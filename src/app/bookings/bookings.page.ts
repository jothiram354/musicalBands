import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit,OnDestroy {
    loadedBookings: Booking[]
    private bookingsSub: Subscription
    isLoading = false

  constructor(private bookingService:BookingService, private loadingCtrl: LoadingController, private router: Router) { }

  ngOnInit() {

    this.bookingsSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings
    })
  }

  ionViewWillEnter(){
    this.isLoading = true
    this.bookingService.fetchBookings().subscribe(()=>{
      this.isLoading = false
    })
  }


  onCancelBooking(bookingId: string, slidingBooking: IonItemSliding){
    slidingBooking.close()
    //cancel booking with offerID
    this.loadingCtrl.create({message: "cancelling"}).then(loadingEl => {
      loadingEl.present()
      this.bookingService.cancelBooking(bookingId).subscribe(()=>{
        loadingEl.dismiss()
        this.router.navigate(['/places/tabs/discover'])
      })
    })

  }

  ngOnDestroy(){
    if(this.bookingsSub){
      this.bookingsSub.unsubscribe()
    }

  }

}
