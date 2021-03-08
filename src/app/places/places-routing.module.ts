import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    path:'tabs',
    component:PlacesPage,
    children:[
      {
        path: 'discover',
        loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule)
      },
      // {
      //   path:':placeId',
      //   loadChildren: () => import('./discover/place-detail/place-detail.module').then( m => m.PlaceDetailPageModule )
      // },
      {
        path: 'offers',
        loadChildren: () => import('./offers/offers.module').then( m => m.OffersPageModule)
      },
    ]
  },
  {
    path:'',
    redirectTo:'tabs/discover',
    pathMatch:'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesPageRoutingModule {}
