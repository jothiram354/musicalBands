import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BandsPage } from './bands.page';

const routes: Routes = [
  {
    path:'tabs',
    component:BandsPage,
    children:[
      {
        path: 'discover',
        loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule)
      },
      // {
      //   path:':bandId',
      //   loadChildren: () => import('./discover/band-detail/band-detail.module').then( m => m.BandDetailPageModule )
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
export class BandsPageRoutingModule {}
