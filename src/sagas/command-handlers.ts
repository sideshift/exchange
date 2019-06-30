import { PlaceOrderCommand, Command, isPlaceOrderCommand } from '../ducks/commands';
import { put, call, select } from 'redux-saga/effects';
import {
  orderRestAction,
  getOrder,
  OrdersState,
  Order,
  orderFillAction,
  orderPartialFillAction,
} from '../ducks/orders';
import { ns } from '../utils';
import { OrderBookEntry, getBestBid, getBestOffer, orderBookInsertAction } from '../ducks/order-book';
import { SagaIterator } from 'redux-saga';
import { claimOrderSeqSaga } from '.';
import { OrderSide, TradeSide } from '../types';
import { tradeEffect } from '../effects';
import { tradeAction } from '../ducks/trades';

export function* placeOrderCommandHandler(command: PlaceOrderCommand) {
  const seq: number = yield call(claimOrderSeqSaga);
  const id = seq.toString();

  // Place order
  // TODO: This name is confusing
  yield put(
    orderRestAction({
      id: id,
      qty: command.payload.orderQty,
      price: command.payload.price,
      side: command.payload.side,
    })
  );

  while (true) {
    const taker: Order = yield select(getOrder, id);

    if (taker === undefined) {
      throw new Error(`Taker order ${id} not found`);
    }

    if (ns.eq(taker.leavesQty, '0')) {
      break;
    }

    const counter: OrderBookEntry = yield select(taker.side === OrderSide.Buy ? getBestOffer : getBestBid);

    if (
      counter === undefined ||
      (taker.side === OrderSide.Buy && ns.gt(counter.price, taker.price)) ||
      (taker.side === OrderSide.Sell && ns.lt(counter.price, taker.price))
    ) {
      // Order will rest in the book
      yield put(
        orderBookInsertAction({
          orderId: taker.id,
          price: taker.price,
          size: taker.leavesQty,
          side: taker.side,
        })
      );

      break;
    }

    const maker: ReturnType<typeof getOrder> = yield select(getOrder, counter.orderId);

    if (maker === undefined) {
      throw new Error(`Maker order ${counter.orderId} not found`);
    }

    const size = ns.min(taker.leavesQty, maker.leavesQty);

    // Orders have been matched
    yield put(
      tradeAction({
        price: counter.price,
        side: taker.side === OrderSide.Buy ? TradeSide.Buy : TradeSide.Sell, // TODO: Garbage
        size,
      })
    );

    // Counter order has been filled
    if (ns.eq(size, maker.leavesQty)) {
      yield put(
        orderFillAction({
          id: maker.id,
        })
      );
    } else {
      yield put(
        orderPartialFillAction({
          id: maker.id,
          amount: size,
        })
      );
    }

    // Command order has been filled
    if (ns.eq(size, taker.leavesQty)) {
      yield put(orderFillAction({ id: taker.id }));
    } else {
      yield put(orderPartialFillAction({ id: taker.id, amount: size }));
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
