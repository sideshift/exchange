import { select, call } from 'redux-saga/effects';
import { placeOrderCommand } from '../ducks/commands';
import { commandWorkerSaga, processCommandSaga } from './commands';

it('should get a test name', () => {
  const command = placeOrderCommand({
    side: 'Buy',
    price: '123.444',
    orderQty: '999.01',
  });

  const gen = commandWorkerSaga(command);

  const value = JSON.stringify(gen.next().value);
  expect(value).toEqual(JSON.stringify(call(console.log.bind(console), 'Sequenced command', 1)));
  expect(gen.next().value).toEqual(call(processCommandSaga, command));
  expect(gen.next().done).toBeTruthy();
});
