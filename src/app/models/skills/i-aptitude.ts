import { ISkill } from '../i-skill';

/**
 * 才能スキル情報インタフェース.
 */
export interface IAptitude extends ISkill {
    /**
     * 装備品倍率情報.
     */
    aptitude?: {
        /**
         * 対象パラメータ.
         */
        key: string;
        /**
         * 無能フラグ.
         */
        lackOfTalent?: boolean;
    }
}
