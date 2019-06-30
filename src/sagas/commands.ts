import { isCommand, Command } from '../ducks/commands';
import { take, call, select, put, SimpleEffect } from 'redux-saga/effects';
import * as db from '../db';
import { log } from '../utils';
import assert = require('assert');

export const processCommandSaga = function*(command: Command): IterableIterator<any> {
  assert(command);
};

export const commandWorkerSaga = function*(command: Command) {
  assert(command, 'command');

  if (command.meta.seq === undefined) {
    throw new Error(`seq missing from command meta`);
  }

  // TODO: Persist command (can fork if it joins back after in correct order)
  // maybe using a channel?
  yield call(db.persistCommand, command);
  yield call(processCommandSaga, command);
};

export const commandWatcherSaga = function*() {
  let seq: number = yield call(db.restoreCommandSeq);

  while (true) {
    const command: Command = yield take<Command>(isCommand);

    if (command.meta.seq !== undefined) {
      throw new Error(`Command sequenced too early`);
    }

    const commandSequenced: Command = { ...command, meta: { ...command.meta, seq } };

    seq += 1;

    yield call(commandWorkerSaga, commandSequenced);
  }
};
