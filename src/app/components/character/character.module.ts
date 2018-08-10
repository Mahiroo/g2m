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
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
} from '@angular/material';
import { PipesModule } from '../../pipes/pipes.module';
import { CharacterManagerService, ItemUtilityService, ManagerService } from '../../services';
import { ItemInfoModule } from '../common/item-info/item-info.module';
import { ItemListModule } from '../common/item-list/item-list.module';

import { CharacterComponent } from './character.component';
import { CharacterMenuComponent } from './character-menu.component';

import { AddItemDialogComponent } from './dialogs/add-item-dialog.component';
import { CharacterListDialogComponent } from './dialogs/character-list-dialog.component';
import { DataManagementDialogComponent } from './dialogs/data-management-dialog.component';
import { EditItemDialogComponent } from './dialogs/edit-item-dialog.component';
import { EditPartsDialogComponent } from './dialogs/edit-parts-dialog.component';
import { ItemListDialogComponent } from './dialogs/item-list-dialog.component';
import { SearchItemDialogComponent } from './dialogs/search-item-dialog.component';

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
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        PipesModule,
        ItemInfoModule,
        ItemListModule,
    ],
    declarations: [
        CharacterComponent,
        CharacterMenuComponent,
        AddItemDialogComponent,
        CharacterListDialogComponent,
        DataManagementDialogComponent,
        EditItemDialogComponent,
        EditPartsDialogComponent,
        ItemListDialogComponent,
        SearchItemDialogComponent,
    ],
    entryComponents: [
        AddItemDialogComponent,
        CharacterListDialogComponent,
        DataManagementDialogComponent,
        EditItemDialogComponent,
        EditPartsDialogComponent,
        ItemListDialogComponent,
        SearchItemDialogComponent,
    ],
    exports: [CharacterComponent, CharacterMenuComponent],
    providers: [ManagerService, ItemUtilityService, CharacterManagerService],
})
export class CharacterModule { }
