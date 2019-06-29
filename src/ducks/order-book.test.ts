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
    it('Should handle insert bid at bottom', () => {
      const prevState: OrderBookState = {
        ...initialState,
        bids: [
          {
            orderId: '10 @ 200',
            size: '10',
            price: '200',
          },
        ],
      };

      const nextState = reducer(
        prevState,
        orderBookInsertAction({
          orderId: '20 @ 50',
          side: 'Buy',
          price: '50',
          size: '20',
        })
      );

      const expectedState: OrderBookState = {
        bids: [
          {
            orderId: '10 @ 200',
            size: '10',
            price: '200',
          },
          {
            orderId: '20 @ 50',
            price: '50',
            size: '20',
          },
        ],
        offers: [],
      };

      expect(nextState).toEqual(expectedState);
    });

    it('Should handle insert bid at top', () => {
      const prevState: OrderBookState = {
        ...initialState,
        bids: [parseOrderBookEntry('Buy 10 @ 200')],
      };

      const nextState = reducer(
        prevState,
        orderBookInsertAction({
          orderId: 'Buy 20 @ 50',
          side: 'Buy',
          price: '50',
          size: '20',
        })
      );

      const expectedState: OrderBookState = {
        bids: [
          {
            orderId: 'Buy 10 @ 200',
            size: '10',
            price: '200',
          },
          {
            orderId: 'Buy 20 @ 50',
            price: '50',
            size: '20',
          },
        ],
        offers: [],
      };

      expect(nextState).toEqual(expectedState);
    });
  });
});
