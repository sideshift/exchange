import { Action } from 'redux';
import { Side } from '../types';

export const NAME = '@@commmand';

export const PLACE_ORDER_COMMAND = `${NAME}/PLACE_ORDER_COMMAND`;

export const COMMAND_TYPES = <const>[PLACE_ORDER_COMMAND];

export type CommandType = typeof COMMAND_TYPES[number];

export interface Command<P = any> {
  readonly type: CommandType;
  readonly payload: { seq?: number } & P;
}

export interface PlaceOrderCommandPayload {
  readonly side: Side;
  readonly price: string;
  readonly orderQty: string;
}

export function createCommand<P>(type: string, payload: P): Command<P> {
  return { type, payload };
}

export type PlaceOrderCommand = Command<PlaceOrderCommandPayload>;

export const isPlaceOrderCommand = (command: Command): command is PlaceOrderCommand =>
  command.type === PLACE_ORDER_COMMAND;

export const placeOrderCommand = (payload: PlaceOrderCommandPayload) => createCommand(PLACE_ORDER_COMMAND, payload);

export const isCommand = (action: Action): action is Command => COMMAND_TYPES.includes(action.type);
