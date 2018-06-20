import { IItem } from './i-item';

/**
 * 種族情報インタフェース.
 */
export interface ISpecies extends IItem {
    /**
     * 最大レベル.
     */
    maxLevel?: number;
}
