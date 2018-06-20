import * as _ from 'underscore';
import { Pipe, PipeTransform } from '@angular/core';
import { GenderPipe } from './gender.pipe';
import { IRestricts } from '../models';

@Pipe({
    name: 'restricts'
})
export class RestrictsPipe implements PipeTransform {

    constructor(private genderPipe: GenderPipe) { }

    transform(value: IRestricts, args?: any): any {
        if (!value) { return null; }
        let result: string = '';
        if (value.genders) {
            _.forEach(value.genders, item => result += `※${this.genderPipe.transform(item)}専用`);
        }
        if (value.species) {
            _.forEach(value.species, item => result += `※${item}専用`);
        }
        if (value.forbid) {
            _.forEach(value.forbid, item => result += `※${item}不可`);
        }
        if (value.jobs) {
            _.forEach(value.jobs, item => result += `※${item}専用`);
        }
        return result;
    }

}
