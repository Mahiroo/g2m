import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocalStorageModule } from 'angular-2-local-storage';
import { MatButtonModule, MatDialogModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { PipesModule } from './pipes/pipes.module';
import { CharacterManagerService, ItemUtilityService, ManagerService } from './services';
import { AppComponent } from './app.component';
import { InventoryModule } from './components/inventory/inventory.module';
import { CharacterModule } from './components/character/character.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        LocalStorageModule.withConfig({ prefix: 'g2', storageType: 'localStorage' }),
        MatButtonModule, MatDialogModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule,
        PipesModule,
        InventoryModule,
        CharacterModule,
    ],
    providers: [ManagerService, ItemUtilityService, CharacterManagerService],
    bootstrap: [AppComponent]
})
export class AppModule { }
