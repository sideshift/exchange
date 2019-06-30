"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../ducks/commands");
const commands_2 = require("./commands");
const redux_saga_test_plan_1 = require("redux-saga-test-plan");
const db = __importStar(require("../db"));
const redux_saga_1 = require("redux-saga");
const expectToEqualAsJson = (actual, expected) => {
    const actualCleaned = JSON.parse(JSON.stringify(actual));
    const expcetedCleaned = JSON.parse(JSON.stringify(expected));
    expect(actualCleaned).toEqual(expcetedCleaned);
};
describe('sagas', () => {
    describe('commands', () => {
        describe('processCommandSaga', () => {
            it('should run', async () => {
                const command = commands_1.placeOrderCommand({
                    side: 'Buy',
                    price: '123.444',
                    orderQty: '999.01',
                });
                await redux_saga_test_plan_1.expectSaga(commands_2.processCommandSaga)
                    .dispatch(command)
                    .throws(Error)
                    .run();
            });
        });
        describe('commandWorkerSaga', () => {
            it('should run', async () => {
                const command = commands_1.placeOrderCommand({
                    side: 'Buy',
                    price: '123.444',
                    orderQty: '999.01',
                }, { seq: 1 });
                await redux_saga_test_plan_1.expectSaga(commands_2.commandWorkerSaga, command)
                    .provide({
                    call(effect, next) {
                        if (effect.fn === db.persistCommand) {
                            const [command] = effect.args;
                            console.log('persist what?', effect.args);
                            return {};
                        }
                        if (effect.fn === commands_2.processCommandSaga) {
                            return {};
                        }
                        // Allow Redux Saga to handle other `call` effects
                        return next();
                    },
                })
                    .run();
            });
        });
        describe('commandWatcherSaga', () => {
            it('should run', async () => {
                const command = commands_1.placeOrderCommand({
                    side: 'Buy',
                    price: '123.444',
                    orderQty: '999.01',
                });
                const seq = 1;
                await redux_saga_test_plan_1.testSaga(commands_2.commandWatcherSaga)
                    .next()
                    .call(db.restoreCommandSeq)
                    .next(seq)
                    .take(commands_1.isCommand)
                    .next(command)
                    .call(commands_2.commandWorkerSaga, { ...command, meta: { seq } })
                    .next(redux_saga_1.END)
                    .finish()
                    .isDone();
            });
        });
    });
});
//# sourceMappingURL=commands.test.js.map