import { Observable, Observer, of, Subscription } from 'rxjs';

const simpleObservable: Observable<number> = of(1, 2, 3, 4);

const observer: Observer<number> = {
  next(value): void {
    console.log(value);
  },
  complete(): void {
    console.log('complete');
  },
  error(err): void {
    console.error('error');
  },
};
const subscription: Subscription = simpleObservable.subscribe(
  observer
);
subscription.unsubscribe();
