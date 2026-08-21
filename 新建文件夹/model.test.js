diff --git a/test/model.test.js b/test/model.test.js
new file mode 100644
index 0000000000000000000000000000000000000000..8b60167546b06d4c707adb276be5791dd0412ad8
--- /dev/null
+++ b/test/model.test.js
@@ -0,0 +1,23 @@
+import test from 'node:test';
+import assert from 'node:assert/strict';
+import { calculateDashboard, currency } from '../src/model.js';
+
+test('calculates salary, revenue, commission, reserve, profit and distribution', () => {
+  const result = calculateDashboard({
+    roles: [{ id: 'sales', name: '销售', salary: 4000, headcounts: [2, 3, 4, 5, 6] }],
+    products: [{ name: '建站套餐2', price: 4999, commissionRate: 0.3, reserveRate: 0.05 }],
+    costs: [{ name: '办公室', amount: 60000 }],
+    scenarios: [{ id: 's1', name: '预测', year: 1, sales: { 建站套餐2: 36 } }],
+  });
+  assert.deepEqual(result.salaryByYear, [96000, 144000, 192000, 240000, 288000]);
+  assert.equal(result.annualFixedCosts, 60000);
+  assert.equal(result.scenarios[0].revenue, 179964);
+  assert.equal(result.scenarios[0].commission, 53989.2);
+  assert.equal(result.scenarios[0].reserve, 8998.2);
+  assert.equal(Math.round(result.scenarios[0].profit * 10) / 10, -39023.4);
+  assert.equal(Math.round(result.scenarios[0].distribution.shareholder * 100) / 100, -19511.7);
+});
+
+test('formats negative currency with parentheses', () => {
+  assert.equal(currency(-1521500), '(¥1,521,500.00)');
+});
