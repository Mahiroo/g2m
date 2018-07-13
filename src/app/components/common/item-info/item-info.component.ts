import * as  _ from 'underscore';
import { Component, Input } from '@angular/core';
import * as g2 from '../../../models';
import { ItemFieldKeys } from '../../../common/const';

@Component({
    selector: 'g2-item-info',
    templateUrl: './item-info.component.html',
    styleUrls: ['./item-info.component.less'],
    host: {
        'class': 'g2-item-info',
    }
})
export class ItemInfoComponent {

    /**
     * 基本値表示フラグ.
     */
    @Input() showBase: boolean;
    /**
     * アイテム情報.
     */
    @Input() item: g2.IInventory;

    /**
     * パラメータキーリスト
     */
    params: string[] = _.reject(ItemFieldKeys.All, key => _.contains(['displayName', 'category', 'price', 'skills', 'updateDate'], key));

    /**
     * アイテム設定値取得.
     * @param key キー値
     */
    getValue(key: string): any {
        if (this.item.baseParams && this.showBase) {
            if (this.item.baseParams[key]) { return this.item.baseParams[key]; }
        }
        return this.item[key];
    }
}
