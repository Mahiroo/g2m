import { ISkill } from '../i-skill';

/**
 * 成長スキル情報インタフェース.
 */
export interface IGrowthRatio extends ISkill {
    /**
     * 成長倍率.
     */
    growthRatio?: number;
}
