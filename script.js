// Wallet Manager - Core Functionality
const WalletManager = {
    // Initialize wallet data if not exists
    initWallet: function() {
        if (!localStorage.getItem('walletData')) {
            const initialData = {
                balance: 0,
                totalCashIn: 0,
                totalCashOut: 0,
                transactions: []
            };
            localStorage.setItem('walletData', JSON.stringify(initialData));
        }
    },

    // Get current wallet data
    getWalletData: function() {
        return JSON.parse(localStorage.getItem('walletData'));
    },

    // Add a new transaction
    addTransaction: function(amount, category, date, description, type) {
        const walletData = this.getWalletData();
        
        const transaction = {
            id: Date.now(),
            amount: parseFloat(amount),
            category: category,
            date: date,
            description: description,
            type: type
        };

        // Update wallet data
        walletData.transactions.unshift(transaction);
        
        if (type === 'income') {
            walletData.balance += transaction.amount;
            walletData.totalCashIn += transaction.amount;
        } else {
            walletData.balance -= transaction.amount;
            walletData.totalCashOut += transaction.amount;
        }

        // Save to localStorage
        localStorage.setItem('walletData', JSON.stringify(walletData));
        
        return transaction;
    },

    // Get current balance
    getBalance: function() {
        return this.getWalletData().balance;
    },

    // Get total cash in
    getTotalCashIn: function() {
        return this.getWalletData().totalCashIn;
    },

    // Get total cash out
    getTotalCashOut: function() {
        return this.getWalletData().totalCashOut;
    },

    // Get recent transactions (limit optional)
    getRecentTransactions: function(limit = 5) {
        return this.getWalletData().transactions.slice(0, limit);
    },

    // Get transactions by date range
    getTransactionsByDateRange: function(startDate, endDate) {
        const transactions = this.getWalletData().transactions;
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });
    },

    // Get transactions by type
    getTransactionsByType: function(type) {
        return this.getWalletData().transactions.filter(t => t.type === type);
    },

    // Get transactions by category
    getTransactionsByCategory: function(category) {
        return this.getWalletData().transactions.filter(t => t.category === category);
    },

    // Format currency
    formatCurrency: function(amount) {
        return '$' + parseFloat(amount).toFixed(2);
    },

    // Format date
    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    // Animate value change
    animateValue: function(elementId, start, end, duration) {
        const obj = document.getElementById(elementId);
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;
            obj.textContent = this.formatCurrency(value);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
};

// UI Updater - Handles all UI updates
const UIUpdater = {
    // Update balance displays
    updateBalances: function() {
        const walletData = WalletManager.getWalletData();
        
        // Update main balance displays
        if (document.getElementById('wallet-balance')) {
            WalletManager.animateValue('wallet-balance', 0, walletData.balance, 1000);
        }
        
        if (document.getElementById('total-cash-in')) {
            WalletManager.animateValue('total-cash-in', 0, walletData.totalCashIn, 1000);
        }
        
        if (document.getElementById('total-cash-out')) {
            WalletManager.animateValue('total-cash-out', 0, walletData.totalCashOut, 1000);
        }
        
        // Update reports page balances if exists
        if (document.getElementById('report-balance')) {
            document.getElementById('report-balance').textContent = WalletManager.formatCurrency(walletData.balance);
        }
        
        if (document.getElementById('report-cash-in')) {
            document.getElementById('report-cash-in').textContent = WalletManager.formatCurrency(walletData.totalCashIn);
        }
        
        if (document.getElementById('report-cash-out')) {
            document.getElementById('report-cash-out').textContent = WalletManager.formatCurrency(walletData.totalCashOut);
        }
    },

    // Update recent transactions table
    updateRecentTransactions: function() {
        const tbody = document.getElementById('recent-transactions');
        if (!tbody) return;
        
        const transactions = WalletManager.getRecentTransactions();
        
        tbody.innerHTML = '';
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-wallet2" style="font-size: 2rem; opacity: 0.3;"></i>
                        <p class="mt-2 text-muted">No transactions yet</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.type === 'income' ? 'transaction-income' : 'transaction-expense';
            
            row.innerHTML = `
                <td>${WalletManager.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'}${WalletManager.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <span class="badge bg-${transaction.type === 'income' ? 'success' : 'danger'}-subtle text-${transaction.type === 'income' ? 'success' : 'danger'}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    },

    // Update transaction history table (for reports page)
    updateTransactionHistory: function(transactions = null) {
        const tbody = document.getElementById('transaction-history');
        if (!tbody) return;
        
        transactions = transactions || WalletManager.getWalletData().transactions;
        
        tbody.innerHTML = '';
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-wallet2" style="font-size: 2rem; opacity: 0.3;"></i>
                        <p class="mt-2 text-muted">No transactions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.type === 'income' ? 'transaction-income' : 'transaction-expense';
            
            row.innerHTML = `
                <td>${WalletManager.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'}${WalletManager.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <span class="badge bg-${transaction.type === 'income' ? 'success' : 'danger'}-subtle text-${transaction.type === 'income' ? 'success' : 'danger'}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
};

// Chart Manager - Handles all chart operations
const ChartManager = {
    charts: {},
    
    // Initialize all charts on the page
    initCharts: function() {
        if (document.getElementById('incomeExpenseChart')) {
            this.createIncomeExpenseChart();
        }
        
        if (document.getElementById('monthlyTrendChart')) {
            this.createMonthlyTrendChart();
        }
        
        if (document.getElementById('categoryChart')) {
            this.createCategoryChart();
        }
    },
    
    // Create income vs expense chart
    createIncomeExpenseChart: function() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        const walletData = WalletManager.getWalletData();
        
        // Calculate last 30 days data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysIncome = walletData.transactions
            .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const last30DaysExpense = walletData.transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0);
        
        this.charts.incomeExpenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [last30DaysIncome, last30DaysExpense],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${WalletManager.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    },
    
    // Create monthly trend chart
    createMonthlyTrendChart: function() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        const walletData = WalletManager.getWalletData();
        
        // Group transactions by month (last 6 months)
        const monthlyData = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        
        // Populate with actual data
        walletData.transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyData[monthYear]) {
                if (t.type === 'income') {
                    monthlyData[monthYear].income += t.amount;
                } else {
                    monthlyData[monthYear].expense += t.amount;
                }
            }
        });
        
        // Prepare chart data
        const labels = Object.keys(monthlyData).map(m => {
            const [year, month] = m.split('-');
            return new Date(year, month - 1).toLocaleDateString('default', { month: 'short' });
        });
        
        const incomeData = Object.values(monthlyData).map(m => m.income);
        const expenseData = Object.values(monthlyData).map(m => m.expense);
        
        this.charts.monthlyTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(40, 167, 69, 0.2)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${WalletManager.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return WalletManager.formatCurrency(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    },
    
    // Create category breakdown chart
    createCategoryChart: function() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const walletData = WalletManager.getWalletData();
        
        // Group expenses by category (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const categoryData = {};
        walletData.transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
            .forEach(t => {
                if (!categoryData[t.category]) {
                    categoryData[t.category] = 0;
                }
                categoryData[t.category] += t.amount;
            });
        
        // Sort categories by amount (descending)
        const sortedCategories = Object.entries(categoryData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Limit to top 5 categories
        
        const labels = sortedCategories.map(c => c[0]);
        const data = sortedCategories.map(c => c[1]);
        
        // Generate distinct colors for categories
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];
        
        this.charts.categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return WalletManager.formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return WalletManager.formatCurrency(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            }
        });
    }
};

// Initialize the application
function initApp() {
    // Initialize wallet data
    WalletManager.initWallet();
    
    // Update UI elements
    UIUpdater.updateBalances();
    UIUpdater.updateRecentTransactions();
    
    // Initialize charts
    ChartManager.initCharts();
    
    // Set current date if element exists
    if (document.getElementById('current-date')) {
        const now = new Date();
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Make functions available globally if needed
window.WalletManager = WalletManager;
window.UIUpdater = UIUpdater;
window.ChartManager = ChartManager;