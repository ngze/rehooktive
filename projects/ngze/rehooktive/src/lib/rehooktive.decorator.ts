import { Observable, Subject } from 'rxjs';
import { Type, ɵivyEnabled as ivyEnabled } from '@angular/core';

import { HooksConfigs } from './hooks-configs';
import { Hook } from './hook.enum';
import { HookConfig } from './hook-config.interface';

export const isFunction = (value: unknown): value is () => {} => {
  return typeof value === 'function';
};

const setupHookSubjectOnTarget = (target: Type<unknown>, config: HookConfig) => {
  const subjectStoreProperty = '_'.concat(config.subjectPropertyName.toString());

  Object.defineProperties(target, {
    [config.subjectPropertyName]: {
      get(): Subject<unknown> {
        return (this[subjectStoreProperty] = this[subjectStoreProperty] || new Subject());
      },
    },
  });
};

const completeSubjectOnInstance = (instance: object, config: HookConfig) => {
  instance[config.subjectPropertyName].next();
  instance[config.subjectPropertyName].complete();
  instance[config.subjectPropertyName] = null;
};

const setupHookMethodOnTarget = (target: Type<unknown>, config: HookConfig) => {
  const originalMethod = target[config.methodName];

  Object.defineProperties(target, {
    [config.methodName]: {
      value(...args: unknown[]): void {
        this[config.subjectPropertyName].next(args[0]);
        originalMethod.apply(this, ...args);
      },
    },
  });
};

const setupHookObservableOnTargetProperty = (target: Type<unknown>, key: string | symbol, config: HookConfig) => {
  Object.defineProperties(target, {
    [key]: {
      enumerable: true,
      configurable: true,
      get(): Observable<unknown> {
        return this[config.subjectPropertyName].pipe();
      },
    },
  });
};

const setupOnDestroyOnTarget = (target: Type<unknown>, config: HookConfig, destroyConfig: HookConfig) => {
  const originalOnDestroyMethod = target[destroyConfig.methodName];

  Object.defineProperties(target, {
    [destroyConfig.methodName]: {
      value(): void {
        completeSubjectOnInstance(this, config);
        completeSubjectOnInstance(this, destroyConfig);
        originalOnDestroyMethod.apply(this);
      },
    },
  });
};

const addHookMethodOnTargetIfMissing = (target: Type<unknown>, config: HookConfig) => {
  if (!isFunction(target[config.methodName])) {
    if (ivyEnabled) {
      target.constructor.prototype[config.methodName] = () => {};
    } else {
      throw new Error(
        `${target.constructor.name} is using Rehooktive for ${config.methodName} but it wasn't implemented.`
      );
    }
  }
};

/**
 * Rehooktive is a property decorator that makes property to emits when the given type of lifecycle hook occurs.
 */
export function Rehooktive(hook: Hook): PropertyDecorator {
  return (target: Type<unknown>, key: string | symbol) => {
    const config = HooksConfigs[hook];
    const destroyConfig = HooksConfigs[Hook.OnDestroy];

    addHookMethodOnTargetIfMissing(target, config);
    addHookMethodOnTargetIfMissing(target, destroyConfig);

    setupHookSubjectOnTarget(target, config);
    setupHookObservableOnTargetProperty(target, key, config);
    setupHookMethodOnTarget(target, config);
    setupOnDestroyOnTarget(target, config, destroyConfig);
  };
}
