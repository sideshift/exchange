import { Command } from './ducks/commands';

export const restoreCommandSeq = async () => 1;

export const persistCommand = async (command: Command) =>
  console.log(`COMMAND`.padEnd(8), 'Seq', command.meta.seq!, command.type);
