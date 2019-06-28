export type Liquidity = 'Maker' | 'Taker';

export type Side = 'buy' | 'sell';

export type OrderStatus = 'New' | 'PartiallyFilled' | 'Filled' | 'Canceled';

export interface Order {
  orderId: string;
  side: Side;
  price: string;
  orderQty: string;
  status: OrderStatus;
  leavesQty: string;
}

export interface OrderBookEntry {
  price: string;
  size: string;
  orderId: string;
}

export interface Trade {
  price: string;
  size: string;
  side: Side; // TODO: Forgot how this works
}

export interface State {
  orderIdCounter: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  orders: {
    [orderId: string]: Order;
  };
  trades: Trade[];
}
