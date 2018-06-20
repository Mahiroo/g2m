import * as _ from 'underscore';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatCheckboxChange } from '@angular/material';
import { AcquisitionFlg, TitleInheritanceFlg } from '../../../../common/const';
import { ManagerService, IFilter, ItemUtilityService } from '../../../../services';
import { ICheckboxTreeItem } from '../../../common/interfaces';

@Component({
    templateUrl: './item-filter-dialog.component.html',
    styleUrls: ['./item-filter-dialog.component.less']
})
export class ItemFilterDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        minWidth: '65vw',
        maxWidth: '65vw',
    };

    /**
     * フィルタ設定.
     */
    set filter(value: IFilter) {
        this._filter = _.clone(value);
    };
    _filter: IFilter;
    /**
     * アイテム合成エリア非表示フラグ.
     */
    hideComposite: boolean;
    /**
     * アイテム種別リスト.
     */
    _categories: ICheckboxTreeItem;
    /**
     * 称号リスト.
     */
    _titles: ICheckboxTreeItem;

    /**
     * コンストラクタ.
     * @param dialogRef ダイアログ参照サービス
     */
    constructor(public dialogRef: MatDialogRef<ItemFilterDialogComponent>, private manager: ManagerService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit(): void {
        if (!this._filter.categories) { this._filter.categories = _.map(this.manager.categories, item => item.name); }
        this._categories = {
            key: 'category',
            children: _.map(this.manager.categories, item => {
                return { key: item.name, checked: _.contains(this._filter.categories, item.name) };
            })
        };

        if (!this._filter.titles) { this._filter.titles = _.map(this.manager.titles, item => item.name); }
        this._titles = {
            key: 'titles',
            children: _.map(this.manager.titles, item => {
                return { key: item.name, checked: _.contains(this._filter.titles, item.name) };
            })
        };
    }

    /**
     * フィルタクリア.
     */
    clear(): void {
        this.filter = ItemUtilityService.INITIAL_FILTER;
        _.forEach(this._categories.children, category => category.checked = true);
        _.forEach(this._titles.children, title => title.checked = true);
    }

    /**
     * フィルタ確定.
     */
    comiit(): void {
        this._filter.categories = _.chain(this._categories.children).filter(item => item.checked).map(item => item.key).value();
        if (!this._filter.categories.length) { delete this._filter.categories; }
        this._filter.titles = _.chain(this._titles.children).filter(item => item.checked).map(item => item.key).value();
        if (!this._filter.titles.length) { delete this._filter.titles; }
        this.dialogRef.close(this._filter);
    }

    /**
     * パネル見出し取得.
     * @param section セクション名
     */
    getPanelCaption(section: string): string {
        let detail: string = '';
        switch (section) {
            case 'rareTitle':
                if (this._filter.showNormalItem) { detail += (this._filter.allTitles) ? '通常・全称号' : '通常'; }
                if (this._filter.showRareTitledItem) {
                    detail += (detail) ? '／' : '';
                    detail += '超レア';
                    if (this._filter.acquisition !== AcquisitionFlg.all) {
                        detail += (this._filter.acquisition === AcquisitionFlg.normal) ? '・所持品のみ' : '・掘り出し物のみ';
                    }
                }
                return (detail) ? `超レア称号(${detail})` : '超レア称号';

            case 'category':
                if (this.getIndeterminate(this._categories)) {
                    const keys: string[] = _.chain(this._categories.children)
                        .filter(child => child.checked)
                        .map(child => child.key)
                        .value();;
                    _.forEach(keys.slice(0, 10), key => detail += (detail) ? `／${key}` : key);
                    if (keys.length > 10) { detail += '...他'; }
                } else {
                    detail = '全て';
                }
                return `アイテム種別(${detail})`;

            case 'title':
                if (this.getIndeterminate(this._titles)) {
                    _.forEach(this._titles.children, child => {
                        if (child.checked) { detail += (detail) ? `／${child.key}` : child.key; }
                    });
                } else {
                    detail = '全て';
                }
                return `称号(${detail})`;

            case 'composite':
                if (this._filter.composite) { detail += '合成可能'; }
                if (this._filter.addTitle) {
                    detail += (detail) ? '／' : '';
                    detail += (this._filter.upgradableOnly) ? '称号付与・強化可能のみ' : '称号付与';
                }
                if (this._filter.inheritanceOnly) {
                    detail += (detail) ? '／' : '';
                    detail += '称号継承';
                    if (this._filter.inheritance !== TitleInheritanceFlg.All) {
                        detail += (this._filter.inheritance !== TitleInheritanceFlg.Material) ? '・継承元のみ' : '・継承先のみ';
                    }
                }
                if (!detail) { detail = '指定なし'; }
                return `アイテム合成・称号継承(${detail})`;

            case 'regex':
                if (this._filter.regexItemName) { detail += `アイテム名:[ ${this._filter.regexItemName} ]` }
                if (this._filter.regexSkillName) {
                    detail += (detail) ? '／' : '';
                    detail += `スキル名:[ ${this._filter.regexSkillName} ]`
                }
                if (!detail) { detail = '指定なし'; }
                return `名称検索(${detail})`;
        }
        return null;
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
