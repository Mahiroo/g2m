import { ISkill } from '../i-skill';

/**
 * 装備アイテム能力値倍率情報インタフェース.
 */
export interface IItemRatio extends ISkill {
    /**
     * 装備アイテム能力値倍率情報.
     */
    itemRatios?: IItemRatioDetail[];
}
/**
 * 装備アイテム能力値倍率詳細情報インタフェース.
 */
export interface IItemRatioDetail {
    /**
     * パラメータ名.
     */
    param: string;
    /**
     * 倍率.
     */
    ratio?: number;
}