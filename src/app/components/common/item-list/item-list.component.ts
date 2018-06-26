import * as _ from 'underscore';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as g2 from '../../../models';
import * as Const from '../../../common/const';
import { ItemUtilityService, ManagerService } from '../../../services'
import { ItemInfoDialogComponent } from './item-info-dialog.component';

@Component({
    selector: 'g2-item-list',
    templateUrl: './item-list.component.html',
    styleUrls: ['./item-list.component.less'],
    host: {
        'class': 'g2-item-list',
    }
})
export class ItemListComponent implements OnInit {

    /**
     * 表示列リスト.
     */
    @Input() set columns(value: string[]) {
        this._columns = _.filter(Const.ItemFieldKeys.All, column => {
            switch (column) {
                case 'displayName':
                case 'skills':
                    return false;
            }
            return _.contains(value, column);
        });
        this._showSkills = _.contains(value, 'skills');
    }
    _columns: string[];
    _showSkills: boolean;

    /**
     * 強調表示スキル正規表現.
     */
    @Input() set highlightSkillRegex(value: string) {
        this._skillRegex = (value) ? new RegExp(value.replace(/([\[\].])/g, '\\$1'), 'gi') : null;
    }
    _skillRegex: RegExp;
    /**
     * 行強調表示スキル名.
     */
    @Input() highlightRowSkill: string;
    /**
     * アイテム情報リスト.
     */
    @Input() set items(value: g2.IInventory[]) {
        this._items = this.itemUtil.sort(value, this.sortKey, this.revert);
    }
    _items: g2.IInventory[];
    /**
     * ページサイズ.
     */
    @Input() pageSize: number;
    /**
     * 表示ページインデックス.
     */
    @Input() pageIndex: number;
    /**
     * 読み取り専用フラグ.
     */
    @Input() readonly: boolean;
    /**
     * 選択可能フラグ.
     */
    @Input() selectable: boolean;

    /**
     * データ変更時イベント.
     */
    @Output() change = new EventEmitter();

    /**
     * 降順フラグ.
     */
    revert: boolean;
    /**
     * ソートキー.
     */
    sortKey: string;

    /**
     * コンストラクタ.
     * @param dialog ダイアログサービス
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティ
     */
    constructor(private dialog: MatDialog, private manager: ManagerService, private itemUtil: ItemUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
    }

    /**
     * 表示範囲アイテム情報リスト取得.
     */
    getDisplayItems(): g2.IInventory[] {
        const start = this.pageSize * this.pageIndex;
        const end = this.pageSize * (this.pageIndex + 1);
        return this._items.slice(start, end);
    }

    /**
     * ヘッダセル Css Class 取得.
     * @param key キー値
     */
    getHeaderCssClass(key: string): string[] {
        const result: string[] = ['header-caption'];
        if (this.sortKey === key) {
            result.push('sort-key');
            if (this.revert) { result.push('desc'); }
        }
        return result;
    }

    /**
     * データ行 Css Class 取得.
     * @param item アイテム情報
     */
    getRowCssClass(item: g2.IInventory): string[] {
        const result: string[] = [];
        if (item.rareTitle) { result.push('rare-titled'); }
        if (item.isAcquisition) { result.push('acquisition'); }
        if (this.highlightRowSkill && _.contains(item.skills, this.highlightRowSkill)) { result.push('highlight-skill'); }
        return result;
    }

    /**
     * データ行 Css Class 取得.
     * @param item アイテム情報
     */
    getSkillCssClass(skill: string): string[] {
        const result: string[] = ['skill'];
        if (this._skillRegex) {
            this._skillRegex.lastIndex = 0;
            if (this._skillRegex.exec(skill)) { result.push('highlight'); }
        }
        return result;
    }

    /**
     * アイテム情報ダイアログオープン.
     * @param item アイテム情報.
     */
    openItemInfoDialog(item: g2.IInventory): void {
        const dialogRef = this.dialog.open(ItemInfoDialogComponent, ItemInfoDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.item = item;
        dialogRef.componentInstance.readonly = this.readonly;
        dialogRef.afterClosed().subscribe(result => {
            if (result) { this.change.emit(); }
        });
    }

    /**
     * ソート.
     * @param key ソートキー
     */
    sort(key?: string): void {
        if (key) {
            if (key !== this.sortKey) {
                this.revert = false;
                this.sortKey = key;
            } else {
                if (this.revert) {
                    this.revert = false;
                    this.sortKey = undefined;
                } else {
                    this.revert = true;
                }
            }
        }
        // ソート実施
        this._items = this.itemUtil.sort(this._items, this.sortKey, this.revert);
    }

}
