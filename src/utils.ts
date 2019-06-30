import { Action } from 'redux';
import BigNumber from 'bignumber.js';
import { call } from 'redux-saga/effects';
import { ActionType as OrderActionType } from './ducks/orders';
import { ActionType as OrderBookActionType } from './ducks/order-book';
import { ActionType as TradeActionType } from './ducks/trades';

export interface ActionWithPayload<T, P = never> extends Action<T> {
  readonly payload: P;
}

export type ActionType = OrderActionType | OrderBookActionType | TradeActionType;

export function createAction<P = any | undefined>(type: ActionType, payload: P): ActionWithPayload<ActionType, P> {
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

export const log = (...args: any[]) => call(console.log.bind(console), ...args);

// Gives you the type of a field K in type T
export type FieldType<T, K extends keyof T> = T[K];
