import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './posts.reducer';

export const selectPosts = createFeatureSelector<State>('posts');

export const selectAll = createSelector(
  selectPosts,
  (state: State) => state.collection
);

export const selectActivePostId = createSelector(
  selectPosts,
  (state: State) => state.activePostId
);

export const selectActivePost = createSelector(
  selectAll,
  selectActivePostId,
  (posts, activePostId) => {
    return posts.find((post) => post.id === activePostId) || { title: '', author: '' };
  }
)
