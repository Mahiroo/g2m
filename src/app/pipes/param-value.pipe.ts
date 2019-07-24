import * as _ from 'underscore';
import { Pipe, PipeTransform } from '@angular/core';
import * as Const from '../common/const';

@Pipe({
    name: 'paramValue'
})
export class ParamValuePipe implements PipeTransform {

    transform(value: any, key: string): any {
        if (value === null || value === undefined) { return null; }
        if (!Const.Fields[key]) { return value; }
        switch (Const.Fields[key].type) {
            case 'num':
                if (key === 'crt') { return parseFloat(value).toFixed(1) + '%'; }
                if (key === 'cnt') { return parseFloat(value).toFixed(1); }
                return String(Math.floor(value));
            case 'signedNum':
                if (value >= 0) { return '+' + String(value); }
                return String(value);
            case 'separatedNum':
                if (!value) { return null; }
                return String(value).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
            case 'date':
                if (!value) { return null; }
                const dateText = [value.getFullYear(), ("00" + (value.getMonth() + 1)).slice(-2), ("00" + value.getDate()).slice(-2)].join('/');
                const timeText = [('00' + value.getHours()).slice(-2), ('00' + value.getMinutes()).slice(-2), ('00' + value.getSeconds()).slice(-2)].join(':');
                return `${dateText} ${timeText}`;
            case 'list':
                let val: Array<any> = value;
                if (!value || !val.length) { return null; }
                return val.join('/');
        }

    }
}