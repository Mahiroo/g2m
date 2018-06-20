/**
 * 能力値情報インタフェース.
 */
export interface IParameters {
    /**
     * インデクサ.
     */
    [key: string]: any;
    /**
     * 力.
     */
    str?: number;
    /**
     * 知力.
     */
    int?: number;
    /**
     * 精神.
     */
    men?: number;
    /**
     * 体力.
     */
    vit?: number;
    /**
     * 敏捷.
     */
    agi?: number;
    /**
     * 運.
     */
    luc?: number;
    /**
     * 攻撃力.
     */
    atk?: number;
    /**
     * 命中精度.
     */
    hit?: number;
    /**
     * 攻撃回数.
     */
    cnt?: number;
    /**
     * 必殺率.
     */
    crt?: number;
    /**
     * 防御力.
     */
    def?: number;
    /**
     * 回避能力.
     */
    eva?: number;
    /**
     * 魔法攻撃力.
     */
    mat?: number;
    /**
     * 魔法回復量.
     */
    rcv?: number;
    /**
     * 魔法防御力.
     */
    mdf?: number;
    /**
     * 罠解除能力.
     */
    trp?: number;
    /**
     * 最大ＨＰ.
     */
    mhp?: number;
    /**
     * 追加ダメージ.
     */
    dmg?: number;
}
