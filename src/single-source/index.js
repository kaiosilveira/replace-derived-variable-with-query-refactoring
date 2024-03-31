export class ProductionPlan {
  constructor() {
    this._adjustments = [];
    this._production = 0;
  }

  get production() {
    return this._production;
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
  }
}
