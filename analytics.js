/**
 * ShopMart Analytics System
 * Real-time analytics and data visualization
 * Using Chart.js for interactive charts
 */

class AnalyticsEngine {
    constructor() {
        this.metrics = {
            pageViews: 0,
            uniqueUsers: new Set(),
            totalRecommendations: 0,
            successfulRecommendations: 0,
            userSatisfaction: 85,
            conversionRate: 0,
            avgSessionTime: 0,
            bounceRate: 0,
            topCategories: {},
            searchQueries: [],
            clickThroughRate: 0,
            revenueGenerated: 0
        };

        this.charts = {};
        this.realTimeData = [];
        this.sessionStart = Date.now();
        this.isActive = true;
        this.updateInterval = null;
        
        this.init();
    }

    /**
     * Initialize analytics engine
     */
    init() {
        console.log('📊 Initializing Analytics Engine...');
        
        this.setupEventTracking();
        this.loadStoredMetrics();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.setupVisibilityTracking();
        
        console.log('✅ Analytics Engine initialized');
    }

    /**
     * Setup event tracking
     */
    setupEventTracking() {
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_blur');
            } else {
                this.trackEvent('page_focus');
            }
        });

        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Track scrolling
        let scrollTimer = null;
        document.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.trackScroll();
            }, 100);
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmission(e);
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError(e);
        });
    }

    /**
     * Load stored metrics from localStorage
     */
    loadStoredMetrics() {
        const storedMetrics = utils.storage.get('shopmart_analytics', {});
        this.metrics = { ...this.metrics, ...storedMetrics };
        
        // Update unique users
        this.metrics.uniqueUsers = new Set(storedMetrics.uniqueUsers || []);
    }

    /**
     * Initialize Chart.js charts
     */
    initializeCharts() {
        // Behavior Trends Chart
        this.initBehaviorChart();
        
        // Category Performance Chart
        this.initCategoryChart();
        
        // Real-time Activity Chart
        this.initActivityChart();
        
        // Accuracy Chart (mini chart)
        this.initAccuracyChart();
    }

    /**
     * Initialize behavior trends chart
     */
    initBehaviorChart() {
        const ctx = document.getElementById('behaviorChart');
        if (!ctx) return;

        this.charts.behavior = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24), // Last 24 hours
                datasets: [{
                    label: 'Page Views',
                    data: this.generateRandomData(24, 20, 100),
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Recommendations',
                    data: this.generateRandomData(24, 10, 50),
                    borderColor: 'rgb(118, 75, 162)',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Conversions',
                    data: this.generateRandomData(24, 2, 15),
                    borderColor: 'rgb(76, 175, 80)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'User Behavior Trends (Last 24 Hours)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Initialize category performance chart
     */
    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Books', 'Clothing', 'Home & Garden', 'Sports'],
                datasets: [{
                    data: [30, 20, 25, 15, 10],
                    backgroundColor: [
                        'rgb(102, 126, 234)',
                        'rgb(118, 75, 162)', 
                        'rgb(240, 147, 251)',
                        'rgb(76, 175, 80)',
                        'rgb(255, 152, 0)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Category Performance'
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    /**
     * Initialize real-time activity chart
     */
    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        this.charts.activity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [1200, 1900, 3000, 5000, 2000, 3000, 2500],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Initialize accuracy mini chart
     */
    initAccuracyChart() {
        const ctx = document.getElementById('accuracyChart');
        if (!ctx) return;

        this.charts.accuracy = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(12),
                datasets: [{
                    label: 'Accuracy %',
                    data: this.generateAccuracyData(12),
                    borderColor: 'rgb(76, 175, 80)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false,
                        min: 70,
                        max: 100
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.isActive) {
                this.updateMetrics();
                this.updateCharts();
                this.saveMetrics();
            }
        }, 5000); // Update every 5 seconds
    }

    /**
     * Update metrics with real-time data
     */
    updateMetrics() {
        // Simulate real-time data updates
        this.metrics.pageViews += Math.floor(Math.random() * 3);
        this.metrics.totalRecommendations += Math.floor(Math.random() * 5);
        this.metrics.successfulRecommendations += Math.floor(Math.random() * 2);
        
        // Calculate derived metrics
        this.metrics.conversionRate = this.metrics.totalRecommendations > 0 
            ? (this.metrics.successfulRecommendations / this.metrics.totalRecommendations * 100).toFixed(1)
            : 0;
            
        this.metrics.clickThroughRate = this.metrics.pageViews > 0
            ? (this.metrics.totalRecommendations / this.metrics.pageViews * 100).toFixed(1)
            : 0;

        // Update satisfaction with some variance
        this.metrics.userSatisfaction += (Math.random() - 0.5) * 2;
        this.metrics.userSatisfaction = Math.max(70, Math.min(100, this.metrics.userSatisfaction));

        // Update session time
        this.metrics.avgSessionTime = (Date.now() - this.sessionStart) / 1000;

        // Add real-time data point
        this.realTimeData.push({
            timestamp: Date.now(),
            value: Math.random() * 100
        });

        // Keep only last 50 data points
        if (this.realTimeData.length > 50) {
            this.realTimeData.shift();
        }
    }

    /**
     * Update all charts with new data
     */
    updateCharts() {
        // Update behavior chart
        if (this.charts.behavior) {
            this.updateBehaviorChart();
        }

        // Update category chart
        if (this.charts.category) {
            this.updateCategoryChart();
        }

        // Update activity chart
        if (this.charts.activity) {
            this.updateActivityChart();
        }

        // Update accuracy chart
        if (this.charts.accuracy) {
            this.updateAccuracyChart();
        }
    }

    /**
     * Update behavior chart data
     */
    updateBehaviorChart() {
        const chart = this.charts.behavior;
        const now = new Date();
        
        // Add new data point
        chart.data.labels.push(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
        chart.data.datasets[0].data.push(Math.floor(Math.random() * 20) + 80);
        chart.data.datasets[1].data.push(Math.floor(Math.random() * 15) + 25);
        chart.data.datasets[2].data.push(Math.floor(Math.random() * 8) + 5);

        // Remove old data (keep last 24 points)
        if (chart.data.labels.length > 24) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update('none'); // Update without animation for real-time
    }

    /**
     * Update category chart data
     */
    updateCategoryChart() {
        const chart = this.charts.category;
        
        // Simulate category performance changes
        chart.data.datasets[0].data = chart.data.datasets[0].data.map(value => {
            const change = (Math.random() - 0.5) * 5;
            return Math.max(5, Math.min(50, value + change));
        });

        chart.update('none');
    }

    /**
     * Update activity chart data
     */
    updateActivityChart() {
        const chart = this.charts.activity;
        
        // Update with current week data
        chart.data.datasets[0].data = this.generateWeeklyActivityData();
        chart.update('none');
    }

    /**
     * Update accuracy chart data
     */
    updateAccuracyChart() {
        const chart = this.charts.accuracy;
        
        // Add new accuracy point
        chart.data.datasets[0].data.push(85 + Math.random() * 12);
        chart.data.labels.push('');

        // Keep last 12 points
        if (chart.data.datasets[0].data.length > 12) {
            chart.data.datasets[0].data.shift();
            chart.data.labels.shift();
        }

        chart.update('none');
    }

    /**
     * Track user events
     */
    trackEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            ...data
        };

        // Store event
        const events = utils.storage.get('analytics_events', []);
        events.push(event);
        
        // Keep only recent events (last 1000)
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        utils.storage.set('analytics_events', events);

        // Update relevant metrics
        this.processEvent(event);
        
        console.log('📊 Event tracked:', eventType, data);
    }

    /**
     * Track click events
     */
    trackClick(event) {
        const element = event.target;
        const clickData = {
            element: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 50),
            x: event.clientX,
            y: event.clientY
        };

        // Special handling for product clicks
        if (element.closest('.product-card')) {
            const productCard = element.closest('.product-card');
            clickData.productId = productCard.dataset.productId;
            clickData.category = productCard.dataset.category;
            this.trackEvent('product_click', clickData);
        } else {
            this.trackEvent('click', clickData);
        }
    }

    /**
     * Track scroll behavior
     */
    trackScroll() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        this.trackEvent('scroll', {
            scrollPercent,
            scrollY: window.scrollY
        });
    }

    /**
     * Track form submissions
     */
    trackFormSubmission(event) {
        const form = event.target;
        this.trackEvent('form_submit', {
            formId: form.id,
            formClass: form.className,
            action: form.action
        });
    }

    /**
     * Track errors
     */
    trackError(event) {
        this.trackEvent('error', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    }

    /**
     * Process events to update metrics
     */
    processEvent(event) {
        switch (event.type) {
            case 'page_view':
                this.metrics.pageViews++;
                break;
                
            case 'product_click':
                this.updateCategoryMetrics(event.category);
                break;
                
            case 'search':
                this.metrics.searchQueries.push(event.query);
                break;
                
            case 'recommendation_shown':
                this.metrics.totalRecommendations++;
                break;
                
            case 'recommendation_clicked':
                this.metrics.successfulRecommendations++;
                break;
        }
    }

    /**
     * Update category metrics
     */
    updateCategoryMetrics(category) {
        if (!this.metrics.topCategories[category]) {
            this.metrics.topCategories[category] = 0;
        }
        this.metrics.topCategories[category]++;
    }

    /**
     * Get or create session ID
     */
    getSessionId() {
        let sessionId = utils.storage.get('session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            utils.storage.set('session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Setup visibility tracking
     */
    setupVisibilityTracking() {
        let startTime = Date.now();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - pause tracking
                this.isActive = false;
                const sessionTime = Date.now() - startTime;
                this.trackEvent('session_time', { duration: sessionTime });
            } else {
                // Page visible - resume tracking
                this.isActive = true;
                startTime = Date.now();
                this.trackEvent('page_focus');
            }
        });

        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            const sessionTime = Date.now() - startTime;
            this.trackEvent('session_end', { duration: sessionTime });
        });
    }

    /**
     * Generate time labels
     */
    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            labels.push(time.getHours() + ':00');
        }
        
        return labels;
    }

    /**
     * Generate random data for charts
     */
    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min)) + min);
        }
        return data;
    }

    /**
     * Generate accuracy data
     */
    generateAccuracyData(count) {
        const data = [];
        let base = 88;
        
        for (let i = 0; i < count; i++) {
            base += (Math.random() - 0.5) * 4;
            base = Math.max(75, Math.min(98, base));
            data.push(base);
        }
        
        return data;
    }

    /**
     * Generate weekly activity data
     */
    generateWeeklyActivityData() {
        return [
            1200 + Math.random() * 200,
            1900 + Math.random() * 300,
            3000 + Math.random() * 500,
            5000 + Math.random() * 800,
            2000 + Math.random() * 400,
            3000 + Math.random() * 600,
            2500 + Math.random() * 400
        ];
    }

    /**
     * Save metrics to localStorage
     */
    saveMetrics() {
        const metricsToSave = {
            ...this.metrics,
            uniqueUsers: Array.from(this.metrics.uniqueUsers), // Convert Set to Array
            lastUpdated: Date.now()
        };
        
        utils.storage.set('shopmart_analytics', metricsToSave);
    }

    /**
     * Get analytics dashboard data
     */
    getDashboardData() {
        return {
            metrics: this.metrics,
            realTimeData: this.realTimeData,
            sessionStart: this.sessionStart,
            aiEngineData: window.shopMartAI ? window.shopMartAI.getAnalytics() : {},
            performanceData: utils.performanceMonitor.getAll()
        };
    }

    /**
     * Update dashboard UI
     */
    updateDashboard() {
        // Update metric displays
        this.updateMetricDisplay('totalRecommendations', this.metrics.totalRecommendations);
        this.updateMetricDisplay('accuracyRate', Math.round(this.metrics.userSatisfaction) + '%');
        this.updateMetricDisplay('userSatisfaction', Math.round(this.metrics.userSatisfaction) + '%');
        this.updateMetricDisplay('activeUsers', 1247 + Math.floor(Math.random() * 100));

        // Update satisfaction meter
        this.updateSatisfactionMeter();
    }

    /**
     * Update individual metric display
     */
    updateMetricDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Animate number change
            utils.animateCounter(element, 
                parseInt(element.textContent) || 0, 
                typeof value === 'string' ? parseInt(value) : value,
                1000,
                (num) => typeof value === 'string' && value.includes('%') ? num + '%' : num
            );
        }
    }

    /**
     * Update satisfaction meter
     */
    updateSatisfactionMeter() {
        const meter = document.getElementById('satisfactionMeter');
        if (meter) {
            const percentage = Math.round(this.metrics.userSatisfaction);
            meter.style.width = percentage + '%';
            meter.style.backgroundColor = percentage > 80 ? '#4CAF50' : 
                                         percentage > 60 ? '#ff9800' : '#f44336';
        }
    }

    /**
     * Export analytics data
     */
    exportData(format = 'json') {
        const data = this.getDashboardData();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `shopmart_analytics_${timestamp}`;

        if (format === 'json') {
            this.downloadJSON(data, filename);
        } else if (format === 'csv') {
            this.downloadCSV(data, filename);
        }
    }

    /**
     * Download data as JSON
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename + '.json');
    }

    /**
     * Download data as CSV
     */
    downloadCSV(data, filename) {
        const csv = this.convertToCSV(data.metrics);
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, filename + '.csv');
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const headers = Object.keys(data);
        const values = Object.values(data).map(v => 
            typeof v === 'object' ? JSON.stringify(v) : v
        );
        
        return headers.join(',') + '\n' + values.join(',');
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Start A/B testing
     */
    startABTest(testName, variants) {
        const userId = this.getSessionId();
        const variant = variants[Math.floor(Math.random() * variants.length)];
        
        this.trackEvent('ab_test_start', {
            testName,
            variant,
            userId
        });

        return variant;
    }

    /**
     * Track A/B test conversion
     */
    trackABTestConversion(testName, variant) {
        this.trackEvent('ab_test_conversion', {
            testName,
            variant
        });
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        this.saveMetrics();
        console.log('📊 Analytics Engine destroyed');
    }
}

// Create global analytics engine instance
window.analyticsEngine = new AnalyticsEngine();

// Start dashboard updates
setInterval(() => {
    if (window.analyticsEngine) {
        window.analyticsEngine.updateDashboard();
    }
}, 3000);

console.log('📊 Analytics Engine loaded successfully');