import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit,OnDestroy {

  place:Place
  placeSub: Subscription
  bookingSub: Subscription
  isBookable = true
  isLoading=false

  constructor(
    private nvCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService:AuthService,
    private alertCtrl: AlertController,
    private router: Router)  { }

  ngOnInit() {

    this.route.paramMap.subscribe( paramMap => {
      if(!paramMap.has('placeId')){
        this.nvCtrl.navigateBack('/places/tabs/discover')
        return
      }
      this.isLoading = true
      let fetchUserId: string
      this.authService.userId.pipe(take(1),switchMap(userId => {
        if(!userId){
          throw new Error('Found no user!!!')
        }
        fetchUserId = userId
        return this.placesService.getPlace(paramMap.get('placeId'))
      })).subscribe(place => {
        this.place = place
        this.isBookable= !(place.userId === fetchUserId)
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header:"An error occured!",
          message:"could not load place",
          buttons:[{text:'okay',handler:()=>{
            this.router.navigate(['/places/tabs/discover'])
          }}]}).then(alertEl=> {
            alertEl.present()
          })
      }
      )
    })

    }



      /*
       following code is converted in to above code
      this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place
        this.isBookable= !(place.userId === this.authService.userId)
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header:"An error occured!",
          message:"could not load place",
          buttons:[{text:'okay',handler:()=>{
            this.router.navigate(['/places/tabs/discover'])
          }}]}).then(alertEl=> {
            alertEl.present()
          })
      })
    })
  }

    */

  onBookPlace(){
    // this.router.navigateByUrl('/places/tabs/discover')
    // this.nvCtrl.navigateBack('/places/tabs/discover')
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
      componentProps: {selectedPlace:this.place, selectedMode: mode}
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss()
    })
    .then(resultData => {
      console.log(resultData.data,resultData.role);
      if(resultData.role === "confirm"){
        this.loadingCtrl.create({message:'Booking place...'}).then(loadingEl => {
          loadingEl.present()
          const data = resultData.data.bookingData
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
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
    if(this.placeSub){
      this.placeSub.unsubscribe()
    }
    if(this.bookingSub){
      this.bookingSub.unsubscribe()
    }
  }

}
