import { Component, OnInit, AfterContentInit, AfterViewChecked, ViewChild } from '@angular/core';
import { ManagerService } from './services'
import { CharacterComponent, CharacterMenuComponent } from './components/character'
import { InventoryComponent, InventoryMenuComponent } from './components/inventory'

@Component({
    selector: 'g2-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, AfterViewChecked {
    readonly LSKEY_MODE = 'mode';


    @ViewChild(CharacterComponent) characterComponent: CharacterComponent;
    @ViewChild(CharacterMenuComponent) characterMenuComponent: CharacterMenuComponent;

    @ViewChild(InventoryComponent) inventoryComponent: InventoryComponent;
    @ViewChild(InventoryMenuComponent) inventoryMenuComponent: InventoryMenuComponent;

    /**
     * 処理モード.
     */
    mode: IMode;
    /**
     * モード設定リスト.
     */
    readonly modeSettings: IMode[] = [
        { name: 'inventory', icon: 'shopping_cart', title: '所有アイテム管理' },
        { name: 'character', icon: 'person', title: 'キャラクター管理' },
    ];

    /**
     * コンストラクタ.
     * @param manager マネージャサービス
     */
    constructor(private manager: ManagerService) { }

    /**
     * 初期化イベント.
     */
    ngOnInit(): void {
        this.mode = this.manager.localStorage.get(this.LSKEY_MODE);
        if (!this.mode) { this.changeMode(this.modeSettings[0]); }
    }

    ngAfterViewChecked(): void {
        if (this.inventoryMenuComponent) { this.inventoryMenuComponent.contents = this.inventoryComponent; }
        if (this.characterMenuComponent) { this.characterMenuComponent.contents = this.characterComponent; }
    }

    /**
     * モード切替.
     * @param mode モード
     */
    changeMode(mode: IMode): void {
        this.mode = mode;
        this.manager.localStorage.set(this.LSKEY_MODE, mode);
    }
}

/**
 * 処理モードインタフェース.
 */
interface IMode {
    /**
     * 名称.
     */
    name: string;
    /**
     * アイコン.
     */
    icon: string;
    /**
     * タイトル.
     */
    title: string;
}
