import { Injectable } from '@angular/core';
import { from, map, Observable, shareReplay, Subject, switchMap, zip } from 'rxjs';
import { Post } from '../app.component';
import { StorageService } from './storage.service';
import { WindowService } from './window.service';

interface SyncDto {
  addedPosts: Post[];
  deletedPosts: Post[];
  updatedPosts: Post[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private _startSync$: Subject<void> = new Subject<void>();
  private readonly startSync$: Observable<void> = this._startSync$.asObservable();

  private readonly storedPosts$: Observable<Post[]> = this.startSync$.pipe(
    switchMap(() => from(this.storageService.get('posts'))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly addedPosts$: Observable<Post[]> = this.storedPosts$.pipe(
    map(posts => posts.filter(post => post?.offlineCreated))
  );

  private readonly updatedPosts$: Observable<Post[]> = this.storedPosts$.pipe(
    map(posts => posts.filter(post => post?.offlineUpdated && !post?.offlineCreated))
  );

  private readonly deletedPosts$: Observable<Post[]> = this.storedPosts$.pipe(
    map(posts => posts.filter(post => post?.offlineDeleted)) // TODO: deleted posts must be fixed because the flag isn't set currently
  );

  constructor(private windowService: WindowService,
              private readonly storageService: StorageService) {

    const sync$: Observable<SyncDto> = zip(this.addedPosts$, this.updatedPosts$, this.deletedPosts$).pipe(
      map(([addedPosts, updatedPosts, deletedPosts]) => ({ addedPosts, updatedPosts, deletedPosts }))
    );

    sync$.subscribe(value => console.log('sync', value));
  }

  startSync() {
    this._startSync$.next();
  }
}
