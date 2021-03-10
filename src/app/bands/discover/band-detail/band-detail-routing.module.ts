import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BandDetailPage } from './band-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BandDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BandDetailPageRoutingModule {}
