import { ProductionPlan } from './index';

describe('multiple sources', () => {
  describe('ProductionPlan', () => {
    it('should return the predefined production if no adjustments were made', () => {
      const productionPlan = new ProductionPlan(10);
      expect(productionPlan.production).toBe(10);
    });

    it('should return the pre-defined proudction plus the adjustments made', () => {
      const productionPlan = new ProductionPlan(10);
      productionPlan.applyAdjustment({ amount: 10 });
      expect(productionPlan.production).toBe(20);
    });
  });
});
