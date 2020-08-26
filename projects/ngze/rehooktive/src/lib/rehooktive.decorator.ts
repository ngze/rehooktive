import { Observable, Subject } from 'rxjs';
import { Type } from '@angular/core';

import { HooksConfigs } from './hooks-configs';
import { Hook } from './hook.enum';
import { HookConfig } from './hook-config.interface';
import { addHookMethodOnTargetIfMissing, completeSubjectOnInstance } from './internals';

/**
 * Adds subject on the provided target that is used to emit on lifecycle hook calls.
 */
const setupHookSubjectOnTarget = (target: Type<unknown>, subjectPropertyName: symbol) => {
  const isSubjectExists = target[subjectPropertyName];

  if (!isSubjectExists) {
    Object.defineProperty(target, subjectPropertyName, {
      writable: true,
      value: new Subject(),
    });
  }
};

/**
 * Adds functionality to the provided target that emits on each lifecycle hook call.
 */
const setupHookMethodOnTarget = (target: Type<unknown>, methodName: string, subjectPropertyName: symbol) => {
  const originalMethod = target[methodName];

  Object.defineProperty(target, methodName, {
    value(...args: unknown[]) {
      this[subjectPropertyName].next(args[0]);
      return originalMethod.apply(this, ...args);
    },
  });
};

/**
 * Assigns the lifecycle hook observable to the given key on the provided target.
 */
const setupHookObservableOnTargetProperty = (
  target: Type<unknown>,
  key: string | symbol,
  subjectPropertyName: symbol
) => {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get(): Observable<unknown> {
      return this[subjectPropertyName].pipe();
    },
  });
};

/**
 * Adds functionality to the provided target that completes the lifecycle hook subject on destroy.
 */
const setupOnDestroyOnTarget = (target: Type<unknown>, config: HookConfig, destroyConfig: HookConfig) => {
  const originalOnDestroyMethod = target[destroyConfig.methodName];

  Object.defineProperty(target, destroyConfig.methodName, {
    value() {
      completeSubjectOnInstance(this, config.subjectPropertyName);
      originalOnDestroyMethod.apply(this);
    },
  });
};

/**
 * Rehooktive is a property decorator that makes a property to emit when the given type of lifecycle hook occurs.
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
