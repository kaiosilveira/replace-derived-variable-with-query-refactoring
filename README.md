[![Continuous Integration](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace Derived Variable With Query

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
class Clz {
  get discountedTotal() {
    return this._discountedTotal;
  }

  set discount(aNumber) {
    const old = this._discount;
    this._discount = aNumber;
    this._discountedTotal += old - aNumber;
  }
}
```

</td>

<td>

```javascript
class Clz {
  get discountedTotal() {
    return this._baseTotal - this._discount;
  }

  set discount(aNumber) {
    this._discount = aNumber;
  }
}
```

</td>
</tr>
</tbody>
</table>

In exact sciences, we build new things on top of truth, there's the only way we can be sure our work is correct. Therefore, the source of the truth itself is paramount for all programs, and it's not difficult to understand why having multiple sources of truth brings additional confusion and complexity. This refactoring helps remove these multiple sources.

## Working example

We have two working examples, both extracted from the book, representing the same scenario: a program that holds a production plan. The first example looks into the case where there's only one source for the derived variable, while the second looks into the case where there are multiple sources.

### Single source

For this scenario, the `ProductionPlan` class looks like this:

```javascript
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
```

We want to get rid of the private `_production` variable, transforming it into a getter that's dynamically calculated based on the `adjustments`.

#### Test suite

The test suite for the `ProductionPlan` class covers the edge case where no adjustments were made, as well as a regular case where an adjustment was made, making sure that `production` reflects this fact.

```javascript
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
```

With these tests in place, we're safe to proceed.

#### Steps

We don't want to break the code that's currently working, so we start by introducing a `calculatedProduction` getter. This getter will be used as a bridge between the current behavior and our envisioned behavior (where the derived `_production` field no longer exists):

```diff
+++ b/src/single-source/index.js
@@ -8,6 +8,10 @@ export class ProductionPlan {
     return this._production;
   }
+  get calculatedProduction() {
+    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
+  }
+
   applyAdjustment(anAdjustment) {
     this._adjustments.push(anAdjustment);
     this._production += anAdjustment.amount;
```

Then, as a sanity check, we [introduce an assertion](https://github.com/kaiosilveira/introduce-assertion-refactoring) to make sure `production` has the same value as `calculatedProduction`:

```diff
+++ b/src/single-source/index.js
@@ -1,3 +1,5 @@
+import assert from 'node:assert';
+
 export class ProductionPlan {
   constructor() {
     this._adjustments = [];
@@ -5,6 +7,7 @@ export class ProductionPlan {
   }
   get production() {
+    assert(this._production === this.calculatedProduction);
     return this._production;
   }
```

Our tests are still passing, so we can move forward with confidence. We can now return the value of `calculatedProduction` at the `production` getter:

```diff
+++ b/src/single-source/index.js
@@ -8,7 +8,7 @@ export class ProductionPlan {
   get production() {
     assert(this._production === this.calculatedProduction);
-    return this._production;
+    return this.calculatedProduction;
   }
   get calculatedProduction() {
```

The assertion is no longer needed, so we remove it:

```diff
+++ b/src/single-source/index.js
@@ -1,5 +1,3 @@
-import assert from 'node:assert';
-
 export class ProductionPlan {
   constructor() {
     this._adjustments = [];
@@ -7,7 +5,6 @@ export class ProductionPlan {
   }
   get production() {
-    assert(this._production === this.calculatedProduction);
     return this.calculatedProduction;
   }
```

Finally, we can [inline](https://github.com/kaiosilveira/inline-variable-refactoring) `calculatedProudction` into `production` getter:

```diff
+++ b/src/single-source/index.js
@@ -5,10 +5,6 @@ export class ProductionPlan {
   }
   get production() {
-    return this.calculatedProduction;
-  }
-
-  get calculatedProduction() {
     return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
   }
```

And then, we can remove the `_production` field:

```diff
+++ b/src/single-source/index.js
@@ -1,7 +1,6 @@
 export class ProductionPlan {
   constructor() {
     this._adjustments = [];
-    this._production = 0;
   }
   get production() {
@@ -10,6 +9,5 @@ export class ProductionPlan {
   applyAdjustment(anAdjustment) {
     this._adjustments.push(anAdjustment);
-    this._production += anAdjustment.amount;
   }
 }
```

And that's it!

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                                 | Message                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [fb1df73](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/fb1df73e53c53d4ed02adbba95184eb6e277b00c) | introduce `calculatedProduction` getter                          |
| [be30da4](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/be30da40a4bdeb57633ec38738d301f0d7e672c5) | assert `production` has the same value as `calculatedProduction` |
| [e873ca2](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/e873ca275364c502f609e868836108a535a2ce91) | return `calculatedProduction` at `production` getter             |
| [53d995a](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/53d995af55206ebece0170821647f3e636a2652d) | remove assertion for `production === calculatedProduction`       |
| [c14966c](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/c14966c1bbc70b74eaf11c155bfa72da65cdc6b7) | inline `calculatedProudction` into `production` getter           |
| [af4e704](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/af4e7049bb77c985e5c2433b848202ab0b3f5ddb) | remove `_production` field                                       |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commits/main).

### Multiple sources

This scenario has the same `ProductionPlan` class but is a bit more involved since the class' constructor now also accepts an initial value for `production`. The class looks like this:

```javascript
export class ProductionPlan {
  constructor(production) {
    this._adjustments = [];
    this._production = production;
  }

  get production() {
    return this._production;
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
  }
}
```

#### Test suite

The test suite for `ProductionPlan` is fairly similar to the one in the previous example, with the only difference being a test that covers the case where we provide an initial value to `production`. It looks like this:

```javascript
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
```

With these tests in place, we can move forward.

#### Steps

We start by [splitting](https://github.com/kaiosilveira/split-variable-refactoring) the `production` variable:

```diff
+++ b/src/multiple-sources/index.js
@@ -1,15 +1,16 @@
 export class ProductionPlan {
   constructor(production) {
+    this._initialProduction = production;
+    this._productionAccumulator = 0;
     this._adjustments = [];
-    this._production = production;
   }
   get production() {
-    return this._production;
+    return this._initialProduction + this._productionAccumulator;
   }
   applyAdjustment(anAdjustment) {
     this._adjustments.push(anAdjustment);
-    this._production += anAdjustment.amount;
+    this._productionAccumulator += anAdjustment.amount;
   }
 }
```

Then we can proceed with the same approach used in the previous example. We introduce a `calculatedProduction` getter:

```diff
+++ b/src/multiple-sources/index.js
@@ -9,6 +9,10 @@ export class ProductionPlan {
     return this._initialProduction + this._productionAccumulator;
   }
+  get calculatedProduction() {
+    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
+  }
+
   applyAdjustment(anAdjustment) {
     this._adjustments.push(anAdjustment);
     this._productionAccumulator += anAdjustment.amount;
```

Then, we add an assertion to make sure `productionAccumulator` equals `calculatedProduction`:

```diff
+++ b/src/multiple-sources/index.js
@@ -1,3 +1,5 @@
+import assert from 'node:assert';
+
 export class ProductionPlan {
   constructor(production) {
     this._initialProduction = production;
@@ -6,6 +8,7 @@ export class ProductionPlan {
   }
   get production() {
+    assert(this._productionAccumulator === this.calculatedProduction);
     return this._initialProduction + this._productionAccumulator;
   }
```

Then we start using `calculatedProduction` at the `production` getter:

```diff
+++ b/src/multiple-sources/index.js
@@ -9,7 +9,7 @@ export class ProductionPlan {
   get production() {
     assert(this._productionAccumulator === this.calculatedProduction);
-    return this._initialProduction + this._productionAccumulator;
+    return this._initialProduction + this.calculatedProduction;
   }
   get calculatedProduction() {
```

And we can now safely remove the assertion:

```diff
+++ b/src/multiple-sources/index.js
@@ -1,5 +1,3 @@
-import assert from 'node:assert';
-
 export class ProductionPlan {
   constructor(production) {
     this._initialProduction = production;
@@ -8,7 +6,6 @@ export class ProductionPlan {
   }
   get production() {
-    assert(this._productionAccumulator === this.calculatedProduction);
     return this._initialProduction + this.calculatedProduction;
   }
```

Finally, we can [inline](https://github.com/kaiosilveira/inline-variable-refactoring) `calculatedProduction`:

```diff
+++ b/src/multiple-sources/index.js
@@ -6,11 +6,7 @@ export class ProductionPlan {
   }
   get production() {
-    return this._initialProduction + this.calculatedProduction;
-  }
-
-  get calculatedProduction() {
-    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
+    return this._initialProduction + this._adjustments.reduce((sum, a) => sum + a.amount, 0);
   }
   applyAdjustment(anAdjustment) {
```

And that's it!

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                                 | Message                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| [0f0eae1](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/0f0eae1acf6ebd10e59e243a490a0021e5855e15) | split `production` variable                                  |
| [5c2466b](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/5c2466b4a5874b4cd9754995799815f6cf5bc768) | introduce `calculatedProduction` getter                      |
| [744a4a1](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/744a4a1ab447ef7e0abbf9e6f82a5241ef951663) | assert `productionAccumulator` equals `calculatedProduction` |
| [8c5d077](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/8c5d07774e34df516c5892aff33941c3610b4e74) | return `calculatedProduction` at `production` getter         |
| [20129d6](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/20129d692e3eb7b8cae4de62038fc83fec4e2301) | remove assertion for `calculatedProduction`                  |
| [a31ea87](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/a31ea87022a3c9d182bd42e64b9e58a933a09a20) | inline `calculatedProduction`                                |
| [4a362f1](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commit/4a362f17810ff2833df6c67361d75c8117859749) | remove `_productionAccumulator` field                        |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-derived-variable-with-query-refactoring/commits/main).
