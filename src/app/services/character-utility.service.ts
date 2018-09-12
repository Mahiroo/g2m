import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import * as g2 from '../models';
import { PARAMETER_KEYS } from '../common/const';
import { ManagerService } from './manager.service';
import { ItemUtilityService } from './item-utility.service';

@Injectable()
export class CharacterUtilityService {

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティサービス.
     */
    constructor(private manager: ManagerService, private itemUtil: ItemUtilityService) { }

    /**
     * スキル情報集約.
     * @param character キャラクター情報
     */
    collectSkills(character: g2.ICharacter): g2.ICharacter {

        const collected: _.Dictionary<g2.IAttachedSkill> = {};
        const mergeSkills = (skills: string[], stat?: boolean) => {
            _.forEach(skills, skill => {
                if (!this.manager.skills[skill]) { console.warn(`skill [${skill}] is not exists.`); return; }
                if (!collected[skill]) {
                    collected[skill] = _.clone(this.manager.skills[skill]);
                    collected[skill].count = 0;
                }
                if (stat) { collected[skill].static = true; }
                collected[skill].count += 1;
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
        result.detailParameters = { base: {}, level: {}, equipment: {}, skill: {} };
        result.equipments = [];
        return this.recalc(result);
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
        character.detailParameters = { base: {}, level: {}, equipment: {}, skill: {} };
        // 種族/職業or副職が未設定の場合は終了
        if (!character.species || (!character.job && !character.subJob)) { return; }

        // レベル倍率の算出
        let levelRatio = (character.level > 100) ? 100 : character.level;
        if (character.level > 30) { levelRatio += 0.5 * ((character.level > 100) ? 70 : (character.level - 30)); }
        if (character.level > 60) { levelRatio += 0.75 * ((character.level > 100) ? 40 : (character.level - 60)); }
        if (character.species.indexOf('人間') < 0) {
            // 人間以外
            if (character.level > 80) { levelRatio += 2.25 * (character.level - 80); }
            if (character.level > 100) { levelRatio += 2.25 * (character.level - 100); }
        } else {
            // 人間
            if (character.level > 100) { levelRatio += 1.125 * (character.level - 100); }
            if (character.level > 150) { levelRatio += 0.5625 * (character.level - 150); }
            if (character.level > 180) { levelRatio += 0.845 * (character.level - 180); }
        }

        // 職業倍率の取得
        let job: g2.IJob = this.manager.jobs[character.job || character.subJob];
        if (job && job.lower) { job = this.manager.jobs[job.lower]; }
        const jobRate: IJobRate = (job) ? jobRates[job.name] : null;

        // 基本値とレベル比例値の算出
        _.forEach(PARAMETER_KEYS.BATTLE, key => this.getBattleParam(character, key, levelRatio, jobRate));

        // 才能スキル抽出
        const aptitudes: _.Dictionary<{ aptitude?: boolean, lackOfTalent?: boolean }> = {};
        _.chain(character.skills)
            .filter(skill => !!(skill.aptitude))
            .forEach((skill: g2.Skills.IAptitude) => {
                if (!aptitudes[skill.aptitude.key]) { aptitudes[skill.aptitude.key] = {}; }
                if (skill.aptitude.lackOfTalent) {
                    aptitudes[skill.aptitude.key].lackOfTalent = true;
                } else {
                    aptitudes[skill.aptitude.key].aptitude = true;
                }
            });

        // 補正前能力値算出
        _.forEach(PARAMETER_KEYS.BATTLE, key => {

            // 才能補正
            let aptitude: number = 1;
            if (aptitudes[key]) {
                // TODO : cnt の倍率
                if (aptitudes[key].aptitude !== aptitudes[key].lackOfTalent) { aptitude = (aptitudes[key].aptitude) ? 1.5 : 0.5; }
            }
            character[key] = (character.detailParameters.base[key] + character.detailParameters.level[key]) * aptitude;

            // 最大HPの基本値加算
            if (key === 'mhp') { character[key] = Math.round(10.5 + character[key]); }
            // 罠解除能力の基本値加算
            if (key === 'trp') { character[key] += 50; }
        });

        // TODO : 変換スキル補正
        const convertSkills: g2.Skills.IConvertParam[] = _.filter(character.skills, (skill: g2.Skills.IConvertParam) => !!(skill.convertParam));
        _.forEach(convertSkills, skill => {
            _.forEach(skill.convertParam, detail => {
                character[detail.toKey] += Math.floor(character[detail.fromKey]) * detail.rate;
            })
        });

        // 格闘補正
        character.grapple = !(_.find(this.getAllItems(character), item => !!(item.atk)));
        if (character.grapple) {
            character.hit *= 1.6;
        }

        return character;
    }
    /**
     *
     * @param character
     * @param key
     * @param levelRatio
     * @param jobRate
     */
    getBattleParam(character: g2.ICharacter, key: string, levelRatio: number, jobRate: IJobRate) {

        // 基本値とレベル比例値の算出
        switch (key) {
            case 'mhp':
                character.detailParameters.base[key] = character.vit;
                character.detailParameters.level[key] = (character.vit * levelRatio * jobRate[key] * character.growthRatio);
                break;

            case 'atk':
                character.detailParameters.base[key] = character.str;
                character.detailParameters.level[key] = (character.str * levelRatio * jobRate[key] * character.growthRatio);
                break;

            case 'hit':
                character.detailParameters.base[key] = 50 + (character.str + character.agi) / 2;
                character.detailParameters.level[key] = (character.str * levelRatio * jobRate[key] * character.growthRatio) / 2
                character.detailParameters.level[key] += (character.agi * levelRatio * jobRate[key] * character.growthRatio) / 2;
                break;

            case 'crt':
                character.detailParameters.base[key] = 0;
                character.detailParameters.level[key] = 0;
                if (character.agi > 15) {
                    character.detailParameters.base[key] += (character.agi - 15);
                    character.detailParameters.level[key] += (character.agi - 15) * levelRatio * jobRate[key] * character.growthRatio;
                }
                if (character.luc > 15) {
                    character.detailParameters.base[key] += (character.luc - 15) * 2;
                    character.detailParameters.level[key] += (character.luc - 15) * 2 * levelRatio * jobRate[key] * character.growthRatio;
                }
                if (character.detailParameters.base[key] == 0) { character.detailParameters.base[key] = 1; };
                character.detailParameters.level[key] = Math.floor(character.detailParameters.level[key]);
                break;

            case 'def':
                character.detailParameters.base[key] = character.vit;
                character.detailParameters.level[key] = (character.vit * levelRatio * jobRate[key] * character.growthRatio);
                break;

            case 'eva':
                character.detailParameters.base[key] = (character.agi + character.luc) / 2;
                character.detailParameters.level[key] = (character.agi * levelRatio * jobRate[key] * character.growthRatio) / 2;
                character.detailParameters.level[key] += (character.luc * levelRatio * jobRate[key] * character.growthRatio) / 2;
                break;

            case 'mat':
                character.detailParameters.base[key] = character.int;
                character.detailParameters.level[key] = (character.int * levelRatio * jobRate[key] * character.growthRatio);
                break;

            case 'mdf':
            case 'rcv':
                character.detailParameters.base[key] = character.men;
                character.detailParameters.level[key] = (character.men * levelRatio * jobRate[key] * character.growthRatio);
                break;

            case 'trp':
                character.detailParameters.base[key] = character.agi + character.luc;
                character.detailParameters.level[key] = (character.agi * levelRatio * jobRate[key] * character.growthRatio);
                character.detailParameters.level[key] += (character.luc * levelRatio * jobRate[key] * character.growthRatio);
                character.detailParameters.level[key] += 2000 * jobRate[key];
                break
        }
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
        // character.growthRatio *= 100;
        // character.growthRatio = Math.round(character.growthRatio);
        // character.growthRatio /= 100;
    }



}
/**
 * 職業倍率インタフェース.
 */
interface IJobRate extends g2.IParameters {
}
/**
 * 職業倍率定義.
 */
const jobRates: _.Dictionary<IJobRate> = {
    "戦士": { mhp: 1.20, atk: 0.10, hit: 0.15, cnt: 1.00, crt: 0, def: 0.14, eva: 0.04, mat: 0.06, rcv: 0.17, mdf: 0.08, trp: 0.005 },
    "剣士": { mhp: 1.00, atk: 0.11, hit: 0.25, cnt: 1.00, crt: 0, def: 0.12, eva: 0.08, mat: 0.06, rcv: 0.15, mdf: 0.04, trp: 0.005 },
    "盗賊": { mhp: 0.75, atk: 0.08, hit: 0.20, cnt: 1.00, crt: 0.012, def: 0.06, eva: 0.12, mat: 0.06, rcv: 0.15, mdf: 0.04, trp: 0.050 },
    "僧侶": { mhp: 0.65, atk: 0.07, hit: 0.05, cnt: 1.00, crt: 0, def: 0.08, eva: 0.04, mat: 0.09, rcv: 0.40, mdf: 0.12, trp: 0.005 },
    "魔法使い": { mhp: 0.60, atk: 0.03, hit: 0.10, cnt: 1.00, crt: 0, def: 0.02, eva: 0.08, mat: 0.15, rcv: 0.17, mdf: 0.08, trp: 0.005 },
    "狩人": { mhp: 0.90, atk: 0.10, hit: 0.10, cnt: 1.00, crt: 0.016, def: 0.08, eva: 0.08, mat: 0.08, rcv: 0.15, mdf: 0.04, trp: 0.015 },
    "修道者": { mhp: 0.85, atk: 0.08, hit: 0.10, cnt: 1.00, crt: 0, def: 0.10, eva: 0.08, mat: 0.10, rcv: 0.20, mdf: 0.08, trp: 0.005 },
    "侍": { mhp: 0.90, atk: 0.20, hit: 0.15, cnt: 1.00, crt: 0, def: 0.08, eva: 0.06, mat: 0.07, rcv: 0.16, mdf: 0.04, trp: 0.005 },
    "剣聖": { mhp: 1.00, atk: 0.09, hit: 0.28, cnt: 1.00, crt: 0, def: 0.12, eva: 0.10, mat: 0.07, rcv: 0.15, mdf: 0.04, trp: 0.005 },
    "秘法剣士": { mhp: 1.00, atk: 0.10, hit: 0.19, cnt: 1.00, crt: 0, def: 0.12, eva: 0.08, mat: 0.12, rcv: 0.25, mdf: 0.08, trp: 0.005 },
    "賢者": { mhp: 0.85, atk: 0.08, hit: 0.13, cnt: 1.00, crt: 0, def: 0.10, eva: 0.06, mat: 0.14, rcv: 0.30, mdf: 0.12, trp: 0.030 },
    "忍者": { mhp: 0.80, atk: 0.10, hit: 0.22, cnt: 1.00, crt: 0.02, def: 0.10, eva: 0.14, mat: 0.09, rcv: 0.15, mdf: 0.08, trp: 0.030 },
    "君主": { mhp: 1.10, atk: 0.10, hit: 0.15, cnt: 1.00, crt: 0, def: 0.16, eva: 0.04, mat: 0.05, rcv: 0.25, mdf: 0.08, trp: 0.005 },
    "ロイヤルライン": { mhp: 0.85, atk: 0.08, hit: 0.10, cnt: 1.00, crt: 0, def: 0.10, eva: 0.08, mat: 0.10, rcv: 0.20, mdf: 0.08, trp: 0.005 },
};

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
