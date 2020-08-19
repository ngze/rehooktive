import { Hook } from './hook.enum';
import { HookConfig } from './hook-config.interface';

/**
 * Configurations for all the available lifecycle hooks.
 */
export const HooksConfigs: Record<Hook, HookConfig> = {
  [Hook.OnChanges]: {
    methodName: 'ngOnChanges',
    subjectPropertyName: Symbol('__ngOnChangesSubject__'),
  },
  [Hook.OnInit]: {
    methodName: 'ngOnInit',
    subjectPropertyName: Symbol('__ngOnInitSubject__'),
  },
  [Hook.DoCheck]: {
    methodName: 'ngDoCheck',
    subjectPropertyName: Symbol('__ngDoCheckSubject__'),
  },
  [Hook.AfterViewInit]: {
    methodName: 'ngAfterViewInit',
    subjectPropertyName: Symbol('__ngAfterViewInitSubject__'),
  },
  [Hook.AfterViewChecked]: {
    methodName: 'ngAfterViewChecked',
    subjectPropertyName: Symbol('__ngAfterViewCheckedSubject__'),
  },
  [Hook.AfterContentInit]: {
    methodName: 'ngAfterContentInit',
    subjectPropertyName: Symbol('__ngAfterContentInitSubject__'),
  },
  [Hook.AfterContentChecked]: {
    methodName: 'ngAfterContentChecked',
    subjectPropertyName: Symbol('__ngAfterContentCheckedSubject__'),
  },
  [Hook.OnDestroy]: {
    methodName: 'ngOnDestroy',
    subjectPropertyName: Symbol('__ngOnDestroySubject__'),
  },
};
