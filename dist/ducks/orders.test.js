"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("./orders");
const lodash_1 = require("lodash");
const parseOrder = (value) => {
    const match = value.match(/^(buy|sell) ([0-9\.]+) *@ *([0-9\.]+)(.+)?$/i);
    if (match === null || match.length < 5) {
        throw new Error(`Invalid ${value} ${match && match.length}`);
    }
    const side = lodash_1.upperFirst(match[1]);
    const qty = match[2];
    const price = match[3];
    const idSuffix = match[4] || '';
    const id = `${side} ${qty} @ ${price}${idSuffix}`;
    const order = {
        id,
        price,
        qty,
        side,
    };
    return order;
};
describe('Orders', () => {
    describe('reducer', () => {
        describe('Rest', () => {
            it('Should rest order', () => {
                const prevState = {
                    ...orders_1.initialState,
                    'order-a': {
                        id: 'order-a',
                        leavesQty: '10',
                        price: '123',
                        qty: '10',
                        side: 'Buy',
                        status: 'New',
                    },
                };
                const nextState = orders_1.reducer(prevState, orders_1.orderRestAction(parseOrder('Buy 20 @ 50')));
                const expectedState = {
                    ...prevState,
                    'Buy 20 @ 50': {
                        id: 'Buy 20 @ 50',
                        leavesQty: '20',
                        price: '50',
                        qty: '20',
                        side: 'Buy',
                        status: 'New',
                    },
                };
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
