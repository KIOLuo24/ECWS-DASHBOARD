diff --git a/src/main.js b/src/main.js
new file mode 100644
index 0000000000000000000000000000000000000000..1af7927c5c86bcc0d3b7e9f0f17fe916fbff4e12
--- /dev/null
+++ b/src/main.js
@@ -0,0 +1,63 @@
+import { calculateDashboard, currency } from './model.js';
+import './styles.css';
+
+const uid = () => Math.random().toString(36).slice(2);
+const years = [1, 2, 3, 4, 5];
+let state = {
+  roles: [
+    { id: uid(), name: '项目经理', salary: 10000, headcounts: [1, 1, 1, 1, 1] },
+    { id: uid(), name: '开发经理', salary: 15000, headcounts: [1, 1, 1, 1, 1] },
+    { id: uid(), name: '运维', salary: 6000, headcounts: [0, 0, 1, 1, 1] },
+    { id: uid(), name: '销售', salary: 4000, headcounts: [2, 3, 4, 6, 6] },
+    { id: uid(), name: '客服', salary: 6000, headcounts: [0, 0, 1, 2, 3] },
+  ],
+  products: [
+    { id: uid(), name: '建站套餐1', price: 2999, commissionRate: 0.3, reserveRate: 0.05 },
+    { id: uid(), name: '建站套餐2', price: 4999, commissionRate: 0.3, reserveRate: 0.05 },
+    { id: uid(), name: '建站套餐3', price: 7999, commissionRate: 0.3, reserveRate: 0.05 },
+    { id: uid(), name: '运营套餐1', price: 13999, commissionRate: 0.2, reserveRate: 0.05 },
+    { id: uid(), name: '运营套餐2', price: 18999, commissionRate: 0.15, reserveRate: 0.05 },
+    { id: uid(), name: '运营套餐3', price: 38999, commissionRate: 0.1, reserveRate: 0.05 },
+  ],
+  costs: [
+    { id: uid(), name: '办公室', amount: 60000 },
+    { id: uid(), name: '域名', amount: 1500 },
+    { id: uid(), name: '服务器', amount: 8000 },
+  ],
+  scenarios: [
+    { id: uid(), name: '预测公式', year: 5, sales: {} },
+    { id: uid(), name: '第一年签25', year: 1, sales: { 建站套餐2: 36, 运营套餐2: 24, 运营套餐3: 12 } },
+  ],
+};
+const root = document.getElementById('root');
+const setState = (patch) => { state = { ...state, ...patch }; render(); };
+const input = (value, path, type = 'number', step = 1) => `<input data-path="${path}" type="${type}" min="0" step="${step}" value="${value ?? ''}">`;
+function render() {
+  const data = calculateDashboard(state);
+  root.innerHTML = `<main><header><p>经营测算看板</p><h1>团队、套餐、成本与利润分配，一屏联动测算</h1></header>
+  <section class="grid cards">${metric('最高利润', currency(Math.max(...data.scenarios.map(s => s.profit))))}${metric('年固定成本', currency(data.annualFixedCosts))}${metric('员工年工资峰值', currency(Math.max(...data.salaryByYear)))}${metric('套餐数量', `${state.products.length} 个`)}</section>
+  <section class="panel"><div class="title"><h2>团队规模与工资</h2><button data-action="add-role">＋ 新增岗位</button></div><div class="table-wrap"><table><thead><tr><th>人员</th>${years.map(y=>`<th>人数/第${y}年</th>`).join('')}<th>月工资</th>${years.map(y=>`<th>工资/第${y}年</th>`).join('')}<th></th></tr></thead><tbody>${state.roles.map((r,ri)=>`<tr><td>${input(r.name,`roles.${ri}.name`,'text')}</td>${r.headcounts.map((h,hi)=>`<td>${input(h,`roles.${ri}.headcounts.${hi}`)}</td>`).join('')}<td>${input(r.salary,`roles.${ri}.salary`,'number',500)}</td>${data.roleAnnualCosts[r.id].map(v=>`<td>${currency(v)}</td>`).join('')}<td><button class="icon" data-remove-role="${ri}">删</button></td></tr>`).join('')}</tbody><tfoot><tr><td colspan="7">总工资</td>${data.salaryByYear.map(v=>`<td>${currency(v)}</td>`).join('')}<td></td></tr></tfoot></table></div></section>
+  <section class="grid two">${costEditor()}${productEditor()}</section>${scenarioTable(data)}</main>`;
+}
+function metric(t,v){return `<article class="metric"><span>${t}</span><strong>${v}</strong></article>`}
+function costEditor(){return `<section class="panel"><div class="title"><h2>场地/设备与自定义成本</h2><button data-action="add-cost">＋ 新增</button></div>${state.costs.map((c,i)=>`<div class="row"><label>名称${input(c.name,`costs.${i}.name`,'text')}</label><label>金额${input(c.amount,`costs.${i}.amount`)}</label><button class="icon" data-remove-cost="${i}">删</button></div>`).join('')}</section>`}
+function productEditor(){return `<section class="panel"><div class="title"><h2>产品套餐、提成与风险金</h2><button data-action="add-product">＋ 新增套餐</button></div>${state.products.map((p,i)=>`<div class="row product"><label>套餐${input(p.name,`products.${i}.name`,'text')}</label><label>定价${input(p.price,`products.${i}.price`)}</label><label>提成%${input(p.commissionRate*100,`products.${i}.commissionRatePercent`)}</label><label>风险金%${input(p.reserveRate*100,`products.${i}.reserveRatePercent`)}</label><strong>${currency(p.price*p.commissionRate)}/单</strong><button class="icon" data-remove-product="${i}">删</button></div>`).join('')}</section>`}
+function scenarioTable(data){return `<section class="panel"><div class="title"><h2>预测公式与年利润分配</h2><button data-action="add-scenario">＋ 新增预测</button></div><div class="table-wrap"><table><thead><tr><th>场景</th><th>第几年工资</th>${state.products.map(p=>`<th>${p.name}</th>`).join('')}<th>收入</th><th>工资成本</th><th>提成</th><th>固定成本</th><th>风险金</th><th>利润</th><th>利润率</th><th>股东50%</th><th>项目经理10%</th><th>开发经理10%</th><th>再投入20%</th><th>运营5%</th><th>奖金池5%</th></tr></thead><tbody>${data.scenarios.map((s,si)=>`<tr class="${s.profit>=0?'ok':'bad'}"><td>${input(s.name,`scenarios.${si}.name`,'text')}</td><td>${input(s.year,`scenarios.${si}.year`)}</td>${state.products.map(p=>`<td>${input(s.sales[p.name]||0,`scenarios.${si}.sales.${p.name}`)}</td>`).join('')}<td>${currency(s.revenue)}</td><td>${currency(s.salaryCost)}</td><td>${currency(s.commission)}</td><td>${currency(s.fixedCost)}</td><td>${currency(s.reserve)}</td><td>${currency(s.profit)}</td><td>${s.margin}</td>${Object.values(s.distribution).map(v=>`<td>${currency(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`}
+root.addEventListener('input', (event) => {
+  const path = event.target.dataset.path; if (!path) return;
+  const parts = path.split('.'); let target = state;
+  for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
+  const key = parts.at(-1); const value = event.target.type === 'number' ? Number(event.target.value || 0) : event.target.value;
+  if (key === 'commissionRatePercent') target.commissionRate = value / 100; else if (key === 'reserveRatePercent') target.reserveRate = value / 100; else target[key] = value;
+  render();
+});
+root.addEventListener('click', (event) => {
+  const button = event.target.closest('button'); if (!button) return;
+  const a = button.dataset.action;
+  if (a === 'add-role') setState({ roles: [...state.roles, { id: uid(), name: '新岗位', salary: 6000, headcounts: [0,0,0,0,0] }] });
+  if (a === 'add-cost') setState({ costs: [...state.costs, { id: uid(), name: '新成本', amount: 0 }] });
+  if (a === 'add-product') setState({ products: [...state.products, { id: uid(), name: '新套餐', price: 0, commissionRate: 0.1, reserveRate: 0.05 }] });
+  if (a === 'add-scenario') setState({ scenarios: [...state.scenarios, { id: uid(), name: '新预测', year: 1, sales: {} }] });
+  ['role','cost','product'].forEach(kind => { const index = button.dataset[`remove${kind[0].toUpperCase()}${kind.slice(1)}`]; if (index !== undefined) setState({ [`${kind}s`]: state[`${kind}s`].filter((_, i) => i !== Number(index)) }); });
+});
+render();
