import { Action } from 'redux';
import { EffectType } from './effects';

export interface ActionWithPayload<P, T = string> extends Action<T> {
  payload: P;
}

export enum OrderSide {
  Buy = 'BUY',
  Sell = 'SELL',
}

export enum TradeSide {
  Buy = 'BUY',
  Sell = 'SELL',
}
