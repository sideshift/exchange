// TODO: Should this be called executions?
import { Reducer, Action } from 'redux';
import { ActionWithPayload, TradeSide } from '../types';
import { createAction } from '../utils';
import { flow, last } from 'lodash';

export const NAME = '@@trades';

export enum ActionType {
  Trade = '@@trades/TRADES_TRADE_ACTION',
  IncrSeq = '@@trades/TRADES_INCR_SEQ_ACTION',
}

export interface Trade {
  // readonly id: string;
  readonly side: TradeSide;
  readonly price: string;
  readonly size: string;
}

export interface TradeActionPayload extends Trade {}

export interface TradeAction extends ActionWithPayload<TradeActionPayload, ActionType.Trade> {}

export const tradeAction = (payload: TradeActionPayload) => createAction(ActionType.Trade, payload);

export const isTradeAction = (action: Action<ActionType>): action is TradeAction => action.type === ActionType.Trade;

export type TradesState = {
  readonly seq: number;
  readonly items: Trade[];
};

export interface IncrTradeSeqAction extends Action<ActionType.IncrSeq> {}

export const incrTradeSeqAction = () => ({ type: ActionType.IncrSeq });

export const isIncrTradeSeqAction = (action: Action<ActionType>): action is IncrTradeSeqAction =>
  action.type === ActionType.IncrSeq;

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
