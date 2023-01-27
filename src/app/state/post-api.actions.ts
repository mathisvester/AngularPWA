import { createAction, props } from '@ngrx/store';
import { Post } from '../app.component';

export const postsLoaded = createAction(
  '[Posts API] Posts Loaded Success',
  props<{ posts: Post[] }>()
);

export const postCreated = createAction(
  '[Posts API] Post Created',
  props<{ post: Post }>()
);

export const postUpdated = createAction(
  '[Posts API] Post Updated',
  props<{ post: Post }>()
);

export const postDeleted = createAction(
  '[Posts API] Post Deleted',
  props<{ postId: string }>()
);
