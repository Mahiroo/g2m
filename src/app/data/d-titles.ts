import * as _ from 'underscore';
import { ITitle } from '../models';

/**
 * 称号情報リスト初期化.
 */
export function initTitles(): _.Dictionary<ITitle> {
    const keys: string[] = _.map(master, values => values[0]);
    const values: ITitle[] = _.map(master, (values, index): ITitle => {
        return {
            displayName: values[1],
            kind: '称号',
            minusRatio: values[4],
            name: values[0],
            plusRatio: values[3],
            priceRatio: values[5],
            rarePriceAdditional: values[7],
            rarePriceRatio: values[6],
            seq: index + 1,
            symbol: values[2],
        };
    });
    return _.object(keys, values);
}

/**
 * マスタデータ.
 */
const master: any[][] = [
    ['最低な', '最低な', '低', 0.5, 2, 0.5, 2, 2000000],
    ['臭い', '臭い', '臭', 0.8, 1.25, 0.8, 4, 4000000],
    ['(称号無し)', '', '無', 1, 1, 1, 8, 8000000],
    ['名工の', '名工の', '名', 1.33, 0.75, 2, 18, 18000000],
    ['魔性の', '魔性の', '魔', 1.58, 0.63, 3, 31, 31000000],
    ['宿った', '宿った', '宿', 2.1, 0.48, 9, 74, 74000000],
    ['伝説の', '伝説の', '伝', 2.75, 0.36, 20, 0, 99999999],
    ['恐ろしい', '恐ろしい', '恐', 3.5, 0.29, 42, 0, 99999999],
    ['壊れた', '壊れた', '壊', 5, 0.2, 125, 0, 99999999],
];

