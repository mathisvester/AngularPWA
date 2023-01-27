import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay, take } from 'rxjs';
import { PostService } from './services/post.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { SyncService } from './services/sync.service';
import { WindowService } from './services/window.service';
import { StorageService } from './services/storage.service';
import { Store } from '@ngrx/store';
import { selectActivePost, selectAll } from './state/posts.selectors';
import { createPost, deletePost, enter, reload, selectPost, updatePost } from './state/posts.actions';

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
export class AppComponent implements OnInit {
  title = 'pwa-offline';

  readonly connection$: Observable<boolean> = this.windowService.connection$;

  readonly posts$: Observable<Post[]> = this.store.select(selectAll);
  readonly currentPost$: Observable<Post | NewPost> = this.store.select(selectActivePost);

  form$: Observable<FormGroup> = this.currentPost$.pipe(
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
              private store: Store,
              private fb: FormBuilder) {
    // this.posts$.subscribe(posts => this.storageService.set('posts', posts)); TODO: fix initial save
  }

  ngOnInit() {
    this.store.dispatch(enter());
  }

  selectPost(post: Post) {
    this.store.dispatch(selectPost({ postId: post.id }));
  }

  submit(post: NewPost) {
    this.currentPost$.pipe(
      take(1)
    ).subscribe(currentPost => {
      if (AppComponent.isPost(currentPost)) {
        this.updatePost({ ...currentPost, ...post });
      } else {
        this.createPost(post);
      }
    });
  }

  createPost(post: NewPost) {
    this.store.dispatch(createPost({ post: { id: uuidv4(), ...post } }));
  }

  updatePost(post: Post) {
    this.store.dispatch(updatePost({ post }));
  }

  deletePost(postId: string) {
    this.store.dispatch(deletePost({ postId }));
  }

  sync() {
    this.syncService.startSync();
  }

  reload() {
    this.store.dispatch(reload());
  }

}
