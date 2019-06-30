import { combineReducers } from 'redux';
import { reducer as ordersReducer, NAME as ORDERS_NAME } from './ducks/orders';
import { reducer as orderBookReducer, NAME as ORDER_BOOK_NAME } from './ducks/order-book';

export const reducer = combineReducers({
  [ORDERS_NAME]: ordersReducer,
  [ORDER_BOOK_NAME]: orderBookReducer,
});
