import { Side } from './types';

export const COMMAND_PREFIX = '@@command';

export const PLACE_ORDER_COMMAND = `${COMMAND_PREFIX}/PLACE_ORDER`;

export const COMMANDS = <const>[PLACE_ORDER_COMMAND];

export type CommandIds = typeof COMMANDS[number];

export interface Command {
  readonly seq: number;
  readonly type: CommandIds;
}

export interface PlaceOrderCommand extends Command {
  readonly payload: {
    readonly side: Side;
    readonly price: string;
    readonly orderQty: string;
  };
}

export const isPlaceOrderCommand = (command: Command): command is PlaceOrderCommand =>
  command.type === PLACE_ORDER_COMMAND;

export const placeOrderCommand = ({
  side,
  price,
  orderQty,
}: {
  side: Side;
  price: string;
  orderQty: string;
}) =>
  ({
    type: PLACE_ORDER_COMMAND,
    payload: {
      orderQty,
      price,
      side,
    },
  } as PlaceOrderCommand);
