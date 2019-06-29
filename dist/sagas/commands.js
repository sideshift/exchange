"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../ducks/commands");
const effects_1 = require("redux-saga/effects");
// TODO: Dummy for mock
exports.processCommandSaga = function* (command) {
    const state = yield effects_1.select(state => state);
    console.log('yolo', state);
};
exports.commandWorkerSaga = function* (command) {
    let seq = 0; // TODO: Remove me!
    // TODO: Feels weird. Use a meta field?
    command.payload.seq = ++seq;
    // TODO: Persist command (can fork if it joins back after).
    //Can store in variable here
    yield effects_1.call(console.log.bind(console), 'Sequenced command', command.payload.seq);
    yield effects_1.call(exports.processCommandSaga, command);
};
exports.commandWatcherSaga = function* () {
    while (true) {
        const command = yield effects_1.take(commands_1.isCommand);
    }
    //x
};
