import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EMPTY, merge, Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  share,
  startWith,
  switchMap,
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './appExtraMile.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppExtraMileComponent {
  inputControl = new FormControl('');

  inputValue$ = this.inputControl.valueChanges;

  suggestions$ = merge(
    this.inputValue$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(
        (search): Observable<SuggestionState> => {
          if (search.length < 3) {
            return EMPTY;
          }
          return this.loadUsersLike(search).pipe(
            map(
              (res): SuggestionState => ({
                type: 'success',
                error: null,
                suggestions: res.items,
              })
            ),
            catchError((err) =>
              of<SuggestionState>({
                type: 'error',
                suggestions: null,
                error: err.message,
              })
            ),
            startWith({
              type: 'loading',
              suggestions: null,
              error: null,
            })
          );
        }
      )
    ),
    this.inputValue$.pipe(
      map(
        (search): SuggestionState => {
          return {
            type: 'idle',
            error: null,
            suggestions: null,
          };
        }
      )
    )
  ).pipe(share());

  constructor(private httpClient: HttpClient) {}

  loadUsersLike(name: string): Observable<GitHubResponse> {
    const response: Observable<GitHubResponse> = this.httpClient.get<GitHubResponse>(
      `https://api.github.com/search/users?q=${name}`
    );
    return response;
  }
}

type SuggestionState =
  | {
      type: 'idle';
      error: null;
      suggestions: null;
    }
  | {
      type: 'success';
      error: null;
      suggestions: GitHubResponse['items'];
    }
  | {
      type: 'loading';
      error: null;
      suggestions: null;
    }
  | {
      type: 'error';
      error: string;
      suggestions: null;
    };

type GitHubResponse = {
  items: {
    avatar_url: string;
    login: string;
  }[];
};
