import { IBaseObject } from './i-base-object';
import { ISavedItem } from './i-saved-item';

/**
 * NPC 情報インタフェース.
 */
export interface INonePlayerCharacter extends IBaseObject {
    /**
     * 装備品リスト.
     */
    equipments?: ISavedItem[];
    /**
     * 性別.
     */
    gender?: string;
    /**
     * 職業.
     */
    job?: string;
    /**
     * 最大レベル.
     */
    maxLevel?: number;
    /**
     * 種族.
     */
    species?: string;
    /**
     * 副職.
     */
    subJob?: string;
}
