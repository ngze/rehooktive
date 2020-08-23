import { Component, HostListener } from '@angular/core';
import { Rehooktive, Hook } from '@ngze/rehooktive';
import { Observable } from 'rxjs';
import { mapTo, scan } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: '<strong>Number of checks: {{ numberOfChecks$ | async }}</strong>',
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
  @Rehooktive(Hook.DoCheck)
  private readonly doCheck$: Observable<void>;

  readonly numberOfChecks$ = this.doCheck$.pipe(
    mapTo(1),
    scan((acc, value) => acc + value)
  );

  @HostListener('mousemove')
  onMousemove() {}
}
