/**
 * Interface of lifecycle hook configuration used to setup method name, subject property name, etc.
 */
export interface HookConfig {
  /**
   * Lifecycle hook method name.
   */
  readonly methodName: string;

  /**
   * Lifecycle hook subject property name.
   */
  readonly subjectPropertyName: symbol;
}
