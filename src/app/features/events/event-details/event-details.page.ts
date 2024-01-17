import {ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute, Router} from "@angular/router";
import { ModalController } from "@ionic/angular";
import { Select, Store } from "@ngxs/store";
import {Observable, tap} from "rxjs";

import {UserActivities} from "../../../shared/models/interfaces/user";
import {AuthState} from "../../../state/auth";
import {LoadEvent, EventsState, UpdateEvent, UnselectEvent, DeleteEvent} from '../../../state/events';
import {JoinUserToEvent, UserState} from "../../../state/user";
import {ShouldAuthModalComponent} from "../../auth/should-auth-modal/should-auth-modal.component";
import {EventDetails, Participant} from "../model/interfaces";

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnDestroy {
  @Select(EventsState.selectedEventDetails) event$!: Observable<EventDetails | null>;
  public selectedEvent: EventDetails;
  @Select(UserState.userActivities) currentUserActivities$!: Observable<UserActivities | null>;
  public currentUserActivities: UserActivities;
  private destroyRef = inject(DestroyRef);

  constructor(private route: ActivatedRoute, private store: Store, private modalController: ModalController, private router: Router, private cdr: ChangeDetectorRef) {
    this.store.dispatch(new LoadEvent({eventId: this.route.snapshot.paramMap.get('eventId')}));
    this.event$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event) => this.selectedEvent = event)
    ).subscribe()
    this.currentUserActivities$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event) => this.currentUserActivities = event)
    ).subscribe()
  }

  joinEvent(eventId: string, chatId: string) {
    this.store.selectSnapshot(AuthState.isLoggedIn) ? this.joinUserToEvent(eventId, chatId) : this.openShouldAuthModal;
  }

  get currentUserUid(): string | null {
    const user = this.store.selectSnapshot(AuthState.user)
    return user ? user.uid : null
  }

  joinUserToEvent(eventId: string, chatId: string) {
    const { username, about, ageGroup, interests } = this.store.selectSnapshot(UserState.userPreferences)
    let participant: Participant = {
      userId: this.currentUserUid,
      username,
      about,
      ageGroup,
      interests
    };

    this.selectedEvent.participants ? this.selectedEvent.participants.push(participant) : [participant];
    this.store.dispatch(new UpdateEvent({ eventId, eventData: {participants: this.selectedEvent.participants} }));
    this.currentUserActivities.joinedEvents ? this.currentUserActivities.joinedEvents.push({eventId, chatId}) : (this.currentUserActivities.joinedEvents = [{eventId, chatId}])
    this.store.dispatch(new JoinUserToEvent({ userId: this.currentUserUid, events: this.currentUserActivities.joinedEvents }));
    this.router.navigate(['chats', chatId])
  }

  async openShouldAuthModal() {
    const modal = await this.modalController.create({
      component: ShouldAuthModalComponent
    });
    return await modal.present();
  }

  leaveEvent(eventId: string) {
    const participants = this.selectedEvent.participants?.filter(participant => participant.userId !== this.currentUserUid)
    this.store.dispatch(new JoinUserToEvent({ userId: this.currentUserUid, events: this.currentUserActivities.joinedEvents.filter(event => eventId !== event.eventId) }));
    this.store.dispatch(new UpdateEvent({ eventId, eventData: {participants} }));
  }

  deleteEvent(eventId: string) {
    this.store.dispatch(new DeleteEvent({eventId}))
  }

  get isCurrentUserJoined(): boolean {
    return !!this.currentUserActivities?.joinedEvents?.find(event => event.eventId === this.selectedEvent?.id)
  }

  isCurrentUserOrganizer(): boolean {
    return this.currentUserUid === this.selectedEvent.organizer.uid
  }

  ngOnDestroy() {
    this.store.dispatch(new UnselectEvent())

  }
}
