import { all, call, takeLatest, select, takeEvery, put } from 'redux-saga/effects';
import { COMMAND_PREFIX, Command } from './commands';
import { incrementOrderIdCounterAction } from './actions';
import { getCommandHandler, CommandHandler } from './command-handlers';

export function* initializationSaga() {
  yield all([
    // call(initialDataFlow),
    // call(loginFlow),
    // call(authFlow),
    // call(signupFlow),
    // call(registerFlow),
  ]);
}

function* persistCommandSaga(command: Command) {
  yield;
}

function* commandWorker(command: Command) {
  if (!command.type.startsWith(COMMAND_PREFIX)) {
    return;
  }

  yield call(persistCommandSaga, command);

  const handler = getCommandHandler(command) as CommandHandler;

  if (!handler) {
    return;
  }

  yield call(handler, command);
}

function* commandWatcher() {
  yield takeEvery(`*`, commandWorker);
}

function* commandSaga() {
  yield all([call(commandWatcher)]);
}

export function* rootSaga() {
  yield all([call(initializationSaga), call(commandSaga)]);
}
