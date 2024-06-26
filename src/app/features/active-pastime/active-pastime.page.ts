import {Component, OnInit} from '@angular/core';
import { Router } from "@angular/router";
import { NavController } from '@ionic/angular';
import {Select, Store} from "@ngxs/store";
import {Observable} from "rxjs";

import {EventsState, LoadAllEvents} from "../../state/events";
import {EventDetails} from "../events/model/interfaces";
@Component({
  selector: 'app-active-pastime',
  templateUrl: './active-pastime.page.html',
  styleUrls: ['./active-pastime.page.scss'],
})
export class ActivePastimePage implements OnInit {
  @Select(EventsState.eventCountsByCategory) eventCounts$: Observable<{ [category: string]: number }>;
  path = '../../../assets/images/';
  activities = [
    {
      activity: 'bowling',
      icon: 'bowling-ball-outline'
    },
    {
      activity: 'drinking',
      icon: 'wine-outline'
    },
    {
      activity: 'playing kids',
      icon: 'happy-outline'
    },
    {
      activity: 'clubing',
      icon: 'musical-notes-outline'
    },
    {
      activity: 'barbecue',
      icon: 'flame-outline'
    },
    {
      activity: 'soccer',
      icon: 'football-outline'
    },
    {
      activity: 'volleyball',
      icon: 'baseball-outline'
    },
  ]

  constructor(private navCtrl: NavController, private router: Router, private store: Store) { }

  ngOnInit() {
    this.store.dispatch(new LoadAllEvents())
  }

  goToActivity(activity: string) {
    this.router.navigate(['/events', activity]);
  }

}
