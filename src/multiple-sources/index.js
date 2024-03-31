import assert from 'node:assert';

export class ProductionPlan {
  constructor(production) {
    this._initialProduction = production;
    this._productionAccumulator = 0;
    this._adjustments = [];
  }

  get production() {
    assert(this._productionAccumulator === this.calculatedProduction);
    return this._initialProduction + this._productionAccumulator;
  }

  get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._productionAccumulator += anAdjustment.amount;
  }
}
