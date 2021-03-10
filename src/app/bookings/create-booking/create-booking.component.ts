import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Band } from 'src/app/bands/band.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  @Input() selectedBand: Band
  @Input() selectedMode: 'select' | 'random'
  @ViewChild('f',{static:true}) form:NgForm

  startDate: string
  endDate: string

  constructor(private modalCtrl: ModalController,private router:Router) { }

  ngOnInit() {

    const availableFrom = new Date(this.selectedBand.availableFrom)
    const availableTo = new Date(this.selectedBand.availableTo)
    if(this.selectedMode === 'random'){
      this.startDate= new Date(
        availableFrom.getTime() +
       Math.random() *
       (availableTo.getTime()-7*24*60*60*1000-availableFrom.getTime()
      )
       ).toISOString()

      this.endDate = new Date(
        new Date(this.startDate).getTime() + Math.random() *
                        (new Date(this.startDate).getTime() + 6*24*60*60*1000 - new Date(this.startDate).getTime())

      ).toISOString()

    }
  }

  onCancel(){
    this.modalCtrl.dismiss(null,'cancel');
  }

  onBookBand(){
    if(!this.form.valid || !this.datesValid){
        return
    }
    this.modalCtrl.dismiss({
      bookingData:{
        firstName: this.form.value['first-name'],
        lastName: this.form.value['last-name'],
        personRequired: +this.form.value['person-required'],
        startDate: new Date(this.form.value['date-from']),
        endDate: new Date(this.form.value['date-to'])
      }
    },'confirm')
    this.router.navigate(['/bands/tabs/discover'])
  }

  datesValid(){
    const starDate = new Date(this.form.value['date-from'])
    const endDate = new Date(this.form.value['date-to'])
    return endDate>starDate
  }

}
