import { ProductionPlan } from './index';

describe('ProductionPlan', () => {
  it('should return product as zero if no adjustments were made', () => {
    const productionPlan = new ProductionPlan();
    expect(productionPlan.production).toBe(0);
  });

  it('should return product as 10 if an adjusment of 10 monetary units were made', () => {
    const productionPlan = new ProductionPlan();
    productionPlan.applyAdjustment({ amount: 10 });
    expect(productionPlan.production).toBe(10);
  });
});
