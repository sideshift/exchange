import { Reducer, Action, AnyAction } from 'redux';
import { ActionWithPayload, OrderSide } from '../types';
import { createAction, ns } from '../utils';
import { findIndex, flow, groupBy, chain, without, omit } from 'lodash';
import assert = require('assert');
import { select, put } from 'redux-saga/effects';

export const NAME = '@@orders';

export enum OrderStatus {
  New = 'New',
  PartiallyFilled = 'PartiallyFilled',
  Filled = 'Filled',
  Canceled = 'Canceled',
}

export interface Order {
  readonly id: string;
  readonly side: OrderSide;
  readonly price: string;
  readonly status: OrderStatus;
  readonly qty: string;
  readonly leavesQty: string;
}

export enum ActionType {
  OrderRest = '@@orders/ORDER_REST_ACTON',
  OrderFill = '@@orders/ORDER_FILL_ACTION',
  OrderPartialFill = '@@orders/ORDER_PARTIAL_FILL_ACTION',
  OrderCancel = '@@orders/ORDER_CANCEL_ACTON',
  IncrSeq = '@@orders/INCR_SEQ_ACTION',
}

export interface OrderRestActionPayload extends Omit<Order, 'status' | 'leavesQty'> {}

export interface OrderRestAction extends ActionWithPayload<OrderRestActionPayload> {}

export const orderRestAction = (payload: OrderRestActionPayload) => createAction(ActionType.OrderRest, payload);

export const isOrderRestAction = (action: Action): action is OrderRestAction => action.type === ActionType.OrderRest;

export interface OrderFillActionPayload {
  readonly id: string;
}

export interface OrderFillAction extends ActionWithPayload<OrderFillActionPayload> {}

export const orderFillAction = (payload: OrderFillActionPayload) => createAction(ActionType.OrderFill, payload);

export const isOrderFillAction = (action: Action): action is OrderFillAction => action.type === ActionType.OrderFill;

export interface OrderPartialFillActionPayload {
  readonly id: string;
  readonly amount: string;
}

export interface OrderPartialFillAction extends ActionWithPayload<OrderPartialFillActionPayload> {}

export const orderPartialFillAction = (payload: OrderPartialFillActionPayload) =>
  createAction(ActionType.OrderPartialFill, payload);

export const isOrderPartialFillAction = (action: Action): action is OrderPartialFillAction =>
  action.type === ActionType.OrderPartialFill;

export interface OrderCancelActionPayload {
  readonly id: string;
}

export interface OrderCancelAction extends ActionWithPayload<OrderCancelActionPayload> {}

export const orderCancelAction = (payload: OrderCancelActionPayload) => createAction(ActionType.OrderCancel, payload);

export const isOrderCancelAction = (action: Action): action is OrderCancelAction =>
  action.type === ActionType.OrderCancel;

export interface IncrOrderSeqAction extends Action {}

export const incrOrderSeqAction = () => createAction(ActionType.IncrSeq, undefined);

export const isIncrOrderSeqAction = (action: Action): action is IncrOrderSeqAction =>
  action.type === ActionType.IncrSeq;

export type OrdersItemsState = {
  [id: string]: Order;
};

export const initialItemsState: OrdersItemsState = {};

export type OrdersState = {
  readonly seq: number;
  readonly items: OrdersItemsState;
};

export const initialState: OrdersState = {
  seq: 1,
  items: initialItemsState,
};

const getState = (state: any) => state[NAME] as OrdersState;

export const getOrderSeq = flow(
  getState,
  state => state.seq
);

const getItems = flow(
  getState,
  state => state.items
);

export const getOrder = (state: any, orderId: string) => state[NAME].items[orderId] as Order;

const validatePreviousStatus = (previous: OrderStatus, next: Exclude<OrderStatus, OrderStatus.New>) => {
  const valid: { [status in Exclude<OrderStatus, OrderStatus.New>]: OrderStatus[] } = {
    PartiallyFilled: [OrderStatus.New, OrderStatus.PartiallyFilled],
    Filled: [OrderStatus.New, OrderStatus.PartiallyFilled],
    Canceled: [OrderStatus.New, OrderStatus.PartiallyFilled, OrderStatus.Filled],
  };

  const isValid = valid[next].includes(previous);

  if (!isValid) {
    throw new Error(`Cannot transition from ${previous} to ${next}`);
  }
};

export const itemsReducer: Reducer<OrdersItemsState> = (state = initialItemsState, action: Action) => {
  if (isOrderRestAction(action)) {
    const { id, price, qty, side } = action.payload;

    if (state[id] !== undefined) {
      throw new Error(`Order ${id} already resting`);
    }

    const order: Order = {
      id,
      side,
      price,
      qty,
      leavesQty: qty,
      status: OrderStatus.New,
    };

    return {
      ...state,
      [id]: order,
    };
  }

  if (isOrderFillAction(action)) {
    const { id } = action.payload;

    const prevOrder = state[id];

    if (prevOrder === undefined) {
      throw new Error(`Order not found`);
    }

    validatePreviousStatus(prevOrder.status, OrderStatus.Filled);

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: '0',
      status: OrderStatus.Filled,
    };

    return {
      ...state,
      [id]: nextOrder,
    };
  }

  if (isOrderPartialFillAction(action)) {
    const { id, amount } = action.payload;

    const prevOrder = state[id];

    if (prevOrder === undefined) {
      throw new Error(`Order not found`);
    }

    validatePreviousStatus(prevOrder.status, OrderStatus.PartiallyFilled);

    const nextLeavesQty = ns.minus(prevOrder.leavesQty, amount);

    if (ns.lte(nextLeavesQty, '0')) {
      throw new Error(`leavesQty would become <= 0`);
    }

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: nextLeavesQty,
      status: OrderStatus.PartiallyFilled,
    };

    return {
      ...state,
      [id]: nextOrder,
    };
  }

  if (isOrderCancelAction(action)) {
    const { id } = action.payload;

    const prevOrder = state[id];

    if (prevOrder === undefined) {
      throw new Error(`Order not found`);
    }

    validatePreviousStatus(prevOrder.status, OrderStatus.Canceled);

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: '0',
      status: OrderStatus.Canceled,
    };

    return {
      ...state,
      [id]: nextOrder,
    };
  }

  return state;
};

export const reducer: Reducer<OrdersState> = (state = initialState, action: Action) => {
  const { items } = state;

  if (isIncrOrderSeqAction(action)) {
    return {
      ...state,
      seq: state.seq + 1,
    };
  }

  return {
    ...state,
    items: itemsReducer(items, action),
  };
};
