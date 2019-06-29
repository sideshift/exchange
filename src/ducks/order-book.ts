import { Reducer, Action, AnyAction } from 'redux';
import { ActionWithPayload, Side } from '../types';
import { createAction, ns } from '../utils';
import { findIndex } from 'lodash';

const NAME = '@@order-book';

export const ORDER_BOOK_INSERT_ACTION = `${NAME}/ORDER_BOOK_INSERT_ACTION`;

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

export interface OrderBookState {
  bids: OrderBookEntry[];
  offers: OrderBookEntry[];
}

export const initialState: OrderBookState = {
  bids: [],
  offers: [],
};

export const reducer: Reducer<OrderBookState> = (state = initialState, action: Action) => {
  if (isOrderBookInsertAction(action)) {
    const { orderId, side, price, size } = action.payload;

    const entry: OrderBookEntry = {
      orderId,
      price,
      size,
    };

    if (side === 'Buy') {
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

    if (side === 'Sell') {
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

  return state;
};
