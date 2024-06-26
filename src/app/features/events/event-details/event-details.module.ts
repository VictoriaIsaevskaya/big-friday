import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { IonicModule } from '@ionic/angular';

import {PageHeaderComponent} from "../../../layout/page-header/page-header.component";
import {ShouldAuthModalComponent} from "../../auth/should-auth-modal/should-auth-modal.component";

import { EventDetailsPageRoutingModule } from './event-details-routing.module';
import { EventDetailsPage } from './event-details.page';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      EventDetailsPageRoutingModule,
      PageHeaderComponent,
      ShouldAuthModalComponent,
      RouterModule,
    ],
  declarations: [EventDetailsPage]
})
export class EventDetailsPageModule {}
