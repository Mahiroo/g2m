import * as _ from 'underscore';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as g2 from '../../models';
import { PARAMETER_KEYS, ItemFieldKeys } from '../../common/const';
import { isSameText } from '../../common/function';
import { CharacterManagerService, ItemUtilityService, ManagerService, IFilter } from '../../services'
import { AddItemDialogComponent } from './dialogs/add-item-dialog.component';
import { CharacterListDialogComponent } from './dialogs/character-list-dialog.component';
import { DataManagementDialogComponent } from './dialogs/data-management-dialog.component';
import { EditItemDialogComponent } from './dialogs/edit-item-dialog.component';
import { EditPartsDialogComponent } from './dialogs/edit-parts-dialog.component';
import { ItemListDialogComponent } from './dialogs/item-list-dialog.component';
import { SearchItemDialogComponent } from './dialogs/search-item-dialog.component';
import { ItemFilterDialogComponent } from '../common/item-list/dialogs/item-filter-dialog.component';

@Component({
    selector: 'g2-character',
    templateUrl: './character.component.html',
    styleUrls: ['./character.component.less']
})
export class CharacterComponent implements OnInit {

    readonly BASE_PARAMS = PARAMETER_KEYS.BASE;
    readonly BATTLE_PARAMS = ItemFieldKeys.Battle;
    readonly LSKEY_FILTER = 'character.search-item-dialog.filter';
    readonly LSKEY_SETTINGS = 'character.settings';

    /**
     * 装備アイテム情報リスト.
     */
    attachedItems: g2.IItem[];
    /**
     * 装備品能力値合計.
     */
    attachedItemParams: g2.IParameters;
    /**
     * 所有スキル情報リスト.
     */
    attachedSkills: g2.IAttachedSkill[];
    /**
     *
     */
    beingUsedItems: _.Dictionary<string[]>;
    /**
     * 編集キャラクター情報.
     */
    editCharacter: g2.ICharacter;
    /**
     * 装備倍率リスト.
     */
    equipmentRatios: { key: string, value: number }[];
    /**
     * フィルタ設定.
     */
    filter: IFilter;
    /**
     * アイテム一覧表示列リスト.
     */
    itemListColumns: string[] = ['category'];
    /**
     * 選択アイテム.
     */
    selectedItem: g2.IInventory;
    /**
     * 選択スキル.
     */
    selectedSkill: g2.IAttachedSkill;
    /**
     * 環境設定.
     */
    settings: ICharacterComponentSettings;
    /**
     * 更新フラグ.
     */
    updated: boolean;

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティ
     * @param charManager キャラクタユーティリティ
     */
    constructor(private dialog: MatDialog, private manager: ManagerService, private itemUtil: ItemUtilityService, private charManager: CharacterManagerService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.settings = this.manager.localStorage.get(this.LSKEY_SETTINGS) || {};
        if (this.settings.editId) { this.editCharacter = _.find(this.charManager.characters, character => character.id === this.settings.editId); }
        if (!this.editCharacter) { this.editCharacter = this.charManager.create(); }
        this.filter = this.manager.localStorage.get(this.LSKEY_FILTER) || ItemUtilityService.INITIAL_FILTER;
        this.refresh();
    }

    /**
     * 新規キャラクター作成.
     */
    createNewCharacter(): void {
        this.editCharacter = this.charManager.create();
        this.updated = false;
        this.refresh();
        this.saveSettings();
    }

    /**
     * 装備アイテム利用中キャラクターリスト取得.
     */
    getBeingUsedCharacters(item: g2.IInventory): string {
        if (!this.beingUsedItems[item.displayName]) { return null; }
        let result: string = '';
        _.forEach(this.beingUsedItems[item.displayName], character => {
            result += `${character}／`;
        });
        return (result) ? result.replace(/／$/g, '') : null;
    }

    /**
     * ビルド構成情報取得.
     */
    getBuildInfo(): string {
        return this.charManager.getBuildPartsInfo(this.editCharacter);
    }

    /**
     * 装備アイテムCssClass取得.
     * @param item アイテム情報
     */
    getEquipmentItemCssClass(item: g2.IInventory): string[] {
        const result: string[] = ['equipment-item'];
        if (item.rareTitle) { result.push('rare-titled'); }
        if (item.jewel) { result.push('jeweled'); }
        if (item.static) { result.push('static'); }
        if (this.selectedItem && this.selectedItem === item) { result.push('selected'); }
        if (this.selectedSkill && _.contains(item.skills, this.selectedSkill.name)) { result.push('highlight'); }
        if (this.beingUsedItems[item.displayName.replace(/\[.+\]]/, '')]) { result.push('used'); }
        return result;
    }

    /**
     * アイテム装備倍率取得.
     * @param item アイテム情報
     */
    getItemRatio(item: g2.IInventory): number {
        const ratio: number = this.editCharacter.itemRatio.equipmentRatio[item.majorCategory];
        return (ratio) ? item.ratio * ratio : item.ratio;
    }

    /**
     * スキルアイテムCssClass取得.
     * @param skill スキル情報
     */
    getSkillItemCssClass(skill: g2.IAttachedSkill): string[] {
        const result: string[] = ['skill-item'];
        if (skill.static) { result.push('static'); }
        if (skill.count > 1) { result.push('duplicate'); }
        if (this.selectedSkill === skill) { result.push('selected'); }
        if (this.selectedItem) {
            if (_.contains(this.selectedItem.skills, skill.name)) { result.push('highlight'); }
        }
        return result;
    }

    /**
     * アイテム追加ダイアログ表示.
     */
    openAddItemDialog(): void {
        const dialogRef = this.dialog.open(AddItemDialogComponent, AddItemDialogComponent.DEFAULT_OPTIONS);
        dialogRef.afterClosed().subscribe(result => {
            if (!dialogRef.componentInstance.addedItems.length) { return; }
            this.unionEquipmentItems(dialogRef.componentInstance.addedItems);
            this.selectedItem = null;
            this.updated = true;
            this.refresh();
        });
    }

    /**
     * キャラクター一覧ダイアログ表示.
     */
    openCharacterListDialog(): void {
        const dialogRef = this.dialog.open(CharacterListDialogComponent, CharacterListDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.editCharacter = this.editCharacter;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.editCharacter = this.charManager.getClone(result);
            this.selectedItem = null;
            this.selectedSkill = null;
            this.updated = false;
            this.refresh();
            this.saveSettings();
        });
    }

    /**
     * データ管理ダイアログ表示.
     */
    openDataManagementDialog(): void {
        const dialogRef = this.dialog.open(DataManagementDialogComponent, DataManagementDialogComponent.DEFAULT_OPTIONS);
        dialogRef.afterClosed().subscribe(result => {
        });
    }

    /**
     * 装備アイテム編集.
     */
    openEditItemDialog(item?: g2.IInventory, event?: MouseEvent): void {
        if (event) { event.srcElement.attributes['dblclicked'] = 2; }
        if (item) {
            this.selectedItem = item;
            this.selectedSkill = null;
        }
        if (!this.selectedItem || this.selectedItem.static) { return; }

        const dialogRef = this.dialog.open(EditItemDialogComponent, EditItemDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.item = this.selectedItem;

        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            const index: number = _.findIndex(this.editCharacter.equipments, item => {
                if (!isSameText(item.n, this.selectedItem.name)) { return false; }
                if (this.manager.getTitle(item.t) !== this.manager.getTitle(this.selectedItem.title)) { return false; }
                if (!isSameText(item.r, this.selectedItem.rareTitle)) { return false; }
                if (!isSameText(item.j, this.selectedItem.jewel)) { return false; }
                return true;
            });
            this.editCharacter.equipments[index] = this.itemUtil.getSavedItem(result);
            this.selectedItem = null;
            this.selectedSkill = null;
            this.updated = true;
            this.refresh();
        });
    }


    /**
     * キャラクター構成要素編集ダイアログ表示.
     */
    openEditPartsDialog(): void {
        const parts = ['npc', 'gender', 'species', 'homunculus', 'job', 'subJob', 'personality', 'personality2', 'level'];
        const copyParts = (from: g2.ICharacter, to: g2.ICharacter) => {
            _.forEach(parts, part => to[part] = from[part]);
        };

        const dialogRef = this.dialog.open(EditPartsDialogComponent, EditPartsDialogComponent.DEFAULT_OPTIONS);
        copyParts(this.editCharacter, dialogRef.componentInstance.edit);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                copyParts(dialogRef.componentInstance.edit, this.editCharacter);
                this.updated = true;
                this.selectedItem = null;
                this.selectedSkill = null;
                this.refresh();
            }
        });
    }

    /**
     * アイテム一覧ダイアログ表示.
     */
    openItemListDialog(): void {
        const dialogRef = this.dialog.open(ItemListDialogComponent, ItemListDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.items = this.attachedItems;
        dialogRef.componentInstance.itemRatios = this.editCharacter.itemRatio;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
        });
    }

    /**
     * アイテム検索ダイアログ表示.
     */
    openSearchItemDialog(): void {
        const filterDialogRef = this.dialog.open(ItemFilterDialogComponent, ItemFilterDialogComponent.DEFAULT_OPTIONS);
        filterDialogRef.componentInstance.filter = this.filter;
        filterDialogRef.afterClosed().subscribe(filterResult => {
            if (!filterResult) { return; }

            const dialogRef = this.dialog.open(SearchItemDialogComponent, SearchItemDialogComponent.DEFAULT_OPTIONS);
            dialogRef.componentInstance.filter = filterResult;
            dialogRef.afterClosed().subscribe(result => {
                this.filter = dialogRef.componentInstance.filter;
                this.manager.localStorage.set(this.LSKEY_FILTER, this.filter);
                if (!result) { return; }
                this.unionEquipmentItems(result);
                this.selectedItem = null;
                this.selectedSkill = null;
                this.updated = true;
                this.refresh();
            });
        });
    }

    /**
     * 情報更新.
     */
    refresh(): void {
        // キャラクター再計算
        this.charManager.recalc(this.editCharacter);
        // 装備品倍率を配列に変換
        this.equipmentRatios = _.chain(this.editCharacter.itemRatio.equipmentRatio).keys().map(key => {
            return { key: key, value: this.editCharacter.itemRatio.equipmentRatio[key] };
        }).value();
        // 所持スキルを配列に変換
        this.attachedSkills = _.chain(this.editCharacter.skills).toArray().sortBy(skill => skill.seq).value();
        // 装備アイテムリストを取得
        this.attachedItems = _.map(this.charManager.getAllItems(this.editCharacter), item => this.itemUtil.applyRatio(item, this.editCharacter.itemRatio));
        this.attachedItemParams = {};
        _.forEach(this.attachedItems, item => {
            _.forEach(PARAMETER_KEYS.BATTLE, key => {
                if (!item[key]) { return; }
                if (!this.attachedItemParams[key]) { this.attachedItemParams[key] = 0; }
                this.attachedItemParams[key] += item[key];
            });
        });
        this.beingUsedItems = {};
        _.forEach(this.attachedItems, item => {
            const itemName: string = item.displayName.replace(/\[.+\]]/, '');
            const attachedCharacters: string[] = this.charManager.getItemAttachedCharacters(item, this.editCharacter.id);
            if (attachedCharacters.length) {
                this.beingUsedItems[itemName] = attachedCharacters;
            }
        });
    }

    /**
     * キャラクター削除.
     */
    remove(): void {
        if (!confirm(`編集中キャラクターを削除します。よろしいですか？`)) { return; }
        if (this.charManager.remove(this.editCharacter)) {
            this.charManager.save();
            this.editCharacter = this.charManager.create();
            this.refresh();
            this.updated = false;
        }
    }

    /**
     * 装備アイテムを外す.
     */
    removeSelectedItem(): void {
        const newEquipmentList: g2.ISavedItem[] = _.chain(this.attachedItems)
            .filter(item => (!item.static && item !== this.selectedItem))
            .map(item => this.itemUtil.getSavedItem(item))
            .value();
        if (newEquipmentList.length === this.editCharacter.equipments.length) { return; }
        this.editCharacter.equipments = newEquipmentList;
        this.updated = true;
        this.selectedItem = null;
        this.selectedSkill = null;
        this.refresh();
    }

    /**
     * 編集中キャラクター情報保存.
     */
    save(): void {
        if (this.editCharacter.id) {
            this.charManager.mod(this.editCharacter);
        } else {
            this.editCharacter = this.charManager.add(this.editCharacter);
        }
        this.charManager.save();
        this.updated = false;
        this.saveSettings();
    }

    /**
     * 環境設定保存.
     */
    saveSettings(): void {
        this.settings.editId = this.editCharacter.id;
        this.manager.localStorage.set(this.LSKEY_SETTINGS, this.settings);
    }

    /**
     * 装備アイテム選択.
     * @param item アイテム情報
     */
    selectEquipmentItem(item: g2.IInventory, event: MouseEvent): void {
        const self = this;
        setTimeout(() => {
            var dblclicked = parseInt(event.srcElement.attributes['dblclicked'], 10);
            if (dblclicked > 0) {
                event.srcElement.attributes['dblclicked'] -= 1;
            } else {
                self.selectedItem = (self.selectedItem === item) ? null : item;
                self.selectedSkill = null;
            }
        }, 300);
    }

    /**
     * スキル選択.
     * @param skill スキル情報
     */
    selectSkill(skill: g2.IAttachedSkill): void {
        this.selectedItem = null;
        this.selectedSkill = (this.selectedSkill === skill) ? null : skill;
    }

    /**
     * 装備アイテムリスト結合.
     * @param items アイテム情報リスト
     */
    unionEquipmentItems(items: g2.ISavedItem[]): void {

        this.editCharacter.equipments = _.chain(items)
            .map((item): g2.ISavedItem => {
                return { n: item.n, r: item.r, t: item.t, j: item.j };
            })
            .union(this.editCharacter.equipments)
            .value();
    }

}
/**
 * 環境設定インタフェース.
 */
interface ICharacterComponentSettings {
    /**
     * 編集中キャラクターID.
     */
    editId?: number;
}