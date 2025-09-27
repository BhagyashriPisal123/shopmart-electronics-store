/**
 * ShopMart AI - Utility Functions
 * Advanced utility functions for the recommendation system
 */

// ===== GENERAL UTILITIES =====

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format currency with Indian Rupee symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format large numbers with K, M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

/**
 * Calculate time ago from timestamp
 * @param {number} timestamp - Timestamp to calculate from
 * @returns {string} Time ago string
 */
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// ===== DOM UTILITIES =====

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element|null} Found element or null
 */
function $(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.warn('Invalid selector:', selector);
        return null;
    }
}

/**
 * Query all selectors with error handling
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {NodeList} Found elements
 */
function $$(selector, parent = document) {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.warn('Invalid selector:', selector);
        return [];
    }
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} content - Inner content
 * @returns {Element} Created element
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });

    if (content) {
        element.innerHTML = content;
    }

    return element;
}

/**
 * Add CSS class with animation support
 * @param {Element} element - Target element
 * @param {string} className - Class to add
 * @param {number} delay - Animation delay
 */
function addClassWithDelay(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.add(className);
    }, delay);
}

/**
 * Toggle element visibility with animation
 * @param {Element} element - Target element
 * @param {boolean} show - Show or hide
 * @param {string} animation - Animation class
 */
function toggleVisibility(element, show, animation = 'fade-in') {
    if (show) {
        element.style.display = 'block';
        element.classList.add(animation);
    } else {
        element.classList.remove(animation);
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Target element or selector
 * @param {number} offset - Offset from top
 */
function scrollToElement(target, offset = 80) {
    const element = typeof target === 'string' ? $(target) : target;
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== DATA UTILITIES =====

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 * @param {*} item - Item to check
 * @returns {boolean} Is object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get nested property value safely
 * @param {Object} obj - Source object
 * @param {string} path - Property path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Property value
 */
function getNestedProperty(obj, path, defaultValue = null) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
}

/**
 * Set nested property value safely
 * @param {Object} obj - Target object
 * @param {string} path - Property path
 * @param {*} value - Value to set
 */
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        return current[key];
    }, obj);
    target[lastKey] = value;
}

// ===== ARRAY UTILITIES =====

/**
 * Shuffle array elements
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get unique array elements
 * @param {Array} array - Source array
 * @param {string} key - Key for object uniqueness
 * @returns {Array} Unique elements
 */
function getUniqueElements(array, key = null) {
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = getNestedProperty(item, key);
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
}

/**
 * Group array by property
 * @param {Array} array - Array to group
 * @param {string|Function} keyOrFn - Grouping key or function
 * @returns {Object} Grouped object
 */
function groupBy(array, keyOrFn) {
    return array.reduce((groups, item) => {
        const key = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Sort array by multiple criteria
 * @param {Array} array - Array to sort
 * @param {Array} criteria - Sort criteria
 * @returns {Array} Sorted array
 */
function multiSort(array, criteria) {
    return array.sort((a, b) => {
        for (const criterion of criteria) {
            const { key, order = 'asc' } = criterion;
            const aVal = getNestedProperty(a, key);
            const bVal = getNestedProperty(b, key);
            
            let result = 0;
            if (aVal < bVal) result = -1;
            if (aVal > bVal) result = 1;
            
            if (order === 'desc') result *= -1;
            if (result !== 0) return result;
        }
        return 0;
    });
}

// ===== STORAGE UTILITIES =====

/**
 * Safe localStorage wrapper
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Storage get error:', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Storage set error:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Storage remove error:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Storage clear error:', error);
            return false;
        }
    }
};

// ===== VALIDATION UTILITIES =====

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Phone number validation (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
function isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Password strength checker
 * @param {string} password - Password to check
 * @returns {Object} Strength analysis
 */
function checkPasswordStrength(password) {
    const analysis = {
        score: 0,
        feedback: [],
        strength: 'weak'
    };

    if (password.length >= 8) {
        analysis.score += 1;
    } else {
        analysis.feedback.push('Password should be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) analysis.score += 1;
    else analysis.feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) analysis.score += 1;
    else analysis.feedback.push('Add uppercase letters');

    if (/\d/.test(password)) analysis.score += 1;
    else analysis.feedback.push('Add numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) analysis.score += 1;
    else analysis.feedback.push('Add special characters');

    if (analysis.score >= 4) analysis.strength = 'strong';
    else if (analysis.score >= 3) analysis.strength = 'medium';

    return analysis;
}

// ===== PERFORMANCE UTILITIES =====

/**
 * Performance measurement utility
 */
class PerformanceMonitor {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
    }

    start(name) {
        this.marks.set(name, performance.now());
    }

    end(name) {
        const startTime = this.marks.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.measures.set(name, duration);
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        console.warn(`No start mark found for: ${name}`);
        return 0;
    }

    getAll() {
        return Object.fromEntries(this.measures);
    }

    clear() {
        this.marks.clear();
        this.measures.clear();
    }
}

/**
 * Lazy loading utility
 * @param {string} selector - Target selector
 * @param {Function} callback - Load callback
 * @param {Object} options - Observer options
 */
function lazyLoad(selector, callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observerOptions = { ...defaultOptions, ...options };
    const elements = $(selector);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elements.forEach(element => observer.observe(element));
    return observer;
}

// ===== ANIMATION UTILITIES =====

/**
 * Animate number counting
 * @param {Element} element - Target element
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration
 * @param {Function} formatter - Value formatter
 */
function animateCounter(element, start, end, duration = 1000, formatter = null) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        const displayValue = formatter ? formatter(Math.floor(current)) : Math.floor(current);
        element.textContent = displayValue;
    }, 16);
}

/**
 * Stagger animation for multiple elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {string} className - Animation class
 * @param {number} delay - Delay between elements
 */
function staggerAnimation(elements, className, delay = 100) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(className);
        }, index * delay);
    });
}

// ===== ERROR HANDLING =====

/**
 * Global error handler
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.init();
    }

    init() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    logError(type, error) {
        const errorInfo = {
            type,
            message: error.message || error,
            stack: error.stack || '',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        console.error('Error logged:', errorInfo);
        
        // You can send to analytics service here
        this.sendToAnalytics(errorInfo);
    }

    sendToAnalytics(errorInfo) {
        // Implement analytics reporting
        console.log('📊 Error sent to analytics:', errorInfo.type);
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }
}

// ===== EXPORTS =====

// Create global instances
window.performanceMonitor = new PerformanceMonitor();
window.errorHandler = new ErrorHandler();

// Export utilities to global scope
window.utils = {
    // General
    debounce,
    throttle,
    generateId,
    formatCurrency,
    formatNumber,
    timeAgo,
    
    // DOM
    $,
    $,
    createElement,
    addClassWithDelay,
    toggleVisibility,
    scrollToElement,
    
    // Data
    deepClone,
    deepMerge,
    isObject,
    getNestedProperty,
    setNestedProperty,
    
    // Array
    shuffleArray,
    getUniqueElements,
    groupBy,
    multiSort,
    
    // Storage
    storage,
    
    // Validation
    isValidEmail,
    isValidPhone,
    checkPasswordStrength,
    
    // Performance
    lazyLoad,
    
    // Animation
    animateCounter,
    staggerAnimation
};

console.log('🛠️ Utils loaded successfully');