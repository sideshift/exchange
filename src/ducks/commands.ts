import { Action } from 'redux';
import { Side } from '../types';

export const NAME = '@@commmand';

export const PLACE_ORDER_COMMAND = `${NAME}/PLACE_ORDER_COMMAND`;

export const COMMAND_TYPES = <const>[PLACE_ORDER_COMMAND];

export type CommandType = typeof COMMAND_TYPES[number];

export interface CommandMeta {
  seq?: number;
}

export interface Command<P = any> {
  readonly type: CommandType;
  readonly payload: P;
  readonly meta: CommandMeta;
}

export interface PlaceOrderCommandPayload {
  readonly side: Side;
  readonly price: string;
  readonly orderQty: string;
}

export function createCommand<P>(type: string, payload: P, meta: CommandMeta = {}): Command<P> {
  return { type, payload, meta };
}

export type PlaceOrderCommand = Command<PlaceOrderCommandPayload>;

export const isPlaceOrderCommand = (command: Command): command is PlaceOrderCommand =>
  command.type === PLACE_ORDER_COMMAND;

export const placeOrderCommand = (payload: PlaceOrderCommandPayload, meta: CommandMeta = {}) =>
  createCommand(PLACE_ORDER_COMMAND, payload, meta);

export const isCommand = (action: Action): action is Command => COMMAND_TYPES.includes(action.type);
