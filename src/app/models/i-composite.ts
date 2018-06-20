/**
 * アイテム合成情報インタフェース.
 */
export interface IComposite {
    /**
     * 素材アイテム名.
     */
    materialItem: string;
    /**
     * 合成材料アイテム名.
     */
    otherItem: string;
    /**
     * 結果アイテム名.
     */
    resultItem: string;
}
