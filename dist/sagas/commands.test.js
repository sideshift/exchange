"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effects_1 = require("redux-saga/effects");
const commands_1 = require("../ducks/commands");
const commands_2 = require("./commands");
it('should get a test name', () => {
    const command = commands_1.placeOrderCommand({
        side: 'Buy',
        price: '123.444',
        orderQty: '999.01',
    });
    const gen = commands_2.commandWorkerSaga(command);
    const value = JSON.stringify(gen.next().value);
    expect(value).toEqual(JSON.stringify(effects_1.call(console.log.bind(console), 'Sequenced command', 1)));
    expect(gen.next().value).toEqual(effects_1.call(commands_2.processCommandSaga, command));
    expect(gen.next().done).toBeTruthy();
});
