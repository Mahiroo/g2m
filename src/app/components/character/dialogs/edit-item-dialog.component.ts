import * as _ from 'underscore';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, ValidationErrors } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { MatDialogConfig, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import * as g2 from '../../../models';
import { ManagerService, ItemUtilityService } from '../../../services';

@Component({
    templateUrl: './edit-item-dialog.component.html',
    styleUrls: ['./edit-item-dialog.component.less']
})
export class EditItemDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
    };
    /**
     * フィルタ済みアイテム名称リスト.
     */
    filteredItemNames: Observable<string[]>;
    /**
     * フィルタ済み超レア称号名称リスト.
     */
    filteredTitleNames: Observable<string[]>;
    /**
     * フィルタ済み称号名称リスト.
     */
    filteredRareTitleNames: Observable<string[]>;
    /**
     * 編集中フラグ.
     */
    isEdit: boolean;
    /**
     * アイテム情報.
     */
    set item(value: g2.IItem) {
        this.selectedItem = value.name;
        this.selectedTitle = value.title;
        this.selectedRareTitle = value.rareTitle;
        this.selectedJewel = value.jewel;
        this._item = this.itemUtil.getClone(value);
    }
    _item: g2.IItem;
    /**
     * アイテム名称入力コントロール.
     */
    itemControl: FormControl = new FormControl();
    /**
     * アイテム名称入力エレメント.
     */
    itemElement: HTMLElement;
    /**
     * 超レア称号名称入力コントロール.
     */
    rareTitleControl: FormControl = new FormControl();
    /**
     * 超レア称号名称入力エレメント.
     */
    rareTitleElement: HTMLElement;
    /**
     * 選択アイテム.
     */
    selectedItem: string;
    /**
     * 選択アイテム.
     */
    selectedJewel: string;
    /**
     * 選択超レア称号.
     */
    selectedRareTitle: string;
    /**
     * 選択称号.
     */
    selectedTitle: string;
    /**
     * 称号名称入力コントロール.
     */
    titleControl: FormControl = new FormControl();
    /**
     * 称号名称入力エレメント.
     */
    titleElement: HTMLElement;

    inputJewel: IInputField;

    /**
     * コンストラクタ.
     * @param el HTMLエレメント参照
     * @param dialogRef ダイアログ参照
     * @param itemUtil アイテムユーティリティサービス
     */
    constructor(private el: ElementRef, public dialogRef: MatDialogRef<EditItemDialogComponent>, private manager: ManagerService, private itemUtil: ItemUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        const initInput = (names: string[], cssClass: string): IInputField => {
            const control = this.initInputContorl(names);
            return {
                names: names,
                element: this.el.nativeElement.getElementsByClassName(cssClass)[0],
                control: control,
                value: '',
                filterd: this.bindAutoComplete(control, names)
            };
        }
        const jewels = _.chain(this.manager.items).toArray().filter(item => item.majorCategory === '宝石').map(item => item.name).value();
        this.inputJewel = initInput(jewels, 'input-jewel');
        if (this.selectedJewel) { this.inputJewel.value = this.selectedJewel; }

        this.itemElement = this.el.nativeElement.getElementsByClassName('input-item')[0];
        this.titleElement = this.el.nativeElement.getElementsByClassName('input-title')[0];
        this.rareTitleElement = this.el.nativeElement.getElementsByClassName('input-rare-title')[0];

        const itemNames = _.chain(this.manager.items).toArray().filter(item => item.havableTitle).map(item => item.name).value();
        this.itemControl = this.initInputContorl(itemNames, true);
        this.filteredItemNames = this.bindAutoComplete(this.itemControl, itemNames);

        const titleNames = _.chain(this.manager.titles).toArray().map(item => item.name).value();
        this.titleControl = this.initInputContorl(titleNames);
        this.filteredTitleNames = this.bindAutoComplete(this.titleControl, titleNames);

        const rareTitleNames = _.chain(this.manager.rareTitles).toArray().map(item => item.name).value();
        this.rareTitleControl = this.initInputContorl(rareTitleNames);
        this.filteredRareTitleNames = this.bindAutoComplete(this.rareTitleControl, rareTitleNames);
    }

    /**
     * 変更処理.
     */
    commit(): void {
        if (this.selectedRareTitle && !this.rareTitleControl.valid) {
            this.rareTitleElement.focus();
            return;
        }
        if (this.selectedTitle && !this.titleControl.valid) {
            this.titleElement.focus();
            return;
        }
        if (!this.selectedItem || !this.itemControl.valid) {
            this.itemElement.focus();
            return;
        }
        if (this.inputJewel.value && !this.inputJewel.control.valid) {
            this.inputJewel.element.focus();
            return;
        }

        const item: g2.IItem = this.itemUtil.getItem(this.selectedItem, this.selectedTitle, this.selectedRareTitle, this.inputJewel.value);
        this.dialogRef.close(item);
    }

    /**
     * 入力コントロールへのAutoCompleteバインド.
     */
    bindAutoComplete(control: FormControl, names: string[]): Observable<string[]> {
        return control.valueChanges.startWith('').map(value => {
            let selected = 0;
            return _.filter(names, item => {
                if (item.indexOf(value) < 0 || selected > 10) { return false; }
                selected++;
                return true;
            });
        });
    }

    /**
     * 入力コントロール初期化.
     */
    initInputContorl(names: string[], required?: boolean): FormControl {
        const validation = (target: FormControl) => {
            if (target.value && !_.contains(names, target.value)) { return { 'notExists': true }; }
            return null;
        };
        const validators: ValidatorFn[] = [validation];
        if (required) { validators.push(Validators.required); }
        return new FormControl('', Validators.compose(validators));
    }

    inputValueChanged(): void {

    }

    /**
     * エラーメッセージ取得.
     * @param control 対象コントロール
     */
    getErrorMessage(control: FormControl): string {
        return (control.hasError('notExists')) ? `[ ${control.value} ]は存在しません。` :
            (control.hasError('required')) ? `値を入力してください` : null;
    }
}



interface IInputField {
    control: FormControl;
    element: HTMLElement;
    names: string[];
    filterd: Observable<string[]>;
    value: string;
}