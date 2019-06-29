import { isCommand, Command } from '../ducks/commands';
import { take, call, select } from 'redux-saga/effects';

// TODO: Dummy for mock
export const processCommandSaga = function*(command: Command) {
  const state = yield select(state => state);
  console.log('yolo', state);
};

export const commandWorkerSaga = function*(command: Command) {
  let seq = 0; // TODO: Remove me!

  // TODO: Feels weird. Use a meta field?
  command.payload.seq = ++seq;

  // TODO: Persist command (can fork if it joins back after).
  //Can store in variable here

  yield call(console.log.bind(console), 'Sequenced command', command.payload.seq);

  yield call(processCommandSaga, command);
};

export const commandWatcherSaga = function*() {
  while (true) {
    const command = yield take(isCommand);
  }
  //x
};
