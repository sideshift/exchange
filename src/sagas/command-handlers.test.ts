import { expectSaga } from 'redux-saga-test-plan';
import { placeOrderCommandHandler } from './command-handlers';
import { PlaceOrderCommand, placeOrderCommand } from '../ducks/commands';
import { reducer } from '../store';
import { orderRestAction } from '../ducks/orders';
import { NAME as ORDERS_NAME } from '../ducks/orders';
import { NAME as ORDER_BOOK_NAME, orderBookInsertAction } from '../ducks/order-book';

describe('Command handlers', () => {
  describe('placeOrderCommandHandler', () => {
    it('should pass vector 1', () => {
      // NOTE: Yolo test while I figure out how to do this

      const command = placeOrderCommand({
        side: 'Buy',
        price: '100',
        orderQty: '10',
      });

      return expectSaga(placeOrderCommandHandler, command)
        .withReducer(reducer)
        .hasFinalState<ReturnType<typeof reducer>>({
          [ORDERS_NAME]: {
            seq: 2,
            items: {
              '1': {
                id: '1',
                side: 'Buy',
                price: '100',
                qty: '10',
                leavesQty: '10',
                status: 'New',
              },
            },
          },
          [ORDER_BOOK_NAME]: {
            bids: [
              {
                orderId: '1',
                price: '100',
                size: '10',
              },
            ],
            offers: [],
          },
        })
        .put(
          orderRestAction({
            id: '1',
            side: 'Buy',
            price: '100',
            qty: '10',
          })
        )
        .put(
          orderBookInsertAction({
            orderId: '1',
            side: 'Buy',
            price: '100',
            size: '10',
          })
        )
        .run();
    });
  });
});
