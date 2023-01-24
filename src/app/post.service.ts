import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Post } from './app.component';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly baseUrl = environment.apiUrl + '/posts';
  private readonly online$: Observable<boolean> = this.windowService.connection$;

  constructor(private httpClient: HttpClient,
              private windowService: WindowService,
              private storageService: StorageService) {
  }

  getPosts(): Observable<Post[]> {
    return this.online$.pipe(
      take(1),
      switchMap(online => {
        if (online) {
          return this.httpClient.get<Post[]>(this.baseUrl);
        } else {
          return this.storageService.getPosts();
        }
      })
    );
  }

  addPost(post: Post): Observable<Post> {
    return this.online$.pipe(
      take(1),
      switchMap(online => {
        if (online) {
          return this.httpClient.post<Post>(this.baseUrl, post);
        } else {
          return this.storageService.addPost(post);
        }
      })
    );
  }

  updatePost(post: Post): Observable<Post> {
    return this.online$.pipe(
      take(1),
      switchMap(online => {
        if (online) {
          return this.httpClient.put<Post>(`${this.baseUrl}/${post.id}`, post);
        } else {
          return this.storageService.updatePost(post);
        }
      })
    );
  }

  deletePost(post: Post): Observable<unknown> {
    return this.online$.pipe(
      take(1),
      switchMap(online => {
        if (online) {
          return this.httpClient.delete(`${this.baseUrl}/${post.id}`);
        } else {
          return this.storageService.deletePost(post);
        }
      })
    );
  }
}





