// Initial data from the Excel template
let needs = [
    { id: 1, name: 'Rent', cost: 510.0 },
    { id: 2, name: 'Groceries', cost: 300.0 },
    { id: 3, name: 'Car Insurance', cost: 100.0 },
    { id: 4, name: 'Gas', cost: 40.0 }
];

let wants = [
    { id: 1, name: 'Shopping', cost: 150.0 },
    { id: 2, name: 'Games', cost: 100.0 },
    { id: 3, name: 'Subscriptions', cost: 25.0 }
];


// Target percentages
const TARGET_NEEDS = 0.65;
const TARGET_WANTS = 0.25;
const TARGET_SAVINGS = 0.10;

// Elements
const allowanceInput = document.getElementById('monthly-allowance');
const needsListEl = document.getElementById('needs-list');
const wantsListEl = document.getElementById('wants-list');

const totalNeedsEl = document.getElementById('total-needs');
const totalWantsEl = document.getElementById('total-wants');
const totalSavingsEl = document.getElementById('total-savings');

const percentNeedsEl = document.getElementById('percent-needs');
const percentWantsEl = document.getElementById('percent-wants');
const percentSavingsEl = document.getElementById('percent-savings');

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function renderList(type) {
    const list = type === 'needs' ? needs : wants;
    const container = type === 'needs' ? needsListEl : wantsListEl;

    container.innerHTML = '';

    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-item';

        row.innerHTML = `
            <input type="text" class="item-name" value="${item.name}" placeholder="Category" onchange="updateItem('${type}', ${index}, 'name', this.value)">
            <input type="number" class="item-cost" value="${item.cost}" placeholder="0.00" step="0.01" min="0" onchange="updateItem('${type}', ${index}, 'cost', this.value)">
            <button class="del-btn" onclick="removeItem('${type}', ${index})">✕</button>
        `;

        container.appendChild(row);
    });
}

function calculateTotals() {
    const allowance = parseFloat(allowanceInput.value) || 0;

    const needsTotal = needs.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    const wantsTotal = wants.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    const savingsTotal = allowance - needsTotal - wantsTotal;

    const needsPercent = allowance > 0 ? (needsTotal / allowance) * 100 : 0;
    const wantsPercent = allowance > 0 ? (wantsTotal / allowance) * 100 : 0;
    const savingsPercent = allowance > 0 ? (savingsTotal / allowance) * 100 : 0;

    // Update UI
    totalNeedsEl.textContent = `$${needsTotal.toFixed(2)}`;
    totalWantsEl.textContent = `$${wantsTotal.toFixed(2)}`;
    totalSavingsEl.textContent = `$${savingsTotal.toFixed(2)}`;

    percentNeedsEl.textContent = `${needsPercent.toFixed(1)}%`;
    percentWantsEl.textContent = `${wantsPercent.toFixed(1)}%`;
    percentSavingsEl.textContent = `${savingsPercent.toFixed(1)}%`;

    // Manage colors based on targets
    manageStatusColors(needsPercent, wantsPercent, savingsPercent);
}

function manageStatusColors(needsP, wantsP, savingsP) {
    const needsCard = document.querySelector('.needs-card');
    const wantsCard = document.querySelector('.wants-card');
    const savingsCard = document.querySelector('.savings-card');

    // Needs
    if (needsP > (TARGET_NEEDS * 100 + 5)) {
        needsCard.style.background = 'var(--danger)';
    } else {
        needsCard.style.background = 'var(--primary-light)';
    }

    // Wants
    if (wantsP > (TARGET_WANTS * 100 + 5)) {
        wantsCard.style.background = 'var(--danger)';
    } else {
        wantsCard.style.background = 'var(--warning)';
    }

    // Savings
    if (savingsP < (TARGET_SAVINGS * 100 - 5)) {
        savingsCard.style.background = 'var(--danger)';
    } else if (savingsP >= (TARGET_SAVINGS * 100)) {
        savingsCard.style.background = 'var(--success)';
    } else {
        savingsCard.style.background = 'var(--success)';
    }
}

// Global Actions exposed to window
window.addItem = function (type) {
    if (type === 'needs') {
        needs.push({ id: generateId(), name: '', cost: 0 });
    } else {
        wants.push({ id: generateId(), name: '', cost: 0 });
    }
    renderList(type);
    calculateTotals();
};

window.removeItem = function (type, index) {
    if (type === 'needs') {
        needs.splice(index, 1);
    } else {
        wants.splice(index, 1);
    }
    renderList(type);
    calculateTotals();
};

window.updateItem = function (type, index, field, value) {
    if (type === 'needs') {
        needs[index][field] = field === 'cost' ? parseFloat(value) || 0 : value;
    } else {
        wants[index][field] = field === 'cost' ? parseFloat(value) || 0 : value;
    }
    calculateTotals();
};

// Event Listeners
allowanceInput.addEventListener('input', calculateTotals);

// Initial Render
renderList('needs');
renderList('wants');
calculateTotals();

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const themeText = document.getElementById('theme-text');

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
    if (themeText) themeText.textContent = 'Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
        if (themeText) themeText.textContent = 'Dark Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
        if (themeText) themeText.textContent = 'Light Mode';
    }

    // Attempt to redraw timeline chart to get updated colors
    if (typeof calculateDebtTotals === 'function') {
        calculateDebtTotals();
    }
});

// --- Step 5 Financial Aid Calculator ---
let costsItems = [
    { id: generateId(), name: 'Tuition', amount: 0 },
    { id: generateId(), name: 'ECS Fee', amount: 0 },
    { id: generateId(), name: 'Activity Fee', amount: 0 },
    { id: generateId(), name: 'Health Fee', amount: 0 },
    { id: generateId(), name: 'Communication Fee', amount: 0 }
];

let aidItems = [
    { id: generateId(), name: 'University Grant', amount: 0 },
    { id: generateId(), name: 'FDUL', amount: 0 },
    { id: generateId(), name: 'FDSL', amount: 0 },
    { id: generateId(), name: 'NYS TAP', amount: 0 },
    { id: generateId(), name: 'PELL Grant', amount: 0 }
];

const costsListEl = document.getElementById('costs-list');
const aidListEl = document.getElementById('aid-list');

const aidTotalCosts = document.getElementById('aid-total-costs');
const aidTotalAid = document.getElementById('aid-total-aid');
const aidTotalRefund = document.getElementById('aid-total-refund');

const annCosts = document.getElementById('annually-costs');
const annAid = document.getElementById('annually-aid');
const annRefund = document.getElementById('annually-refund');

const semCosts = document.getElementById('semester-costs');
const semAid = document.getElementById('semester-aid');
const semRefund = document.getElementById('semester-refund');

const monCosts = document.getElementById('monthly-costs');
const monAid = document.getElementById('monthly-aid');
const monRefund = document.getElementById('monthly-refund');

function renderAidList(type) {
    const list = type === 'costs' ? costsItems : aidItems;
    const container = type === 'costs' ? costsListEl : aidListEl;

    container.innerHTML = '';

    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-item';

        row.innerHTML = `
            <input type="text" class="item-name" value="${item.name}" placeholder="Description" onchange="updateAidItem('${type}', ${index}, 'name', this.value)">
            <input type="number" class="item-cost" value="${item.amount}" placeholder="0.00" step="0.01" min="0" onchange="updateAidItem('${type}', ${index}, 'amount', this.value)">
            <button class="del-btn" onclick="removeAidItem('${type}', ${index})">✕</button>
        `;

        container.appendChild(row);
    });
}

function calculateAidTotals() {
    const semesterCosts = costsItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const semesterAid = aidItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const annualCosts = semesterCosts * 2;
    const annualAid = semesterAid * 2;

    const monthlyCosts = annualCosts / 8;
    const monthlyAid = annualAid / 8;

    const semesterRefund = semesterAid - semesterCosts;
    const annualRefund = annualAid - annualCosts;
    const monthlyRefund = monthlyAid - monthlyCosts;

    // Update main summary cards (we'll show semesterly by default for the big cards)
    aidTotalCosts.textContent = `$${semesterCosts.toFixed(2)}`;
    aidTotalAid.textContent = `$${semesterAid.toFixed(2)}`;
    aidTotalRefund.textContent = `$${semesterRefund.toFixed(2)}`;

    // Manage negative refund text colors (if negative, it's a balance due)
    if (semesterRefund < 0) {
        aidTotalRefund.style.color = 'var(--danger-light)';
    } else {
        aidTotalRefund.style.color = 'white'; // reset to default
    }

    // Update breakdowns
    annCosts.textContent = `$${annualCosts.toFixed(2)}`;
    annAid.textContent = `$${annualAid.toFixed(2)}`;
    annRefund.textContent = `$${annualRefund.toFixed(2)}`;
    annRefund.style.color = annualRefund < 0 ? 'var(--danger)' : 'var(--primary)';

    semCosts.textContent = `$${semesterCosts.toFixed(2)}`;
    semAid.textContent = `$${semesterAid.toFixed(2)}`;
    semRefund.textContent = `$${semesterRefund.toFixed(2)}`;
    semRefund.style.color = semesterRefund < 0 ? 'var(--danger)' : 'var(--primary)';

    monCosts.textContent = `$${monthlyCosts.toFixed(2)}`;
    monAid.textContent = `$${monthlyAid.toFixed(2)}`;
    monRefund.textContent = `$${monthlyRefund.toFixed(2)}`;
    monRefund.style.color = monthlyRefund < 0 ? 'var(--danger)' : 'var(--primary)';
}

window.addAidItem = function (type) {
    if (type === 'costs') {
        costsItems.push({ id: generateId(), name: '', amount: 0 });
    } else {
        aidItems.push({ id: generateId(), name: '', amount: 0 });
    }
    renderAidList(type);
    calculateAidTotals();
};

window.removeAidItem = function (type, index) {
    if (type === 'costs') {
        costsItems.splice(index, 1);
    } else {
        aidItems.splice(index, 1);
    }
    renderAidList(type);
    calculateAidTotals();
};

window.updateAidItem = function (type, index, field, value) {
    if (type === 'costs') {
        costsItems[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    } else {
        aidItems[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    }
    calculateAidTotals();
};

// Initial Render for Aid Calculator
renderAidList('costs');
renderAidList('aid');
calculateAidTotals();



// --- Step 6: Debt Snowball Calculator ---
let debts = [
    { name: 'Credit Card', type: 'cc', balance: 1500, rate: 22, monthlyUsage: 50, actualPayment: 150 },
    { name: 'Student Loan', type: 'sl', balance: 15000, rate: 5, monthlyUsage: 0, actualPayment: 600 }
];

const debtListEl = document.getElementById('debt-list');
const totalDebtEl = document.getElementById('total-debt');
const totalPaymentsEl = document.getElementById('total-payments');

function renderDebtList() {
    debtListEl.innerHTML = '';

    debts.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-item';
        row.style.gap = '12px';

        row.innerHTML = `
            <input type="text" class="item-name" style="flex:1" value="${item.name}" placeholder="Loan Name" onchange="updateDebtItem(${index}, 'name', this.value)">
            <select style="width:110px; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--surface); color:var(--text-main)" onchange="updateDebtItem(${index}, 'type', this.value)">
                <option value="cc" ${item.type === 'cc' ? 'selected' : ''}>Credit Card</option>
                <option value="sl" ${item.type === 'sl' ? 'selected' : ''}>Student Loan</option>
                <option value="other" ${item.type === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="number" class="item-cost" style="width:100px" value="${item.balance}" placeholder="0.00" step="0.01" min="0" oninput="updateDebtItem(${index}, 'balance', this.value)">
            <input type="number" class="item-cost" style="width:80px" value="${item.rate}" placeholder="0.00" step="0.01" min="0" oninput="updateDebtItem(${index}, 'rate', this.value)">
            <input type="number" class="item-cost" style="width:100px" value="${item.monthlyUsage !== undefined ? item.monthlyUsage : ''}" placeholder="0.00" step="0.01" min="0" oninput="updateDebtItem(${index}, 'monthlyUsage', this.value)">
            <input type="number" class="item-cost" style="width:100px" value="${item.actualPayment !== undefined ? item.actualPayment : ''}" placeholder="0.00" step="0.01" min="0" oninput="updateDebtItem(${index}, 'actualPayment', this.value)">
            <button class="del-btn" style="width:30px" onclick="removeDebtItem(${index})">✕</button>
        `;
        debtListEl.appendChild(row);
    });

    calculateDebtTotals();
}

function calculateDebtTotals() {
    let totalDebt = 0;
    let totalActualPayments = 0;

    let minScenarioDebts = [];
    let actScenarioDebts = [];

    debts.forEach(d => {
        let bal = parseFloat(d.balance) || 0;
        let rate = parseFloat(d.rate) || 0;
        let usage = parseFloat(d.monthlyUsage) || 0;
        let actP = parseFloat(d.actualPayment) || 0;

        let minP = 0;
        if (d.type === 'cc') minP = 40;
        else if (d.type === 'sl') minP = 500;
        else minP = Math.max(25, bal * 0.03); // fallback logic

        totalDebt += bal;
        totalActualPayments += actP;

        minScenarioDebts.push({
            name: d.name,
            balance: bal,
            rate: rate,
            payment: minP,
            usage: usage,
            interestPaid: 0
        });

        actScenarioDebts.push({
            name: d.name,
            balance: bal,
            rate: rate,
            payment: actP,
            usage: usage,
            interestPaid: 0
        });
    });

    totalDebtEl.textContent = `$${totalDebt.toFixed(2)}`;
    totalPaymentsEl.textContent = `$${totalActualPayments.toFixed(2)}`;

    generateTimeline(minScenarioDebts, actScenarioDebts);
}

let snowballChartInstance = null;

function generateTimeline(minDebts, actDebts) {
    let totalMinInterest = 0;
    let totalActInterest = 0;

    const labels = ['Now'];

    // Initial balances at Now
    let startMinBalance = minDebts.reduce((sum, d) => sum + d.balance, 0);
    let startActBalance = actDebts.reduce((sum, d) => sum + d.balance, 0);

    const minData = [startMinBalance];
    const actData = [startActBalance];

    for (let year = 1; year <= 5; year++) {
        for (let q = 1; q <= 4; q++) {
            // 3 months per quarter
            for (let m = 0; m < 3; m++) {
                // Min Scenario
                minDebts.forEach(d => {
                    if (d.balance > 0 || d.usage > 0) {
                        let monthlyRate = (d.rate / 100) / 12;
                        let interest = d.balance * monthlyRate;
                        d.interestPaid += interest;
                        totalMinInterest += interest;

                        d.balance += interest + d.usage;
                        let payment = Math.min(d.payment, d.balance);
                        if (d.balance < d.payment && d.usage > 0) {
                            payment = d.balance; // Pay off whatever is remaining
                        }
                        d.balance -= payment;
                    }
                });

                // Act Scenario
                actDebts.forEach(d => {
                    if (d.balance > 0 || d.usage > 0) {
                        let monthlyRate = (d.rate / 100) / 12;
                        let interest = d.balance * monthlyRate;
                        d.interestPaid += interest;
                        totalActInterest += interest;

                        d.balance += interest + d.usage;
                        let payment = Math.min(d.payment, d.balance);
                        if (d.balance < d.payment && d.usage > 0) {
                            payment = d.balance;
                        }
                        d.balance -= payment;
                    }
                });
            }

            let minQBalance = minDebts.reduce((sum, d) => sum + d.balance, 0);
            let actQBalance = actDebts.reduce((sum, d) => sum + d.balance, 0);

            labels.push(`Y${year} Q${q}`);
            minData.push(Math.max(0, minQBalance));
            actData.push(Math.max(0, actQBalance));

            // if both are paid off (and no usage) we can break early
            let minPaidOff = minDebts.every(d => d.balance <= 0 && d.usage <= 0);
            let actPaidOff = actDebts.every(d => d.balance <= 0 && d.usage <= 0);

            if (minPaidOff && actPaidOff) break;
        }
        let minPaidOff = minDebts.every(d => d.balance <= 0 && d.usage <= 0);
        let actPaidOff = actDebts.every(d => d.balance <= 0 && d.usage <= 0);
        if (minPaidOff && actPaidOff) break;
    }

    const totalMinInterestEl = document.getElementById('total-interest-min');
    const totalActInterestEl = document.getElementById('total-interest-act');
    const totalSavedEl = document.getElementById('total-saved');

    // Find first point where min payment balance goes UP
    let increaseIndex = -1;
    for (let i = 1; i < minData.length; i++) {
        if (minData[i] > minData[i - 1]) {
            increaseIndex = i;
            break;
        }
    }

    if (totalMinInterestEl) totalMinInterestEl.textContent = `$${totalMinInterest.toFixed(2)}`;
    if (totalActInterestEl) totalActInterestEl.textContent = `$${totalActInterest.toFixed(2)}`;
    if (totalSavedEl) {
        let saved = totalMinInterest - totalActInterest;
        totalSavedEl.textContent = `$${saved.toFixed(2)}`;
        totalSavedEl.parentElement.style.background = saved >= 0 ? 'var(--success-light)' : 'var(--danger-light)';
        totalSavedEl.parentElement.style.borderColor = saved >= 0 ? 'var(--success)' : 'var(--danger)';
        totalSavedEl.style.color = saved >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    const ctx = document.getElementById('snowballChart');
    if (!ctx) return;

    if (snowballChartInstance) {
        snowballChartInstance.destroy();
    }

    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let textColor = isDark ? '#d1d5db' : '#6B7280';
    let gridColor = isDark ? '#374151' : '#E5E7EB';

    snowballChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Min Payment Balance',
                    data: minData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                },
                {
                    label: 'Actual Payment Balance',
                    data: actData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Inter, sans-serif' } }
                },
                annotation: increaseIndex !== -1 ? {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: increaseIndex,
                            xMax: increaseIndex,
                            borderColor: 'var(--danger)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Debt Starts Increasing',
                                position: 'start',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                font: { family: 'Inter, sans-serif', size: 12, weight: 'bold' }
                            }
                        }
                    }
                } : {}
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) { return '$' + value; },
                        color: textColor
                    },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

// Expose functions globally for button clicks
window.addDebtItem = function () {
    debts.push({ name: '', type: 'cc', balance: 0, rate: 0, monthlyUsage: '', actualPayment: '' });
    renderDebtList();
};

window.updateDebtItem = function (index, field, value) {
    if (field === 'balance' || field === 'rate' || field === 'monthlyUsage' || field === 'actualPayment') {
        debts[index][field] = value === '' ? '' : (parseFloat(value) || 0);
    } else {
        debts[index][field] = value;
    }

    // Re-calculate totals without re-rendering to prevent losing cursor focus
    calculateDebtTotals();
};

window.removeDebtItem = function (index) {
    debts.splice(index, 1);
    renderDebtList();
};

// Initial render
renderDebtList();

// --- Step 7: Balance Sheet ---
let bsAssets = [
    { name: 'Checking Account', amount: 1000, apr: 0.1 },
    { name: 'Savings Account', amount: 5000, apr: 4.25 },
    { name: 'Index Funds', amount: 2500, apr: 7.0 }
];

let bsLiabilities = [
    { name: 'Student Loan', amount: 15000, apr: 5.5 },
    { name: 'Credit Card', amount: 500, apr: 22.0 }
];

const assetsListEl = document.getElementById('assets-list');
const liabilitiesListEl = document.getElementById('liabilities-list');

const bsTotalAssetsEl = document.getElementById('bs-total-assets');
const bsTotalLiabilitiesEl = document.getElementById('bs-total-liabilities');
const bsNetWorthEl = document.getElementById('bs-net-worth');
const bsNetWorthCardEl = document.getElementById('bs-net-worth-card');

function renderBSList(type) {
    const list = type === 'assets' ? bsAssets : bsLiabilities;
    const container = type === 'assets' ? assetsListEl : liabilitiesListEl;

    container.innerHTML = '';

    list.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-item';
        row.style.gap = '12px';

        row.innerHTML = `
            <input type="text" class="item-name" style="flex:1" value="${item.name}" placeholder="Name" onchange="updateBSItem('${type}', ${index}, 'name', this.value)">
            <input type="number" class="item-cost" style="width:100px" value="${item.amount}" placeholder="0.00" step="0.01" min="0" oninput="updateBSItem('${type}', ${index}, 'amount', this.value)">
            <input type="number" class="item-cost" style="width:80px" value="${item.apr}" placeholder="0.00" step="0.01" min="0" oninput="updateBSItem('${type}', ${index}, 'apr', this.value)">
            <button class="del-btn" style="width:30px" onclick="removeBSItem('${type}', ${index})">✕</button>
        `;
        container.appendChild(row);
    });

    calculateBSTotals();
}

function calculateBSTotals() {
    const totalAssets = bsAssets.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalLiabilities = bsLiabilities.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Calculate Annual Impacts (Value * (APR/100))
    const annualAssetGrowth = bsAssets.reduce((sum, item) => {
        let amt = parseFloat(item.amount) || 0;
        let apr = parseFloat(item.apr) || 0;
        return sum + (amt * (apr / 100));
    }, 0);

    const annualLiabilityCost = bsLiabilities.reduce((sum, item) => {
        let amt = parseFloat(item.amount) || 0;
        let apr = parseFloat(item.apr) || 0;
        return sum + (amt * (apr / 100));
    }, 0);

    const netAnnualChange = annualAssetGrowth - annualLiabilityCost;

    bsTotalAssetsEl.textContent = `$${totalAssets.toFixed(2)}`;
    bsTotalLiabilitiesEl.textContent = `$${totalLiabilities.toFixed(2)}`;
    bsNetWorthEl.textContent = `$${netWorth.toFixed(2)}`;

    // Update Net Worth Card colors
    if (netWorth > 0) {
        bsNetWorthCardEl.style.background = 'var(--success-light)';
        bsNetWorthCardEl.style.borderColor = 'var(--success)';
        bsNetWorthEl.style.color = 'var(--success)';
    } else if (netWorth < 0) {
        bsNetWorthCardEl.style.background = 'var(--danger-light)';
        bsNetWorthCardEl.style.borderColor = 'var(--danger)';
        bsNetWorthEl.style.color = 'var(--danger)';
    } else {
        bsNetWorthCardEl.style.background = 'var(--surface)';
        bsNetWorthCardEl.style.borderColor = 'var(--border)';
        bsNetWorthEl.style.color = 'var(--text-main)';
    }

    // Update Annual Impact Summaries
    const growthEl = document.getElementById('bs-annual-growth');
    const lossEl = document.getElementById('bs-annual-loss');
    const netEl = document.getElementById('bs-annual-net');

    if (growthEl) growthEl.textContent = `+$${annualAssetGrowth.toFixed(2)}`;
    if (lossEl) lossEl.textContent = `-$${annualLiabilityCost.toFixed(2)}`;

    if (netEl) {
        netEl.textContent = `${netAnnualChange >= 0 ? '+' : '-'}$${Math.abs(netAnnualChange).toFixed(2)}`;
        netEl.style.color = netAnnualChange >= 0 ? 'var(--success)' : 'var(--danger)';
    }
}

window.addBSItem = function (type) {
    if (type === 'assets') {
        bsAssets.push({ name: '', amount: '', apr: '' });
    } else {
        bsLiabilities.push({ name: '', amount: '', apr: '' });
    }
    renderBSList(type);
};

window.updateBSItem = function (type, index, field, value) {
    const list = type === 'assets' ? bsAssets : bsLiabilities;
    if (field === 'amount' || field === 'apr') {
        list[index][field] = value === '' ? '' : (parseFloat(value) || 0);
    } else {
        list[index][field] = value;
    }
    calculateBSTotals();
};

window.removeBSItem = function (type, index) {
    if (type === 'assets') {
        bsAssets.splice(index, 1);
    } else {
        bsLiabilities.splice(index, 1);
    }
    renderBSList(type);
};

window.exportBalanceSheetCSV = function () {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Header for Assets
    csvContent += "Type,Name,Amount ($),APR (%)\r\n";

    let totalAssets = 0;
    bsAssets.forEach(item => {
        let amt = parseFloat(item.amount) || 0;
        let apr = parseFloat(item.apr) || 0;
        totalAssets += amt;
        csvContent += `Asset,${item.name || 'Unnamed'},${amt},${apr}\r\n`;
    });

    let totalLiabilities = 0;
    bsLiabilities.forEach(item => {
        let amt = parseFloat(item.amount) || 0;
        let apr = parseFloat(item.apr) || 0;
        totalLiabilities += amt;
        csvContent += `Liability,${item.name || 'Unnamed'},${amt},${apr}\r\n`;
    });

    csvContent += `\r\n`;
    csvContent += `Total Assets,${totalAssets}\r\n`;
    csvContent += `Total Liabilities,${totalLiabilities}\r\n`;
    csvContent += `Net Worth,${totalAssets - totalLiabilities}\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "balance_sheet.csv");
    document.body.appendChild(link); // Required for FF

    link.click();

    // Clean up
    document.body.removeChild(link);
};

// Initial Render for Balance Sheet
renderBSList('assets');
renderBSList('liabilities');

// --- Header Auto-Hide Logic ---
const header = document.querySelector('.glass-header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Hide if scrolling down and not at the very top (e.g. past 80px)
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
        header.classList.add('header-hidden');
    } else {
        // Show if scrolling up or at the top
        header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
});

window.addEventListener('mousemove', (e) => {
    // Show header if mouse is near the top of the window (within top 60px)
    if (e.clientY <= 60) {
        header.classList.remove('header-hidden');
    }
});
