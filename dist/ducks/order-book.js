"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
exports.NAME = '@@order-book';
exports.ORDER_BOOK_INSERT_ACTION = `${exports.NAME}/ORDER_BOOK_INSERT_ACTION`;
exports.ORDER_BOOK_REDUCE_ACTION = `${exports.NAME}/ORDER_BOOK_REDUCE_ACTION`;
exports.ORDER_BOOK_REMOVE_ACTION = `${exports.NAME}/ORDER_BOOK_REMOVE_ACTION`;
exports.orderBookInsertAction = (payload) => utils_1.createAction(exports.ORDER_BOOK_INSERT_ACTION, payload);
exports.isOrderBookInsertAction = (action) => action.type === exports.ORDER_BOOK_INSERT_ACTION;
exports.orderBookReduceAction = (payload) => utils_1.createAction(exports.ORDER_BOOK_REDUCE_ACTION, payload);
exports.isOrderBookReduceAction = (action) => action.type === exports.ORDER_BOOK_REDUCE_ACTION;
exports.orderBookRemoveAction = (payload) => utils_1.createAction(exports.ORDER_BOOK_REMOVE_ACTION, payload);
exports.isOrderBookRemoveAction = (action) => action.type === exports.ORDER_BOOK_REMOVE_ACTION;
exports.initialState = {
    bids: [],
    offers: [],
};
const getState = (state) => state[exports.NAME];
// TODO: Terrible performance. Does not know it's sorted
const entriesToL2 = (entries, side) => lodash_1.chain(entries)
    .groupBy(entry => entry.price)
    .values()
    .map(group => ({
    price: group[0].price,
    size: utils_1.ns.sum(...group.map(_ => _.size)),
    count: group.length,
}))
    .sort((a, b) => utils_1.ns.cmp(a.price, b.price) * (side === 'Buy' ? -1 : 1))
    .value();
exports.getLevel2 = lodash_1.flow(getState, state => ({
    bids: entriesToL2(state.bids, 'Buy'),
    offers: entriesToL2(state.offers, 'Sell'),
}));
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
    if (exports.isOrderBookReduceAction(action)) {
        const { side, orderId, amount } = action.payload;
        const target = side === 'Buy' ? state.bids : state.offers;
        const index = lodash_1.findIndex(target, entry => entry.orderId === orderId);
        if (index === -1) {
            throw new Error(`Order not found`);
        }
        const prevEntry = target[index];
        const nextEntry = { ...prevEntry, size: utils_1.ns.minus(prevEntry.size, amount) };
        if (utils_1.ns.lte(nextEntry.size, '0')) {
            throw new Error(`Order entry size would become <= 0`);
        }
        const nextEntries = [...target.slice(0, index), nextEntry, ...target.slice(index + 1)];
        if (side === 'Buy') {
            return {
                ...state,
                bids: nextEntries,
            };
        }
        if (side === 'Sell') {
            return {
                ...state,
                offers: nextEntries,
            };
        }
    }
    if (exports.isOrderBookRemoveAction(action)) {
        const { side, orderId } = action.payload;
        const target = side === 'Buy' ? state.bids : state.offers;
        const index = lodash_1.findIndex(target, entry => entry.orderId === orderId);
        if (index === -1) {
            throw new Error(`Order not found`);
        }
        const nextEntries = [...target.slice(0, index), ...target.slice(index + 1)];
        if (side === 'Buy') {
            return {
                ...state,
                bids: nextEntries,
            };
        }
        if (side === 'Sell') {
            return {
                ...state,
                offers: nextEntries,
            };
        }
    }
    return state;
};
