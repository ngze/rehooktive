import { OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import { Rehooktive } from '../lib/rehooktive.decorator';
import { Hook } from '../lib/hook.enum';
import { HooksConfigs } from '../lib/hooks-configs';

import { disableIvy, enableIvy, WithLifecycleHooks } from './utils';

describe('Rehooktive decorator', () => {
  test('is adding missing lifecycle hook methods when Ivy is enabled', () => {
    enableIvy();

    class Test {
      @Rehooktive(Hook.OnInit)
      readonly onInit$: Observable<void>;
    }

    const prototype = Test.prototype as WithLifecycleHooks<Test>;

    expect(prototype.ngOnInit).toBeInstanceOf(Function);
    expect(prototype.ngOnDestroy).toBeInstanceOf(Function);
  });

  test('is throwing when lifecycle hook method is missing and Ivy is disabled/not available', () => {
    disableIvy();

    expect(() => {
      class Test {
        @Rehooktive(Hook.OnInit)
        readonly onInit$: Observable<void>;
      }
    }).toThrow('Test is using Rehooktive for ngOnInit but it wasn\'t implemented.');
  });

  test('is completing subject on destroy', () => {
    enableIvy();

    const { subjectPropertyName } = HooksConfigs[Hook.OnInit];

    class Test {
      @Rehooktive(Hook.OnInit)
      readonly onInit$: Observable<void>;
    }

    let instance = new Test() as WithLifecycleHooks<Test>;
    const subjectNextSpy = spyOn(instance[subjectPropertyName], 'next');
    const subjectCompleteSpy = spyOn(instance[subjectPropertyName], 'complete');

    instance.ngOnDestroy();

    expect(subjectCompleteSpy).toBeCalled();
    expect(subjectNextSpy).toBeCalled();
    expect(instance[subjectPropertyName]).toBeNull();
  });

  test('is emitting on each lifecycle hook call', () => {
    enableIvy();

    const { subjectPropertyName } = HooksConfigs[Hook.AfterContentChecked];

    class Test {
      @Rehooktive(Hook.AfterContentChecked)
      readonly afterContentChecked$: Observable<void>;
    }

    const instance = new Test() as WithLifecycleHooks<Test>;
    const subjectNextSpy = spyOn(instance[subjectPropertyName], 'next');

    instance.ngAfterContentChecked();
    instance.ngAfterContentChecked();
    instance.ngAfterContentChecked();

    expect(subjectNextSpy).toBeCalledTimes(3);
  });

  test('is emitting lifecycle hook args when exists', () => {
    enableIvy();

    const { subjectPropertyName } = HooksConfigs[Hook.OnChanges];

    class Test {
      @Rehooktive(Hook.OnChanges)
      readonly onChanges$: Observable<SimpleChanges>;
    }

    const instance = new Test() as WithLifecycleHooks<Test>;
    const subjectNextSpy = spyOn(instance[subjectPropertyName], 'next');

    const args1: SimpleChanges = {
      input: new SimpleChange(null, 1, true),
    };

    const args2: SimpleChanges = {
      input: new SimpleChange(1, 2, false),
    };

    const args3: SimpleChanges = {
      input: new SimpleChange(2, 3, false),
    };

    instance.ngOnChanges(args1);
    instance.ngOnChanges(args2);
    instance.ngOnChanges(args3);

    expect(subjectNextSpy).toHaveBeenNthCalledWith(1, args1);
    expect(subjectNextSpy).toHaveBeenNthCalledWith(2, args2);
    expect(subjectNextSpy).toHaveBeenNthCalledWith(3, args3);
  });

  test('is working with subclasses', () => {
    enableIvy();

    const { subjectPropertyName } = HooksConfigs[Hook.OnInit];

    class Parent {
      @Rehooktive(Hook.OnInit)
      readonly onInit$: Observable<void>;
    }

    class Child extends Parent {}

    const instance = new Child() as WithLifecycleHooks<Child>;
    const subjectNextSpy = spyOn(instance[subjectPropertyName], 'next');
    const subjectCompleteSpy = spyOn(instance[subjectPropertyName], 'complete');

    instance.ngOnInit();
    instance.ngOnDestroy();

    expect(subjectNextSpy).toBeCalledTimes(2);
    expect(subjectCompleteSpy).toHaveBeenCalled();
  });

  test('is not overriding existing lifecycle hook method but still emitting', () => {
    enableIvy();

    const { subjectPropertyName } = HooksConfigs[Hook.OnInit];
    const uniqueValue = Symbol('uniqueValue');

    class Test implements OnInit {
      @Rehooktive(Hook.OnInit)
      readonly onInit$: Observable<void>;

      ngOnInit() {
        return uniqueValue;
      }
    }

    const instance = new Test();
    const subjectNextSpy = spyOn(instance[subjectPropertyName], 'next');

    expect(instance.ngOnInit()).toBe(uniqueValue);
    expect(subjectNextSpy).toBeCalled();
  });
});
