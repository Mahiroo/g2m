import * as _ from 'underscore';
import { INonePlayerCharacter } from '../models';

/**
 * 性別情報リスト初期化.
 */
export function initNonePlayerCharacters(): _.Dictionary<INonePlayerCharacter> {
    const keys: string[] = _.map(master, values => values[0]);
    const values: INonePlayerCharacter[] = _.map(master, (values, index): INonePlayerCharacter => {
        const result: INonePlayerCharacter = {
            displayName: values[0],
            gender: values[1],
            kind: 'NPC',
            maxLevel: values[3],
            name: values[0],
            seq: index + 1,
            species: values[2],
            subJob: values[4],
        };
        if (values[5]) { result.job = values[5]; }
        result.equipments = _.map(values.splice(6), value => (_.isString(value)) ? { n: value } : value);
        return result;
    });
    return _.object(keys, values);
}

/**
 * マスタデータ.
 */
const master: any[][] = [
    ['ロードレオン', '男', '人間:男', 200, 'ロイヤルライン', '君主', 'ロードレオン', '形見の鎧', 'ドラゴンスレイヤー', { n: 'エクスカリバー', t: '伝説の' }],
    ['ヘリウス', '男', 'ヒューマノイド:男', 99, '修道者', '魔法使い', 'ヘリウス', '失われた知識'],
    ['リリーナ', '女', 'サイボーグ', 130, '盗賊', '', 'リリーナ', '薬の知識', 'テイマー機能', '生命維持装置'],
    ['ケルベロス', '不明', '魔造生物', 130, '剣士', '', 'ケルベロス', '三頭四肢'],
    ['リリィ', '女', 'ヒューマノイド:女', 99, '盗賊', '修道者', 'リリィ', '魔法の天才', 'ひかえめ'],
    ['セッタ', '不明', '鬼', 200, '侍', '僧侶', '鬼神セッタ', '金棒', '銘酒ドラゴンダッシュ'],
    ['ネコマタ', '女', 'ワーキャット', 135, '忍者', '', 'ネコマタ', 'サファイア', 'ラピスラズリ', 'エメラルド', 'ムーンストーン'],
    ['ゲオルグ', '男', 'ダークエルフ', 150, '剣聖', '秘法剣士', 'ゲオルグ', '対人間', 'ネクロノミコン', '魔剣ダーインスレイヴ'],
    ['ファリア', '女', 'エルフ', 150, 'ロイヤルライン', '', 'ファリア', '森と剣の指輪'],
    ['ファウスト', '男', '吸血鬼', 200, 'ロイヤルライン', '戦士', '暗黒卿ファウスト', '血の誓い', 'ファウストのマント', 'リネージュ・ハザード', '孤高', '保護：リリーナ', '保護：ゲオルグ', '☆リヴァイアサン'],
    ['マリー', '女', 'アマゾネス', 135, '狩人', '', 'マリー・マーズウォルフ', '吸魔の首飾り'],
    ['クラマ', '男', '天狗', 130, '侍', '', 'クラマ', 'サスケの刀', '忍術', '不断の努力(侍)'],
    ['ヘリウス（不死）', '男', 'アンデッドマン', 140, '修道者', '賢者', 'ヘリウス', '失われた知識', '亜種の因子', 'リリィの書'],
    ['ダニエル', '男', '人間:男', 200, 'ロイヤルライン', 'ロイヤルマスター', 'ダニエル', '元帝国貴族', 'エリート', '星降る腕輪'],
];
