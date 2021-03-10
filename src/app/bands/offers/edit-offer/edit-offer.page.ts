import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Band } from '../../band.model';
import { BandsService } from '../../bands.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit,OnDestroy {

  band: Band;
  form : FormGroup
  private bandSub: Subscription
  isLoading = false
  bandId: string

  constructor(
    private route: ActivatedRoute,
    private bandService: BandsService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.bandSub = this.route.paramMap.subscribe( paramMap => {
      if(!paramMap.has('bandId')){
        this.navCtrl.navigateBack('/bands/tabs/offers')
        return
      }
      this.bandId =  paramMap.get('bandId')
      this.isLoading = true
      this.bandSub = this.bandService.getBand(paramMap.get('bandId')).subscribe(band => {
        this.band = band
        this.form = new FormGroup({
          title: new FormControl(this.band.title,{
            updateOn:"blur",
            validators: [Validators.required]
          }),
          description: new FormControl(this.band.description,{
            updateOn:"blur",
            validators: [Validators.required]
          }),
          price: new FormControl(this.band.price,{
            updateOn: 'blur',
            validators:[Validators.required, Validators.min(1)]
          }),
          dateFrom: new FormControl(this.band.availableFrom,{
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          dateTo: new FormControl(this.band.availableTo,{
            updateOn: 'blur',
            validators: [Validators.required  ]
          }),
          imageUrl: new FormControl(this.band.imageUrl,{
            updateOn: 'blur',
            validators: [Validators.required  ]
          })
        })
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header:'An error occured',
          message:"band could not be fetched. PLease try again later",
          buttons: [{text:'okay',handler: ()=>{
            this.router.navigate(['/bands/tabs/offers'])
          }}]
        }).then(alertEl => {
          alertEl.present()
        })
      })

    })
  }

  onUpdateOffer(){
    if(!this.form.valid){
      return;
    }

    this.loadingCtrl.create({
      message:"updating bands..."
    }).then(loadingEl => {
      loadingEl.present()
      this.bandService.updateBand(
        this.band.id,
        this.form.value.title,
        this.form.value.description,
        this.form.value.imageUrl,
        this.form.value.price,
        this.form.value.dateFrom,
        this.form.value.dateTo
        ).subscribe(()=>{
          loadingEl.dismiss()
          this.form.reset()
          this.router.navigate(['/bands/tabs/offers'])
        })
    })


  }

  ngOnDestroy(){
    if(this.bandSub){
      this.bandSub.unsubscribe()
    }
  }

}
