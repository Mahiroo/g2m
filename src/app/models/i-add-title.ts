/**
 * 称号付与情報インタフェース.
 */
export interface IAddTitle {
    /**
     * 素材アイテム名.
     */
    materialItem: string;
    /**
     * 結果アイテム名.
     */
    resultItem: string;
    /**
     * 付与称号.
     */
    title: string;
}
