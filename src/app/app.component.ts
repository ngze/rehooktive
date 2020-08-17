import { Component, HostListener } from '@angular/core';
import { ReactiveHook, Hook } from '@ngze/reactive-hooks';
import { Observable } from 'rxjs';
import { mapTo, scan } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: ` <strong>Number of checks: {{ numberOfChecks$ | async }}</strong> `,
  styles: [
    `
      :host {
        display: flex;
        height: 100vh;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class AppComponent {
  @ReactiveHook(Hook.DoCheck)
  private readonly doCheck$: Observable<void>;

  readonly numberOfChecks$ = this.doCheck$.pipe(
    mapTo(1),
    scan((acc, value) => acc + value)
  );

  @HostListener('mousemove')
  // tslint:disable-next-line:typedef
  onMousemove() {}
}
