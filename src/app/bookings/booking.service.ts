import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, concat } from "rxjs";
import { delay, map, switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Booking } from "./booking.model";


interface BookingData{
  bookedTo: string,
  bookedfrom: string,
  firstName: string,
  personRequired: number,
  lastName: string,
  bandId: string,
  bandImage: string,
  bandTitle: string,
  userId:string
}

@Injectable({
  providedIn:"root"
})
export class BookingService{

  private _bookings = new BehaviorSubject<Booking[]>([])

  constructor(private authService: AuthService, private http:HttpClient){}


  get bookings(){
    return this._bookings.asObservable()
  }

 addBooking(
   bandId: string,
   bandTitle:string,
   bandImage:string,
   firstName:string,
   lastName:string,
   personRequired: number,
   dateFrom:Date,
   dateTo: Date
   ){
     let generatedId: string
     let newBooking : Booking
     return this.authService.userId.pipe(take(1),switchMap(userId =>
      {
        if(!userId){
          throw new Error('No user id found')
        }
        newBooking = new Booking(
          Math.random().toString(),
          bandId,
          userId,
          bandTitle,
          bandImage,
          firstName,
          lastName,
          personRequired,
          dateFrom,
          dateTo
        )
        return this.http.post<{name: string}>(
          'https://band-project-ff84f-default-rtdb.firebaseio.com/bookings.json',
          {...newBooking, id:null}
        )
       }
     ),switchMap(resData => {
      generatedId = resData.name
      return this.bookings;
    } ),
    take(1),
    tap(bookings=>{ //in this line of code you can learn what is subscribe & take M.211
      newBooking.id=generatedId
      this._bookings.next(bookings.concat(newBooking))
    })

    )



    // return this.bookings.pipe(take(1),delay(1000),tap(bookings => {
    //     this._bookings.next(bookings.concat(newBooking))
    //   }))

   }


  fetchBookings(){

    return this.authService.userId.pipe(take(1),switchMap(userId => {
      if(!userId){
        throw new Error("No user found")
      }
      return this.http.get<{[key:string] : BookingData}>(
        `https://band-project-ff84f-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
          userId}"`
          )
    }),
    map(bookingData => {
          const bookings = []
          for(const key in bookingData){
            if(bookingData.hasOwnProperty(key)){
              bookings.push(new Booking(
                key,
                bookingData[key].bandId,
                bookingData[key].userId,
                bookingData[key].bandTitle,
                bookingData[key].bandImage,
                bookingData[key].firstName,
                bookingData[key].lastName,
                bookingData[key].personRequired,
                new Date(bookingData[key].bookedfrom),
                new Date(bookingData[key].bookedTo)))
            }
          }
          return bookings;
        }), tap(bookings => {
          this._bookings.next(bookings)
        }))
  }


 cancelBooking(bookingId:string){
   return this.http.delete(
     `https://band-project-ff84f-default-rtdb.firebaseio.com/bookings/${bookingId}.json`
     ).pipe(switchMap(()=>{
       return this.bookings;
     }),take(1),tap(bookings => {
      this._bookings.next(bookings.filter(b=> b.id !== bookingId))
     }))

 }


}
