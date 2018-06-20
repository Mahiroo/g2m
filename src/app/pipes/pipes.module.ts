import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderPipe } from './gender.pipe';
import { ParamValuePipe } from './param-value.pipe';
import { ParamNamePipe } from './param-name.pipe';
import { ParamShortNamePipe } from './param-short-name.pipe';
import { RestrictsPipe } from './restricts.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [GenderPipe, ParamValuePipe, ParamNamePipe, ParamShortNamePipe, RestrictsPipe],
    exports: [GenderPipe, ParamValuePipe, ParamNamePipe, ParamShortNamePipe, RestrictsPipe],
    providers: [GenderPipe],
})
export class PipesModule { }
