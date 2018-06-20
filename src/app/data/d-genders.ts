import * as _ from 'underscore';
import { IGender } from '../models';

/**
 * 性別情報リスト初期化.
 */
export function initGenders(): _.Dictionary<IGender> {
    const keys: string[] = _.map(master, values => values[0]);
    const values: IGender[] = _.map(master, (values, index): IGender => {
        return {
            displayName: values[0],
            kind: '性別',
            name: values[0],
            seq: index + 1,
            species: values.slice(1),
        };
    });
    return _.object(keys, values);
}

/**
 * マスタデータ.
 */
const master: any[][] = [
    ['男', '人間:男', 'ピグミーチャム', 'ノーム', 'ドワーフ', 'ダークエルフ', '吸血鬼'],
    ['女', '人間:女', 'エルフ', 'サイキック', 'ワーキャット', 'ドラゴニュート', 'アマゾネス'],
    ['不明', '魔造生物', 'アンデッドマン', '巨人', '天狗', '鬼', 'サイボーグ'],
];
