"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../ducks/commands");
const effects_1 = require("redux-saga/effects");
const db = __importStar(require("../db"));
const assert = require("assert");
exports.processCommandSaga = function* (command) {
    assert(command);
    throw new Error(`Not implemented drep ` + command.type);
};
exports.commandWorkerSaga = function* (command) {
    assert(command, 'command');
    if (command.meta.seq === undefined) {
        throw new Error(`seq missing from command meta`);
    }
    // TODO: Persist command (can fork if it joins back after in correct order)
    // maybe using a channel?
    yield effects_1.call(db.persistCommand, command);
    yield effects_1.call(exports.processCommandSaga, command);
};
exports.commandWatcherSaga = function* () {
    let seq = yield effects_1.call(db.restoreCommandSeq);
    while (true) {
        const command = yield effects_1.take(commands_1.isCommand);
        if (command.meta.seq !== undefined) {
            throw new Error(`Command sequenced too early`);
        }
        const commandSequenced = { ...command, meta: { ...command.meta, seq } };
        seq += 1;
        yield effects_1.call(exports.commandWorkerSaga, commandSequenced);
    }
};
//# sourceMappingURL=commands.js.map