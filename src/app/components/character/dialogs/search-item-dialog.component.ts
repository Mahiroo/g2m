import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MatTabChangeEvent, MatPaginatorIntl, PageEvent } from '@angular/material';
import * as g2 from '../../../models';
import { ItemUtilityService, IFilter, ManagerService } from '../../../services'
import { FieldSettingsDialogComponent, ItemFilterDialogComponent } from '../../common/item-list';

@Component({
    templateUrl: './search-item-dialog.component.html',
    styleUrls: ['./search-item-dialog.component.less']
})
export class SearchItemDialogComponent implements OnInit {

    /**
     * ダイアログ呼び出しオプション規定値.
     */
    static readonly DEFAULT_OPTIONS: MatDialogConfig = {
        maxWidth: '95vw',
        minWidth: '95vw',
        width: '95vw',
    };

    static readonly LSKEY_COLUMNS = 'search-item-dialog.columns';

    /**
     * 表示列リスト.
     */
    columns: string[];
    /**
     * フィルタ設定.
     */
    filter: IFilter;
    /**
     * アイテム情報リスト.
     */
    items: g2.IInventory[];
    pageIndex: number = 0;
    pageSize: number = 10;

    /**
     * コンストラクタ.
     * @param charUtil
     */
    constructor(matPaginatorIntl: MatPaginatorIntl, public dialogRef: MatDialogRef<SearchItemDialogComponent>, private dialog: MatDialog, private manager: ManagerService, private itemUtil: ItemUtilityService) {
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
        this.columns = this.manager.localStorage.get(SearchItemDialogComponent.LSKEY_COLUMNS) || this.itemUtil.getFieldKeys();
        this.refresh();
    }

    /**
     * ページ変更イベント.
     * @param event イベントデータ
     */
    changePage(event: PageEvent): void {
        if (event.pageSize !== this.pageSize) {
            this.pageSize = event.pageSize;
        }
        if (event.pageIndex !== this.pageIndex) { this.pageIndex = event.pageIndex; }
    }

    /**
     * 選択アイテム装備.
     */
    equip(): void {
        const selectedItems: g2.ISavedItem[] = _.chain(this.items)
            .filter(item => item.selected)
            .map(item => this.itemUtil.getSavedItem(item))
            .value();
        if (selectedItems.length) { this.dialogRef.close(selectedItems); }
    }

    /**
     * フィルタ設定ダイアログ表示.
     */
    openItemFilterDialog(): void {
        const dialogRef = this.dialog.open(ItemFilterDialogComponent, ItemFilterDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.filter = this.filter;
        dialogRef.componentInstance.hideComposite = true;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.filter = result;
            this.refresh();
        });
    }

    /**
     * 表示設定ダイアログ表示.
     */
    openFieldSettingsDialog(): void {
        const dialogRef = this.dialog.open(FieldSettingsDialogComponent, FieldSettingsDialogComponent.DEFAULT_OPTIONS);
        dialogRef.componentInstance.columns = this.columns;
        dialogRef.afterClosed().subscribe(result => {
            if (!result) { return; }
            this.columns = result;
            this.manager.localStorage.set(SearchItemDialogComponent.LSKEY_COLUMNS, this.columns);
        });
    }

    /**
     * 表示更新.
     */
    refresh(): void {
        const newItems = this.itemUtil.getInventories(this.filter);
        this.items = newItems;
    }


}
