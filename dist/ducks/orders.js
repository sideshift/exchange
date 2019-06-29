"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const assert = require("assert");
exports.NAME = '@@order';
exports.ORDER_REST_ACTION = `${exports.NAME}/ORDER_REST_ACTION`;
exports.ORDER_FILL_ACTION = `${exports.NAME}/ORDER_FILL_ACTION`;
exports.ORDER_PARTIAL_FILL_ACTION = `${exports.NAME}/ORDER_PARTIAL_FILL_ACTION`;
exports.ORDER_CANCEL_ACTION = `${exports.NAME}/ORDER_CANCEL_ACTION`;
exports.orderRestAction = (payload) => utils_1.createAction(exports.ORDER_REST_ACTION, payload);
exports.isOrderRestAction = (action) => action.type === exports.ORDER_REST_ACTION;
exports.OrderFillAction = (payload) => utils_1.createAction(exports.ORDER_FILL_ACTION, payload);
exports.isOrderFillAction = (action) => action.type === exports.ORDER_FILL_ACTION;
exports.OrderPartialFillAction = (payload) => utils_1.createAction(exports.ORDER_PARTIAL_FILL_ACTION, payload);
exports.isOrderPartialFillAction = (action) => action.type === exports.ORDER_PARTIAL_FILL_ACTION;
exports.orderCancelAction = (payload) => utils_1.createAction(exports.ORDER_CANCEL_ACTION, payload);
exports.isOrderCancelAction = (action) => action.type === exports.ORDER_CANCEL_ACTION;
exports.initialState = {};
const getState = (state) => state[exports.NAME];
exports.reducer = (state = exports.initialState, action) => {
    if (exports.isOrderRestAction(action)) {
        const { id, price, qty, side } = action.payload;
        assert(!state[id]);
        const order = {
            id,
            side,
            price,
            qty,
            leavesQty: qty,
            status: 'New',
        };
        return {
            ...state,
            [id]: order,
        };
    }
    if (exports.isOrderFillAction(action)) {
        const { id } = action.payload;
        const prevOrder = state[id];
        if (prevOrder === undefined) {
            throw new Error(`Order not found`);
        }
        if (!['New', 'PartiallyFilled'].includes(prevOrder.status)) {
            throw new Error(`Cannot fill order in status ${prevOrder.status}`);
        }
        const nextOrder = {
            ...prevOrder,
            leavesQty: '0',
            status: 'Filled',
        };
        return {
            ...state,
            [id]: nextOrder,
        };
    }
    if (exports.isOrderPartialFillAction(action)) {
        const { id, amount } = action.payload;
        const prevOrder = state[id];
        if (prevOrder === undefined) {
            throw new Error(`Order not found`);
        }
        if (!['New', 'PartiallyFilled'].includes(prevOrder.status)) {
            throw new Error(`Invalid previous status: ${prevOrder.status}`);
        }
        const nextLeavesQty = utils_1.ns.minus(prevOrder.leavesQty, amount);
        if (utils_1.ns.lte(nextLeavesQty, '0')) {
            throw new Error(`leavesQty would become <= 0`);
        }
        const nextOrder = {
            ...prevOrder,
            leavesQty: nextLeavesQty,
            status: 'PartiallyFilled',
        };
        return {
            ...state,
            [id]: nextOrder,
        };
    }
    if (exports.isOrderCancelAction(action)) {
        const { id } = action.payload;
        const prevOrder = state[id];
        if (prevOrder === undefined) {
            throw new Error(`Order not found`);
        }
        // TODO: <const>
        if (!['New', 'PartiallyFilled', 'Filled'].includes(prevOrder.status)) {
            throw new Error(`Cannot cancel order in status ${prevOrder.status}`);
        }
        const nextOrder = {
            ...prevOrder,
            leavesQty: '0',
            status: 'Canceled',
        };
        return {
            ...state,
            [id]: nextOrder,
        };
    }
    return state;
};
