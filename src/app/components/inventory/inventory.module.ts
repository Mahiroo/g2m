import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatOptionModule,
    MatPaginatorModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule,
} from '@angular/material';
import { PipesModule } from '../../pipes/pipes.module';
import { CharacterManagerService, ItemUtilityService, ManagerService } from '../../services';
import { ItemListModule } from '../common/item-list/item-list.module';
import { InventoryComponent } from './inventory.component';
import { InventoryMenuComponent } from './inventory-menu.component';
import { SettingsDialogComponent } from './dialogs/settings-dialog.component';
import { DataManagementDialogComponent } from './dialogs/data-management-dialog.component';
import { ItemRegisterDialogComponent } from './dialogs/item-register-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatOptionModule,
        MatPaginatorModule,
        MatRadioModule,
        MatTabsModule,
        MatTooltipModule,
        PipesModule,
        ItemListModule,
    ],
    declarations: [InventoryComponent, InventoryMenuComponent, SettingsDialogComponent, DataManagementDialogComponent, ItemRegisterDialogComponent],
    entryComponents: [SettingsDialogComponent, DataManagementDialogComponent, ItemRegisterDialogComponent],
    exports: [InventoryComponent, InventoryMenuComponent],
    providers: [ManagerService, ItemUtilityService, CharacterManagerService],
})
export class InventoryModule { }
