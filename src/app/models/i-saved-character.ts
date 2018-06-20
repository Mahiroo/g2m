import { ISavedItem } from './i-saved-item';

/**
 * 保存用キャラクター情報インタフェース.
 */
export interface ISavedCharacter {
    /**
     * 装備品リスト.
     */
    eq?: ISavedItem[];
    /**
     * 性別.
     */
    gd?: string;
    /**
     * 魔造素材.
     */
    hm?: string;
    /**
     * キャラクターID.
     */
    id?: number;
    /**
     * 職業.
     */
    jb?: string;
    /**
     * レベル.
     */
    lv?: number;
    /**
     * 名前.
     */
    nm?: string;
    /**
     * NPC.
     */
    np?: string;
    /**
     * ソート順.
     */
    o?: number;
    /**
     * 個性.
     */
    p1?: string;
    /**
     * 個性2.
     */
    p2?: string;
    /**
     * 種族.
     */
    sp?: string;
    /**
     * 副職.
     */
    sj?: string;
}
