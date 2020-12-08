import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  share,
  switchMap,
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  inputControl = new FormControl('');

  inputValue$ = this.inputControl.valueChanges;

  suggestions$ = merge(
    this.inputValue$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((search) =>
        this.loadUsersLike(search).pipe(
          catchError((err) => of({ items: [] }))
        )
      ),
      map((response) => response.items)
    ),
    this.inputValue$.pipe(map(() => []))
  ).pipe(share());

  constructor(private httpClient: HttpClient) {}

  loadUsersLike(name: string): Observable<GitHubResponse> {
    if (name.length < 3) {
      return of({ items: [] });
    }
    const response: Observable<GitHubResponse> = this.httpClient.get<GitHubResponse>(
      `https://api.github.com/search/users?q=${name}`
    );
    return response;
  }
}

type GitHubResponse = {
  items: {
    avatar_url: string;
    login: string;
  }[];
};
