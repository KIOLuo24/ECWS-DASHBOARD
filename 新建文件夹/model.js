diff --git a/src/model.js b/src/model.js
new file mode 100644
index 0000000000000000000000000000000000000000..20c2f68a3cb957525b2e5e38ed45e408ecafc98a
--- /dev/null
+++ b/src/model.js
@@ -0,0 +1,53 @@
+export function currency(value) {
+  const abs = Math.abs(value || 0);
+  const formatted = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(abs);
+  return value < 0 ? `(${formatted})` : formatted;
+}
+
+const money = (value) => Math.round(value * 100) / 100;
+
+export function calculateDashboard({ roles, products, costs, scenarios }) {
+  const roleAnnualCosts = Object.fromEntries(
+    roles.map((role) => [role.id, role.headcounts.map((count) => count * role.salary * 12)]),
+  );
+  const salaryByYear = [0, 1, 2, 3, 4].map((yearIndex) =>
+    roles.reduce((sum, role) => sum + roleAnnualCosts[role.id][yearIndex], 0),
+  );
+  const annualFixedCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
+  const productByName = Object.fromEntries(products.map((product) => [product.name, product]));
+  const scenarioResults = scenarios.map((scenario) => {
+    const salesEntries = Object.entries(scenario.sales || {});
+    const revenue = money(salesEntries.reduce((sum, [name, quantity]) => sum + (productByName[name]?.price || 0) * quantity, 0));
+    const commission = money(salesEntries.reduce((sum, [name, quantity]) => {
+      const product = productByName[name];
+      return sum + (product ? product.price * product.commissionRate * quantity : 0);
+    }, 0));
+    const reserve = money(salesEntries.reduce((sum, [name, quantity]) => {
+      const product = productByName[name];
+      return sum + (product ? product.price * product.reserveRate * quantity : 0);
+    }, 0));
+    const salaryCost = salaryByYear[Math.min(4, Math.max(0, Number(scenario.year || 1) - 1))] || 0;
+    const fixedCost = annualFixedCosts;
+    const profit = money(revenue - salaryCost - commission - reserve - fixedCost);
+    const distribution = {
+      shareholder: profit * 0.5,
+      projectManager: profit * 0.1,
+      developmentManager: profit * 0.1,
+      reinvestment: profit * 0.2,
+      operationsLoss: profit * 0.05,
+      bonusPool: profit * 0.05,
+    };
+    return {
+      ...scenario,
+      revenue,
+      salaryCost,
+      commission,
+      reserve,
+      fixedCost,
+      profit,
+      margin: revenue ? `${Math.round((profit / revenue) * 100)}%` : '#DIV/0!',
+      distribution,
+    };
+  });
+  return { roleAnnualCosts, salaryByYear, annualFixedCosts, scenarios: scenarioResults };
+}
