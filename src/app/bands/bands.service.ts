import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Band } from './band.model';
import { take,map,tap,delay, switchMap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';





interface BandData{
  availableFrom:string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BandsService {

  private _bands = new BehaviorSubject<Band[]>([])

  get bands(){
    return this._bands.asObservable()
  }

  constructor(private authService: AuthService,private http: HttpClient) {}

  getBand(id: string){
    return this.http.get<BandData>(
      `https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places/${id}.json`,
      ).pipe(
        map(bandData => {
          return new Band(
            id,
            bandData.title,
            bandData.description,
            bandData.imageUrl,
            bandData.price,
            new Date(bandData.availableFrom),
            new Date(bandData.availableTo),
            bandData.userId
            )
        })
      )
  }

  fetchBands(){
    return this.http.get<{[key:string]: BandData}>('https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      const bands =[]
      for(const key in resData){
        if(resData.hasOwnProperty(key)){
          bands.push(
            new Band(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId)
                )
        }
      }
      return bands;
    }),
    tap(bands =>  {
      this._bands.next(bands)
    })
    )
  }

  addBand(title:string,description:string,price:number,dateFrom:Date,dateTo:Date,imageUrl:string)
  {
      let generatedId: string;
      let newBand: Band
      return this.authService.userId.pipe(take(1),switchMap(userId => {
        if(!userId){
          throw new Error("No user found")
        }
        newBand = new Band(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          userId
          );

          return this.http
          .post<{name:string}>('https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places.json',
          {...newBand,
            id:null
          })

        }),

        switchMap(resData => {
          generatedId = resData.name
          return this.bands
        }),
        take(1),
        tap(bands => {
          newBand.id = generatedId
          this._bands.next(bands.concat(newBand))
        })

      )


      // return this.bands.pipe(take(1),delay(1000),tap(bands => {

      //     this._bands.next(bands.concat(newBand))

      // }))

  }

  updateBand(bandId:string,title:string,description:string,imageUrl:string,price:number,availableFrom:Date,availableTo:Date){

    let updatedBands: Band[]
    return this.bands.pipe(take(1), switchMap(bands => {
      if(!bands || bands.length<=0){
        return this.fetchBands()
      }else{
        return of(bands)
      }
    }),
    switchMap(bands => {
      updatedBands = [...bands]
      const updatedBandIndex = bands.findIndex(pl => pl.id === bandId)
      const oldBand = updatedBands[updatedBandIndex]
      updatedBands[updatedBandIndex] = new Band(
        oldBand.id,
        title,
        description,
        imageUrl,
        price,
        availableFrom,
        availableTo,
        oldBand.userId
      )
      return this.http.put(
        `https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places/${bandId}.json`,
        {...updatedBands[updatedBandIndex],id:null})

    })
    ,tap(()=>{
      this._bands.next(updatedBands)
    }))

  }




}
