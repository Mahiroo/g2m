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
        result.detailParameters = { base: {}, equipment: {}, skill: {} };
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
        // 戦闘能力値再計算
        this.recalcBattleParams(character);
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
     * 戦闘能力値再計算.
     * @param character キャラクター情報
     */
    recalcBattleParams(character: g2.ICharacter): g2.ICharacter {
        character.detailParameters = { base: {}, equipment: {}, skill: {} };
        // 種族/職業or副職が未設定の場合は終了
        if (!character.species || (!character.job && !character.subJob)) { return; }
        // 職業倍率の取得
        const jobRate: IJobRate = getJobRate(this.manager, character.job || character.subJob);
        // 格闘フラグの設定
        character.grapple = !!(_.find(this.getAllItems(character), item => !!(item.atk)));

        character.mhp = character.detailParameters.base.mhp = getBattleParam(character, '最大HP', jobRate);
        character.atk = character.detailParameters.base.atk = getBattleParam(character, '攻撃力', jobRate);
        character.hit = character.detailParameters.base.hit = getBattleParam(character, '命中精度', jobRate);
        character.crt = character.detailParameters.base.crt = getBattleParam(character, '必殺率', jobRate);
        character.cnt = character.detailParameters.base.cnt = getBattleParam(character, '攻撃回数', jobRate);
        character.def = character.detailParameters.base.def = getBattleParam(character, '防御力', jobRate);
        character.eva = character.detailParameters.base.eva = getBattleParam(character, '回避能力', jobRate);
        character.mat = character.detailParameters.base.mat = getBattleParam(character, '魔法攻撃力', jobRate);
        character.mdf = character.detailParameters.base.mdf = getBattleParam(character, '魔法防御力', jobRate);
        character.rcv = character.detailParameters.base.rcv = getBattleParam(character, '魔法回復量', jobRate);
        character.trp = character.detailParameters.base.trp = getBattleParam(character, '罠解除能力', jobRate);
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

/**
 * 戦闘能力値取得.
 * @param character キャラクター情報
 * @param paramName パラメータ名
 * @param jobRate 職業倍率
 */
function getBattleParam(character: g2.ICharacter, paramName: string, jobRate: IJobRate): number {

    // レベル倍率の算出
    let levelRatio = character.level;
    if (character.level > 30) { levelRatio += ((character.level - 30) * 0.5); }
    if (character.level > 60) { levelRatio += ((character.level - 60) * 0.75); }
    if (character.level > 100) { levelRatio += ((character.level - 100) * 2.25); }

    let result: number = 0;
    switch (paramName) {
        case '最大HP':
            result = 11 + character.vit + character.vit * levelRatio * jobRate.mhp;
            break;
        case '攻撃力':
            result = character.str + character.str * levelRatio * jobRate.atk;
            break;
        case '命中精度':
            result = 50 + (character.str + character.str * levelRatio * jobRate.hit) / 2 + (character.agi + character.agi * levelRatio * jobRate.hit) / 2;
            break;
        case '必殺率':
        case '攻撃回数':
            return 0;
        case '防御力':
            result = character.vit + character.vit * levelRatio * jobRate.def;
            break;
        case '回避能力':
            result = (character.agi + character.agi * levelRatio * jobRate.eva) / 2 + (character.luc + character.luc * levelRatio * jobRate.eva) / 2;
            break;
        case '魔法攻撃力':
            result = character.int + character.int * levelRatio * jobRate.mat;
            break;
        case '魔法回復量':
            result = character.men + character.men * levelRatio * jobRate.rcv;
            break;
        case '魔法防御力':
            result = character.men + character.men * levelRatio * jobRate.mdf / 10;
            break;
        case '罠解除能力':
            result = jobRate.trpBase + character.agi + character.luc + (character.agi * levelRatio * jobRate.trp) + (character.luc * levelRatio * jobRate.trp)
            break;
    }
    return result;
}

/**
 * 才能倍率取得.
 * @param character キャラ歌ー情報.
 * @param paramName パラメータ名
 */
function getTalentRatio(character: g2.ICharacter, paramName: string): number {
    if (paramName === '攻撃回数') {
        if (character.skills[`[才能] ${paramName}`] && character.skills[`[無能] ${paramName}`]) { return 0.8; }
        if (character.skills[`[才能] ${paramName}`]) { return 1.3; }
        if (character.skills[`[無能] ${paramName}`]) { return 0.6; }
    } else {
        if (character.skills[`[才能] ${paramName}`] && character.skills[`[無能] ${paramName}`]) { return 1; }
        if (character.skills[`[才能] ${paramName}`]) { return 1.5; }
        if (character.skills[`[無能] ${paramName}`]) { return 0.5; }
    }
    return 1;
}

function getJobRate(manager: ManagerService, jobName: string): IJobRate {
    let job: g2.IJob = manager.jobs[jobName];
    if (job && job.lower) { job = manager.jobs[job.lower]; }
    return (job) ? jobRates[job.name] : null;
}
interface IJobRate extends g2.IParameters {
    /**
     * 罠解除能力基本値.
     */
    trpBase?: number;
}
const jobRates: _.Dictionary<IJobRate> = {
    "戦士": { mhp: 1.20, atk: 0.10, hit: 0.15, cnt: 1.00, crt: 1.00, def: 0.14, eva: 0.04, mat: 0.06, rcv: 0.17, mdf: 0.08, trp: 0.005, trpBase: 60 },
    "剣士": { mhp: 1.00, atk: 0.11, hit: 0.25, cnt: 1.00, crt: 1.00, def: 0.12, eva: 0.08, mat: 0.06, rcv: 0.15, mdf: 0.04, trp: 0.005, trpBase: 60 },
    "盗賊": { mhp: 0.75, atk: 0.08, hit: 0.20, cnt: 1.00, crt: 1.00, def: 0.06, eva: 0.12, mat: 0.06, rcv: 0.15, mdf: 0.04, trp: 0.050, trpBase: 200 },
    "僧侶": { mhp: 0.65, atk: 0.07, hit: 0.05, cnt: 1.00, crt: 1.00, def: 0.08, eva: 0.04, mat: 0.09, rcv: 0.40, mdf: 0.12, trp: 0.005, trpBase: 60 },
    "魔法使い": { mhp: 0.60, atk: 0.03, hit: 0.10, cnt: 1.00, crt: 1.00, def: 0.02, eva: 0.08, mat: 0.15, rcv: 0.17, mdf: 0.08, trp: 0.005, trpBase: 60 },
    "狩人": { mhp: 0.90, atk: 0.10, hit: 0.10, cnt: 1.00, crt: 1.00, def: 0.08, eva: 0.08, mat: 0.08, rcv: 0.15, mdf: 0.04, trp: 0.015, trpBase: 60 },
    "修道": { mhp: 0.85, atk: 0.08, hit: 0.10, cnt: 1.00, crt: 1.00, def: 0.10, eva: 0.08, mat: 0.10, rcv: 0.20, mdf: 0.08, trp: 0.005, trpBase: 60 },
    "侍": { mhp: 0.90, atk: 0.20, hit: 0.15, cnt: 1.00, crt: 1.00, def: 0.08, eva: 0.06, mat: 0.07, rcv: 0.16, mdf: 0.04, trp: 0.005, trpBase: 60 },
    "剣聖": { mhp: 1.00, atk: 0.09, hit: 0.28, cnt: 1.00, crt: 1.00, def: 0.12, eva: 0.10, mat: 0.07, rcv: 0.15, mdf: 0.04, trp: 0.005, trpBase: 60 },
    "秘法": { mhp: 1.00, atk: 0.10, hit: 0.19, cnt: 1.00, crt: 1.00, def: 0.12, eva: 0.08, mat: 0.12, rcv: 0.25, mdf: 0.08, trp: 0.005, trpBase: 60 },
    "賢者": { mhp: 0.85, atk: 0.08, hit: 0.13, cnt: 1.00, crt: 1.00, def: 0.10, eva: 0.06, mat: 0.14, rcv: 0.30, mdf: 0.12, trp: 0.030, trpBase: 110 },
    "忍者": { mhp: 0.80, atk: 0.10, hit: 0.22, cnt: 1.00, crt: 1.00, def: 0.10, eva: 0.14, mat: 0.09, rcv: 0.15, mdf: 0.08, trp: 0.030, trpBase: 110 },
    "君主": { mhp: 1.10, atk: 0.10, hit: 0.15, cnt: 1.00, crt: 1.00, def: 0.16, eva: 0.04, mat: 0.05, rcv: 0.25, mdf: 0.08, trp: 0.005, trpBase: 60 },
    "ロイヤル": { mhp: 0.85, atk: 0.08, hit: 0.10, cnt: 1.00, crt: 1.00, def: 0.10, eva: 0.08, mat: 0.10, rcv: 0.20, mdf: 0.08, trp: 0.005, trpBase: 60 },
};
