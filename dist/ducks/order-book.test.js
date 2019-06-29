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
        it('Should handle insert bid at bottom', () => {
            const prevState = {
                ...order_book_1.initialState,
                bids: [
                    {
                        orderId: '10 @ 200',
                        size: '10',
                        price: '200',
                    },
                ],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction({
                orderId: '20 @ 50',
                side: 'Buy',
                price: '50',
                size: '20',
            }));
            const expectedState = {
                bids: [
                    {
                        orderId: '10 @ 200',
                        size: '10',
                        price: '200',
                    },
                    {
                        orderId: '20 @ 50',
                        price: '50',
                        size: '20',
                    },
                ],
                offers: [],
            };
            expect(nextState).toEqual(expectedState);
        });
        it('Should handle insert bid at top', () => {
            const prevState = {
                ...order_book_1.initialState,
                bids: [parseOrderBookEntry('Buy 10 @ 200')],
            };
            const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction({
                orderId: 'Buy 20 @ 50',
                side: 'Buy',
                price: '50',
                size: '20',
            }));
            const expectedState = {
                bids: [
                    {
                        orderId: 'Buy 10 @ 200',
                        size: '10',
                        price: '200',
                    },
                    {
                        orderId: 'Buy 20 @ 50',
                        price: '50',
                        size: '20',
                    },
                ],
                offers: [],
            };
            expect(nextState).toEqual(expectedState);
        });
    });
});
