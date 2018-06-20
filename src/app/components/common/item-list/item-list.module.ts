import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
} from '@angular/material';

import { PipesModule } from '../../../pipes/pipes.module';
import { ItemUtilityService, ManagerService } from '../../../services';
import { ItemInfoModule } from '../item-info/item-info.module';

import { ItemListComponent } from './item-list.component';
import { ItemInfoDialogComponent } from './item-info-dialog.component';
import { ItemFilterDialogComponent } from './dialogs/item-filter-dialog.component';
import { FieldSettingsDialogComponent } from './dialogs/field-settings-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatTabsModule,
        PipesModule,
        ItemInfoModule,
    ],
    declarations: [ItemListComponent, ItemInfoDialogComponent, ItemFilterDialogComponent, FieldSettingsDialogComponent],
    exports: [ItemListComponent, ItemInfoDialogComponent, ItemFilterDialogComponent, FieldSettingsDialogComponent],
    entryComponents: [ItemInfoDialogComponent, ItemFilterDialogComponent, FieldSettingsDialogComponent],
    providers: [ManagerService, ItemUtilityService],
})
export class ItemListModule { }
