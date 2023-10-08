import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import {PageHeaderComponent} from "../../shared/components/page-header/page-header.component";
import {OverflowCheckDirective} from "../../shared/directive/overflow-check.directive";

import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    OverflowCheckDirective,
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
