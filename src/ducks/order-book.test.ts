import {
  reducer,
  orderBookInsertAction,
  OrderBookState,
  initialState,
  OrderBookInsertAction,
  OrderBookEntry,
} from './order-book';
import { upperFirst, pick } from 'lodash';
import assert = require('assert');
import { Side } from '../types';

const parseOrder = (value: string) => {
  const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)$/i);

  // throw new Error(match!.length.toString());

  if (match === null || match.length !== 4) {
    throw new Error(`Invalid ${value} ${match && match.length}`);
  }

  const side = upperFirst(match[1]) as Side;
  const size = match[2];
  const price = match[3];
  const orderId = `${side} ${size} @ ${price}`;

  return {
    orderId,
    side,
    price,
    size,
  };
};

const parseOrderBookEntry = (value: string) => pick(parseOrder(value), ['orderId', 'price', 'size']) as OrderBookEntry;

describe('OrderBook', () => {
  describe('reducer', () => {
    it('Should handle insert bid at top', () => {
      const prevState: OrderBookState = {
        ...initialState,
        bids: [parseOrderBookEntry('Buy 10 @ 200')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Buy 20 @ 50')));

      const expectedState: OrderBookState = {
        bids: [parseOrderBookEntry('Buy 10 @ 200'), parseOrderBookEntry('Buy 20 @ 50')],
        offers: [],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert bid in middle', () => {
      const prevState: OrderBookState = {
        ...initialState,
        bids: [parseOrderBookEntry('Buy 20 @ 200'), parseOrderBookEntry('Buy 10 @ 100')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Buy 15 @ 150')));

      const expectedState: OrderBookState = {
        bids: [
          parseOrderBookEntry('Buy 20 @ 200'),
          parseOrderBookEntry('Buy 15 @ 150'),
          parseOrderBookEntry('Buy 10 @ 100'),
        ],
        offers: [],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert bid at bottom', () => {
      const prevState: OrderBookState = {
        ...initialState,
        bids: [parseOrderBookEntry('Buy 10 @ 200')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Buy 20 @ 50')));

      const expectedState: OrderBookState = {
        ...initialState,
        bids: [parseOrderBookEntry('Buy 10 @ 200'), parseOrderBookEntry('Buy 20 @ 50')],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert offer at top', () => {
      const prevState: OrderBookState = {
        ...initialState,
        offers: [parseOrderBookEntry('Sell 20 @ 200')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Sell 10 @ 100')));

      const expectedState: OrderBookState = {
        ...initialState,
        offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert offer in middle', () => {
      const prevState: OrderBookState = {
        ...initialState,
        offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Sell 15 @ 150')));

      const expectedState: OrderBookState = {
        ...initialState,
        offers: [
          parseOrderBookEntry('Sell 10 @ 100'),
          parseOrderBookEntry('Sell 15 @ 150'),
          parseOrderBookEntry('Sell 20 @ 200'),
        ],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert offer at bottom', () => {
      const prevState: OrderBookState = {
        ...initialState,
        offers: [parseOrderBookEntry('Sell 10 @ 100')],
      };

      const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Sell 20 @ 200')));

      const expectedState: OrderBookState = {
        ...initialState,
        offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
      };

      expect(nextState).toEqual(expectedState);
    });
  });
});
