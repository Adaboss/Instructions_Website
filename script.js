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


// --- Step 6 Debt Snowball Calculator ---
let debts = [];

const debtListEl = document.getElementById('debt-list');
const totalDebtEl = document.getElementById('total-debt');
const totalPaymentsEl = document.getElementById('total-payments');

window.addDebtItem = function() {
    debts.push({ name: '', balance: 0, rate: 0, payment: 0 });
    renderDebts();
};

window.removeDebt = function(index) {
    debts.splice(index, 1);
    renderDebts();
};

window.updateDebt = function(index, field, value) {
    if (field === 'balance' || field === 'payment' || field === 'rate') {
        debts[index][field] = parseFloat(value) || 0;
    } else {
        debts[index][field] = value;
    }
    updateDebtTotals();
};

function renderDebtList() {
    const container = document.getElementById('debt-list');
    container.innerHTML = '';

    debts.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-item';

        row.innerHTML = `
            <input type="text" class="col-name" value="${item.name}" placeholder="Loan Name" onchange="updateDebtItem(${index}, 'name', this.value)">
            <input type="number" class="col-balance" value="${item.balance}" placeholder="0.00" step="0.01" min="0" onchange="updateDebtItem(${index}, 'balance', this.value)">
            <input type="number" class="col-rate" value="${item.rate}" placeholder="0.00" step="0.01" min="0" onchange="updateDebtItem(${index}, 'rate', this.value)">
            <input type="number" class="col-payment" value="${item.minPayment}" placeholder="0.00" step="0.01" min="0" onchange="updateDebtItem(${index}, 'minPayment', this.value)">
            <button class="col-action" onclick="removeDebtItem(${index})">✕</button>
        `;

        container.appendChild(row);
    });

    updateDebtTotals();
}

function updateDebtTotals() {
    let totalDebt = 0;
    let totalPayments = 0;

    debts.forEach(d => {
        totalDebt += d.balance;
        totalPayments += d.payment;
    });

    totalDebtEl.textContent = `$${totalDebt.toFixed(2)}`;
    totalPaymentsEl.textContent = `$${totalPayments.toFixed(2)}`;
}

// Initial render
renderDebts();
