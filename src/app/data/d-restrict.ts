import * as _ from 'underscore';
import { IRestricts } from '../models';

/**
 * 装備制限情報リスト初期化.
 */
export function initRestricts(): { name: string, restricts?: IRestricts }[] {
    return master;
}

/**
 * マスタデータ.
 */
const master: any[] = [
    { name: 'フェンシングサーベル', restricts: { jobs: ['剣聖'] } },
    { name: '舞姫の小剣', restricts: { jobs: ['剣聖'] } },
    { name: 'スクリュードライバー', restricts: { genders: ['男'] } },
    { name: '悪のサーベル', restricts: { species: ['ダークエルフ'] } },
    { name: '点牙突剣', restricts: { jobs: ['剣聖'] } },
    { name: '虹色小剣', restricts: { jobs: ['剣聖'] } },
    { name: 'クイーンビュート', restricts: { genders: ['女'] } },
    { name: '断罪のサーベル', restricts: { jobs: ['剣聖'] } },
    { name: 'メリクルレイピア', restricts: { jobs: ['剣聖'] } },
    { name: 'ライトセイバー', restricts: { genders: ['男'] } },
    { name: '悪魔将軍の剣', restricts: { genders: ['男'] } },
    { name: 'プリンセスソード', restricts: { genders: ['女'] } },
    { name: 'ブリュンヒルドの剣', restricts: { genders: ['女'] } },
    { name: 'ヴァルキリーソード', restricts: { genders: ['女'] } },
    { name: '神獣の槍', restricts: { jobs: ['侍'] } },
    { name: '国護りの刀', restricts: { jobs: ['侍'] } },
    { name: '魔人の刀', restricts: { genders: ['男'] } },
    { name: 'クイーンボウ', restricts: { genders: ['女'] } },
    { name: '原始の服', restricts: { genders: ['男'] } },
    { name: 'サキュバス・スーツ', restricts: { genders: ['女'] } },
    { name: 'クイーンプレート', restricts: { genders: ['女'] } },
    { name: 'ミネルバプレート', restricts: { genders: ['女'] } },
    { name: 'ウェディングドレス', restricts: { genders: ['女'] } },
    { name: 'インペリアルシールド', restricts: { jobs: ['戦士'] } },
    { name: '黒い盾', restricts: { species: ['ダークエルフ'] } },
    { name: '白い盾', restricts: { species: ['エルフ'] } },
    { name: 'ヴァルキリーの盾', restricts: { genders: ['女'] } },
    { name: '竜人王の小手', restricts: { species: ['ドラゴニュート'] } },
    { name: '王女の杖', restricts: { genders: ['女'] } },
    { name: '王者の杖', restricts: { genders: ['男'] } },
    { name: '五輪書', restricts: { jobs: ['侍'] } },
    { name: '八咫鏡', restricts: { genders: ['女'] } },
    { name: 'おまもり', restricts: { species: ['人間'] } },
    { name: '身体強化術', restricts: { species: ['人間'] } },
    { name: '物理結界', restricts: { genders: ['男'], species: ['人間'] } },
    { name: '魔法結界', restricts: { genders: ['女'], species: ['人間'] } },
    { name: '百戦錬磨', restricts: { genders: ['男'], species: ['人間'], forbid: ['アンデッドマン'] } },
    { name: '万紫千紅', restricts: { genders: ['女'], species: ['人間'], forbid: ['アンデッドマン'] } },
    { name: '奇妙なしっぽ', restricts: { species: ['ピグミーチャム'] } },
    { name: '処世術', restricts: { species: ['ピグミーチャム'] } },
    { name: '浮雲驚竜', restricts: { species: ['ピグミーチャム'], forbid: ['アンデッドマン'] } },
    { name: 'とんがり帽子', restricts: { species: ['ノーム'] } },
    { name: '暗黒教典', restricts: { species: ['ノーム'] } },
    { name: '精霊の守護', restricts: { genders: ['男'], species: ['ノーム'] } },
    { name: '森羅万象', restricts: { species: ['ノーム'], forbid: ['アンデッドマン'] } },
    { name: '鍛冶ハンマー', restricts: { species: ['ドワーフ'] } },
    { name: '斧銃技師', restricts: { species: ['ドワーフ'] } },
    { name: '地精の結界装置', restricts: { species: ['ドワーフ'] } },
    { name: '削岩の秘術', restricts: { genders: ['男'], species: ['ドワーフ'] } },
    { name: '低重心歩行', restricts: { genders: ['男'], species: ['ドワーフ'] } },
    { name: '不壊金剛', restricts: { species: ['ドワーフ'], forbid: ['アンデッドマン'] } },
    { name: '黒マスク', restricts: { species: ['ダークエルフ'] } },
    { name: '黒精炎術', restricts: { genders: ['男'], species: ['ダークエルフ'] } },
    { name: '紫電一閃', restricts: { species: ['ダークエルフ'], forbid: ['アンデッドマン'] } },
    { name: '棺桶', restricts: { species: ['吸血鬼'] } },
    { name: '魔剣術', restricts: { species: ['吸血鬼'] } },
    { name: '魔矢強化術', restricts: { genders: ['男'], species: ['吸血鬼'] } },
    { name: '夢幻泡影', restricts: { species: ['吸血鬼'], forbid: ['アンデッドマン'] } },
    { name: '風のささやき', restricts: { species: ['エルフ'] } },
    { name: '白精冷術', restricts: { genders: ['女'], species: ['エルフ'] } },
    { name: '森の守り手', restricts: { genders: ['女'], species: ['エルフ'] } },
    { name: '千古不滅', restricts: { species: ['エルフ'], forbid: ['アンデッドマン'] } },
    { name: '魔女の帽子', restricts: { species: ['サイキック'] } },
    { name: '魔操身術', restricts: { species: ['サイキック'] } },
    { name: '門戸開放', restricts: { species: ['サイキック'], forbid: ['アンデッドマン'] } },
    { name: 'ワイルドスカーフ', restricts: { species: ['ワーキャット'] } },
    { name: '先天略奪者', restricts: { species: ['ワーキャット'] } },
    { name: '天真爛漫', restricts: { species: ['ワーキャット'], forbid: ['アンデッドマン'] } },
    { name: '竜人の秘薬', restricts: { species: ['ドラゴニュート'] } },
    { name: '逆鱗', restricts: { genders: ['女'], species: ['ドラゴニュート'] } },
    { name: '竜の爪', restricts: { genders: ['女'], species: ['ドラゴニュート'] } },
    { name: '竜神の攻め', restricts: { genders: ['女'], species: ['ドラゴニュート'] } },
    { name: '竜神の守り', restricts: { genders: ['女'], species: ['ドラゴニュート'] } },
    { name: '竜章鳳姿', restricts: { species: ['ドラゴニュート'], forbid: ['アンデッドマン'] } },
    { name: 'アルテミスの首飾り', restricts: { species: ['アマゾネス'] } },
    { name: '剣と弓術', restricts: { species: ['アマゾネス'] } },
    { name: '戦乙女の加護', restricts: { genders: ['女'], species: ['アマゾネス'] } },
    { name: '刀槍矛戟', restricts: { species: ['アマゾネス'], forbid: ['アンデッドマン'] } },
    { name: '魔核保護', restricts: { species: ['魔造生物'] } },
    { name: '神工鬼斧', restricts: { species: ['魔造生物'], forbid: ['アンデッドマン'] } },
    { name: 'ボディアーマー', restricts: { species: ['アンデッドマン'] } },
    { name: 'ドーピング', restricts: { species: ['アンデッドマン'] } },
    { name: '純粋原液', restricts: { species: ['アンデッドマン'] } },
    { name: '金棒', restricts: { species: ['鬼'] } },
    { name: '金剛杵', restricts: { species: ['鬼'] } },
    { name: '悪鬼羅刹', restricts: { species: ['鬼'], forbid: ['アンデッドマン'] } },
    { name: '鉄拳制裁', restricts: { species: ['巨人'] } },
    { name: 'ドラゴンスイング', restricts: { species: ['巨人'] } },
    { name: '聖人君子', restricts: { species: ['巨人'], forbid: ['アンデッドマン'] } },
    { name: '天狗の陣羽織', restricts: { species: ['天狗'] } },
    { name: '天馬行空', restricts: { species: ['天狗'], forbid: ['アンデッドマン'] } },
    { name: 'ブースター', restricts: { species: ['サイボーグ'] } },
    { name: 'HP増幅', restricts: { species: ['サイボーグ'] } },
    { name: '狙撃仕様', restricts: { species: ['サイボーグ'] } },
    { name: 'ピットシステム', restricts: { genders: ['不明'], species: ['サイボーグ'] } },
    { name: '機動装甲', restricts: { species: ['サイボーグ'] } },
    { name: '常在戦場', restricts: { species: ['サイボーグ'], forbid: ['アンデッドマン'] } },
]
