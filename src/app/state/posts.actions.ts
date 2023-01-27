import { createAction, props } from '@ngrx/store';
import { Post } from '../app.component';

export const enter = createAction('[Posts Page] Enter');

export const reload = createAction('[Posts Page] Reload');

export const selectPost = createAction(
  '[Posts Page] Select Post',
  props<{ postId: string }>()
);

export const createPost = createAction(
  '[Posts Page] Create Post',
  props<{ post: Post }>()
);

export const updatePost = createAction(
  '[Posts Page] Update Post',
  props<{ post: Post }>()
);

export const deletePost = createAction(
  '[Posts Page] Delete Book',
  props<{ postId: string }>()
);
