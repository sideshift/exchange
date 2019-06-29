"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
const NAME = '@@order-book';
exports.ORDER_BOOK_INSERT_ACTION = `${NAME}/ORDER_BOOK_INSERT_ACTION`;
exports.orderBookInsertAction = (payload) => utils_1.createAction(exports.ORDER_BOOK_INSERT_ACTION, payload);
exports.isOrderBookInsertAction = (action) => action.type === exports.ORDER_BOOK_INSERT_ACTION;
exports.initialState = {
    bids: [],
    offers: [],
};
exports.reducer = (state = exports.initialState, action) => {
    if (exports.isOrderBookInsertAction(action)) {
        const { orderId, side, price, size } = action.payload;
        const entry = {
            orderId,
            price,
            size,
        };
        if (side === 'Buy') {
            const { bids } = state;
            // The best (highest) bid is at the top of the book and the worst (lowest)
            // Find the first entry with a lower price and insert right before it
            const index = lodash_1.findIndex(bids, other => utils_1.ns.lt(other.price, price));
            const nextBids = index === -1 ? [...bids, entry] : [...bids.slice(0, index), entry, ...bids.slice(index)];
            return {
                ...state,
                bids: nextBids,
            };
        }
        if (side === 'Sell') {
            const { offers } = state;
            // The best (lowest) offer is at the top of the book and the worst (highest)
            // Find the first entry with a higher price and insert right before it
            const index = lodash_1.findIndex(offers, other => utils_1.ns.gt(other.price, price));
            const nextOffers = index === -1 ? [...offers, entry] : [...offers.slice(0, index), entry, ...offers.slice(index)];
            return {
                ...state,
                offers: nextOffers,
            };
        }
    }
    return state;
};
