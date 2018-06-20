import * as _ from 'underscore';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogConfig, MatDialogRef } from '@angular/material';
import { ICheckboxTreeItem } from '../../../common/interfaces';
import { ItemFieldKeys, PARAMETER_KEYS } from '../../../../common/const';

@Component({
    templateUrl: './field-settings-dialog.component.html',
    styleUrls: ['./field-settings-dialog.component.less']
})
export class FieldSettingsDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        maxWidth: '700px',
        minWidth: '700px',
    };

    /**
     * 選択列名リスト.
     */
    columns: string[];
    /**
     * 表示列設定ツリー.
     */
    _columns: ICheckboxTreeItem;

    /**
     * コンストラクタ.
     * @param dialogRef ダイアログ参照サービス
     */
    constructor(public dialogRef: MatDialogRef<FieldSettingsDialogComponent>) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this._columns = { key: '全て' };
        this._columns.children = [
            {
                key: '基本情報',
                children: _.map(['category', 'price', 'updateDate',], (key): ICheckboxTreeItem => {
                    return { key: key, checked: _.contains(this.columns, key) }
                })
            },
            {
                key: '戦闘能力値',
                children: _.map(ItemFieldKeys.Battle, (key): ICheckboxTreeItem => {
                    return { key: key, checked: _.contains(this.columns, key) }
                })
            },
            {
                key: '基本能力値',
                children: _.map(ItemFieldKeys.Base, (key): ICheckboxTreeItem => {
                    return { key: key, checked: _.contains(this.columns, key) }
                })
            },
            { key: 'equ', checked: _.contains(this.columns, 'equ'), },
            { key: 'skills', checked: _.contains(this.columns, 'skills'), },
        ];
    }

    /**
     * 確定処理.
     */
    comiit(): void {
        const result: string[] = _.chain(this._columns.children)
            .map(col => (col.children) ? col.children : [col])
            .flatten(true)
            .filter(col => col.checked)
            .map(col => col.key)
            .value();

        this.dialogRef.close(result);
    }


    /**
     * MatCheckBoxチェック状態取得.
     * @param item 項目定義
     */
    getChecked(item: ICheckboxTreeItem): boolean {
        if (!item.children || !item.children.length) { return item.checked; }
        return _.chain(item.children).map(child => this.getChecked(child)).contains(true).value();
    }

    /**
     * チェック状態リスト取得.
     * @param item 項目定義
     */
    getCheckedList(item: ICheckboxTreeItem): boolean[] {
        if (item.children) {
            return _.chain(item.children)
                .map(child => this.getCheckedList(child))
                .flatten()
                .value();
        } else {
            return [item.checked];
        }
    };

    /**
     * 曖昧状態取得.
     * @param item 項目定義
     */
    getIndeterminate(item: ICheckboxTreeItem): boolean {
        if (!item.children) { return false; }
        return (_.uniq(this.getCheckedList(item)).length !== 1);
    }

    /**
     * MatCheckBoxチェック状態設定.
     * @param item 項目定義
     */
    setChecked(item: ICheckboxTreeItem, checked: boolean): void {
        if (item.children) {
            _.forEach(item.children, child => this.setChecked(child, checked));
        } else {
            item.checked = checked;
        }
    }

}

