import { Post } from '../app.component';
import { createReducer, on } from '@ngrx/store';
import { selectPost } from './posts.actions';
import { postCreated, postDeleted, postsLoaded, postUpdated } from './post-api.actions';

const createPost = (posts: Post[], post: Post) => [ ...posts, post ];
const updatePost = (posts: Post[], changes: Post) => posts.map((post) => {
  return post.id === changes.id ? Object.assign({}, post, changes) : post;
});
const deletePost = (posts: Post[], postId: string) => posts.filter((post) => postId !== post.id);

export interface State {
  collection: Post[];
  activePostId: string | null;
}

export const initialState: State = {
  collection: [],
  activePostId: null
}

export const postsReducer = createReducer(
  initialState,
  on(selectPost, (state, action) => {
    return {
      ...state,
      activePostId: action.postId
    };
  }),
  on(postsLoaded, (state, action) => {
    return {
      ...state,
      collection: action.posts
    };
  }),
  on(postCreated, (state, action) => {
    return {
      collection: createPost(state.collection, action.post),
      activePostId: null
    }
  }),
  on(postUpdated, (state, action) => {
    return {
      collection: updatePost(state.collection, action.post),
      activePostId: null
    }
  }),
  on(postDeleted, (state, action) => {
    return {
      ...state,
      collection: deletePost(state.collection, action.postId)
    }
  })
);
