"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_book_1 = require("./order-book");
const lodash_1 = require("lodash");
const parseOrder = (value) => {
    const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)(.+)?$/i);
    if (match === null || match.length < 5) {
        throw new Error(`Invalid ${value} ${match && match.length}`);
    }
    const side = lodash_1.upperFirst(match[1]);
    const size = match[2];
    const price = match[3];
    const orderIdSuffix = match[4] || '';
    const orderId = `${side} ${size} @ ${price}${orderIdSuffix}`;
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
        describe('Insert', () => {
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
                const nextState = order_book_1.reducer(prevState, order_book_1.orderBookInsertAction(parseOrder('Buy 15 @ 100.5')));
                const expectedState = {
                    bids: [
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 15 @ 100.5'),
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
        describe('Reduce', () => {
            it('Should handle reduce bid', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                const nextState = order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Buy 20 @ 200',
                    amount: '3',
                    side: 'Buy',
                }));
                const expectedState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        {
                            ...parseOrderBookEntry('Buy 20 @ 200'),
                            size: '17',
                        },
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                expect(nextState).toEqual(expectedState);
            });
            it('Should handle reduce offer', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        parseOrderBookEntry('Sell 20 @ 200'),
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                const nextState = order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Sell 20 @ 200',
                    amount: '3',
                    side: 'Sell',
                }));
                const expectedState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        {
                            ...parseOrderBookEntry('Sell 20 @ 200'),
                            size: '17',
                        },
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                expect(nextState).toEqual(expectedState);
            });
            it('Should throw when bid to reduce is not found', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Buy 5 @ 50',
                    amount: '3',
                    side: 'Buy',
                }))).toThrow(/not found/);
            });
            it('Should throw when reducing bid size to zero', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Buy 10 @ 100',
                    amount: '10',
                    side: 'Buy',
                }))).toThrow(/<= 0/);
            });
            it('Should throw when reducing bid size below zero', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Buy 10 @ 100',
                    amount: '20',
                    side: 'Buy',
                }))).toThrow(/<= 0/);
            });
            it('Should throw when offer to reduce is not found', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        parseOrderBookEntry('Sell 20 @ 200'),
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Sell 5 @ 50',
                    amount: '3',
                    side: 'Sell',
                }))).toThrow(/not found/);
            });
            it('Should throw when reducing offer size to zero', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        parseOrderBookEntry('Sell 20 @ 200'),
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Sell 10 @ 100',
                    amount: '10',
                    side: 'Sell',
                }))).toThrow(/<= 0/);
            });
            it('Should throw when reducing offer size below zero', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        parseOrderBookEntry('Sell 20 @ 200'),
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookReduceAction({
                    orderId: 'Sell 10 @ 100',
                    amount: '20',
                    side: 'Sell',
                }))).toThrow(/<= 0/);
            });
        });
        describe('Remove', () => {
            it('Should throw when bid to remove is not found', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    bids: [
                        parseOrderBookEntry('Buy 30 @ 300'),
                        parseOrderBookEntry('Buy 20 @ 200'),
                        parseOrderBookEntry('Buy 10 @ 100'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookRemoveAction({
                    orderId: 'Buy 5 @ 50',
                    side: 'Buy',
                }))).toThrow(/not found/);
            });
            it('Should throw when offer to reduce is not found', () => {
                const prevState = {
                    ...order_book_1.initialState,
                    offers: [
                        parseOrderBookEntry('Sell 10 @ 100'),
                        parseOrderBookEntry('Sell 20 @ 200'),
                        parseOrderBookEntry('Sell 30 @ 300'),
                    ],
                };
                expect(() => order_book_1.reducer(prevState, order_book_1.orderBookRemoveAction({
                    orderId: 'Sell 5 @ 50',
                    side: 'Sell',
                }))).toThrow(/not found/);
            });
        });
    });
    describe('getLevel2', () => {
        it('should group entries by price', () => {
            const state = {
                ...order_book_1.initialState,
                offers: [
                    parseOrderBookEntry('Sell 10 @ 100'),
                    parseOrderBookEntry('Sell 10 @ 100.5'),
                    parseOrderBookEntry('Sell 20 @ 200'),
                    parseOrderBookEntry('Sell 21 @ 200'),
                    parseOrderBookEntry('Sell 22 @ 200.5'),
                    parseOrderBookEntry('Sell 30 @ 300'),
                    parseOrderBookEntry('Sell 40 @ 400.123'),
                    parseOrderBookEntry('Sell 41 @ 400.123'),
                    parseOrderBookEntry('Sell 42 @ 400.123'),
                    parseOrderBookEntry('Sell 50 @ 500'),
                ],
                bids: [
                    parseOrderBookEntry('Buy 9 @ 90'),
                    parseOrderBookEntry('Buy 8 @ 80.321'),
                    parseOrderBookEntry('Buy 8.1 @ 80.321'),
                    parseOrderBookEntry('Buy 7 @ 70'),
                ],
            };
            const actual = order_book_1.getLevel2({ [order_book_1.NAME]: state });
            const expected = {
                bids: [
                    {
                        price: '90',
                        size: '9',
                        count: 1,
                    },
                    {
                        price: '80.321',
                        size: '16.1',
                        count: 2,
                    },
                    {
                        price: '70',
                        size: '7',
                        count: 1,
                    },
                ],
                offers: [
                    {
                        price: '100',
                        size: '10',
                        count: 1,
                    },
                    {
                        price: '100.5',
                        size: '10',
                        count: 1,
                    },
                    {
                        price: '200',
                        size: '41',
                        count: 2,
                    },
                    {
                        price: '200.5',
                        size: '22',
                        count: 1,
                    },
                    {
                        price: '300',
                        size: '30',
                        count: 1,
                    },
                    {
                        price: '400.123',
                        size: '123',
                        count: 3,
                    },
                    {
                        price: '500',
                        size: '50',
                        count: 1,
                    },
                ],
            };
            expect(actual).toEqual(expected);
        });
    });
});
