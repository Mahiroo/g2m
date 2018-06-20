import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import * as g2 from '../../../models';
import { ItemUtilityService } from '../../../services';

@Component({
    templateUrl: './data-management-dialog.component.html',
    styleUrls: ['./data-management-dialog.component.less']
})
export class DataManagementDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        maxWidth: '600px',
        minWidth: '600px',
    };
    /**
     * ファイルアップロードエレメント.
     */
    @ViewChild('fileInput') fileInputElement: ElementRef;
    /**
     * インポートファイル名.
     */
    fileName: string;
    /**
     * 選択タブインデックス.
     */
    selectedTabIndex: number;
    /**
     * データ更新フラグ.
     */
    updated: boolean;

    /**
     * コンストラクタ.
     * @param dialogRef ダイアログ参照
     * @param itemUtil アイテムユーティリティサービス
     */
    constructor(public dialogRef: MatDialogRef<DataManagementDialogComponent>, private itemUtil: ItemUtilityService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.selectedTabIndex = 0;
        this.updated = false;
    }

    /**
     * データエクスポート.
     */
    exportData(): void {
        const jsonData = this.itemUtil.export();
        const fileName = 'g2m.inventory.json';
        const blob = new Blob([JSON.stringify(jsonData, null, '\t')], { 'type': 'text/json' });

        if (window.navigator.msSaveBlob) {
            // for IE
            window.navigator.msSaveBlob(blob, fileName);
            return;
        }
        const a = document.createElement('a');
        a.download = fileName;
        a.target = '_blank';

        if (window.URL && window.URL.createObjectURL) {
            // for Firefox
            a.href = window.URL.createObjectURL(blob);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } else if (window['webkitURL'] && window['webkitURL'].createObject) {
            // for Chrome
            a.href = window['webkitURL'].createObjectURL(blob);
            a.click();

        } else {
            // for Safari
            window.open('data:' + 'text/json' + ';base64,' + window['Base64'].encode('abc'), '_blank');
        }
        this.dialogRef.close();
    }

    getButtonVisible(tabIndex: number): boolean {
        return (this.selectedTabIndex === tabIndex);
    }

    /**
     * データインポート.
     */
    importData(): void {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            this.itemUtil.import(JSON.parse(reader.result));
            alert(`データの復元が完了しました。`);
            this.dialogRef.close(true);
        }, true);
        reader.readAsText(this.fileInputElement.nativeElement.files[0], 'UTF-8');
    }

    onFileInput($event: any): void {
        if (!this.fileInputElement.nativeElement.files || this.fileInputElement.nativeElement.files.length === 0) {
            this.fileName = null;
            return;
        }
        this.fileName = this.fileInputElement.nativeElement.files[0].name;
    }

    /**
     * ゲームリセット.
     */
    resetGame(): void {
        const message = 'ゲームリセットを実施します。\r\n全ての超レア称号付きアイテムを掘り出し物に入った状態に変更します。\r\n実行してよろしいですか？';
        if (!confirm(message)) { return; }
        this.itemUtil.resetGame(true);
        alert(`ゲームリセットが完了しました。`);
        this.dialogRef.close(true);
    }

    /**
     * 所有フラグ一括変更.
     * @param possession 所有フラグ.
     */
    setPossessionAll(possession: boolean): void {
        const flagValue: string = (possession) ? '入手済み' : '未入手';
        if (!confirm(`全ての通常アイテムを${flagValue}状態に変更してよろしいですか？`)) { return; }
        this.itemUtil.setPossessionAll(possession, true);
        this.dialogRef.close(true);
    }

    /**
     * タブ変更イベント.
     * @param event イベントデータ
     */
    tabChanged(event: MatTabChangeEvent): void {
        this.selectedTabIndex = event.index;
    }
}
