import { ISkill } from '../i-skill';

/**
 * 装備アイテム倍率情報インタフェース.
 */
export interface IEquipmentRatio extends ISkill {
    /**
     * 装備品倍率情報.
     */
    equipmentRatios?: IEquipmentRatioDetail[];
}
export interface IEquipmentRatioDetail {
    group: string;
    ratio?: number;
    level?: boolean;
}