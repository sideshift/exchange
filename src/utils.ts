import { Action } from 'redux';
import BigNumber from 'bignumber.js';

export interface ActionWithPayload<T, P = never> extends Action<T> {
  readonly payload: P;
}

export function createAction<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P> {
  return { type, payload };
}

export const n = (value: BigNumber.Value) => new BigNumber(value);

export const ns = {
  minus: (a: BigNumber.Value, b: BigNumber.Value) =>
    n(a)
      .minus(b)
      .toString(),
  min: (...args: BigNumber.Value[]) => BigNumber.min(...args.map(n)).toString(),
  sum: (...args: BigNumber.Value[]) => BigNumber.sum(...args.map(n)).toString(),
  gt: (a: BigNumber.Value, b: BigNumber.Value) => n(a).gt(b),
  lt: (a: BigNumber.Value, b: BigNumber.Value) => n(a).lt(b),
  lte: (a: BigNumber.Value, b: BigNumber.Value) => n(a).lte(b),
  eq: (a: BigNumber.Value, b: BigNumber.Value) => n(a).eq(b),
  cmp: (a: BigNumber.Value, b: BigNumber.Value) => n(a).comparedTo(b),
};
