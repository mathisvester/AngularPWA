import { PostService } from '../services/post.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { createPost, deletePost, enter, reload, updatePost } from './posts.actions';
import { concatMap, exhaustMap, map } from 'rxjs';
import { postCreated, postDeleted, postsLoaded, postUpdated } from './post-api.actions';
import { StorageService } from '../services/storage.service';

@Injectable()
export class PostApiEffects {
  constructor(private postsService: PostService,
              private storageService: StorageService,
              private actions$: Actions) {
  }

  loadPosts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(enter, reload),
      exhaustMap(() => {
        return this.postsService.getPosts().pipe(
          map((posts) => postsLoaded({ posts }))
        );
      })
    );
  });

  createPost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createPost),
      concatMap((action) => {
        return this.postsService.addPost(action.post).pipe(
          map((post) => postCreated({ post }))
        );
      })
    );
  });

  updatePost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatePost),
      concatMap((action) => {
        return this.postsService.updatePost(action.post).pipe(
          map((post) => postUpdated({ post }))
        );
      })
    );
  });

  deletePost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deletePost),
      concatMap((action) => {
        return this.postsService.deletePost(action.postId).pipe(
          map(() => postDeleted({ postId: action.postId }))
        );
      })
    );
  });
}
