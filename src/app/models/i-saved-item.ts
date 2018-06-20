/**
 * 保存用アイテム情報インタフェース.
 */
export interface ISavedItem {
    /**
     * 掘り出し物フラグ.
     */
    a?: boolean;
    /**
     * 更新日時.
     */
    d?: number;
    /**
     * ダミーフラグ.
     */
    dummy?: boolean;
    /**
     * 宝石名称.
     */
    j?: string;
    /**
     * アイテム名称.
     */
    n?: string;
    /**
     * 所有フラグ.
     */
    p?: boolean;
    /**
     * 超レア称号名称.
     */
    r?: string;
    /**
     * 称号名称.
     */
    t?: string;
    /**
     * 最高称号超過フラグ.
     */
    titleLimitOver?: boolean;
}
