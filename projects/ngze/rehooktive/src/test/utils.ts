import { SimpleChanges, ɵivyEnabled } from '@angular/core';

export type WithLifecycleHooks<T> = T & {
  ngOnChanges: (changes: SimpleChanges) => {};
  ngOnInit: () => {};
  ngDoCheck: () => {};
  ngAfterViewInit: () => {};
  ngAfterViewChecked: () => {};
  ngAfterContentInit: () => {};
  ngAfterContentChecked: () => {};
  ngOnDestroy: () => {};
};

export const enableIvy = () => {
  // @ts-ignore
  // noinspection JSConstantReassignment
  ɵivyEnabled = true;
};

export const disableIvy = () => {
  // @ts-ignore
  // noinspection JSConstantReassignment
  ɵivyEnabled = false;
};
