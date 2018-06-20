import * as _ from 'underscore';
import * as Const from './const';
import { IParameters } from '../models';


export function isSameText(a: string, b: string): boolean {
    if (!a && !b) { return true; }
    return (a === b);
}

/**
 * 能力値設定.
 * @param obj 対象オブジェクト
 * @param values 能力値リスト
 */
export function setParameters(obj: IParameters, values: any[]): void {

    if (values.length >= Const.PARAMETER_KEYS.ALL.length) {
        setBattleParameters(obj, values);
        setBaseParameters(obj, values.slice(Const.PARAMETER_KEYS.BATTLE.length));
    } else if (values.length <= Const.PARAMETER_KEYS.BASE.length) {
        setBaseParameters(obj, values);
    } else {
        setBattleParameters(obj, values);
    }
}

/**
 * 基本能力値設定.
 * @param obj 対象オブジェクト
 * @param values 能力値リスト
 */
export function setBattleParameters(obj: IParameters, values: any[]): void {
    _.forEach(Const.PARAMETER_KEYS.BATTLE, (key, index) => {
        if (values[index]) { obj[key] = toNumber(values[index]); }
    });
}

/**
 * 戦闘能力値設定.
 * @param obj 対象オブジェクト
 * @param values 能力値リスト
 */
export function setBaseParameters(obj: IParameters, values: any[]): void {
    _.forEach(Const.PARAMETER_KEYS.BASE, (key, index) => {
        if (values[index]) { obj[key] = toNumber(values[index]); }
    });
}

/**
 * 数値変換.
 * @param value 変換値
 */
export function toNumber(value: any): number {
    if (value === undefined || value === null || value === '') { return undefined; }
    if (typeof value === 'number') { return value; }
    if (!isNaN(value)) { return parseFloat(value); }
    return null;
}
