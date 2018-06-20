import { Pipe, PipeTransform } from '@angular/core';
import * as Const from '../common/const';

@Pipe({
    name: 'paramShortName'
})
export class ParamShortNamePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value === null || value === undefined || !Const.Fields[value]) { return null; }
        return Const.Fields[value].shortName;
    }

}
