/**
 * チェックボックスツリー構造インタフェース.
 */
export interface ICheckboxTreeItem {
    /**
     * チェック状態.
     */
    checked?: boolean;
    /**
     * 子要素リスト.
     */
    children?: ICheckboxTreeItem[];
    /**
     * キー値.
     */
    key: string;
}
