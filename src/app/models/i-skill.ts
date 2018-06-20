import { IBaseObject } from './i-base-object';

/**
 * スキル情報インタフェース.
 */
export interface ISkill extends IBaseObject {
    /**
     * 所有数.
     */
    count?: number;
    /**
     * スキルグループ.
     */
    group?: string;
    /**
     * 固定スキルフラグ.
     */
    static?: boolean;
}
