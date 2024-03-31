export class ProductionPlan {
  constructor(production) {
    this._initialProduction = production;
    this._productionAccumulator = 0;
    this._adjustments = [];
  }

  get production() {
    return this._initialProduction + this._productionAccumulator;
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._productionAccumulator += anAdjustment.amount;
  }
}
