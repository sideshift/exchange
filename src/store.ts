import { rootSaga } from './sagas';
import createSagaMiddleware from 'redux-saga';
import { reducer } from './reducers';
import { applyMiddleware, createStore, compose } from 'redux';
import assert = require('assert');
import { Command } from './commands';
import { getCommandHandler, CommandHandler } from './command-handlers';

export const createExchangeStore = () => {
  const sagaMiddleware = createSagaMiddleware({});
  const store = createStore(reducer, compose(applyMiddleware(sagaMiddleware)));
  const { run } = sagaMiddleware;

  run(rootSaga);

  const processCommand = async (command: Command) => {
    // TODO: Assign sequence and persist

    // TODO: Run commandx handler
    const handler = getCommandHandler(command) as CommandHandler;
    assert(handler, `No command handler found for ${command.type}`);

    const commandOutput = await run(handler, command).toPromise();
  };

  return { run, store, processCommand };
};
