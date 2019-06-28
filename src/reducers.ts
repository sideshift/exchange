import assert = require('assert');
import { findIndex } from 'lodash';
import { stringMath } from './utils';
import { Reducer, Action } from 'redux';

import {
  isIncrementOrderIdCounterAction,
  isCreateOrderAction,
  isBookOrderAction,
  isTradeAction,
  isFillAction,
  isPartialFillAction,
} from './actions';
import { State, OrderBookEntry, Order, OrderStatus } from './types';

const INITIAL_STATE: State = {
  orderIdCounter: 1,
  bids: [],
  asks: [],
  orders: {},
  trades: [],
};

const addOrderEntry = (entries: OrderBookEntry[], order: Order) => {
  const { orderId, price, leavesQty, side } = order;

  const entry: OrderBookEntry = {
    orderId,
    price,
    size: leavesQty,
  };

  const index = findIndex(entries, other =>
    side === 'buy' ? stringMath.lt(other.price, price) : stringMath.gt(other.price, price)
  );

  if (index === -1) {
    return [...entries, entry];
  }

  const left = entries.slice(0, index);
  const right = entries.slice(index);

  return [...left, entry, ...right];
};

const modifyOrderBookEntry = (
  entries: OrderBookEntry[],
  orderId: string,
  projection: (entry: OrderBookEntry) => OrderBookEntry
) => {
  const index = entries.findIndex(_ => _.orderId === orderId);
  assert(index !== -1, `Order ${orderId} not found`);

  const entry = entries[index];
  const left = entries.slice(0, index);
  const right = entries.slice(index + 1);
  const nextEntry = projection(entry);

  return [...left, nextEntry, ...right];
};

const removeOrderBookEntry = (entries: OrderBookEntry[], orderId: string) => {
  const index = entries.findIndex(_ => _.orderId === orderId);
  assert(index !== -1, `Order ${orderId} not found`);

  const left = entries.slice(0, index);
  const right = entries.slice(index + 1);

  return [...left, ...right];
};

export const reducer: Reducer<State> = (state: State = INITIAL_STATE, action: any) => {
  if (isIncrementOrderIdCounterAction(action)) {
    return { ...state, orderIdCounter: state.orderIdCounter + 1 };
  }

  if (isCreateOrderAction(action)) {
    const order = action.payload;
    const { orderId } = order;

    return {
      ...state,
      orders: { ...state.orders, [orderId]: order },
    };
  }

  if (isBookOrderAction(action)) {
    const order = action.payload;
    const { side } = order;

    if (side === 'buy') {
      return {
        ...state,
        bids: addOrderEntry(state.bids, order),
      };
    }

    if (side === 'sell') {
      return {
        ...state,
        asks: addOrderEntry(state.asks, order),
      };
    }
  }

  if (isTradeAction(action)) {
    const trade = action.payload;

    return {
      ...state,
      trades: [...state.trades, trade],
    };
  }

  if (isFillAction(action)) {
    const { orderId, side, liquidity } = action.payload;

    assert(state.orders[orderId]);

    const nextOrders = {
      ...state.orders,
      [orderId]: {
        ...state.orders[orderId],
        status: 'Filled' as OrderStatus,
        leavesQty: '0',
      },
    };

    if (liquidity === 'Taker') {
      return {
        ...state,
        orders: nextOrders,
      };
    }
    return {
      ...state,
      orders: nextOrders,
      bids: side === 'buy' ? removeOrderBookEntry(state.bids, orderId) : state.bids,
      asks: side === 'sell' ? removeOrderBookEntry(state.asks, orderId) : state.asks,
    };
  }

  if (isPartialFillAction(action)) {
    const { orderId, side, size, liquidity } = action.payload; // TODO: Pass orderId

    assert(state.orders[orderId]);

    const nextOrders = {
      ...state.orders,
      [orderId]: {
        ...state.orders[orderId],
        status: 'PartiallyFilled' as OrderStatus,
        leavesQty: stringMath.sub(state.orders[orderId].leavesQty, size),
      },
    };

    if (liquidity === 'Taker') {
      return {
        ...state,
        orders: nextOrders,
      };
    }

    if (side === 'buy') {
      const { bids } = state;

      return {
        ...state,
        orders: nextOrders,
        bids: modifyOrderBookEntry(bids, orderId, prev => ({
          ...prev,
          size: stringMath.sub(prev.size, size),
        })),
      };
    }

    if (side === 'sell') {
      const { asks } = state;

      return {
        ...state,
        orders: nextOrders,
        asks: modifyOrderBookEntry(asks, orderId, prev => ({
          ...prev,
          size: stringMath.sub(prev.size, size),
        })),
      };
    }
  }

  console.log('Unhandled action', (action as Action).type);

  return state;
};
