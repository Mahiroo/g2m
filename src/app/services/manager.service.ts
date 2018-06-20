import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LocalStorageService } from 'angular-2-local-storage';
import * as _ from 'underscore';
import { AddTitleFlg, CompsiteFlg, TitleInheritanceFlg } from '../common/const';
import * as g2 from '../models';
import * as g2Data from '../data';

@Injectable()
export class ManagerService {

    /**
     * 称号付与合成情報リスト.
     */
    addTitles: g2.IAddTitle[] = g2Data.initAddTitles();
    /**
     * アイテム種別情報リスト.
     */
    categories: _.Dictionary<g2.ICategory> = g2Data.initCategories();
    /**
     * アイテム合成情報リスト.
     */
    composites: g2.IComposite[] = g2Data.initComposites();
    /**
     * 性別情報リスト.
     */
    genders: _.Dictionary<g2.IGender> = g2Data.initGenders();
    /**
     * 称号継承情報リスト.
     */
    inheritTitles: g2.IInheritTitle[] = g2Data.initInheritTitles();
    /**
     * アイテム情報リスト.
     */
    items: _.Dictionary<g2.IItem> = g2Data.initItems();
    /**
     * 職業情報リスト.
     */
    jobs: _.Dictionary<g2.IJob> = g2Data.initJobs();
    /**
     * NPC情報リスト.
     */
    nonePlayerCharacters: _.Dictionary<g2.INonePlayerCharacter> = g2Data.initNonePlayerCharacters();
    /**
     * 超レア称号情報リスト.
     */
    rareTitles: _.Dictionary<g2.IRareTitle> = g2Data.initRareTitles();
    /**
     * スキル情報リスト.
     */
    skills: _.Dictionary<g2.ISkill> = g2Data.initSkills();
    /**
     * 種族情報リスト.
     */
    species: _.Dictionary<g2.ISpecies> = g2Data.initSpecies();
    /**
     * 称号情報リスト.
     */
    titles: _.Dictionary<g2.ITitle> = g2Data.initTitles();

    /**
     * コンストラクタ.
     */
    constructor(public localStorage: LocalStorageService) {

        // マスタデータの紐付け.
        setMixingData(this);

        // マスタデータ整合性検査
        validMasterData(this);
    }

    getCategory(subCategory: string): g2.ICategory {
        return _.find(this.categories, category => _.contains(category.subCategories, subCategory));
    }
    getTitle(title: string): g2.ITitle {
        const key = (title) ? title : '(称号無し)';
        return this.titles[key];
    }

}

/**
 * マスタデータ紐付け.
 * @param manager マネージャサービス
 */
function setMixingData(manager: ManagerService): void {

    const messages: string[] = [];

    // アイテム種別情報の紐付け
    _.forEach(manager.items, item => {
        const category: g2.ICategory = _.find(manager.categories, category => _.contains(category.subCategories, item.category));
        item.majorCategory = category.name;
        if (category.havableTitle) { item.havableTitle = true; }
    });

    // 称号継承情報の紐付け
    _.forEach(manager.inheritTitles, inheritTitle => {
        if (manager.items[inheritTitle.materialItem] && manager.items[inheritTitle.resultItem]) {
            manager.items[inheritTitle.materialItem].titleInheritance |= TitleInheritanceFlg.Material;
            manager.items[inheritTitle.resultItem].titleInheritance |= TitleInheritanceFlg.Result;
        } else {
            messages.push(`inheritTitle is invalid. material:[${inheritTitle.materialItem}] result:[${inheritTitle.resultItem}]`);
        }
    });
    // アイテム合成情報の紐付け
    _.forEach(manager.composites, composite => {
        if (manager.items[composite.materialItem] && manager.items[composite.otherItem] && manager.items[composite.resultItem]) {
            manager.items[composite.materialItem].composite |= CompsiteFlg.Material;
            manager.items[composite.otherItem].composite |= CompsiteFlg.Other;
            manager.items[composite.resultItem].composite |= CompsiteFlg.Result;
        } else {
            messages.push(`composite is invalid. material:[${composite.materialItem}] other:[${composite.otherItem}] result:[${composite.resultItem}]`);
        }
    });
    // 称号付与合成情報の紐付け
    _.forEach(manager.addTitles, addTitle => {
        if (manager.items[addTitle.materialItem] && manager.items[addTitle.resultItem]) {
            manager.items[addTitle.materialItem].addTitle |= AddTitleFlg.Material;
            manager.items[addTitle.resultItem].addTitle |= AddTitleFlg.Result;
        } else {
            messages.push(`addTitle is invalid. material:[${addTitle.materialItem}] result:[${addTitle.resultItem}]`);
        }
    });
    // 装備制限情報の紐付け
    _.forEach(g2Data.initRestricts(), values => {
        if (manager.items[values.name]) {
            manager.items[values.name].restricts = values.restricts;
        } else {
            messages.push(`restricts is invalid. item:[${values.name}]`);
        }
    });

    if (messages.length) {
        // マスタデータ不正
        _.forEach(messages, message => console.log(message));
        throw `master data is invalid!!`;
    }
}

/**
 * マスタデータ整合性検査.
 * @param manager マネージャサービス
 */
function validMasterData(manager: ManagerService): void {

    if (environment.production) { return; }

    // スキル情報の検査
    let skillInvalid: boolean = false;
    const skillExists = (item: g2.ISkillAttachable): void => {
        _.forEach(item.skills, skill => {
            if (!manager.skills[skill]) {
                skillInvalid = true;
                console.log(`item:[${item['name']}] skill:[${skill}] is not exists.`);
            }
        });
    };
    _.forEach(manager.items, item => skillExists(item));
    _.forEach(manager.jobs, item => skillExists(item));
    _.forEach(manager.species, item => skillExists(item));
    _.forEach(manager.rareTitles, item => skillExists(item));

    if (skillInvalid) {
        // マスタデータ不正
        throw `master data is invalid!!`;
    }
    console.log(manager);
}
