import { OrderSide, TradeSide } from './types';

export const NAME = '@@effects';

export enum EffectType {
  Trade = '@@effects/TRADE_EFFECT',
}

export interface EffectMeta {
  seq?: number;
}

export interface Effect<P = any> {
  readonly type: EffectType;
  readonly payload: P;
  readonly meta: EffectMeta;
}

export interface EffectWithPayload<P> extends Effect<P> {
  payload: P;
}

export function createEffect<P>(type: EffectType, payload: P, meta: EffectMeta = {}): Effect<P> {
  return { type, payload, meta };
}

export interface TradeEffectPayload {
  readonly price: string;
  readonly size: string; // TODO: Name?
  readonly side: TradeSide;
}

export interface TradeEffect extends EffectWithPayload<TradeEffectPayload> {}

export const tradeEffect = (payload: TradeEffectPayload) => createEffect(EffectType.Trade, payload);

export const isTradeEffect = (effect: Effect): effect is TradeEffect => effect.type === EffectType.Trade;
