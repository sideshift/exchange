"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_book_1 = require("./order-book");
const lodash_1 = require("lodash");
const parseOrder = (value) => {
    const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)$/i);
    // throw new Error(match!.length.toString());
    if (match === null || match.length !== 4) {
        throw new Error(`Invalid ${value} ${match && match.length}`);
    }
    const side = lodash_1.upperFirst(match[1]);
    const size = match[2];
    const price = match[3];
    const orderId = `${side} ${size} @ ${price}`;
    return {
        orderId,
        side,
        price,
        size,
    };
};
const parseOrderBookEntry = (value) => lodash_1.pick(parseOrder(value), ['orderId', 'price', 'size']);
describe('OrderBook', () => {
    describe('reducer', () => {
        it('Should handle insert bid at top', () => {
            const prevState = {
                ...order_book_1.initialState,
                bids: [parseOrderBookEntry('Buy 10 @ 200')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Buy 20 @ 50')));
            const expectedState = {
                bids: [parseOrderBookEntry('Buy 10 @ 200'), parseOrderBookEntry('Buy 20 @ 50')],
                offers: [],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert bid in middle', () => {
            const prevState = {
                ...order_book_1.initialState,
                bids: [parseOrderBookEntry('Buy 20 @ 200'), parseOrderBookEntry('Buy 10 @ 100')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Buy 15 @ 150')));
            const expectedState = {
                bids: [
                    parseOrderBookEntry('Buy 20 @ 200'),
                    parseOrderBookEntry('Buy 15 @ 150'),
                    parseOrderBookEntry('Buy 10 @ 100'),
                ],
                offers: [],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert bid at bottom', () => {
            const prevState = {
                ...order_book_1.initialState,
                bids: [parseOrderBookEntry('Buy 10 @ 200')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Buy 20 @ 50')));
            const expectedState = {
                ...order_book_1.initialState,
                bids: [parseOrderBookEntry('Buy 10 @ 200'), parseOrderBookEntry('Buy 20 @ 50')],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert offer at top', () => {
            const prevState = {
                ...order_book_1.initialState,
                offers: [parseOrderBookEntry('Sell 20 @ 200')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Sell 10 @ 100')));
            const expectedState = {
                ...order_book_1.initialState,
                offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert offer in middle', () => {
            const prevState = {
                ...order_book_1.initialState,
                offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Sell 15 @ 150')));
            const expectedState = {
                ...order_book_1.initialState,
                offers: [
                    parseOrderBookEntry('Sell 10 @ 100'),
                    parseOrderBookEntry('Sell 15 @ 150'),
                    parseOrderBookEntry('Sell 20 @ 200'),
                ],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert offer at bottom', () => {
            const prevState = {
                ...order_book_1.initialState,
                offers: [parseOrderBookEntry('Sell 10 @ 100')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Sell 20 @ 200')));
            const expectedState = {
                ...order_book_1.initialState,
                offers: [parseOrderBookEntry('Sell 10 @ 100'), parseOrderBookEntry('Sell 20 @ 200')],
            };
            expect(nextState).toEqual(expectedState);
        });
    });
});
