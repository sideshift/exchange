import { Action } from 'redux';

export interface ActionWithPayload<P> extends Action<string> {
  payload: P;
}

export type Side = 'Buy' | 'Sell';
