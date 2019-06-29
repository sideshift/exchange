import {
  reducer,
  orderBookInsertAction,
  OrderBookState,
  initialState,
  OrderBookEntry,
  orderBookReduceAction,
  orderBookRemoveAction,
  getLevel2,
  NAME,
  OrderBookL2,
} from './order-book';
import { upperFirst, pick } from 'lodash';
import { Side } from '../types';

const parseOrder = (value: string) => {
  const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)(.+)?$/i);

  if (match === null || match.length < 5) {
    throw new Error(`Invalid ${value} ${match && match.length}`);
  }

  const side = upperFirst(match[1]) as Side;
  const size = match[2];
  const price = match[3];
  const orderIdSuffix = match[4] || '';
  const orderId = `${side} ${size} @ ${price}${orderIdSuffix}`;

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
    describe('Insert', () => {
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

        const nextState = reducer(prevState, orderBookInsertAction(parseOrder('Buy 15 @ 100.5')));

        const expectedState: OrderBookState = {
          bids: [
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 15 @ 100.5'),
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

    describe('Reduce', () => {
      it('Should handle reduce bid', () => {
        const prevState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        const nextState = reducer(
          prevState,
          orderBookReduceAction({
            orderId: 'Buy 20 @ 200',
            amount: '3',
            side: 'Buy',
          })
        );

        const expectedState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            {
              ...parseOrderBookEntry('Buy 20 @ 200'),
              size: '17',
            },
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        expect(nextState).toEqual(expectedState);
      });

      it('Should handle reduce offer', () => {
        const prevState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            parseOrderBookEntry('Sell 20 @ 200'),
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        const nextState = reducer(
          prevState,
          orderBookReduceAction({
            orderId: 'Sell 20 @ 200',
            amount: '3',
            side: 'Sell',
          })
        );

        const expectedState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            {
              ...parseOrderBookEntry('Sell 20 @ 200'),
              size: '17',
            },
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        expect(nextState).toEqual(expectedState);
      });

      it('Should throw when bid to reduce is not found', () => {
        const prevState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Buy 5 @ 50',
              amount: '3',
              side: 'Buy',
            })
          )
        ).toThrow(/not found/);
      });

      it('Should throw when reducing bid size to zero', () => {
        const prevState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Buy 10 @ 100',
              amount: '10',
              side: 'Buy',
            })
          )
        ).toThrow(/<= 0/);
      });

      it('Should throw when reducing bid size below zero', () => {
        const prevState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Buy 10 @ 100',
              amount: '20',
              side: 'Buy',
            })
          )
        ).toThrow(/<= 0/);
      });

      it('Should throw when offer to reduce is not found', () => {
        const prevState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            parseOrderBookEntry('Sell 20 @ 200'),
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Sell 5 @ 50',
              amount: '3',
              side: 'Sell',
            })
          )
        ).toThrow(/not found/);
      });

      it('Should throw when reducing offer size to zero', () => {
        const prevState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            parseOrderBookEntry('Sell 20 @ 200'),
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Sell 10 @ 100',
              amount: '10',
              side: 'Sell',
            })
          )
        ).toThrow(/<= 0/);
      });

      it('Should throw when reducing offer size below zero', () => {
        const prevState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            parseOrderBookEntry('Sell 20 @ 200'),
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookReduceAction({
              orderId: 'Sell 10 @ 100',
              amount: '20',
              side: 'Sell',
            })
          )
        ).toThrow(/<= 0/);
      });
    });

    describe('Remove', () => {
      it('Should throw when bid to remove is not found', () => {
        const prevState: OrderBookState = {
          ...initialState,
          bids: [
            parseOrderBookEntry('Buy 30 @ 300'),
            parseOrderBookEntry('Buy 20 @ 200'),
            parseOrderBookEntry('Buy 10 @ 100'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookRemoveAction({
              orderId: 'Buy 5 @ 50',
              side: 'Buy',
            })
          )
        ).toThrow(/not found/);
      });

      it('Should throw when offer to reduce is not found', () => {
        const prevState: OrderBookState = {
          ...initialState,
          offers: [
            parseOrderBookEntry('Sell 10 @ 100'),
            parseOrderBookEntry('Sell 20 @ 200'),
            parseOrderBookEntry('Sell 30 @ 300'),
          ],
        };

        expect(() =>
          reducer(
            prevState,
            orderBookRemoveAction({
              orderId: 'Sell 5 @ 50',
              side: 'Sell',
            })
          )
        ).toThrow(/not found/);
      });
    });
  });

  describe('getLevel2', () => {
    it('should group entries by price', () => {
      const state: OrderBookState = {
        ...initialState,
        offers: [
          parseOrderBookEntry('Sell 10 @ 100'),
          parseOrderBookEntry('Sell 10 @ 100.5'),
          parseOrderBookEntry('Sell 20 @ 200'),
          parseOrderBookEntry('Sell 21 @ 200'),
          parseOrderBookEntry('Sell 22 @ 200.5'),
          parseOrderBookEntry('Sell 30 @ 300'),
          parseOrderBookEntry('Sell 40 @ 400.123'),
          parseOrderBookEntry('Sell 41 @ 400.123'),
          parseOrderBookEntry('Sell 42 @ 400.123'),
          parseOrderBookEntry('Sell 50 @ 500'),
        ],
        bids: [
          parseOrderBookEntry('Buy 9 @ 90'),
          parseOrderBookEntry('Buy 8 @ 80.321'),
          parseOrderBookEntry('Buy 8.1 @ 80.321'),
          parseOrderBookEntry('Buy 7 @ 70'),
        ],
      };

      const actual = getLevel2({ [NAME]: state });

      const expected: OrderBookL2 = {
        bids: [
          {
            price: '90',
            size: '9',
            count: 1,
          },
          {
            price: '80.321',
            size: '16.1',
            count: 2,
          },
          {
            price: '70',
            size: '7',
            count: 1,
          },
        ],
        offers: [
          {
            price: '100',
            size: '10',
            count: 1,
          },
          {
            price: '100.5',
            size: '10',
            count: 1,
          },
          {
            price: '200',
            size: '41',
            count: 2,
          },
          {
            price: '200.5',
            size: '22',
            count: 1,
          },
          {
            price: '300',
            size: '30',
            count: 1,
          },
          {
            price: '400.123',
            size: '123',
            count: 3,
          },
          {
            price: '500',
            size: '50',
            count: 1,
          },
        ],
      };

      expect(actual).toEqual(expected);
    });
  });
});
