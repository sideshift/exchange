import { PlaceOrderCommand, Command, isPlaceOrderCommand } from './commands';
import { getOrderIdCounter, getOrder, getTopAsk, getTopBid } from './selectors';
import { select, put } from 'redux-saga/effects';

import {
  incrementOrderIdCounterAction,
  createOrderAction,
  bookOrderAction,
  tradeAction,
  fillAction,
  partialFillAction,
} from './actions';

import { stringMath } from './utils';
import { SagaIterator } from 'redux-saga';
import { OrderBookEntry } from './types';

export function* placeOrderCommandHandler(command: PlaceOrderCommand) {
  // Fetch and claim the next order id
  const prevOrderIdCounter: ReturnType<typeof getOrderIdCounter> = yield select(getOrderIdCounter);
  const orderId = prevOrderIdCounter.toString();
  yield put(incrementOrderIdCounterAction());

  // Place order
  yield put(
    createOrderAction({
      orderId,
      status: 'New',
      leavesQty: command.payload.orderQty,
      orderQty: command.payload.orderQty,
      price: command.payload.price,
      side: command.payload.side,
    })
  );

  while (true) {
    const taker: ReturnType<typeof getOrder> = yield select(getOrder, orderId);

    if (taker === undefined) {
      throw new Error(`Taker order ${orderId} not found`);
    }

    if (stringMath.eq(taker.leavesQty, '0')) {
      break;
    }

    const counter: OrderBookEntry = yield select(taker.side === 'buy' ? getTopAsk : getTopBid);

    if (
      counter === undefined ||
      (taker.side === 'buy' && stringMath.gt(counter.price, taker.price)) ||
      (taker.side === 'sell' && stringMath.lt(counter.price, taker.price))
    ) {
      // Order will rest in the book
      yield put(bookOrderAction(taker));
      break;
    }

    const maker: ReturnType<typeof getOrder> = yield select(getOrder, counter.orderId);

    if (maker === undefined) {
      throw new Error(`Maker order ${counter.orderId} not found`);
    }

    const size = stringMath.min(taker.leavesQty, maker.leavesQty);

    // Orders have been matched
    yield put(
      tradeAction({
        price: counter.price,
        side: taker.side,
        size,
      })
    );

    // Counter order has been filled
    if (stringMath.eq(size, maker.leavesQty)) {
      yield put(fillAction({ orderId: maker.orderId, liquidity: 'Maker', side: maker.side }));
    } else {
      yield put(
        partialFillAction({ orderId: maker.orderId, liquidity: 'Maker', size, side: maker.side })
      );
    }

    // Command order has been filled
    if (stringMath.eq(size, taker.leavesQty)) {
      yield put(fillAction({ orderId: taker.orderId, liquidity: 'Taker', side: taker.side }));
    } else {
      yield put(
        partialFillAction({ orderId: taker.orderId, liquidity: 'Taker', size, side: taker.side })
      );
    }
  }
}

export type CommandHandler = (command: Command) => SagaIterator;

export const getCommandHandler = (command: Command) => {
  if (isPlaceOrderCommand(command)) {
    return placeOrderCommandHandler;
  }

  return undefined;
};
