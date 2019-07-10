import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import * as Const from '../common/const';
import * as g2 from '../models';
import { ManagerService } from './manager.service';

@Injectable()
export class ItemUtilityService {

    /**
     * フィルタ初期値.
     */
    static readonly INITIAL_FILTER: IFilter = {
        acquisition: Const.AcquisitionFlg.all,
        allTitles: false,
        inheritance: Const.TitleInheritanceFlg.All,
        showNormalItem: true,
        showRareTitledItem: true,
        titleLimit: Const.TitleLimitFlg.maxOnly,
    }
    /**
     * ローカルストレージキー値 : 所有アイテム情報.
     */
    readonly LSKEY_INVENTORIES: string = 'data.inventories';
    /**
     * アイテム価格最大値.
     */
    readonly PRICE_MAX = 99999999;

    /**
     * 所有アイテム情報リスト.
     */
    inventories: g2.IInventory[];

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     */
    constructor(private manager: ManagerService) {

        // 所有アイテム情報初期化
        if (!this.manager.localStorage.get(this.LSKEY_INVENTORIES)) {
            const updateDate = new Date().getTime();
            const initialItems: g2.ISavedItem[] = _.chain(this.manager.items)
                .map((item): g2.ISavedItem => (this.manager.getCategory(item.category).havableTitle) ? { n: item.name, d: updateDate } : { n: item.name })
                .value();
            this.manager.localStorage.set(this.LSKEY_INVENTORIES, initialItems);
        }

        this.refresh();
    }

    /**
     * 所有アイテム追加.
     * @param item アイテム情報
     */
    addInventory(item: g2.IItem): g2.IInventory {
        const regist: g2.IInventory = this.getClone(item);
        regist.updateDate = new Date();
        this.inventories.push(regist);
        this.save();
        return this.getClone(regist);
    }

    /**
     * 所有アイテム掘り出し.
     */
    acquireInventory(item: g2.IInventory, save?: boolean): g2.IInventory {
        if (!item.isAcquisition) { return item; }
        const index = _.findIndex(this.inventories, inventory => (inventory.updateDate === item.updateDate && inventory.displayName === item.displayName));
        if (index < 0) { return; }
        this.inventories[index].updateDate = new Date();
        this.inventories[index].isAcquisition = false;
        if (save) { this.save(); }
        return this.getClone(this.inventories[index]);
    }

    /**
     * 装備アイテム倍率適用.
     */
    applyRatio(item: g2.IItem, ratio: g2.IItemRatio): g2.IItem {
        const result = this.getClone(item);

        // 基本値の退避
        result.baseParams = {};
        _.forEach(Const.ItemFieldKeys.Battle, key => {
            if (result[key]) { result.baseParams[key] = result[key]; }
        });

        // 装備倍率の適用
        _.chain(ratio.equipmentRatio)
            .keys()
            .filter(key => key === item.majorCategory)
            .forEach(key => {
                _.forEach(Const.ItemFieldKeys.EquipmentRatio, param => {
                    if (result[param]) {
                        result[param] = result[param] * ratio.equipmentRatio[key];
                    }
                });
            });
        // 装備アイテム能力値倍率の適用
        _.chain(ratio.itemRatios)
            .keys()
            .forEach(param => {
                if (result[param]) { result[param] *= ratio.itemRatios[param]; }
            })

        // 攻撃回数の整数化
        if (result.cnt) {
            result.cnt = Math.round(result.cnt);
        }
        return result;
    }

    /**
     * インスタンス比較.
     * @param a 比較対象のインスタンス
     * @param b 比較対象のインスタンス
     * @param key 比較する項目のキー値
     * @param revert 逆順フラグ
     */
    compare(a: g2.IItem, b: g2.IItem, key?: string, revert?: boolean): number {
        const result = (revert) ? -1 : 1;
        switch (key) {
            case 'category':
                key = null;
                break;
        }
        if (!key || a[key] === b[key]) { return (a.order < b.order) ? -result : result; }
        if (!a[key]) { return 1; }
        if (!b[key]) { return -1; }

        return (a[key] < b[key]) ? -result : result;
    }

    /**
     * エクスポート.
     */
    export(): g2.ISavedItem[] {
        return _.chain(this.inventories)
            .filter(item => !(item.dummy))
            .map(item => this.getSavedItem(item))
            .value();
    }

    /**
     * 称号付与合成情報リスト取得.
     * @param item 対象アイテム
     */
    getAddTitles(item: g2.IItem): g2.IAddTitle[] {
        if (!item.addTitle) { return null; }
        const result = _.chain(this.manager.addTitles)
            .filter(addTitle => {
                if (addTitle.materialItem === item.name) { return true; }
                if (addTitle.resultItem === item.name) { return true; }
                return false;
            })
            .value();
        return (result.length) ? result : null;
    }

    /**
     * クローン取得.
     */
    getClone(original: g2.IItem): g2.IItem {
        const result: any = {};
        _.chain(original)
            .allKeys()
            .forEach(key => {
                if (!original.hasOwnProperty(key)) { return; }
                result[key] = (Array.isArray(original[key])) ? _.clone(original[key]) : original[key];
            });
        return result;
    }

    /**
     * アイテム合成情報リスト取得.
     * @param item 対象アイテム
     */
    getComposites(item: g2.IItem): g2.IComposite[] {
        if (!item.composite) { return null; }
        return _.chain(this.manager.composites)
            .filter(composite => {
                if (composite.materialItem === item.name) { return true; }
                if (composite.otherItem === item.name) { return true; }
                if (composite.resultItem === item.name) { return true; }
                return false;
            })
            .value();
    }

    /**
     * アイテム項目キー値リスト取得.
     */
    getFieldKeys(reject?: string[]): string[] {
        return (reject) ? _.reject(Const.ItemFieldKeys.All, key => _.contains(reject, key)) : _.clone(Const.ItemFieldKeys.All);
    }

    /**
     * 称号継承情報リスト取得.
     * @param item 対象アイテム
     */
    getInheritTitles(item: g2.IItem): g2.IInheritTitle[] {
        if (!item.titleInheritance) { return null; }
        const result = _.chain(this.manager.inheritTitles)
            .filter(inheritance => {
                if (inheritance.materialItem === item.name) { return true; }
                if (inheritance.resultItem === item.name) { return true; }
                return false;
            })
            .value();
        return (result.length) ? result : null;
    }

    /**
     * 所有アイテム情報取得.
     * @param item 省略形アイテム情報
     */
    getInventoryItem(item: g2.ISavedItem): g2.IInventory {
        const result: g2.IInventory = this.getItem(item);
        if (result) {
            if (item.d) { result.updateDate = new Date(item.d); }
            if (item.a) { result.isAcquisition = true; }
            if (item.dummy) { result.dummy = true; }
            if (item.titleLimitOver) { result.titleLimitOver = true; }
            if (item.p) { result.possession = true; }
        }
        return result;
    }

    /**
     * 所有アイテムリスト取得.
     */
    getInventories(filter?: IFilter): g2.IInventory[] {
        const baseItems: g2.IInventory[] = this.inventories;
        if (!filter) { return baseItems; }

        // 名称フィルタ生成
        const regexItemName: RegExp = (filter.isRegex && filter.regexItemName) ? new RegExp(filter.regexItemName.replace(/([\[\]])/g, '\\$1'), 'gi') : null;
        const regexSkillName: RegExp = (filter.isRegex && filter.regexSkillName) ? new RegExp(filter.regexSkillName.replace(/([\[\]])/g, '\\$1'), 'gi') : null;

        return _.chain(baseItems)
            .union(_.toArray(this.manager.jobs), _.toArray(this.manager.species))
            .filter(item => {
                if (item.rareTitle) {
                    // 超レア付きフィルタ
                    if (!filter.showRareTitledItem) { return false; }
                    // 掘り出し物フラグ
                    if (item.isAcquisition) {
                        if (!(filter.acquisition & Const.AcquisitionFlg.acquisition)) { return false; }
                    } else {
                        if (!(filter.acquisition & Const.AcquisitionFlg.normal)) { return false; }
                    }
                } else {
                    // 超レアなしフィルタ
                    if (!filter.showNormalItem) { return false; }
                    // 所有状況
                    if (filter.possessionOnly && !item.possession) { return false; }
                    // 称号制限
                    if (item.dummy) {
                        if (filter.titleLimit === Const.TitleLimitFlg.maxOnly) { return false; }
                        if (filter.titleLimit === Const.TitleLimitFlg.max && item.titleLimitOver) { return false; }
                    }
                }
                // アイテム種別フィルタ
                if (filter.categories && !_.contains(filter.categories, item.majorCategory)) { return false; }
                // 称号フィルタ
                if (item.havableTitle && filter.titles && !_.contains(filter.titles, item.title)) { return false; }

                // アイテム名称フィルタ
                if (regexItemName) {
                    regexItemName.lastIndex = 0;
                    if (!regexItemName.exec(item.displayName)) { return false; }
                } else {
                    if (filter.regexItemName && item.displayName.indexOf(filter.regexItemName) < 0) { return false; }
                }
                // スキル名称フィルタ
                if (regexSkillName) {
                    const foundSkill: string = _.find(item.skills, skill => {
                        regexSkillName.lastIndex = 0;
                        return regexSkillName.exec(skill);
                    });
                    if (!foundSkill) { return false; }
                } else {
                    if (filter.regexSkillName) {
                        const foundSkill: string = _.find(item.skills, skill => skill.indexOf(filter.regexSkillName) >= 0);
                        if (!foundSkill) { return false; }
                    }
                }

                // アイテム合成フィルタ
                if (filter.composite && !(item.composite & Const.CompsiteFlg.Material)) { return false; }
                // 称号付与フィルタ
                if (filter.addTitle) {
                    if (!(item.addTitle & Const.AddTitleFlg.Result)) { return false; }
                    if (filter.upgradableOnly) {
                        const addTitle: g2.IAddTitle = _.find(this.manager.addTitles, addTitleItem => addTitleItem.resultItem === item.name);
                        if (this.manager.titles[addTitle.title].seq <= this.manager.titles[item.title].seq) { return false; }
                    }
                }
                // 称号継承フィルタ
                if (filter.inheritanceOnly) {
                    if (!(item.titleInheritance & filter.inheritance)) { return; }
                }
                return true;
            })
            .sortBy(item => item.order)
            .map(item => this.getClone(item))
            .value();
    }

    /**
     * アイテム情報取得.
     * @param equipmentName アイテム名称
     * @param titleName 称号名称
     * @param rareTitleName 超レア称号名称
     */
    getItem(item: g2.ISavedItem): g2.IItem;
    getItem(itemName: string, titleName?: string, rareTitleName?: string, jewel?: string): g2.IItem;
    getItem(item: any, titleName?: string, rareTitleName?: string, jewel?: string): g2.IItem {

        if (!_.isString(item)) { return this.getItem(item.n, item.t, item.r, item.j); }
        if (!this.manager.items[item]) { return undefined; }

        // アイテム情報取得
        const result: g2.IItem = this.getClone(this.manager.items[item]);
        // 称号情報・超レア称号情報取得
        const title: g2.ITitle = this.manager.titles[titleName] || this.manager.titles['(称号無し)'];
        if (!result.havableTitle && title.displayName) { return undefined; }
        // 超レア称号情報取得
        const rareTitle: g2.IRareTitle = this.manager.rareTitles[rareTitleName];
        // 宝石情報取得
        const jewelItem: g2.IItem = this.manager.items[jewel];

        // 表示名称の取得
        result.title = title.name;
        result.displayName = title.displayName + result.displayName;
        if (rareTitle) {
            result.rareTitle = rareTitle.name;
            result.displayName = rareTitle.name + result.displayName;
        }
        if (jewelItem) {
            result.jewel = jewelItem.name;
            result.displayName += `[${jewelItem.name}]`;
        }

        // ソートオーダー算出
        result.order = (result.seq * 10000) + title.seq;
        if (rareTitle) {
            result.order += rareTitle.seq * 100;
        }
        switch (result.category) {
            case '種族':
                result.order += 100000000;
                break;
            case '職業':
                result.order += 200000000;
                break;
        }

        // 価格計算
        if (result.price) {
            if (rareTitle) {
                result.price *= title.rarePriceRatio;
                result.price += title.rarePriceAdditional;
            } else if (title) {
                result.price *= title.priceRatio;
            }
            if (jewelItem) {
                result.price += (jewelItem.price * 0.789);
            }

            if (result.price > this.PRICE_MAX) { result.price = this.PRICE_MAX; }
        }

        // 宝石能力値加算
        if (jewelItem) {
            _.forEach(Const.ItemFieldKeys.Battle, (key: string): void => {
                if (!jewelItem[key]) { return; }
                if (!result[key]) { result[key] = 0; }
                result[key] += (key === 'mdf') ? jewelItem[key] / 4 : jewelItem[key] / 2;
            });
            _.forEach(Const.ItemFieldKeys.Base, (key: string): void => {
                if (!jewelItem[key]) { return; }
                if (!result[key]) { result[key] = 0; }
                result[key] += jewelItem[key];
            });
        }

        // 能力値の計算
        const plusRatio: number = result.ratio = title.plusRatio * ((rareTitle) ? 2 : 1);
        const minusRatio: number = title.minusRatio * ((rareTitle) ? 2 : 1);
        _.forEach(Const.ItemFieldKeys.Battle, (key: string): void => {
            if (result[key]) {
                switch (key) {
                    case 'crt':
                        break;
                    case 'cnt':
                        if (result.category.startsWith('小手')) { result[key] *= (result[key] > 0) ? plusRatio : minusRatio; }
                        break;
                    default:
                        result[key] *= (result[key] > 0) ? plusRatio : minusRatio;
                        break;
                }
            }
        });

        // スキルのマージ
        if (rareTitle) { result.skills = _.union(result.skills, rareTitle.skills); }
        return result;
    }

    /**
     * 保存用アイテム情報取得.
     * @param item 所有アイテム情報.
     */
    getSavedItem(item: g2.IInventory): g2.ISavedItem {
        const result: g2.ISavedItem = { n: item.name };
        if (item.title && this.manager.titles[item.title].displayName) { result.t = item.title; }
        if (item.rareTitle) { result.r = item.rareTitle; }
        if (item.jewel) { result.j = item.jewel; }
        if (item.updateDate) { result.d = item.updateDate.getTime(); }
        if (item.isAcquisition) { result.a = true; }
        if (item.possession) { result.p = true; }
        return result;
    }

    /**
     * インポート.
     * @param items 保存アイテム情報リスト
     */
    import(items: any[]): void {
        // TODO : データ妥当性検査
        this.manager.localStorage.set(this.LSKEY_INVENTORIES, items);
        this.refresh();
    }

    /**
     * 所有アイテム更新.
     * @param item アイテム情報
     */
    modInventory(original: g2.IInventory, mod: g2.IInventory, save?: boolean): g2.IInventory {
        const index = _.findIndex(this.inventories, item => (item.updateDate === original.updateDate && item.displayName === original.displayName));
        if (index < 0) { return null; }
        mod.updateDate = new Date();
        this.inventories[index] = this.getClone(mod);
        if (save) { this.save(); }
        return mod;
    }

    /**
     * 最新化.
     */
    refresh(): void {
        const savedItems: g2.ISavedItem[] = this.manager.localStorage.get(this.LSKEY_INVENTORIES);
        this.inventories = _.chain(savedItems)
            .map((item): g2.ISavedItem[] => {
                if (item.r || !item.d) { return [item]; }

                // 超レア称号なし/称号付与ありアイテムの全称号情報を追加
                const curTitle: g2.ITitle = this.manager.getTitle(item.t);
                return _.map(this.manager.titles, title => {
                    if (curTitle.name === title.name) { return item; }
                    if (curTitle.seq < title.seq) {
                        return { n: item.n, t: title.name, dummy: true, titleLimitOver: true };
                    } else {
                        return { n: item.n, t: title.name, dummy: true };
                    }
                });
            })
            .flatten(true)
            .map(item => this.getInventoryItem(item))
            .filter(item => !!(item))
            .value();
    }

    /**
     * 所有アイテム削除.
     * @param remove 削除アイテム情報
     */
    remove(remove: g2.IInventory, save?: boolean): void {
        this.inventories = _.reject(this.inventories, (item, index): boolean => (item.updateDate === remove.updateDate && item.displayName === remove.displayName));
        if (save) { this.save(); }
    }

    /**
     * ゲームリセット.
     */
    resetGame(save?: boolean): void {
        const now = new Date();
        _.forEach(this.inventories, item => {
            if (!item.updateDate || !item.rareTitle) { return; }
            item.isAcquisition = true;
            item.updateDate = now;
        });
        if (save) { this.save(); }
    }

    /**
     * 所有アイテム情報リスト保存.
     */
    save(): void {
        this.manager.localStorage.set(this.LSKEY_INVENTORIES, this.export());
    }

    /**
     * 所有フラグ一括変更.
     * @param possession 所有フラグ.
     */
    setPossessionAll(possession: boolean, save?: boolean): void {
        const now = new Date();
        _.forEach(this.inventories, item => {
            if (item.rareTitle || item.dummy || !item.havableTitle) { return; }
            item.possession = possession;
            item.updateDate = now;
        });
        if (save) { this.save(); }
    }

    /**
     * アイテム情報リストソート.
     * @param items アイテム情報リスト
     * @param key ソートキー
     * @param revert 降順フラグ
     */
    sort(items: g2.IItem[], key?: string, revert?: boolean): g2.IItem[] {
        return items.sort((a: g2.IItem, b: g2.IItem) => {
            return this.compare(a, b, key, revert);
        });
    }

    /**
     * 称号アップグレード.
     * @param item アイテム情報
     */
    upgradeTitle(item: g2.IItem): g2.IItem {
        const seq: number = this.manager.titles[item.title].seq;
        const upgrade: g2.ITitle = _.find(this.manager.titles, title => title.seq === seq + 1);
        if (!upgrade) { return item; }
        return this.getItem(item.name, upgrade.name, item.rareTitle);
    }
}

/**
 * アイテムリスト取得フィルタ定義インタフェース.
 */
export interface IFilter {
    /**
     * 掘り出し物表示方式.
     */
    acquisition?: Const.AcquisitionFlg;
    /**
     * 称号付与(アイテム合成)可能フラグ.
     */
    addTitle?: boolean;
    /**
     * すべての称号を表示.
     */
    allTitles?: boolean;
    /**
     * 表示アイテム種別リスト.
     */
    categories?: string[];
    /**
     * アイテム合成フラグ.
     */
    composite?: boolean;
    /**
     * 称号継承表示対象フラグ.
     */
    inheritance?: Const.TitleInheritanceFlg;
    /**
     * 称号継承のみ表示フラグ.
     */
    inheritanceOnly?: boolean;
    /**
     * 正規表現検索フラグ.
     */
    isRegex?: boolean;
    /**
     * 所有アイテムのみフラグ.
     */
    possessionOnly?: boolean;
    /**
     * アイテム名称正規表現.
     */
    regexItemName?: string;
    /**
     * スキル名称正規表現.
     */
    regexSkillName?: string;
    /**
     * 超レア称号なしアイテム表示フラグ.
     */
    showNormalItem?: boolean;
    /**
     * 超レア称号付きアイテム表示フラグ.
     */
    showRareTitledItem?: boolean;
    /**
     * 所有スキルリスト.
     */
    skills?: string[];
    /**
     * 称号表示制限フラグ.
     */
    titleLimit?: Const.TitleLimitFlg;
    /**
     * 表示称号リスト.
     */
    titles?: string[];
    /**
     * 強化可能アイテムのみフラグ.
     */
    upgradableOnly?: boolean;
}
