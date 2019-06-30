import { Action } from 'redux';

export interface ActionWithPayload<P> extends Action<string> {
  payload: P;
}

export enum Side {
  Buy = 'Buy',
  Sell = 'Sell',
}
