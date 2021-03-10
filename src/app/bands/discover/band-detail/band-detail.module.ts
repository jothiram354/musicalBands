import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BandDetailPageRoutingModule } from './band-detail-routing.module';

import { BandDetailPage } from './band-detail.page';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BandDetailPageRoutingModule
  ],
  declarations: [BandDetailPage, CreateBookingComponent],
})
export class BandDetailPageModule {}
