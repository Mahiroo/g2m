import { Pipe, PipeTransform } from '@angular/core';
import * as Const from '../common/const';

@Pipe({
    name: 'gender'
})
export class GenderPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (!value) { return null; }
        switch (value) {
            case '男':
                return '男性';
            case '女':
                return '女性';
            case '不明':
                return '性別不明';
            default:
                return value;
        }
    }

}
