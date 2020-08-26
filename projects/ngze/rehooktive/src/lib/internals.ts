import { Type, ɵivyEnabled as ivyEnabled } from '@angular/core';

/**
 * Type guard for functions.
 */
export const isFunction = (value: unknown): value is () => {} => typeof value === 'function';

/**
 * Completes subject on the provided instance by property name.
 */
export const completeSubjectOnInstance = (instance: object, subjectPropertyName: symbol) => {
  instance[subjectPropertyName].next();
  instance[subjectPropertyName].complete();
  instance[subjectPropertyName] = null;
};

/**
 * Adds lifecycle hook method if missing.
 * Throws an error when Ivy is disabled/not available.
 */
export const addHookMethodOnTargetIfMissing = (target: Type<unknown>, methodName: string) => {
  if (!isFunction(target[methodName])) {
    if (ivyEnabled) {
      target.constructor.prototype[methodName] = () => {};
    } else {
      throw new Error(`${target.constructor.name} is using Rehooktive for ${methodName} but it wasn't implemented.`);
    }
  }
};
