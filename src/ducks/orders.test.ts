import {
  reducer,
  initialItemsState,
  OrderRestActionPayload,
  Order,
  orderRestAction,
  OrdersItemsState,
  orderFillAction,
  orderPartialFillAction,
  orderCancelAction,
  itemsReducer,
} from './orders';
import { upperFirst } from 'lodash';
import { Side } from '../types';

const parseOrder = (value: string) => {
  const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)(.+)?$/i);

  if (match === null || match.length < 5) {
    throw new Error(`Invalid ${value} ${match && match.length}`);
  }

  let side: Side;

  if (match[1].toLowerCase() === 'buy') {
    side = Side.Buy;
  } else if (match[1].toLowerCase() === 'sell') {
    side = Side.Sell;
  } else {
    throw new Error(`Unknown side ${match[1]}`);
  }

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
  describe('itemsReducer', () => {
    describe('Rest', () => {
      it('Should rest order', () => {
        const prevState: OrdersItemsState = {
          ...initialItemsState,
          'order-a': {
            id: 'order-a',
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'New',
          } as Order,
        };

        const nextState = itemsReducer(prevState, orderRestAction(parseOrder('Buy 20 @ 50')));

        const expectedState: OrdersItemsState = {
          ...prevState,
          'Buy 20 @ 50': {
            id: 'Buy 20 @ 50',
            leavesQty: '20',
            price: '50',
            qty: '20',
            side: Side.Buy,
            status: 'New',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Fill', () => {
      it('Should fill order', () => {
        const prevState: OrdersItemsState = {
          ...initialItemsState,
          'Buy 10 @ 123': {
            id: 'Buy 10 @ 123',
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'New',
          } as Order,
        };

        const nextState = itemsReducer(prevState, orderFillAction({ id: 'Buy 10 @ 123' }));

        const expectedState: OrdersItemsState = {
          ...prevState,
          'Buy 10 @ 123': {
            id: 'Buy 10 @ 123',
            leavesQty: '0',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'Filled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Partially fill', () => {
      it('Should partially fill order', () => {
        const id = 'Buy 10 @ 123';

        const prevState: OrdersItemsState = {
          ...initialItemsState,
          [id]: {
            id,
            leavesQty: '10',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'New',
          } as Order,
        };

        const nextState = itemsReducer(prevState, orderPartialFillAction({ id, amount: '3' }));

        const expectedState: OrdersItemsState = {
          ...prevState,
          [id]: {
            id,
            leavesQty: '7',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'PartiallyFilled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });

    describe('Cancel', () => {
      it('Should cancel order', () => {
        const id = 'Buy 10 @ 123';

        const prevState: OrdersItemsState = {
          ...initialItemsState,
          [id]: {
            id,
            leavesQty: '5',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'PartiallyFilled',
          } as Order,
        };

        const nextState = itemsReducer(prevState, orderCancelAction({ id }));

        const expectedState: OrdersItemsState = {
          ...prevState,
          [id]: {
            id,
            leavesQty: '0',
            price: '123',
            qty: '10',
            side: Side.Buy,
            status: 'Canceled',
          } as Order,
        };

        expect(nextState).toEqual(expectedState);
      });
    });
  });
});
