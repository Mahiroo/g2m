import { ISkill } from './i-skill';

/**
 * 所有スキル情報インタフェース.
 */
export interface IAttachedSkill extends ISkill {
    /**
     * 所有数.
     */
    count?: number;
    /**
     * 固定フラグ.
     */
    static?: boolean;
}
