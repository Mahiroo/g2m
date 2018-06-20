import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import * as g2 from '../../../models';
import { ItemFieldKeys } from '../../../common/const';
import { ManagerService, ItemUtilityService } from '../../../services';

@Component({
    templateUrl: './item-info-dialog.component.html',
    styleUrls: ['./item-info-dialog.component.less']
})
export class ItemInfoDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        // maxWidth: '600px',
        // minWidth: '600px',
    };

    /**
     * 称号付与情報リスト.
     */
    addTitles: ICompositeInfo[] = [];
    /**
     * アイテム合成情報リスト.
     */
    composites: ICompositeInfo[] = [];
    /**
     * 称号継承情報リスト.
     */
    inheritances: ICompositeInfo[] = [];
    /**
     * アイテム情報.
     */
    item: g2.IInventory;
    /**
     * 元アイテム情報.
     */
    originalItem: g2.IInventory;
    /**
     * パラメータキーリスト
     */
    params: string[] = _.reject(ItemFieldKeys.All, key => _.contains(['displayName', 'category', 'price', 'skills', 'updateDate'], key));
    /**
     * 読み取り専用フラグ.
     */
    readonly: boolean;
    /**
     * 称号情報リスト.
     */
    titles: g2.ITitle[] = _.toArray(this.manager.titles);
    /**
     * 更新フラグ.
     */
    updated: boolean;
    /**
     * アイテム強化代価リスト.
     */
    upgradeCosts?: { from: string, to: string, cost: string }[] = [];
    /**
     * アイテム強化履歴リスト.
     */
    upgradeHistory: g2.IItem[] = [];
    overedTitle: g2.ITitle;

    /**
     * コンストラクタ.
     * @param dialogRef ダイアログ参照
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティサービス
     */
    constructor(public dialogRef: MatDialogRef<ItemInfoDialogComponent>, private manager: ManagerService, private itemUtil: ItemUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit(): void {
        this.init();
    }

    /**
     * 所有アイテム掘り出し.
     */
    acquire(): void {
        if (!confirm(`[ ${this.item.displayName} ]を掘り出してもよろしいですか？`)) { return; }
        this.item = this.itemUtil.acquireInventory(this.item, true);
        alert(`[ ${this.item.displayName} ]の掘り出しが完了しました。`);
        this.dialogRef.close(true);
    }

    /**
    * 称号項目 css class 取得.
    * @param title 対象称号情報
    */
    getTitleCssClass(title: g2.ITitle): string[] {
        // 基本クラス
        const result: string[] = ['title-chip'];
        if (title) {
            if (title.seq <= this.manager.titles[this.item.title].seq) { result.push('enabled'); }
            if (this.overedTitle) {
                result.push('edit');
                if (title.seq <= this.overedTitle.seq) { result.push('overed'); }
            }
        } else {
            if (this.item.possession) { result.push('enabled'); }
        }
        return result;
    }

    /**
     * 初期化.
     */
    init(): void {
        // アイテム合成情報取得
        if (this.item.composite) {
            this.composites = _.map(this.itemUtil.getComposites(this.item), (composite): ICompositeInfo => {
                // 進化の書対応
                if (composite.materialItem === '進化の書' && composite.otherItem === '幸運のコイン' && this.item.name === '幸運のコイン') {
                    return {
                        from: this.itemUtil.getItem(composite.materialItem),
                        other: this.item,
                        to: this.itemUtil.getItem(composite.resultItem, null, this.item.rareTitle),
                        isUpgrade: true,
                    }
                }
                return {
                    from: (composite.materialItem === this.item.name) ? this.item : this.itemUtil.getItem(composite.materialItem),
                    other: (composite.otherItem === this.item.name && composite.materialItem !== composite.otherItem) ? this.item : this.itemUtil.getItem(composite.otherItem),
                    to: (composite.materialItem === this.item.name) ? this.itemUtil.getItem(composite.resultItem, this.item.title, this.item.rareTitle) : this.itemUtil.getItem(composite.resultItem),
                    isUpgrade: (composite.materialItem === this.item.name),
                }
            });
        } else {
            this.composites = [];
        }
        // ネバネバ対応
        if (this.item.rareTitle && this.item.majorCategory === 'その他') {
            this.composites.push({ from: this.itemUtil.getItem('ネバネバ'), other: this.item, to: this.itemUtil.getItem('ネバネバ', null, this.item.rareTitle), isUpgrade: true });
            console.log(this.composites);
        }

        // 称号付与合成情報取得
        if (this.item.addTitle) {
            this.addTitles = _.map(this.itemUtil.getAddTitles(this.item), (addTitle): ICompositeInfo => {
                // ネバネバ対応
                if (this.item.name === 'ネバネバ') {
                    return {
                        from: this.item,
                        to: this.itemUtil.getItem(addTitle.resultItem, addTitle.title, this.item.rareTitle),
                        isUpgrade: true,
                    }
                }
                return {
                    from: (addTitle.materialItem === this.item.name) ? this.item : this.itemUtil.getItem(addTitle.materialItem),
                    to: (addTitle.resultItem === this.item.name) ? this.itemUtil.getItem(this.item.name, addTitle.title, this.item.rareTitle) : this.itemUtil.getItem(addTitle.resultItem),
                    isUpgrade: (addTitle.resultItem === this.item.name) ? (this.manager.titles[this.item.title].seq < this.manager.titles[addTitle.title].seq) : false,
                }
            });
        } else {
            this.addTitles = [];
        }

        // 称号継承情報取得
        if (this.item.titleInheritance) {
            this.inheritances = _.map(this.itemUtil.getInheritTitles(this.item), (inherit): ICompositeInfo => {
                if (inherit.materialItem === this.item.name) {
                    return { to: this.itemUtil.getItem(inherit.resultItem, this.item.title, this.item.rareTitle), isUpgrade: true };
                } else {
                    const upgraded: g2.IItem = this.itemUtil.upgradeTitle(this.item);
                    return { from: this.itemUtil.getItem(inherit.materialItem, upgraded.title), to: upgraded, isUpgrade: (upgraded.title !== this.item.title) };
                }
            });
        } else {
            this.inheritances = [];
        }
    }

    /**
     * 称号項目マウスオーバー.
     * @param title 対象称号情報
     */
    overTitle(title: g2.ITitle): void {
        this.overedTitle = title;
    }

    /**
     * 称号項目マウスアウト.
     * @param title 対象称号情報
     */
    outTitle(): void {
        this.overedTitle = null;
    }

    /**
     * アイテム情報削除.
     */
    remove(): void {
        if (!confirm(`[ ${this.item.displayName} ]を削除してよろしいですか？`)) { return; }
        this.itemUtil.remove(this.item, true);
        alert(`[ ${this.item.displayName} ]を削除しました。`);
        this.dialogRef.close(true);
    }

    /**
     * 所有フラグ設定.
     */
    setPossession(): void {
        const modItem = this.itemUtil.getClone(this.item);
        modItem.possession = !(this.item.possession);
        this.item = this.itemUtil.modInventory(this.item, modItem, true);
        this.init();
        this.updated = true;
    }

    /**
     * 最大称号設定.
     * @param title 称号情報
     */
    setTitle(title: g2.ITitle): void {
        // if (!confirm(`最大称号を[ ${title.name} ]に更新してよろしいですか？`)) { return; }
        const modItem = (title) ? this.itemUtil.getItem(this.item.name, title.name) : this.itemUtil.getItem(this.item.name);
        modItem.possession = this.item.possession;
        this.item = this.itemUtil.modInventory(this.item, modItem, true);
        this.itemUtil.refresh();
        this.init();
        this.updated = true;
    }

    /**
     * アイテム強化.
     * @param item アイテム情報
     */
    setUpgrade(item: g2.IItem, inheritance?: boolean): void {
        if (!this.originalItem) { this.originalItem = this.item; }
        // 代価計算
        let upgradeCost = { from: this.item.displayName, to: item.displayName, cost: null };
        if (inheritance) {
            if (item.price == 99999999) {
                upgradeCost.cost = `宝石 (99,999,999GP)`;
            } else {
                if (item.rareTitle) {
                    upgradeCost.cost = `宝石 (${item.price}GP以上)`;
                } else {
                    if (this.manager.getTitle(item.title).seq > this.manager.getTitle('宿った').seq) {
                        upgradeCost.cost = `${item.majorCategory} (${item.price}GP以上)`;
                    } else {
                        upgradeCost.cost = `${item.price}GP`;
                    }
                }
            }
        }
        this.upgradeCosts.push(upgradeCost);
        this.upgradeHistory.push(item);
        this.item = item;
        this.init();
    }

    /**
     * アイテム情報更新.
     */
    update(): void {
        if (!confirm(`[ ${this.originalItem.displayName} ]を[ ${this.item.displayName} ]に更新してよろしいですか？`)) { return; }
        this.itemUtil.modInventory(this.originalItem, this.item, true);
        alert(`更新が完了しました。`);
        this.dialogRef.close(true);
    }
}

/**
 * アイテム合成/称号付与/称号継承情報インタフェース.
 */
interface ICompositeInfo {
    /**
     * 元アイテム情報.
     */
    from?: g2.IItem;
    /**
     * 素材アイテム情報.
     */
    other?: g2.IItem;
    /**
     * 結果アイテム情報.
     */
    to: g2.IItem;
    /**
     * 強化フラグ.
     */
    isUpgrade: boolean;
}
