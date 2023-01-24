import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay, switchMap, take, withLatestFrom } from 'rxjs';
import { PostService } from './post.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { SyncService } from './sync.service';
import { WindowService } from './window.service';
import { StorageService } from './storage.service';

export interface NewPost {
  title: string;
  author: string;
}

export interface Post extends NewPost {
  id: string;
  offlineDeleted?: boolean;
  offlineCreated?: boolean;
  offlineUpdated?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pwa-offline';

  readonly connection$: Observable<boolean> = this.windowService.connection$;

  private reload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  readonly posts$: Observable<Post[]> = this.reload$.asObservable().pipe(
    switchMap(() => this.postService.getPosts()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private selectedPost$: BehaviorSubject<Post | NewPost> = new BehaviorSubject<Post | NewPost>({ title: '', author: '' });

  form$: Observable<FormGroup> = this.selectedPost$.asObservable().pipe(
    map(post => this.fb.group({
      title: [ post.title, Validators.required ],
      author: [ post.author, Validators.required ]
    })),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  private static isPost(post: Post | NewPost): post is Post {
    return 'id' in post;
  }

  constructor(private readonly postService: PostService,
              private readonly windowService: WindowService,
              private storageService: StorageService,
              private syncService: SyncService,
              private fb: FormBuilder) {
    this.posts$.subscribe(posts => this.storageService.set('posts', posts));
  }

  selectPost(post: Post) {
    this.selectedPost$.next(post);
  }

  addOrUpdatePost() {
    this.form$.pipe(
      take(1),
      withLatestFrom(this.selectedPost$.asObservable()),
      switchMap(([form, selectedPost]) => {
        if (AppComponent.isPost(selectedPost)) {
          return this.postService.updatePost({ ...selectedPost, ...form.value });
        } else {
          return this.postService.addPost({ id: uuidv4(), ...form.value });
        }
      })
    ).subscribe(() => {
      this.reload$.next(true);
      this.selectedPost$.next({ title: '', author: '' });
    });
  }

  deletePost(post: Post) {
    this.postService.deletePost(post).pipe(
      take(1)
    ).subscribe(() => this.reload$.next(true));
  }

  sync() {
    this.syncService.startSync();
  }

  reload() {
    this.reload$.next(true);
  }

}
