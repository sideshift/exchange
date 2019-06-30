import { Reducer, Action, AnyAction } from 'redux';
import { ActionWithPayload, Side } from '../types';
import { createAction, ns } from '../utils';
import { findIndex, flow, groupBy, chain } from 'lodash';
import assert = require('assert');

export const NAME = '@@order-book';

export const ORDER_BOOK_INSERT_ACTION = `${NAME}/ORDER_BOOK_INSERT_ACTION`;
export const ORDER_BOOK_REDUCE_ACTION = `${NAME}/ORDER_BOOK_REDUCE_ACTION`;
export const ORDER_BOOK_REMOVE_ACTION = `${NAME}/ORDER_BOOK_REMOVE_ACTION`;

export interface OrderBookEntry {
  readonly price: string;
  readonly size: string;
  readonly orderId: string;
}

export interface OrderBookInsertActionPayload {
  readonly side: Side;
  readonly price: string;
  readonly size: string;
  readonly orderId: string;
}

export interface OrderBookInsertAction extends ActionWithPayload<OrderBookInsertActionPayload> {}

export const orderBookInsertAction = (payload: OrderBookInsertActionPayload) =>
  createAction(ORDER_BOOK_INSERT_ACTION, payload);

export const isOrderBookInsertAction = (action: Action): action is OrderBookInsertAction =>
  action.type === ORDER_BOOK_INSERT_ACTION;

export interface OrderBookReduceActionPayload {
  readonly side: Side;
  readonly amount: string;
  readonly orderId: string;
}

export interface OrderBookReduceAction extends ActionWithPayload<OrderBookReduceActionPayload> {}

export const orderBookReduceAction = (payload: OrderBookReduceActionPayload) =>
  createAction(ORDER_BOOK_REDUCE_ACTION, payload);

export const isOrderBookReduceAction = (action: Action): action is OrderBookReduceAction =>
  action.type === ORDER_BOOK_REDUCE_ACTION;

export interface OrderBookRemoveActionPayload {
  readonly side: Side;
  readonly orderId: string;
}

export interface OrderBookRemoveAction extends ActionWithPayload<OrderBookRemoveActionPayload> {}

export const orderBookRemoveAction = (payload: OrderBookRemoveActionPayload) =>
  createAction(ORDER_BOOK_REMOVE_ACTION, payload);

export const isOrderBookRemoveAction = (action: Action): action is OrderBookRemoveAction =>
  action.type === ORDER_BOOK_REMOVE_ACTION;

export interface OrderBookState {
  bids: OrderBookEntry[];
  offers: OrderBookEntry[];
}

export const initialState: OrderBookState = {
  bids: [],
  offers: [],
};

export interface OrderBookL2Entry {
  readonly price: string;
  readonly size: string;
  readonly count: number;
}

// TODO: Rename to Level2, too hard to read "l2"
export interface OrderBookL2 {
  readonly bids: OrderBookL2Entry[];
  readonly offers: OrderBookL2Entry[];
}

const getState = (state: any) => state[NAME] as OrderBookState;

export const getBestBid = flow(
  getState,
  state => state.bids[0]
);

export const getBestOffer = flow(
  getState,
  state => state.offers[0]
);

// TODO: Terrible performance. Does not know it's sorted
const entriesToL2 = (entries: OrderBookEntry[], side: Side) =>
  chain(entries)
    .groupBy(entry => entry.price)
    .values()
    .map(
      group =>
        ({
          price: group[0].price,
          size: ns.sum(...group.map(_ => _.size)),
          count: group.length,
        } as OrderBookL2Entry)
    )
    .sort((a, b) => ns.cmp(a.price, b.price) * (side === Side.Buy ? -1 : 1))
    .value();

export const getLevel2 = flow(
  getState,
  state =>
    ({
      bids: entriesToL2(state.bids, Side.Buy),
      offers: entriesToL2(state.offers, Side.Sell),
    } as OrderBookL2)
);

export const reducer: Reducer<OrderBookState> = (state = initialState, action: Action) => {
  if (isOrderBookInsertAction(action)) {
    const { orderId, side, price, size } = action.payload;

    const entry: OrderBookEntry = {
      orderId,
      price,
      size,
    };

    if (side === Side.Buy) {
      const { bids } = state;

      // The best (highest) bid is at the top of the book and the worst (lowest)
      // Find the first entry with a lower price and insert right before it
      const index = findIndex(bids, other => ns.lt(other.price, price));
      const nextBids = index === -1 ? [...bids, entry] : [...bids.slice(0, index), entry, ...bids.slice(index)];

      return {
        ...state,
        bids: nextBids,
      };
    }

    if (side === Side.Sell) {
      const { offers } = state;

      // The best (lowest) offer is at the top of the book and the worst (highest)
      // Find the first entry with a higher price and insert right before it
      const index = findIndex(offers, other => ns.gt(other.price, price));
      const nextOffers = index === -1 ? [...offers, entry] : [...offers.slice(0, index), entry, ...offers.slice(index)];

      return {
        ...state,
        offers: nextOffers,
      };
    }
  }

  if (isOrderBookReduceAction(action)) {
    const { side, orderId, amount } = action.payload;

    const target = side === Side.Buy ? state.bids : state.offers;
    const index = findIndex(target, entry => entry.orderId === orderId);

    if (index === -1) {
      throw new Error(`Order not found`);
    }

    const prevEntry = target[index];
    const nextEntry: OrderBookEntry = { ...prevEntry, size: ns.minus(prevEntry.size, amount) };

    if (ns.lte(nextEntry.size, '0')) {
      throw new Error(`Order entry size would become <= 0`);
    }

    const nextEntries = [...target.slice(0, index), nextEntry, ...target.slice(index + 1)];

    if (side === Side.Buy) {
      return {
        ...state,
        bids: nextEntries,
      };
    }

    if (side === Side.Sell) {
      return {
        ...state,
        offers: nextEntries,
      };
    }
  }

  if (isOrderBookRemoveAction(action)) {
    const { side, orderId } = action.payload;

    const target = side === Side.Buy ? state.bids : state.offers;
    const index = findIndex(target, entry => entry.orderId === orderId);

    if (index === -1) {
      throw new Error(`Order not found`);
    }

    const nextEntries = [...target.slice(0, index), ...target.slice(index + 1)];

    if (side === Side.Buy) {
      return {
        ...state,
        bids: nextEntries,
      };
    }

    if (side === Side.Sell) {
      return {
        ...state,
        offers: nextEntries,
      };
    }
  }

  return state;
};
