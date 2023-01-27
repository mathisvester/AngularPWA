import { Injectable } from '@angular/core';
import { fromEvent, map, merge, Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  readonly connection$: Observable<boolean> = merge(
    of(null),
    fromEvent(window, 'online'),
    fromEvent(window, 'offline')
  ).pipe(
    map(() => navigator.onLine),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() { }
}
