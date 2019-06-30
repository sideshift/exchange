import { Action } from 'redux';

export interface ActionWithPayload<P> extends Action<string> {
  payload: P;
}

export enum OrderSide {
  Buy = 'BUY',
  Sell = 'SELL',
}
