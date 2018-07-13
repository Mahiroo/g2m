import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import * as g2 from '../../../models';
import { ItemUtilityService, IFilter, ManagerService } from '../../../services'
import { FieldSettingsDialogComponent, ItemFilterDialogComponent } from '../../common/item-list';

@Component({
    templateUrl: './item-list-dialog.component.html',
    styleUrls: ['./item-list-dialog.component.less']
})
export class ItemListDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        maxWidth: '95vw',
        minWidth: '95vw',
        width: '95vw',
    };
    /**
     * ローカルストレージキー : 列定義.
     */
    readonly LSKEY_COLUMNS = 'character.item-list-dialog.columns';

    /**
     * 表示列リスト.
     */
    columns: string[];
    /**
     * 装備倍率反映フラグ.
     */
    isRatio: boolean;
    set itemRatios(value: g2.IItemRatio) {
        this._itemRatios = value;
        if (this._baseItems) {
            this._ratioItems = _.map(this._baseItems, item => item);
        }
    }
    _itemRatios: g2.IItemRatio;
    /**
     * アイテム情報リスト.
     */
    set items(value: g2.IInventory[]) {
        this._baseItems = _.map(value, item => this.itemUtil.getClone(item));
        if (this._itemRatios) {
            this._ratioItems = _.map(value, item => item);
        }
    }
    _baseItems: g2.IInventory[];
    _ratioItems: g2.IInventory[];

    /**
     * コンストラクタ.
     * @param charUtil
     */
    constructor(public dialogRef: MatDialogRef<ItemListDialogComponent>, private dialog: MatDialog, private manager: ManagerService, private itemUtil: ItemUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.columns = this.manager.localStorage.get(this.LSKEY_COLUMNS) || this.itemUtil.getFieldKeys();
    }

    /**
     * 表示設定ダイアログ表示.
     */
    openFieldSettingsDialog(): void {
        const dialogRef = this.dialog.open(FieldSettingsDialogComponent, FieldSettingsDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.columns = this.columns;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.columns = result;
            this.manager.localStorage.set(this.LSKEY_COLUMNS, this.columns);
        });
    }
}
