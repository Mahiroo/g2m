import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import * as g2 from '../models';
import { PARAMETER_KEYS } from '../common/const';
import { ManagerService } from './manager.service';
import { ItemUtilityService } from './item-utility.service';

/**
 * アイテム装備可能数.
 */
const EQUIPMENT_COUNT = {
    /**
     * 通常.
     */
    NORAML: [0, 1, 3, 6, 9, 12, 16, 20, 25, 30, 36, 42, 49, 58, 67, 77, 89, 102, 118, 134, 150, 166, 183, 200],
    /**
     * 才能あり.
     */
    CAPABLE: [0, 1, 2, 5, 7, 10, 13, 16, 20, 24, 29, 34, 40, 46, 53, 60, 67, 75, 83, 91, 99, 108, 117, 126, 135, 145, 158, 176, 200],
};

/**
 * キャラクターユーティリティサービス.
 */
@Injectable()
export class CharacterUtilityService {

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
    constructor(private manager: ManagerService, private itemUtil: ItemUtilityService) {
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
     * スキル情報集約.
     * @param character キャラクター情報
     */
    collectSkills(character: g2.ICharacter): g2.ICharacter {

        const collected: _.Dictionary<g2.IAttachedSkill> = {};
        const mergeSkills = (skills: string[], stat?: boolean) => {
            _.forEach(skills, skill => {
                if (!this.manager.skills[skill]) {
                    console.warn(`skill [${skill}] is not exists.`)
                    return;
                }

                if (!collected[skill]) {
                    collected[skill] = _.clone(this.manager.skills[skill]);
                    collected[skill].count = 0;
                }
                if (stat) {
                    collected[skill].static = true;
                    if (!collected[skill].count) { collected[skill].count = 1; }
                } else {
                    collected[skill].count += 1;
                }
            });
        };

        // 固定スキルの集約
        if (character.species) { mergeSkills(this.manager.species[character.species].skills, true); }
        if (character.job) { mergeSkills(this.manager.jobs[character.job].skills, true); }
        if (character.subJob) {
            // 副職の職業スキルは集約対象外
            _.forEach(this.manager.jobs[character.subJob].skills, skill => {
                if (this.manager.skills[skill]['isJob'] && character.job) { return; }
                mergeSkills([skill], true);
            });
        }
        if (character.homunculus) { mergeSkills(this.manager.items[character.homunculus].skills, true); }
        if (character.personality) { mergeSkills(this.manager.items[character.personality].skills, true); }
        if (character.personality2) { mergeSkills(this.manager.items[character.personality2].skills, true); }
        if (character.npc) {

            _.forEach(this.manager.nonePlayerCharacters[character.npc].equipments, item => {
                const equipment = this.itemUtil.getItem(item);
                if (equipment) { mergeSkills(equipment.skills, true); }
            });
        }

        // 装備品スキルの集約
        _.chain(character.equipments)
            .map(item => this.itemUtil.getItem(item))
            .forEach(item => mergeSkills(item.skills));

        // TODO : 無効になる職業スキルの除外

        character.skills = collected;
        return character;
    }

    /**
     * キャラクター新規作成.
     * @param name
     */
    create(name?: string): g2.ICharacter {
        const result: g2.ICharacter = {};
        result.name = (name) ? name : '新規作成';
        result.additionalParams = {};
        result.equipments = [];
        return this.recalc(result);
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
        const result: g2.IItem[] = [];
        const pushStaticItem = (item: g2.IItem) => {
            const addItem: g2.IItem = this.itemUtil.getClone(item);
            addItem.static = true;
            addItem.order = result.length - 100;
            result.push(addItem);
        };
        if (character.species) { pushStaticItem(this.manager.species[character.species]); }
        if (character.homunculus) { pushStaticItem(this.manager.items[character.homunculus]); }
        if (character.job) { pushStaticItem(this.manager.jobs[character.job]); }
        if (character.subJob) { pushStaticItem(this.manager.jobs[character.subJob]); }
        if (character.personality) { pushStaticItem(this.manager.items[character.personality]); }
        if (character.personality2) { pushStaticItem(this.manager.items[character.personality2]); }
        if (character.npc) {
            _.forEach(this.manager.nonePlayerCharacters[character.npc].equipments, item => {
                pushStaticItem(this.itemUtil.getItem(item));
            });
        }
        _.forEach(character.equipments, item => result.push(this.itemUtil.getItem(item)));
        return _.sortBy(result, item => item.order);
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
        return this.recalc(result);
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
                if (equip.t !== item.title) { return false; }
                if (equip.r !== item.rareTitle) { return false; }
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
     * キャラクター情報再計算.
     * @param character キャラクター情報
     */
    recalc(character: g2.ICharacter): g2.ICharacter {
        // スキル集約
        this.collectSkills(character);
        // 基本能力値再計算
        this.recalcBaseParams(character);
        // アイテム装備可能数再計算
        this.recalcEquipmentsCount(character);
        // 装備アイテム倍率再計算
        this.recalcItemRatio(character);
        // 成長率再計算
        this.recalcGrowthRatio(character);
        return character;
    }

    /**
     * 基本能力値再計算.
     * @param character キャラクター情報
     */
    recalcBaseParams(character: g2.ICharacter): g2.ICharacter {

        // 基本能力加算値の算出
        character.additionalParams = _.object(PARAMETER_KEYS.BASE, [0, 0, 0, 0, 0, 0]);
        const addParams = (item: g2.IParameters) => {
            _.forEach(PARAMETER_KEYS.BASE, param => {
                if (item[param]) { character.additionalParams[param] += item[param]; }
            });
        };
        if (character.homunculus) { addParams(this.manager.items[character.homunculus]); }
        if (character.personality2) { addParams(this.manager.items[character.personality2]); }
        if (character.npc) { _.forEach(this.manager.nonePlayerCharacters[character.npc].equipments, item => addParams(this.itemUtil.getItem(item))); }
        _.forEach(character.equipments, item => addParams(this.itemUtil.getItem(item)));

        // 基本能力値の算出
        _.forEach(PARAMETER_KEYS.BASE, param => character[param] = 0);
        if (character.species) {
            _.forEach(PARAMETER_KEYS.BASE, param => {
                character[param] = this.manager.species[character.species][param] + 10;
                character[param] += (character.additionalParams[param] > 10) ? 10 : character.additionalParams[param];
            });
        }
        return character;
    }

    /**
     * アイテム装備可能数再計算.
     * @param character キャラクター情報
     */
    recalcEquipmentsCount(character: g2.ICharacter): g2.ICharacter {

        // アイテム装備数スキルの抽出
        let master = EQUIPMENT_COUNT.NORAML;
        let addition = 0;
        let isHalf = false;
        _.chain(character.skills)
            .filter(skill => !!(skill.isEquipmentCount))
            .forEach(skill => {
                if (skill.isEquipmentCount.capable) { master = EQUIPMENT_COUNT.CAPABLE; }
                if (skill.isEquipmentCount.half) { isHalf = true; }
                addition += (skill.isEquipmentCount.addition) ? skill.isEquipmentCount.addition : 0;
            });

        // 算出レベルの取得
        let level = character.level;
        if (!level) {
            // キャラクターに未設定の場合、種族/NPCの最大レベルを使用
            level = (character.species) ? this.manager.species[character.species].maxLevel : 0;
            if (character.npc) { level = this.manager.nonePlayerCharacters[character.npc].maxLevel; }
        }
        character.equipmentCount = _.findLastIndex(master, value => (value <= level));
        if (isHalf) { character.equipmentCount = Math.round(character.equipmentCount / 2); }
        character.equipmentCount += addition;
        character.level = level;
        return character;
    }

    /**
     * 装備品倍率再計算.
     * @param character キャラクター情報.
     */
    recalcItemRatio(character: g2.ICharacter): void {
        const equipmentRatio: _.Dictionary<number> = {};
        const itemRatios: _.Dictionary<number> = {};
        character.itemRatio = { equipmentRatio: equipmentRatio, itemRatios: itemRatios };
        // 装備倍率の集約
        _.chain(character.skills)
            .filter((skill: g2.Skills.IEquipmentRatio) => !!skill.equipmentRatios)
            .map((skill: g2.Skills.IEquipmentRatio) => skill.equipmentRatios)
            .flatten()
            .sortBy((ratio: g2.Skills.IEquipmentRatioDetail) => {
                return this.manager.categories[ratio.group].seq;
            })
            .forEach((ratio: g2.Skills.IEquipmentRatioDetail) => {
                if (!equipmentRatio[ratio.group]) { equipmentRatio[ratio.group] = 1; }
                if (ratio.level) {
                    equipmentRatio[ratio.group] *= ((character.level + 100) * ratio.ratio) / 100;
                } else {
                    equipmentRatio[ratio.group] *= ratio.ratio;
                }
            });
        // 装備アイテム能力値倍率の集約
        _.chain(character.skills)
            .filter((skill: g2.Skills.IItemRatio) => !!skill.itemRatios)
            .map((skill: g2.Skills.IItemRatio) => skill.itemRatios)
            .flatten()
            .forEach((ratio: g2.Skills.IItemRatioDetail) => {
                if (!itemRatios[ratio.param]) { itemRatios[ratio.param] = 1; }
                itemRatios[ratio.param] *= ratio.ratio;
            });
    }

    /**
     * 成長率再計算.
     * @param character キャラクター情報.
     */
    recalcGrowthRatio(character: g2.ICharacter): void {
        character.growthRatio = 1;
        _.forEach(character.skills, (skill: g2.Skills.IGrowthRatio) => {
            if (skill.growthRatio) { character.growthRatio *= skill.growthRatio; }
        });
        character.growthRatio *= 100;
        character.growthRatio = Math.round(character.growthRatio);
        character.growthRatio /= 100;
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
