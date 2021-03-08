import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take,map,tap,delay, switchMap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';


// new Place(
//   'p1',
//   'Manhattan Mansion',
//   'In the Heart of NewYork city',
//   'https://media.gettyimages.com/photos/aerial-view-of-lower-manhattan-new-york-picture-id946087016?s=612x612',
//   149.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'xez'
//   ),
// new Place(
//   'p2',
//   'Lamour Toujours',
//   'A romantic place in Paris',
//   'https://slicedpickles.com/wp-content/uploads/2017/02/cq5dam_Fotor.jpg',
//   189.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'cde'
//   ),
// new Place(
//   'p3',
//   'The foggy place',
//   'Not ypur average city trip!',
//   'https://static2.tripoto.com/media/filter/tst/img/109540/TripDocument/1574336652_122a5dd2_b767_4948_b280_2c56c0fdb4dc.jpeg',
//   100.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
//   )


interface PlaceData{
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
export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([])

  get places(){
    return this._places.asObservable()
  }

  constructor(private authService: AuthService,private http: HttpClient) {}

  getPlace(id: string){
    return this.http.get<PlaceData>(
      `https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places/${id}.json`,
      ).pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
            )
        })
      )
  }

  fetchPlaces(){
    return this.http.get<{[key:string]: PlaceData}>('https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      const places =[]
      for(const key in resData){
        if(resData.hasOwnProperty(key)){
          places.push(
            new Place(
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
      return places;
    }),
    tap(places =>  {
      this._places.next(places)
    })
    )
  }

  addPlace(title:string,description:string,price:number,dateFrom:Date,dateTo:Date,imageUrl:string)
  {
      let generatedId: string;
      let newPlace: Place
      return this.authService.userId.pipe(take(1),switchMap(userId => {
        if(!userId){
          throw new Error("No user found")
        }
        newPlace = new Place(
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
          {...newPlace,
            id:null
          })

        }),

        switchMap(resData => {
          generatedId = resData.name
          return this.places
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId
          this._places.next(places.concat(newPlace))
        })

      )


      // return this.places.pipe(take(1),delay(1000),tap(places => {

      //     this._places.next(places.concat(newPlace))

      // }))

  }

  updatePlace(placeId:string,title:string,description:string,imageUrl:string,price:number,availableFrom:Date,availableTo:Date){

    let updatedPlaces: Place[]
    return this.places.pipe(take(1), switchMap(places => {
      if(!places || places.length<=0){
        return this.fetchPlaces()
      }else{
        return of(places)
      }
    }),
    switchMap(places => {
      updatedPlaces = [...places]
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId)
      const oldPlace = updatedPlaces[updatedPlaceIndex]
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        imageUrl,
        price,
        availableFrom,
        availableTo,
        oldPlace.userId
      )
      return this.http.put(
        `https://band-project-ff84f-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
        {...updatedPlaces[updatedPlaceIndex],id:null})

    })
    ,tap(()=>{
      this._places.next(updatedPlaces)
    }))

  }




}
