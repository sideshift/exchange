import { select, call } from 'redux-saga/effects';
import { placeOrderCommand, isCommand } from '../ducks/commands';
import { commandWorkerSaga, processCommandSaga, commandWatcherSaga } from './commands';
import { log } from '../utils';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as db from '../db';
import { END } from 'redux-saga';

const expectToEqualAsJson = (actual: any, expected: any) => {
  const actualCleaned = JSON.parse(JSON.stringify(actual));
  const expcetedCleaned = JSON.parse(JSON.stringify(expected));
  expect(actualCleaned).toEqual(expcetedCleaned);
};

describe('sagas', () => {
  describe('commands', () => {
    describe('processCommandSaga', () => {
      it('should run', async () => {
        const command = placeOrderCommand({
          side: 'Buy',
          price: '123.444',
          orderQty: '999.01',
        });

        // await testSaga(processCommandSaga, command)
        //   .next()
        //   .throw(new Error('idk'))
        //   .isDone();
      });
    });

    describe('commandWorkerSaga', () => {
      it('should run', async () => {
        const command = placeOrderCommand(
          {
            side: 'Buy',
            price: '123.444',
            orderQty: '999.01',
          },
          { seq: 1 }
        );

        await expectSaga(commandWorkerSaga, command)
          .provide({
            call(effect, next) {
              if (effect.fn === db.persistCommand) {
                const [command] = effect.args;

                return {};
              }

              if (effect.fn === processCommandSaga) {
                return {};
              }

              // Allow Redux Saga to handle other `call` effects
              return next();
            },
          })
          .run();
      });
    });

    describe('commandWatcherSaga', () => {
      it('should run', async () => {
        const command = placeOrderCommand({
          side: 'Buy',
          price: '123.444',
          orderQty: '999.01',
        });

        const seq = 1;

        await testSaga(commandWatcherSaga)
          .next()
          .call(db.restoreCommandSeq)
          .next(seq)
          .take(isCommand)
          .next(command)
          .call(commandWorkerSaga, { ...command, meta: { seq } })
          .next(END)
          .finish()
          .isDone();
      });
    });
  });
});
