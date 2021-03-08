import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';

export interface AuthResponseData{
  idToken: string,
  email:string,
  refreshToken:string,
  expiresIn:string,
  localId:string,
  registered: boolean
}


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {


  private _user = new BehaviorSubject<User>(null)

  private activeLogoutTimer: any;

  get userIsAuthenticated(){
    return this._user.asObservable().pipe(
      map(user=>{
        if(user){
          return !!user.token
        }else{
          return false
      }
    })
    )
  };


  get userId(){
    return this._user.asObservable().pipe(map(user => {
      if(user){
        return user.id
      }else{
        return null
      }
    })
    )
  }


  constructor(private http: HttpClient) { }

  autoLogin(){
    return from(Plugins.Storage.get({key:'authData'}))
    .pipe(map(storedData => {
        if(!storedData || !storedData.value){
          return null
        }
        const parsedData = JSON.parse(storedData.value) as {
          token:string;
          tokenExpirationDate:string;
          userId: string;
          email: string;
         }

         const expirationTime = new Date(parsedData.tokenExpirationDate)
         if(expirationTime <= new Date()){
           return null;
         }
         const user = new User(parsedData.userId,parsedData.email,parsedData.token,expirationTime)
         return user
    }),tap(user => {
      if(user){
        this._user.next(user)
        this.autoLogout(user.tokenDuration)
      }
    }),
    map(user => {
      return !!user
    }))
  }

  signUp(email: string,password : string){
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      {email:email,password:password,returnSecureToken: true}
    ).pipe(tap(this.setUserData.bind(this)))
  }

  login(email: string,password: string){
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      {email:email,password:password,returnSecureToken:true}
    ).pipe(tap(this.setUserData.bind(this))) //this refers to this class data not the tap function
  }

  logout(){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)
    }
    this._user.next(null)
    Plugins.Storage.remove({key: 'authData'})
  }

  private autoLogout(duration: number){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)
    }
    this.activeLogoutTimer = setTimeout(()=>{
      this.logout()
    },duration)
  }

  ngOnDestroy(){
    if(this.activeLogoutTimer){
      clearTimeout(this.activeLogoutTimer)  // method is to prevent memory leaks
    }
  }


  private setUserData(userData: AuthResponseData){
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn)*1000)
      const user = new User(
        userData.localId,
        userData.email,
        userData.idToken,
        expirationTime)

      this._user.next(user);
      this.autoLogout(user.tokenDuration)
      this.storeAuthData(userData.localId,userData.idToken,expirationTime.toISOString(),userData.email)
  }

  private storeAuthData(userId:string,token: string,tokenExpirationDate: string,email: string){
    const data = JSON.stringify({
      userId:userId,
      token:token,
      tokenExpirationDate: tokenExpirationDate,
      email
    })
    Plugins.Storage.set({key:'authData',value:data})
  }

}