/**
 * 項目定義インタフェース.
 */
export interface IFieldInfo {
    type: 'other' | 'num' | 'signedNum' | 'separatedNum' | 'date';
    name: string;
    shortName?: string;
    symbole?: string;
    pattern?: RegExp;
}
/**
 * 項目定義リストインタフェース.
 */
export interface IFields {
    [key: string]: IFieldInfo;
}
/**
 * 項目定義リスト.
 */
export const Fields: IFields = {
    'name': { type: 'other', name: '名称', symbole: '名' },
    'displayName': { type: 'other', name: '表示名称', shortName: '名称', symbole: '' },
    'category': { type: 'other', name: '種別', shortName: '種別', symbole: '' },
    'price': { type: 'separatedNum', name: '価格', shortName: '価格', symbole: '' },
    'battle': { type: 'other', name: '戦闘能力値', shortName: '戦闘', symbole: '' },
    'atk': { type: 'num', name: '攻撃力', shortName: '攻撃', symbole: '' },
    'hit': { type: 'num', name: '命中精度', shortName: '命中', symbole: '' },
    'crt': { type: 'num', name: '必殺率', shortName: '必殺', symbole: '' },
    'cnt': { type: 'num', name: '攻撃回数', shortName: '回数', symbole: '' },
    'def': { type: 'num', name: '防御力', shortName: '防御', symbole: '' },
    'eva': { type: 'num', name: '回避能力', shortName: '回避', symbole: '' },
    'mat': { type: 'num', name: '魔法攻撃力', shortName: '魔攻', symbole: '' },
    'rcv': { type: 'num', name: '魔法回復量', shortName: '回復', symbole: '' },
    'mdf': { type: 'num', name: '魔法防御力', shortName: '魔防', symbole: '' },
    'trp': { type: 'num', name: '罠解除能力', shortName: '罠解', symbole: '' },
    'mhp': { type: 'num', name: '最大ＨＰ', shortName: 'ＨＰ', symbole: '' },
    'equ': { type: 'num', name: '装備可能数', shortName: '装数', symbole: '' },
    'equipmentCount': { type: 'num', name: '装備可能数', shortName: '装数', symbole: '' },
    'dmg': { type: 'num', name: '追加ダメージ', shortName: '追加', symbole: '' },
    'base': { type: 'other', name: '基本能力値', shortName: '戦闘', symbole: '' },
    'str': { type: 'signedNum', name: '力', shortName: '力', symbole: '力' },
    'int': { type: 'signedNum', name: '知恵', shortName: '知恵', symbole: '知' },
    'men': { type: 'signedNum', name: '精神', shortName: '精神', symbole: '精' },
    'vit': { type: 'signedNum', name: '体力', shortName: '体力', symbole: '体' },
    'agi': { type: 'signedNum', name: '敏捷', shortName: '敏捷', symbole: '敏' },
    'luc': { type: 'signedNum', name: '運', shortName: '運', symbole: '運' },
    'skills': { type: 'other', name: 'スキル', shortName: 'スキル', symbole: '' },
    'updateDate': { type: 'date', name: '更新日時', shortName: '更新', symbole: '' }
};

/**
 * アイテム項目キー値リスト.
 */
export const ItemFieldKeys = {
    All: [
        'displayName', 'category', 'price',
        'atk', 'hit', 'crt', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp', 'equ',
        'str', 'int', 'men', 'vit', 'agi', 'luc',
        'skills', 'updateDate',
    ],
    Base: ['str', 'int', 'men', 'vit', 'agi', 'luc'],
    Battle: ['atk', 'hit', 'crt', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp'],
    Common: ['displayName', 'category', 'price', 'equ', 'updateDate'],
    EquipmentRatio: ['atk', 'hit', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp'],
    ItemRatio: ['atk', 'hit', 'crt', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp'],
    Skills: ['skills'],
}

/**
 * 能力値パラメータキー.
 */
export const PARAMETER_KEYS = {
    ALL: [
        'atk', 'hit', 'crt', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp', 'equ',
        'str', 'int', 'men', 'vit', 'agi', 'luc'
    ],
    BASE: [
        'str', 'int', 'men', 'vit', 'agi', 'luc'
    ],
    BATTLE: [
        'atk', 'hit', 'crt', 'cnt', 'def', 'eva', 'mat', 'rcv', 'mdf', 'trp', 'mhp', 'equ'
    ]
};

/**
 * アイテム称号付与フラグ.
 */
export enum AddTitleFlg {
    None = 0,
    Material = 1,
    Result = 2,
}

/**
 * アイテム合成フラグ.
 */
export enum CompsiteFlg {
    None = 0,
    Material = 1,
    Other = 2,
    Result = 4,
    All = 7,
}

/**
 * 称号継承フラグ.
 */
export enum TitleInheritanceFlg {
    None = 0,
    Material = 1,
    Result = 2,
    All = 3,
}

/**
 * 掘り出し物表示フラグ.
 */
export enum AcquisitionFlg {
    /**
     * 掘り出し物を表示.
     */
    acquisition = 1,
    /**
     * 通常アイテムを表示.
     */
    normal = 2,
    /**
     * 全て表示.
     */
    all = 3,
}

/**
 * 称号表示制限フラグ.
 */
export enum TitleLimitFlg {
    /**
     * 最高称号のみ.
     */
    maxOnly = 1,
    /**
     * 最高称号まで.
     */
    max = 2,
    /**
     * 全て表示.
     */
    all = 3,
}