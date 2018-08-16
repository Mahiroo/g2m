import { ISkill } from '../i-skill';

/**
 * 変換スキル情報インタフェース.
 */
export interface IConvertParam extends ISkill {
    /**
     * 変換スキル詳細情報リスト.
     */
    convertParam?: IConvertParamDetail[];
}

/**
 * 変換スキル詳細情報インタフェース.
 */
export interface IConvertParamDetail {
    /**
     * 変換元パラメータキー.
     */
    fromKey?: string;
    /**
     * 変換先パラメータキー.
     */
    toKey?: string;
    /**
     * 変換率.
     */
    rate?: number;
}
