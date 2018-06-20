import { IItem } from './i-item';
import { IParameters } from './i-parameters';

/**
 * 職業情報インタフェース.
 */
export interface IJob extends IItem {
    /**
     * 必要能力値.
     */
    necessaryParams?: IParameters;
    /**
     * 下位職業名.
     */
    lower?: string;
    /**
     * 上位職業名.
     */
    upper?: string;
}
