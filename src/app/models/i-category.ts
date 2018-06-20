import { IBaseObject } from './i-base-object';

/**
 * アイテム種別情報インタフェース.
 */
export interface ICategory extends IBaseObject {
    /**
     * 称号所有可能フラグ.
     */
    havableTitle?: boolean;
    /**
     * 省略名称.
     */
    shortName?: string;
    /**
     * 詳細種別リスト.
     */
    subCategories?: string[];
}
