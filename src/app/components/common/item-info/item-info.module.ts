import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../../pipes/pipes.module';

import { ItemInfoComponent } from './item-info.component';

@NgModule({
    imports: [
        CommonModule,
        PipesModule,
    ],
    declarations: [ItemInfoComponent],
    exports: [ItemInfoComponent],
})
export class ItemInfoModule { }
