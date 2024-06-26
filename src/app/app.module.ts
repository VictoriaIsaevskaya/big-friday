import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireDatabaseModule } from "@angular/fire/compat/database";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router'
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from "@ionic/storage-angular";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { NgxsModule } from '@ngxs/store';
import { take } from "rxjs";

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from "./features/auth/auth.module";
import {FooterModule} from "./layout/footer/footer.module";
import {AuthService} from "./services/auth.service";
import {CarouselComponent} from "./shared/components/carousel/carousel.component";
import {AuthState} from "./state/auth";
import {ChatState} from "./state/chat";
import {EventsState} from "./state/events";
import {UserState} from "./state/user";

export function initApp(authService: AuthService) {
  return () => authService.authState$.pipe(take(1)).toPromise();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
    NgxsModule.forRoot([AuthState, EventsState, UserState, ChatState]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot(),
    AuthModule,
    CarouselComponent,
    FooterModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
  }
}
