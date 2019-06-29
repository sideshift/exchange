"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function createAction(type, payload) {
    return { type, payload };
}
exports.createAction = createAction;
exports.n = (value) => new bignumber_js_1.default(value);
exports.ns = {
    minus: (a, b) => exports.n(a)
        .minus(b)
        .toString(),
    min: (...args) => bignumber_js_1.default.min(...args.map(exports.n)).toString(),
    gt: (a, b) => exports.n(a).gt(b),
    lt: (a, b) => exports.n(a).lt(b),
    eq: (a, b) => exports.n(a).eq(b),
};
