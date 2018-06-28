import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import * as g2 from '../../../models';
import { ManagerService, CharacterUtilityService } from '../../../services';

@Component({
    templateUrl: './character-list-dialog.component.html',
    styleUrls: ['./character-list-dialog.component.less']
})
export class CharacterListDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
    };
    /**
     * キャラクター情報リスト.
     */
    characters: g2.ICharacter[];
    displayedColumns: string[] = ['information', 'remove'];
    /**
     * 編集中キャラクター情報.
     */
    editCharacter: g2.ICharacter;
    /**
     * 選択中キャラクター情報.
     */
    selectedCharacter: g2.ICharacter;

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     * @param charUtil キャラクタユーティリティ
     */
    constructor(public dialogRef: MatDialogRef<CharacterListDialogComponent>, private manager: ManagerService, private charUtil: CharacterUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.refresh();
    }

    /**
     * 編集キャラクター確定.
     */
    commit(): void {
        if (!confirm(`現在編集中のキャラクター情報を破棄し、[ ${this.selectedCharacter.name} ]を読み込んでもよろしいですか？`)) { return; }
        this.dialogRef.close(this.selectedCharacter);
    }

    /**
     * ビルド構成情報取得.
     */
    getBuildInfo(character: g2.ICharacter): string {
        return this.charUtil.getBuildPartsInfo(character);
    }

    /**
     * 行 CssClass 取得.
     * @param character
     */
    getRowCssClass(character: g2.ICharacter): string[] {
        const result = [];
        if (character === this.selectedCharacter) { result.push('selected'); }
        if (this.editCharacter && (character.id === this.editCharacter.id)) { result.push('editing'); }
        return result;
    }

    /**
     * ソート順移動(下).
     */
    orderDown(): void {
        if (!this.selectedCharacter) { return; }
        this.charUtil.recalcOrder(this.selectedCharacter, 1, true);
        this.refresh();
    }

    /**
     * ソート順移動(上).
     */
    orderUp(): void {
        if (!this.selectedCharacter) { return; }
        this.charUtil.recalcOrder(this.selectedCharacter, -1, true);
        this.refresh();
    }

    /**
     * 最新化.
     */
    refresh(): void {
        this.characters = _.sortBy(this.charUtil.characters, characters => characters.order);
    }

    /**
     * キャラクター削除.
     */
    remove(): void {
        if (!this.selectedCharacter) { return; }

        const isEdit: boolean = (this.editCharacter && this.selectedCharacter.id === this.editCharacter.id);
        const msg: string = ((isEdit) ? "現在編集中の" : "") + `キャラクター[ ${this.selectedCharacter.name} ]を削除してよろしいですか？`;
        if (!confirm(msg)) { return; }
        this.charUtil.remove(this.selectedCharacter, true);
        if (isEdit) {
            this.dialogRef.close(this.charUtil.create());
        } else {
            this.refresh();
        }
    }

    /**
     * キャラクター選択.
     * @param character キャラクター情報
     */
    select(character: g2.ICharacter): void {
        if (character === this.selectedCharacter) {
            this.selectedCharacter = null;
            return;
        }
        this.selectedCharacter = character;
    }
}
