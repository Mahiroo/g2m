/**
 * 基本情報インタフェース.
 */
export interface IBaseObject {
    /**
     * インデクサ.
     */
    [key: string]: any;
    /**
     * 表示名称.
     */
    displayName?: string;
    /**
     * 名称.
     */
    name: string;
    /**
     * 種別.
     */
    kind: string;
    /**
     * シーケンス番号.
     */
    seq?: number;
}
