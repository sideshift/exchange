"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME = '@@commmand';
exports.PLACE_ORDER_COMMAND = `${exports.NAME}/PLACE_ORDER_COMMAND`;
exports.COMMAND_TYPES = [exports.PLACE_ORDER_COMMAND];
function createCommand(type, payload, meta = {}) {
    return { type, payload, meta };
}
exports.createCommand = createCommand;
exports.isPlaceOrderCommand = (command) => command.type === exports.PLACE_ORDER_COMMAND;
exports.placeOrderCommand = (payload, meta = {}) => createCommand(exports.PLACE_ORDER_COMMAND, payload, meta);
exports.isCommand = (action) => exports.COMMAND_TYPES.includes(action.type);
//# sourceMappingURL=commands.js.map