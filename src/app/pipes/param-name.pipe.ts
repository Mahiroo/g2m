import { Pipe, PipeTransform } from '@angular/core';
import * as Const from '../common/const';

@Pipe({
    name: 'paramName'
})
export class ParamNamePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value === null || value === undefined || !Const.Fields[value]) { return null; }
        return Const.Fields[value].name;
    }
}
