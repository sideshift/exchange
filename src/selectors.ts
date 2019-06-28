import { State } from './types';

export const getOrder = (state: State, orderId: string) => state.orders[orderId];

export const getTopBid = (state: State) => state.bids[0];

export const getTopAsk = (state: State) => state.asks[0];

export const getOrderIdCounter = (state: State) => state.orderIdCounter;
