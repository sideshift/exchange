// TODO: Should this be called executions?
import { Reducer, Action } from 'redux';
import { ActionWithPayload, TradeSide } from '../types';
import { createAction } from '../utils';
import { flow, last } from 'lodash';

export const NAME = '@@trades';

export enum ActionTypes {
  Trade = '@@trades/TRADE_ACTION',
  IncrSeq = '@@trades/INCR_SEQ_ACTION',
}

export interface Trade {
  // readonly id: string;
  readonly side: TradeSide;
  readonly price: string;
  readonly size: string;
}

export interface TradeActionPayload extends Trade {}

export interface TradeAction extends ActionWithPayload<TradeActionPayload, ActionTypes.Trade> {}

export const tradeAction = (payload: TradeActionPayload) => createAction(ActionTypes.Trade, payload);

export const isTradeAction = (action: Action<ActionTypes>): action is TradeAction => action.type === ActionTypes.Trade;

export type TradesState = {
  readonly seq: number;
  readonly items: Trade[];
};

export interface IncrTradeSeqAction extends Action<ActionTypes.IncrSeq> {}

export const incrTradeSeqAction = () => ({ type: ActionTypes.IncrSeq });

export const isIncrTradeSeqAction = (action: Action<ActionTypes>): action is IncrTradeSeqAction =>
  action.type === ActionTypes.IncrSeq;

export const initialState: TradesState = { seq: 1, items: [] };

const getState = (state: any) => state[NAME] as TradesState;

const getItems = flow(
  getState,
  state => state.items
);

export const reducer: Reducer<TradesState> = (state = initialState, action: Action) => {
  if (isIncrTradeSeqAction(action)) {
    return {
      ...state,
      seq: state.seq + 1,
    };
  }

  if (isTradeAction(action)) {
    return {
      ...state,
      items: [action.payload, ...state.items],
    };
  }

  return state;
};
