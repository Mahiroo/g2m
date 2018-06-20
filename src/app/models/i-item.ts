import { AddTitleFlg, CompsiteFlg, TitleInheritanceFlg } from '../common/const';
import { IBaseObject } from './i-base-object';
import { IParameters } from './i-parameters';
import { ISkillAttachable } from './i-skill-attachable';

/**
 * アイテム情報インタフェース.
 */
export interface IItem extends IBaseObject, IParameters, ISkillAttachable {
    /**
     * アイテム称号付与フラグ.
     */
    addTitle?: AddTitleFlg;
    /**
     * 装備倍率適用時基礎パラメータ.
     */
    baseParams?: IParameters;
    /**
     * 詳細アイテム種別.
     */
    category?: string;
    /**
     * アイテム合成フラグ.
     */
    composite?: CompsiteFlg;
    /**
     * ダミーフラグ.
     */
    dummy?: boolean;
    /**
     * 称号所有可能フラグ.
     */
    havableTitle?: boolean;
    /**
     * レアアイテムフラグ.
     */
    isRare?: boolean;
    /**
     * 宝石名称.
     */
    jewel?: string;
    /**
     * アイテム種別.
     */
    majorCategory?: string;
    /**
     * ソートオーダー.
     */
    order?: number;
    /**
     * 価格.
     */
    price?: number;
    /**
     * 超レア称号.
     */
    rareTitle?: string;
    /**
     * 倍率.
     */
    ratio?: number;
    /**
     * 装備制限.
     */
    restricts?: IRestricts;
    /**
     * 固定装備フラグ.
     */
    static?: boolean;
    /**
     * 称号.
     */
    title?: string;
    /**
     * 称号継承フラグ.
     */
    titleInheritance?: TitleInheritanceFlg;
    /**
     * 最高称号超過フラグ.
     */
    titleLimitOver?: boolean;
}

/**
 * 装備制限情報インタフェース.
 */
export interface IRestricts {
    /**
     * 不可リスト.
     */
    forbid?: string[];
    /**
     * 許可性別リスト.
     */
    genders?: string[];
    /**
     * 許可職業リスト.
     */
    jobs?: string[];
    /**
     * 許可種族リスト.
     */
    species?: string[];
}

