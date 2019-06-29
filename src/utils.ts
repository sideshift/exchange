import { Action } from 'redux';
import BigNumber from 'bignumber.js';

export interface ActionWithPayload<T, P = never> extends Action<T> {
  readonly payload: P;
}

export function createAction<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P> {
  return { type, payload };
}

export const n = (value: any) => new BigNumber(value);

export const ns = {
  minus: (a: string, b: string) =>
    n(a)
      .minus(b)
      .toString(),
  min: (...args: string[]) => BigNumber.min(...args.map(n)).toString(),
  gt: (a: string, b: string) => n(a).gt(b),
  lt: (a: string, b: string) => n(a).lt(b),
  eq: (a: string, b: string) => n(a).eq(b),
};
