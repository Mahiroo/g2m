import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material';
import * as g2 from '../../models';
import { ItemUtilityService, IFilter, ManagerService } from '../../services'
import { ItemFilterDialogComponent, FieldSettingsDialogComponent } from '../common/item-list';

import { DataManagementDialogComponent } from './dialogs/data-management-dialog.component';
import { ItemRegisterDialogComponent } from './dialogs/item-register-dialog.component';
import { SettingsDialogComponent } from './dialogs/settings-dialog.component';

@Component({
    selector: 'g2-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.less']
})
export class InventoryComponent implements OnInit {
    /**
     * ローカルストレージキー値 : 所有アイテム情報.
     */
    readonly LSKEY_SETTIGNS: string = 'inventory.settings';
    /**
     * ページングコンポーネント.
     */
    @ViewChild(MatPaginator) paginatror: MatPaginator;
    /**
     * アイテム情報リスト.
     */
    items: g2.IInventory[];
    /**
     * 表示ページインデックス.
     */
    pageIndex: number;
    /**
     * 環境設定情報.
     */
    settings: IInventorySettings;

    /**
     * コンストラクタ.
     * @param dialog ダイアログサービス
     * @param manager マネージャサービス
     * @param itemUtil アイテムユーティリティ
     */
    constructor(matPaginatorIntl: MatPaginatorIntl, private dialog: MatDialog, private manager: ManagerService, private itemUtil: ItemUtilityService) {
        matPaginatorIntl.itemsPerPageLabel = '表示件数:';
        matPaginatorIntl.nextPageLabel = '次のページ';
        matPaginatorIntl.previousPageLabel = '前のページ';
        matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
            if (length === 0 || pageSize === 0) { return '該当なし'; }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            const lastPage = Math.floor(length / pageSize);
            return `${page + 1} / ${lastPage + 1} ページ (全${length}件)`;
        };
    }

    /**
     * 初期化イベント.
     */
    ngOnInit() {
        this.pageIndex = 0;
        this.settings = this.manager.localStorage.get(this.LSKEY_SETTIGNS);
        if (!this.settings) {
            this.settings = {
                columns: this.itemUtil.getFieldKeys(),
                filter: ItemUtilityService.INITIAL_FILTER,
                pageSize: 10
            };
            this.saveSettings();
        }
        this.refresh();
    }

    /**
     * ページ変更イベント.
     * @param event イベントデータ
     */
    changePage(event: PageEvent): void {
        if (event.pageSize !== this.settings.pageSize) {
            this.settings.pageSize = event.pageSize;
            this.saveSettings();
        }
        if (event.pageIndex !== this.pageIndex) { this.pageIndex = event.pageIndex; }
    }

    /**
     * キーワード検索inputイベント.
     * @param event イベントデータ
     */
    onInputSearchRegex(event): void {
        if (event.target.value) { return; }
        this.refresh();
    }

    /**
     * アイテム名称検索キーアップイベント.
     * @param event イベントデータ
     */
    onKeyupItemName(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case 8:
            case 13:
            case 46:
                this.refresh();
                break;
        }
    }

    /**
     * データ管理ダイアログ表示.
     */
    openDataManagementDialog(): void {
        const dialogRef = this.dialog.open(DataManagementDialogComponent, DataManagementDialogComponent.DEFAULT_OPTIONS);
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.refresh();
        });
    }

    /**
     * 検索条件ダイアログ表示.
     */
    openFilterDialog(): void {
        const dialogRef = this.dialog.open(ItemFilterDialogComponent, ItemFilterDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.filter = this.settings.filter;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.settings.filter = result;
            this.saveSettings();
            this.refresh();
        });
    }

    /**
     * アイテム登録ダイアログ表示.
     */
    openItemRegisterDialog(): void {
        const dialogRef = this.dialog.open(ItemRegisterDialogComponent, ItemRegisterDialogComponent.DEFAULT_OPTIONS);
        dialogRef.afterClosed().subscribe(result => {
            if (dialogRef.componentInstance.messages.length) { this.refresh(); }
        });
    }

    /**
     * 表示設定ダイアログ表示.
     */
    openSettingsDialog(): void {
        const dialogRef = this.dialog.open(FieldSettingsDialogComponent, FieldSettingsDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.columns = this.settings.columns;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.settings.columns = result;
            this.saveSettings();
        });
    }

    /**
     * 表示更新.
     */
    refresh(): void {
        const newItems = this.itemUtil.getInventories(this.settings.filter);
        if (this.items && (newItems.length < this.items.length)) {
            const newIndex = Math.floor(newItems.length / this.settings.pageSize);
            if (this.paginatror.pageIndex > newIndex) { this.paginatror.pageIndex = this.pageIndex = newIndex; }
        }
        this.items = newItems;
    }

    /**
     * 環境設定保存.
     */
    saveSettings(): void {
        this.manager.localStorage.set(this.LSKEY_SETTIGNS, this.settings);
    }
}

/**
 * 環境設定インタフェース.
 */
interface IInventorySettings {
    /**
     * 表示列名リスト.
     */
    columns: string[];
    /**
     * フィルタ設定.
     */
    filter: IFilter;
    /**
     * ページ表示数.
     */
    pageSize: number;
}