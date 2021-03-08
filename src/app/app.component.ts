import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit,OnDestroy {

  private authSub: Subscription
  private previousAuthState = false    // to work around ngonit while reloading because it laods faster

  constructor(private authService: AuthService, private router: Router) {}

  onLogout(){
    this.authService.logout()
    this.router.navigateByUrl('/auth')
  }

  ngOnInit(){  // need to review this method
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if(!isAuth && this.previousAuthState !== isAuth){
        this.router.navigateByUrl('/auth')
      }

      this.previousAuthState = isAuth

    })
  }

  ngOnDestroy(){
    if(this.authSub){
       this.authSub.unsubscribe()
    }
  }

}
