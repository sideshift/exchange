import { Reducer, Action, AnyAction } from 'redux';
import { ActionWithPayload, Side } from '../types';
import { createAction, ns } from '../utils';
import { findIndex, flow, groupBy, chain, without, omit } from 'lodash';
import assert = require('assert');

export const NAME = '@@order';

export const ORDER_REST_ACTION = `${NAME}/ORDER_REST_ACTION`;
export const ORDER_FILL_ACTION = `${NAME}/ORDER_FILL_ACTION`;
export const ORDER_PARTIAL_FILL_ACTION = `${NAME}/ORDER_PARTIAL_FILL_ACTION`;
export const ORDER_CANCEL_ACTION = `${NAME}/ORDER_CANCEL_ACTION`;

export const ORDER_STATUSES = <const>['New', 'PartiallyFilled', 'Filled', 'Canceled'];

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface Order {
  readonly id: string;
  readonly side: Side;
  readonly price: string;
  readonly status: OrderStatus;
  readonly qty: string;
  readonly leavesQty: string;
}

export interface OrderRestActionPayload extends Omit<Order, 'status' | 'leavesQty'> {}

export interface OrderRestAction extends ActionWithPayload<OrderRestActionPayload> {}

export const orderRestAction = (payload: OrderRestActionPayload) => createAction(ORDER_REST_ACTION, payload);

export const isOrderRestAction = (action: Action): action is OrderRestAction => action.type === ORDER_REST_ACTION;

export interface OrderFillActionPayload {
  readonly id: string;
}

export interface OrderFillAction extends ActionWithPayload<OrderFillActionPayload> {}

export const OrderFillAction = (payload: OrderFillActionPayload) => createAction(ORDER_FILL_ACTION, payload);

export const isOrderFillAction = (action: Action): action is OrderFillAction => action.type === ORDER_FILL_ACTION;

export interface OrderPartialFillActionPayload {
  readonly id: string;
  readonly amount: string;
}

export interface OrderPartialFillAction extends ActionWithPayload<OrderPartialFillActionPayload> {}

export const OrderPartialFillAction = (payload: OrderPartialFillActionPayload) =>
  createAction(ORDER_PARTIAL_FILL_ACTION, payload);

export const isOrderPartialFillAction = (action: Action): action is OrderPartialFillAction =>
  action.type === ORDER_PARTIAL_FILL_ACTION;

export interface OrderCancelActionPayload {
  readonly id: string;
}

export interface OrderCancelAction extends ActionWithPayload<OrderCancelActionPayload> {}

export const orderCancelAction = (payload: OrderCancelActionPayload) => createAction(ORDER_CANCEL_ACTION, payload);

export const isOrderCancelAction = (action: Action): action is OrderCancelAction => action.type === ORDER_CANCEL_ACTION;

export type OrdersState = {
  [id: string]: Order;
};

export const initialState: OrdersState = {};

const getState = (state: any) => state[NAME] as OrdersState;

const validatePreviousStatus = (previous: OrderStatus, next: Exclude<OrderStatus, 'New'>) => {
  const valid: { [status in Exclude<OrderStatus, 'New'>]: OrderStatus[] } = {
    PartiallyFilled: ['New', 'PartiallyFilled'],
    Filled: ['New', 'PartiallyFilled'],
    Canceled: ['New', 'PartiallyFilled', 'Filled'],
  };

  const isValid = valid[next].includes(previous);

  if (!isValid) {
    throw new Error(`Cannot transition from ${previous} to ${next}`);
  }
};

export const reducer: Reducer<OrdersState> = (state = initialState, action: Action) => {
  if (isOrderRestAction(action)) {
    const { id, price, qty, side } = action.payload;
    assert(!state[id]);

    const order: Order = {
      id,
      side,
      price,
      qty,
      leavesQty: qty,
      status: 'New',
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

    validatePreviousStatus(prevOrder.status, 'Filled');

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: '0',
      status: 'Filled',
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

    validatePreviousStatus(prevOrder.status, 'PartiallyFilled');

    const nextLeavesQty = ns.minus(prevOrder.leavesQty, amount);

    if (ns.lte(nextLeavesQty, '0')) {
      throw new Error(`leavesQty would become <= 0`);
    }

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: nextLeavesQty,
      status: 'PartiallyFilled',
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

    validatePreviousStatus(prevOrder.status, 'Canceled');

    const nextOrder: Order = {
      ...prevOrder,
      leavesQty: '0',
      status: 'Canceled',
    };

    return {
      ...state,
      [id]: nextOrder,
    };
  }

  return state;
};
