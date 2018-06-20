import { IBaseObject } from './i-base-object';

/**
 * 称号情報インタフェース.
 */
export interface ITitle extends IBaseObject {
    /**
     * 負数倍率.
     */
    minusRatio?: number;
    /**
     * 正数倍率.
     */
    plusRatio?: number;
    /**
     * 価格倍率.
     */
    priceRatio?: number;
    /**
     * 超レア価格加算値.
     */
    rarePriceAdditional?: number;
    /**
     * 超レア価格倍率.
     */
    rarePriceRatio?: number;
    /**
     * 略号.
     */
    symbol?: string;
}
