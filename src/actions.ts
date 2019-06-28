import { Action } from 'redux';
import { createAction } from './utils';
import { Trade, Side, Liquidity, Order } from './types';

export const ACTION_PREFIX = '@@action';

export const FILL_ACTION = `${ACTION_PREFIX}/FILL`;
export const BOOK_ORDER_ACTION = `${ACTION_PREFIX}/BOOK_ORDER`;
export const PARTIAL_FILL_ACTION = `${ACTION_PREFIX}/PARTIAL_FILL`;
export const TRADE_ACTION = `${ACTION_PREFIX}/TRADE`;
export const CREATE_ORDER_ACTION = `${ACTION_PREFIX}/CREATE_ORDER`;
export const INCREMENT_ORDER_ID_COUNTER_ACTION = `${ACTION_PREFIX}/INCREMENT_ORDER_ID_COUNTER`;

export const ACTIONS = <const>[
  TRADE_ACTION,
  INCREMENT_ORDER_ID_COUNTER_ACTION,
  FILL_ACTION,
  CREATE_ORDER_ACTION,
  PARTIAL_FILL_ACTION,
  BOOK_ORDER_ACTION,
];

export type ActionIds = typeof ACTIONS[number];

export interface BaseAction<P> extends Action<ActionIds> {
  readonly payload: P;
}

export type TradeAction = BaseAction<Trade>;

export interface FillActionPayload {
  readonly orderId: string;
  readonly side: Side;
  readonly liquidity: Liquidity;
}

export type FillAction = BaseAction<FillActionPayload>;

export interface PartialFillActionPayload {
  readonly orderId: string;
  readonly side: Side;
  readonly size: string;
  readonly liquidity: Liquidity;
}

// TODO: Stop passing objects around. Use ids
export type PartialFillAction = BaseAction<PartialFillActionPayload>;

export type CreateOrderAction = BaseAction<Order>;

export type BookOrderActionPayload = Order;

export type BookOrderAction = BaseAction<BookOrderActionPayload>;

export const tradeAction = (trade: Trade) => createAction(TRADE_ACTION, trade);

export const fillAction = (payload: FillActionPayload) => createAction(FILL_ACTION, payload);

export const partialFillAction = (payload: PartialFillActionPayload) =>
  createAction(PARTIAL_FILL_ACTION, payload);

export const createOrderAction = (payload: Order) => createAction(CREATE_ORDER_ACTION, payload);

export const bookOrderAction = (payload: BookOrderActionPayload) =>
  createAction(BOOK_ORDER_ACTION, payload);

export interface IncrementOrderIdCounterAction extends Action {}

export const incrementOrderIdCounterAction = () => createAction(INCREMENT_ORDER_ID_COUNTER_ACTION);

export const isIncrementOrderIdCounterAction = (
  action: Action
): action is IncrementOrderIdCounterAction => action.type === INCREMENT_ORDER_ID_COUNTER_ACTION;

export const isCreateOrderAction = (action: Action): action is CreateOrderAction =>
  action.type === CREATE_ORDER_ACTION;

export const isBookOrderAction = (action: Action): action is BookOrderAction =>
  action.type === BOOK_ORDER_ACTION;

export const isTradeAction = (action: Action): action is TradeAction =>
  action.type === TRADE_ACTION;

export const isFillAction = (action: Action): action is FillAction => action.type === FILL_ACTION;

export const isPartialFillAction = (action: Action): action is PartialFillAction =>
  action.type === PARTIAL_FILL_ACTION;
