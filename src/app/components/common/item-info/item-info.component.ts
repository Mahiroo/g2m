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

    @Input() item: g2.IInventory;

    /**
     * パラメータキーリスト
     */
    params: string[] = _.reject(ItemFieldKeys.All, key => _.contains(['displayName', 'category', 'price', 'skills', 'updateDate'], key));

}
