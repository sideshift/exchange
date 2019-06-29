"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME = '@@commmand';
exports.PLACE_ORDER_COMMAND = `${exports.NAME}/PLACE_ORDER_COMMAND`;
exports.COMMAND_TYPES = [exports.PLACE_ORDER_COMMAND];
function createCommand(type, payload) {
    return { type, payload };
}
exports.createCommand = createCommand;
exports.isPlaceOrderCommand = (command) => command.type === exports.PLACE_ORDER_COMMAND;
exports.placeOrderCommand = (payload) => createCommand(exports.PLACE_ORDER_COMMAND, payload);
exports.isCommand = (action) => exports.COMMAND_TYPES.includes(action.type);
