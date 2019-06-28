import { createExchangeStore } from './store';
import { placeOrderCommand, Command } from './commands';
import { put, all, call, StrictEffect } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';

const createSimulation = (commands: Command[]) => {
  function* simulation() {
    for (const command of commands) {
      yield put(command);
    }
  }

  return simulation;
};

describe('Order matching', () => {
  it.only('Should pass vector 1', async () => {
    const { run, store } = createExchangeStore();

    await run(
      createSimulation([
        placeOrderCommand({
          side: 'buy',
          price: '1000',
          orderQty: '10',
        }),
        placeOrderCommand({
          side: 'sell',
          price: '500',
          orderQty: '10',
        }),
      ])
    ).toPromise();

    const state = store.getState();

    expect(state).toEqual({
      orderIdCounter: 3,
      bids: [],
      asks: [],
      trades: [
        {
          size: '10',
          price: '1000',
          side: 'sell',
        },
      ],
      orders: {
        1: {
          orderId: '1',
          orderQty: '10',
          side: 'buy',
          price: '1000',
          leavesQty: '0',
          status: 'Filled',
        },
        2: {
          orderId: '2',
          orderQty: '10',
          price: '500',
          side: 'sell',
          leavesQty: '0',
          status: 'Filled',
        },
      },
    });
  });
});
