import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { Post } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  async get(key: string): Promise<any> {
    await this.init();
    return await this._storage?.get(key);
  }

  async set(key: string, value: any): Promise<any> {
    await this.init();
    return this._storage?.set(key, value);
  }

  getPosts(): Observable<Post[]> {
    return from(this.get('posts'));
  }

  addPost(post: Post): Observable<Post> {
    return from(this.get('posts')).pipe(
      map(res => res ?? []),
      switchMap((posts: Post[]) => {
        return from(this.set('posts', [ ...posts, { ...post, offlineCreated: true } ]));
      }),
      map(() => post)
    );
  }

  updatePost(post: Post): Observable<Post> {
    return from(this.get('posts')).pipe(
      switchMap((posts: Post[]) => {
        return from(this.set('posts', posts.map(item => item.id === post.id ? { ...item, ...post, offlineUpdated: true } : item)));
      }),
      map(() => post)
    );
  }

  deletePost(post: Post): Observable<unknown> {
    return from(this.get('posts')).pipe(
      switchMap((posts: Post[]) => {
        if (post?.offlineCreated) {
          return from(this.set('posts', posts.filter(item => post.id !== item.id)));
        } else {
          return from(this.set('posts', posts.map(item => item.id === post.id ? { ...item, offlineDeleted: true } : item)));
        }
      }),
      map(() => undefined)
    );
  }
}
