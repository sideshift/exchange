import { incrOrderSeqAction, getOrderSeq } from '../ducks/orders';
import { put, select } from 'redux-saga/effects';

export function* claimOrderSeqSaga() {
  const seq: number = yield select(getOrderSeq);

  yield put(incrOrderSeqAction());

  return seq;
}

export * from './commands';
export * from './command-handlers';
