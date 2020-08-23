import { Observable, Subject } from 'rxjs';
import { Type } from '@angular/core';

import { HooksConfigs } from './hooks-configs';
import { Hook } from './hook.enum';
import { HookConfig } from './hook-config.interface';
import { addHookMethodOnTargetIfMissing, completeSubjectOnInstance } from './internals';

const setupHookSubjectOnTarget = (target: Type<unknown>, subjectPropertyName: symbol) => {
  const subjectStoreProperty = '_'.concat(subjectPropertyName.toString());

  Object.defineProperties(target, {
    [subjectPropertyName]: {
      get(): Subject<unknown> {
        return (this[subjectStoreProperty] = this[subjectStoreProperty] || new Subject());
      },
    },
  });
};

const setupHookMethodOnTarget = (target: Type<unknown>, methodName: string, subjectPropertyName: symbol) => {
  const originalMethod = target[methodName];

  Object.defineProperties(target, {
    [methodName]: {
      value(...args: unknown[]): void {
        this[subjectPropertyName].next(args[0]);
        originalMethod.apply(this, ...args);
      },
    },
  });
};

const setupHookObservableOnTargetProperty = (
  target: Type<unknown>,
  key: string | symbol,
  subjectPropertyName: symbol
) => {
  Object.defineProperties(target, {
    [key]: {
      enumerable: true,
      configurable: true,
      get(): Observable<unknown> {
        return this[subjectPropertyName].pipe();
      },
    },
  });
};

const setupOnDestroyOnTarget = (target: Type<unknown>, config: HookConfig, destroyConfig: HookConfig) => {
  const originalOnDestroyMethod = target[destroyConfig.methodName];

  Object.defineProperties(target, {
    [destroyConfig.methodName]: {
      value(): void {
        completeSubjectOnInstance(this, config.subjectPropertyName);
        completeSubjectOnInstance(this, destroyConfig.subjectPropertyName);
        originalOnDestroyMethod.apply(this);
      },
    },
  });
};

/**
 * Rehooktive is a property decorator that makes property to emits when the given type of lifecycle hook occurs.
 */
export function Rehooktive(hook: Hook): PropertyDecorator {
  return (target: Type<unknown>, key: string | symbol) => {
    const config = HooksConfigs[hook];
    const destroyConfig = HooksConfigs[Hook.OnDestroy];

    addHookMethodOnTargetIfMissing(target, config.methodName);
    addHookMethodOnTargetIfMissing(target, destroyConfig.methodName);

    setupHookSubjectOnTarget(target, config.subjectPropertyName);
    setupHookObservableOnTargetProperty(target, key, config.subjectPropertyName);
    setupHookMethodOnTarget(target, config.methodName, config.subjectPropertyName);
    setupOnDestroyOnTarget(target, config, destroyConfig);
  };
}
