import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonSegment, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Band } from '../band.model';
import { BandsService } from '../bands.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedBands: Band[]
  listedLoadedBands: Band[]
  bandsSub: Subscription
  relevantBands: Band[]
  isLoading = false

  constructor(private bandService: BandsService,private menuCtrl: MenuController, private authService:AuthService){ }

  ngOnInit() {
    this.bandsSub = this.bandService.bands.subscribe( bands => {
      this.loadedBands = bands
      this.relevantBands = this.loadedBands
      this.listedLoadedBands =this.relevantBands.slice(1)
    })

  }

  ionViewWillEnter(){
    this.isLoading = true
    this.bandService.fetchBands().subscribe(()=>{
      this.isLoading = false
    })
  }

  onFilterUpdate(event: CustomEvent<IonSegment>){
    // console.log(event.detail)
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if(event.detail.value=="all"){
        this.relevantBands = this.loadedBands
        this.listedLoadedBands = this.relevantBands.slice(1)
      }else{
        this.relevantBands = this.loadedBands.filter(
          band => band.userId !== userId
        )
        this.listedLoadedBands = this.relevantBands.slice(1)
      }
    })

  }

  ngOnDestroy(){
    if(this.bandsSub){
      this.bandsSub.unsubscribe()
    }
  }

}
