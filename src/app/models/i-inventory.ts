import { IItem } from './i-item';

/**
 * 所有アイテム情報インタフェース.
 */
export interface IInventory extends IItem {
    /**
     * 掘り出し物フラグ.
     */
    isAcquisition?: boolean;
    /**
     * 所有フラグ.
     */
    possession?: boolean;
    /**
     * 更新日時.
     */
    updateDate?: Date;
}
