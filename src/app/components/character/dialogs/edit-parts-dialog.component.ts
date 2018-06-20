import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatRadioChange, MatSelectChange } from '@angular/material';
import * as g2 from '../../../models';
import { ManagerService } from '../../../services';

@Component({
    templateUrl: './edit-parts-dialog.component.html',
    styleUrls: ['./edit-parts-dialog.component.less']
})
export class EditPartsDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        minWidth: '400px',
    };
    /**
     * 編集データ.
     */
    edit: g2.ICharacter = {};
    /**
     * 項目設定リスト.
     */
    fields: IField[];
    /**
     * NPCフラグ.
     */
    isNpc: boolean;
    /**
     * マスタ情報.
     */
    master: {
        [key: string]: g2.IBaseObject[] | any;
    };
    /**
     * レベル最大値.
     */
    maxLevel: number = 0;

    /**
     * コンストラクタ.
     * @param charUtil
     */
    constructor(public dialogRef: MatDialogRef<EditPartsDialogComponent>, private manager: ManagerService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.fields = [
            { key: 'npc', placeholder: 'NPC', hidden: () => !this.isNpc, readonly: () => false },
            { key: 'gender', placeholder: '性別', hidden: () => false, readonly: () => this.isNpc },
            { key: 'species', placeholder: '種族', hidden: () => false, readonly: () => this.isNpc },
            { key: 'homunculus', placeholder: '魔造素材', hidden: () => this.isNpc || this.edit.species !== '魔造生物', readonly: () => false },
            { key: 'job', placeholder: '職業', hidden: () => false, readonly: () => !!(this.isNpc && (!this.edit.npc || this.manager.nonePlayerCharacters[this.edit.npc].job)) },
            { key: 'subJob', placeholder: '副職', hidden: () => false, readonly: () => this.isNpc },
            { key: 'personality', placeholder: '個性', hidden: () => this.isNpc || this.edit.species === '魔造生物', readonly: () => false },
            { key: 'personality2', placeholder: '個性その２', hidden: () => this.isNpc, readonly: () => false },
        ];
        this.isNpc = !!(this.edit.npc);
        this.recalcLevel();

        this.master = {
            npc: _.keys(this.manager.nonePlayerCharacters),
            gender: _.keys(this.manager.genders),
            homunculus: _.chain(this.manager.items).filter(item => item.category === '魔造生物').map(item => item.name).value(),
            personality: _.chain(this.manager.items).filter(item => item.category === '個性').map(item => item.name).value(),
            personality2: _.chain(this.manager.items).filter(item => item.category === '個性その２').map(item => item.name).value(),
            subJob: _.chain(this.manager.jobs).filter(item => !(item.lower)).map(item => item.name).value(),
        };
    }

    /**
     * NPCフラグ変更イベント.
     * @param event イベントデータ
     */
    changeIsNpc(event: MatRadioChange): void {
        if (this.isNpc === event.value) { return; }
        this.isNpc = event.value;
        this.clearCharacter();
    }

    /**
     * キャラクター情報クリア.
     */
    clearCharacter(): void {
        this.edit.npc = null;
        this.edit.gender = null;
        this.edit.species = null;
        this.edit.job = null;
        this.edit.subJob = null;
        this.edit.homunculus = null;
        this.edit.personality = null;
        this.edit.personality2 = null;
        this.edit.equipments = [];
        this.recalcLevel();
    }


    /**
     * 確定処理.
     */
    commit(): void {
        this.dialogRef.close(this.edit);
    }

    /**
     * select options 取得.
     * @param key 項目名称
     */
    getOptions(key: string): string[] {
        switch (key) {
            case 'species':
                if (this.isNpc) { return (this.edit.species) ? [this.manager.species[this.edit.species].name] : []; }
                return (this.edit.gender) ? this.manager.genders[this.edit.gender].species : [];

            case 'job':
                return _.chain(this.manager.jobs).filter(item => {
                    if (this.edit.subJob) {
                        if (item.lower === this.edit.subJob) { return true; }
                        if (item.name === this.edit.subJob) { return false; }
                    }
                    return !(item.lower);
                }).map(item => item.name).value();

            default:
                return this.master[key];
        }
    }

    recalcLevel(): void {
        if (this.edit.npc) {
            this.maxLevel = this.manager.nonePlayerCharacters[this.edit.npc].maxLevel;
        } else {
            this.maxLevel = (this.edit.species) ? this.manager.species[this.edit.species].maxLevel : 0;
        }
        if (!this.edit.level || this.edit.level > this.maxLevel) { this.edit.level = this.maxLevel; }
    }


    /**
     * select 選択項目変更イベント.
     * @param key 項目名称
     * @param event イベントデータ
     */
    selectionChange(key: string, event: MatSelectChange): void {
        if (this.edit[key] === event.value) { return; }
        this.edit[key] = event.value;

        switch (key) {
            case 'npc':
                const selectedNpc: g2.INonePlayerCharacter = this.manager.nonePlayerCharacters[event.value];
                this.edit.gender = selectedNpc.gender;
                this.edit.species = selectedNpc.species;
                this.edit.job = selectedNpc.job;
                this.edit.subJob = selectedNpc.subJob;
                this.edit.level = 0;
                break;

            case 'gender':
                this.edit.species = null;
                break;
            case 'species':
                this.edit.level = 0;
                break;

            case 'subJob':
                if (this.edit.job === event.value) {
                    this.edit.job = this.manager.jobs[this.edit.job].upper;
                } else if (this.manager.jobs[this.edit.job].lower) {
                    this.edit.job = this.manager.jobs[this.edit.job].lower;
                }
                break;
        }
        this.recalcLevel();
    }
}

/**
 * 項目定義インタフェース.
 */
interface IField {
    /**
     * キー値.
     */
    key: string;
    /**
     * 非表示フラグ.
     */
    hidden: () => boolean;
    /**
     * placehold文字列.
     */
    placeholder: string;
    /**
     * 読み取り専用フラグ.
     */
    readonly: () => boolean;
}


