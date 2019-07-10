import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import * as g2 from '../models';
import { PARAMETER_KEYS } from '../common/const';
import { ManagerService } from './manager.service';
import { ItemUtilityService } from './item-utility.service';
import { CharacterUtilityService } from './character-utility.service';


/**
 * キャラクターユーティリティサービス.
 */
@Injectable()
export class CharacterManagerService {

    /**
     * ローカルストレージキー値 : キャラクター情報.
     */
    readonly LSKEY_CHARACTERS: string = 'data.characters';
    readonly CHARACTER_KEYS: string[][] = [
        ['eq', 'equipments'],
        ['gd', 'gender'],
        ['hm', 'homunculus'],
        ['id', 'id'],
        ['jb', 'job'],
        ['lv', 'level'],
        ['nm', 'name'],
        ['np', 'npc'],
        ['o', 'order'],
        ['p1', 'personality'],
        ['p2', 'personality2'],
        ['sj', 'subJob'],
        ['sp', 'species'],
    ];

    /**
     * キャラクター情報リスト.
     */
    characters: g2.ICharacter[];

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティサービス.
     */
    constructor(public utility: CharacterUtilityService, private manager: ManagerService, private itemUtil: ItemUtilityService) {
        // キャラクター情報初期化
        if (!this.manager.localStorage.get(this.LSKEY_CHARACTERS)) {
            this.manager.localStorage.set(this.LSKEY_CHARACTERS, []);
        }
        this.refresh();
    }

    /**
     * キャラクター情報追加.
     * @param character キャラクター情報
     */
    add(character: g2.ICharacter, save?: boolean): g2.ICharacter {
        if (character.id) { return; }
        const max: g2.ICharacter = (this.characters.length) ? _.max(this.characters, chara => chara.id) : null;
        character.id = (max) ? (max.id + 1) : 1;
        this.characters.push(character);
        if (save) { this.save(); }
        return character;
    }


    /**
     * キャラクター新規作成.
     * @param name
     */
    create(name?: string): g2.ICharacter {
        return this.utility.create(name);
    }

    /**
     * エクスポート.
     */
    export(): g2.ISavedCharacter[] {
        return _.chain(this.characters)
            .sortBy(character => character.order)
            .forEach((character, index) => { character.order = index + 1 })
            .map(character => {
                const result: g2.ISavedCharacter = { nm: character.name };
                _.forEach(this.CHARACTER_KEYS, keys => {
                    if (character[keys[1]]) { result[keys[0]] = character[keys[1]]; }
                });
                return result;
            })
            .value();
    }

    /**
     * 全アイテム情報リスト取得.
     * @param character キャラクター情報.
     */
    getAllItems(character: g2.ICharacter): g2.IItem[] {
        return this.utility.getAllItems(character);
    }

    /**
     * ビルド構成情報取得.
     */
    getBuildPartsInfo(character: g2.ICharacter): string {
        const results: string[] = [
            character.npc,
            (character.species) ? this.manager.species[character.species].displayName : null,
            character.homunculus,
            character.gender,
            (!character.job) ? character.subJob : (character.subJob) ? `${character.job}(${character.subJob})` : character.job,
            character.personality,
            character.personality2
        ];
        let result = '';
        _.forEach(results, value => {
            if (value) { result += `${value}／`; }
        });
        return (result) ? result.replace(/／+$/, '') : '未構成';
    }

    /**
     * クローン取得.
     * @param character キャラクター情報
     */
    getClone(character: g2.ICharacter): g2.ICharacter {
        const result: g2.ICharacter = {};
        _.chain(character)
            .allKeys()
            .forEach(key => {
                if (!character.hasOwnProperty(key)) { return; }
                result[key] = (Array.isArray(character[key])) ? _.clone(character[key]) : character[key];
            });
        return this.utility.recalc(result);
    }

    /**
     * 指定アイテムを装備しているキャラクターリスト取得.
     * @param item
     */
    getItemAttachedCharacters(item: g2.IItem, ignoreId?: number): string[] {
        const result: string[] = [];
        // 通常アイテムは対象外
        if (!item.rareTitle) { return result; }
        _.forEach(this.characters, character => {
            if (ignoreId && (ignoreId === character.id)) { return false; }
            const findItem = _.find(character.equipments, equip => {
                if (equip.n !== item.name) { return false; }
                if (equip.r !== item.rareTitle) { return false; }
                if (equip.t !== item.title) {
                    if (!equip.t && item.title !== '(称号無し)') { return false; }
                }
                return true;
            });
            if (findItem) { result.push(character.name); }
        });
        return result;
    }

    /**
     * インポート.
     * @param items 保存キャラクター情報リスト
     */
    import(items: any[]): void {
        // TODO : データ妥当性検査
        this.manager.localStorage.set(this.LSKEY_CHARACTERS, items);
        this.refresh();
    }

    /**
     * キャラクター情報更新.
     * @param character キャラクター情報
     */
    mod(character: g2.ICharacter, save?: boolean): boolean {
        if (!character.id) { return false; }
        const index = _.findIndex(this.characters, chara => chara.id === character.id);
        if (index < 0) { return false; }
        this.characters[index] = this.getClone(character);
        if (save) { this.save(); }
        return true;
    }

    /**
     * キャラクター情報再計算.
     * @param character キャラクター情報
     */
    recalc(character: g2.ICharacter, allSkill: boolean = false): g2.ICharacter {
        return this.utility.recalc(character, allSkill);
    }

    /**
     * ソート順変更
     * @param character キャラクター情報
     * @param value 変更値
     */
    recalcOrder(target: g2.ICharacter, value: number, save?: boolean): void {
        let newIndex: number = _.findIndex(this.characters, character => character.id === target.id) + value;
        if (newIndex < 0) { newIndex = 0; }
        if (newIndex >= this.characters.length) { newIndex = this.characters.length; }
        this.characters = _.reject(this.characters, character => character.id === target.id);
        this.characters.splice(newIndex, 0, target);
        _.forEach(this.characters, (character, index) => character.order = index + 1);
        if (save) { this.save(); }
    }


    /**
     * 最新化.
     */
    refresh(): void {
        const savedCharacters: g2.ISavedCharacter[] = this.manager.localStorage.get(this.LSKEY_CHARACTERS);
        this.characters = _.chain(savedCharacters)
            .map((savedCharacter): g2.ICharacter => {
                const result: g2.ICharacter = {};
                _.forEach(this.CHARACTER_KEYS, keys => {
                    if (savedCharacter[keys[0]]) { result[keys[1]] = savedCharacter[keys[0]]; }
                });
                return result;
            })
            .value();
    }

    /**
     * キャラクター情報削除.
     * @param character キャラクター情報
     */
    remove(character: g2.ICharacter, save?: boolean): boolean {
        if (!character.id) { return false; }
        const index = _.findIndex(this.characters, chara => chara.id === character.id);
        if (index < 0) { return false; }
        this.characters = _.reject(this.characters, val => val.id === character.id);
        if (save) { this.save(); }
        return true;
    }

    /**
     * キャラクター情報リスト保存.
     */
    save(): void {
        this.manager.localStorage.set(this.LSKEY_CHARACTERS, this.export());
    }
}

