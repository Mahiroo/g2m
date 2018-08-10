import { IAttachedSkill } from './i-attached-skill';
import { IParameters } from './i-parameters';
import { ISavedItem } from './i-saved-item';
/**
 * キャラクター情報インタフェース.
 */
export interface ICharacter extends IParameters {
    /**
     * 基本能力加算値.
     */
    additionalParams?: IParameters;
    /**
     * 詳細パラメータ.
     */
    detailParameters?: {
        /**
         * 基本値.
         */
        base?: IParameters,
        /**
         * レベル比例値.
         */
        level?: IParameters,
        /**
         * スキル.
         */
        skill?: IParameters,
        /**
         * 装備品.
         */
        equipment?: IParameters,
    }
    /**
     * アイテム装備可能数.
     */
    equipmentCount?: number;
    /**
     * 装備品リスト.
     */
    equipments?: ISavedItem[];
    /**
     * 装備品倍率.
     */
    equipmentRatios?: _.Dictionary<number>;
    /**
     * 性別.
     */
    gender?: string;
    /**
     * 格闘フラグ.
     */
    grapple?: boolean;
    /**
     * 成長倍率.
     */
    growthRatio?: number;
    /**
     * 魔造素材.
     */
    homunculus?: string;
    /**
     * キャラクターID.
     */
    id?: number;
    /**
     * 装備アイテム倍率.
     */
    itemRatio?: IItemRatio;
    /**
     * 職業.
     */
    job?: string;
    /**
     * レベル.
     */
    level?: number;
    /**
     * 名前.
     */
    name?: string;
    /**
     * NPC.
     */
    npc?: string;
    /**
     * ソート順.
     */
    order?: number;
    /**
     * 個性.
     */
    personality?: string;
    /**
     * 個性2.
     */
    personality2?: string;
    /**
     * 所有スキルリスト.
     */
    skills?: _.Dictionary<IAttachedSkill>;
    /**
     * 種族.
     */
    species?: string;
    /**
     * 副職.
     */
    subJob?: string;
}

/**
 * 装備アイテム倍率情報インタフェース.
 */
export interface IItemRatio {
    /**
     * 装備倍率.
     */
    equipmentRatio?: _.Dictionary<number>;
    /**
     * アイテム倍率.
     */
    itemRatios?: _.Dictionary<number>;
}