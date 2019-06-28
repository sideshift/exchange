import { BigNumber } from 'bignumber.js';
import { BaseAction } from './actions';

export const createAction = <P>(type: string, payload?: P) =>
  ({
    type,
    payload,
  } as BaseAction<P>);

export const stringMath = {
  sub: (a: string, b: string) =>
    n(a)
      .minus(b)
      .toString(),
  min: (...args: string[]) => BigNumber.min(...args.map(n)).toString(),
  gt: (a: string, b: string) => n(a).gt(b),
  lt: (a: string, b: string) => n(a).lt(b),
  eq: (a: string, b: string) => n(a).eq(b),
};

export const n = (value: any) => new BigNumber(value);
