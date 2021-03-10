import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Band } from '../../band.model';
import { BandsService } from '../../bands.service';

@Component({
  selector: 'app-band-detail',
  templateUrl: './band-detail.page.html',
  styleUrls: ['./band-detail.page.scss'],
})
export class BandDetailPage implements OnInit,OnDestroy {

  band:Band
  bandSub: Subscription
  bookingSub: Subscription
  isBookable = true
  isLoading=false

  constructor(
    private nvCtrl: NavController,
    private route: ActivatedRoute,
    private bandService: BandsService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService:AuthService,
    private alertCtrl: AlertController,
    private router: Router)  { }

  ngOnInit() {

    this.route.paramMap.subscribe( paramMap => {
      if(!paramMap.has('bandId')){
        this.nvCtrl.navigateBack('/bands/tabs/discover')
        return
      }
      this.isLoading = true
      let fetchUserId: string
      this.authService.userId.pipe(take(1),switchMap(userId => {
        if(!userId){
          throw new Error('Found no user!!!')
        }
        fetchUserId = userId
        return this.bandService.getBand(paramMap.get('bandId'))
      })).subscribe(band => {
        this.band = band
        this.isBookable= !(band.userId === fetchUserId)
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header:"An error occured!",
          message:"could not load band",
          buttons:[{text:'okay',handler:()=>{
            this.router.navigate(['/bands/tabs/discover'])
          }}]}).then(alertEl=> {
            alertEl.present()
          })
      }
      )
    })

    }



      /*
       following code is converted in to above code
      this.bandsService.getBand(paramMap.get('BandId')).subscribe(band => {
        this.band = band
        this.isBookable= !(band.userId === this.authService.userId)
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header:"An error occured!",
          message:"could not load band",
          buttons:[{text:'okay',handler:()=>{
            this.router.navigate(['/bands/tabs/discover'])
          }}]}).then(alertEl=> {
            alertEl.present()
          })
      })
    })
  }

    */

  onBookBand(){
    // this.router.navigateByUrl('/bands/tabs/discover')
    // this.nvCtrl.navigateBack('/bands/tabs/discover')
    this.actionSheetCtrl.create({
      header:'Choose an Action',
      buttons:[
        {
          text:'Select Date',
          handler: ()=> {
            this.openBookingModal('select')
          }
        },
        {
          text:'Random Date',
          handler: ()=> {
            this.openBookingModal('random')
          }
        },
        {
          text:'Cancel',
          role: 'destructive'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present()
    })
  }

  openBookingModal(mode:'select' |  'random'){
    // console.log(mode)
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {selectedBand:this.band, selectedMode: mode}
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss()
    })
    .then(resultData => {
      console.log(resultData.data,resultData.role);
      if(resultData.role === "confirm"){
        this.loadingCtrl.create({message:'Booking band...'}).then(loadingEl => {
          loadingEl.present()
          const data = resultData.data.bookingData
          this.bookingService.addBooking(
            this.band.id,
            this.band.title,
            this.band.imageUrl,
            data.firstName,
            data.lastName,
            data.personRequired,
            data.startDate,
            data.endDate
          ).subscribe(()=>{
            loadingEl.dismiss()
          })

        })

      }
    })
  }

  ngOnDestroy(){
    if(this.bandSub){
      this.bandSub.unsubscribe()
    }
    if(this.bookingSub){
      this.bookingSub.unsubscribe()
    }
  }

}
