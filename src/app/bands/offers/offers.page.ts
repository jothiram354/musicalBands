import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Band } from '../band.model';
import { BandsService } from '../bands.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit,OnDestroy {

  offers: Band[];
  private bandsSub: Subscription
  isLoading = false

  constructor(private bandsService: BandsService, private router: Router) {
    this.bandsSub = this.bandsService.bands.subscribe( bands => {
      this.offers= bands
    })
  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.isLoading=true
    this.bandsService.fetchBands().subscribe(()=>{
      this.isLoading = false
    })
  }

  onEdit(offerId: string, slidingItem: IonItemSliding){
    slidingItem.close()
    this.router.navigate(['/','bands','tabs','offers','edit',offerId])
  }

  ngOnDestroy(){
    if(this.bandsSub){
      this.bandsSub.unsubscribe()
    }
  }

}
