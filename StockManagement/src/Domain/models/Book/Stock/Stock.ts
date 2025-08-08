import { QuantityAvailable } from "./QuantityAvailable/QuantityAvailable";
import { Status, StatusEnum } from "./Status/Status";
import { StockId } from "./StockId/StockId";

export class Stock {
    /**
     * private constructorにしている理由は、
     * create メソッドと reconstruct メソッドのみでエンティティを生成することを強制するためです。
     * この後create メソッドでは、エンティティの生成時の制御 (ビジネスルールの適用) を行います。
     * reconstruct メソッドは、データベースなどから読み込んだデータをもとにエンティティを再構築する際に使用します。
     * reconstruct メソッドはchapter12 リポジトリで利用します。
     */
    private constructor(
        private readonly _id: StockId,
        private _quantityAvailable: QuantityAvailable,
        private _status: Status
    ){}

    static create(): Stock {
        const defaultId = new StockId()
        const defaultQuantityAvailable = new QuantityAvailable(0);
        const defaultStatus = new Status(StatusEnum.OutOfStock); 

        return new Stock(defaultId, defaultQuantityAvailable, defaultStatus);
    }

    public delete() {
        if (this.status.value !== StatusEnum.OutOfStock) {
            throw new Error("在庫がある場合削除できません。")
        }
    }

    public changeStatus(newStatus: Status): void {
        this._status = newStatus;
    }

    // 在庫数を増やす
    increaseQuantity(amount: number): void {
        if (amount < 0) {
            throw new Error("増加量は0以上でなければなりません。");
        }

        const newQuantity = this._quantityAvailable.increment(amount).value;

        // 在庫数が10以下ならステータスを残りわずかにする
        if (newQuantity <= 10) {
            this.changeStatus(new Status(StatusEnum.LowStock));
        }
        this._quantityAvailable = new QuantityAvailable(newQuantity);
    }

    // 在庫数を減らす
    decreaseQuantity(amount: number): void {
        if (amount < 0) {
            throw new Error("減少量は0以上でなければなりません。");
        }

        const newQuantity = this.quantityAvailable.decrement(amount).value;
        if (newQuantity < 0) {
            throw new Error("減少後の在庫数が0未満になってしまいます。");
        }

        // 在庫数が10以下ならステータスを残りわずかにする
        if (newQuantity <= 10) {
        this.changeStatus(new Status(StatusEnum.LowStock));
        }

        // 在庫数が0になったらステータスを在庫切れにする
        if (newQuantity === 0) {
        this.changeStatus(new Status(StatusEnum.OutOfStock));
        }

        this._quantityAvailable = new QuantityAvailable(newQuantity);
    }

    // エンティティの再構築
    static reconstruct(
        id: StockId,
        quantityAvailable: QuantityAvailable,
        status: Status
    ): Stock {
        return new Stock(id, quantityAvailable, status);
    }

    get id(): StockId {
        return this._id;
    }

    get quantityAvailable(): QuantityAvailable {
        return this._quantityAvailable;
    }

    get status(): Status {
        return this._status;
    }
}