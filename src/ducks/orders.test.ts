import {
  reducer,
  initialState,
  OrderRestActionPayload,
  Order,
  orderRestAction,
  OrdersState,
  OrderFillAction,
  OrderPartialFillAction,
  orderCancelAction,
} from './orders';
import { upperFirst } from 'lodash';
import { Side } from '../types';

const parseOrder = (value: string) => {
  const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)(.+)?$/i);

  if (match === null || match.length < 5) {
    throw new Error(`Invalid ${value} ${match && match.length}`);
  }

  const side = upperFirst(match[1]) as Side;
  const qty = match[2];
  const price = match[3];
  const idSuffix = match[4] || '';
  const id = `${side} ${qty} @ ${price}${idSuffix}`;

  const order: OrderRestActionPayload = {
    id,
    price,
    qty,
    side,
  };

  return order;
};

describe('Orders', () => {
  describe('reducer', () => {
    describe('Rest', () => {
      it('Should rest order', () => {
        const prevState: OrdersState = {
          ...initialState,
          'order-a': {
            id: 'order-a',
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'New',
          } as Order,
        };

        const nextState = reducer(prevState, orderRestAction(parseOrder('Buy 20 @ 50')));

        const expectedState: OrdersState = {
          ...prevState,
          'Buy 20 @ 50': {
            id: 'Buy 20 @ 50',
            leavesQty: '20',
            price: '50',
            qty: '20',
            side: 'Buy',
            status: 'New',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Fill', () => {
      it('Should fill order', () => {
        const prevState: OrdersState = {
          ...initialState,
          'Buy 10 @ 123': {
            id: 'Buy 10 @ 123',
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'New',
          } as Order,
        };

        const nextState = reducer(prevState, OrderFillAction({ id: 'Buy 10 @ 123' }));

        const expectedState: OrdersState = {
          ...prevState,
          'Buy 10 @ 123': {
            id: 'Buy 10 @ 123',
            leavesQty: '0',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'Filled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Partially fill', () => {
      it('Should partially fill order', () => {
        const id = 'Buy 10 @ 123';

        const prevState: OrdersState = {
          ...initialState,
          [id]: {
            id,
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'New',
          } as Order,
        };

        const nextState = reducer(prevState, OrderPartialFillAction({ id, amount: '3' }));

        const expectedState: OrdersState = {
          ...prevState,
          [id]: {
            id,
            leavesQty: '7',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'PartiallyFilled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Cancel', () => {
      it('Should cancel order', () => {
        const id = 'Buy 10 @ 123';

        const prevState: OrdersState = {
          ...initialState,
          [id]: {
            id,
            leavesQty: '5',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'PartiallyFilled',
          } as Order,
        };

        const nextState = reducer(prevState, orderCancelAction({ id }));

        const expectedState: OrdersState = {
          ...prevState,
          [id]: {
            id,
            leavesQty: '0',
            price: '123',
            qty: '10',
            side: 'Buy',
            status: 'Canceled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });
  });
});
