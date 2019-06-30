import { Action } from 'redux';
import { OrderSide } from '../types';

export const NAME = '@@commmand';

export enum CommandType {
  PlaceOrder = '@@command/PLACE_ORDER',
}

export interface CommandMeta {
  seq?: number;
}

export interface Command<P = any> {
  readonly type: CommandType;
  readonly payload: P;
  readonly meta: CommandMeta;
}

export interface PlaceOrderCommandPayload {
  readonly side: OrderSide;
  readonly price: string;
  readonly orderQty: string;
}

export function createCommand<P>(type: CommandType, payload: P, meta: CommandMeta = {}): Command<P> {
  return { type, payload, meta };
}

export type PlaceOrderCommand = Command<PlaceOrderCommandPayload>;

export const isPlaceOrderCommand = (command: Command): command is PlaceOrderCommand =>
  command.type === CommandType.PlaceOrder;

export const placeOrderCommand = (payload: PlaceOrderCommandPayload, meta: CommandMeta = {}) =>
  createCommand(CommandType.PlaceOrder, payload, meta);

export const isCommand = (action: Action): action is Command => action.type in CommandType;
