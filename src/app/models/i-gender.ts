import { IBaseObject } from './i-base-object';

/**
 * 性別情報インタフェース.
 */
export interface IGender extends IBaseObject {
    /**
     * 種族リスト.
     */
    species?: string[];
}
