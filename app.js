/**
 * ShopMart Main Application
 * Core application logic and UI management
 */

class ShopMartApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.cart = [];
        this.currentUser = { id: 'user_' + utils.generateId() };
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'ai-score';
        this.priceRange = { min: 0, max: 200000 };
        this.isLoading = false;
        this.currentPage = 1;
        this.productsPerPage = 12;
        
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('🚀 Initializing ShopMart Application...');
        utils.performanceMonitor.start('app_init');

        try {
            await this.loadProducts();
            this.setupEventListeners();
            this.initializeUI();
            this.loadUserData();
            this.initializeHeroAnimation();
            this.setupScrollAnimations();
            
            // Initial product load
            await this.applyFiltersAndSearch();
            
            // Track page view
            window.analyticsEngine?.trackEvent('page_view', {
                page: 'home',
                userId: this.currentUser.id
            });

            utils.performanceMonitor.end('app_init');
            console.log('✅ ShopMart Application initialized successfully');
            
            // Show welcome message
            this.showToast('Welcome to ShopMart AI!', 'success', 'AI-powered shopping experience activated');

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            window.errorHandler?.logError('App Initialization', error);
            this.showToast('Application Error', 'error', 'Please refresh the page');
        }
    }

    /**
     * Load products data
     */
    async loadProducts() {
        try {
            // In a real app, this would be an API call
            this.products = window.productsData || [];
            
            if (this.products.length === 0) {
                // Generate demo products if none exist
                this.products = this.generateDemoProducts();
                window.productsData = this.products;
            }

            console.log(`📦 Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Failed to load products:', error);
            this.products = this.generateDemoProducts();
        }
    }

    /**
     * Generate demo products for testing
     */
    generateDemoProducts() {
        return [
            {
                id: 1,
                name: "MacBook Pro 16-inch M2",
                price: 199999,
                originalPrice: 219999,
                rating: 4.8,
                category: "electronics",
                icon: "fas fa-laptop",
                description: "Powerful laptop for professionals with M2 chip",
                features: ["M2 Pro Chip", "16GB RAM", "512GB SSD", "Liquid Retina Display"],
                tags: ["laptop", "apple", "professional", "m2", "macbook"],
                brand: "Apple",
                inStock: true,
                discount: 9
            },
            {
                id: 2,
                name: "Sony WH-1000XM4",
                price: 24999,
                originalPrice: 29999,
                rating: 4.7,
                category: "electronics", 
                icon: "fas fa-headphones",
                description: "Industry-leading noise canceling headphones",
                features: ["Active Noise Canceling", "30hr Battery", "Hi-Res Audio", "Touch Controls"],
                tags: ["headphones", "sony", "wireless", "noise-canceling", "bluetooth"],
                brand: "Sony",
                inStock: true,
                discount: 17
            },
            {
                id: 3,
                name: "Clean Code: A Handbook",
                price: 1599,
                originalPrice: 1899,
                rating: 4.6,
                category: "books",
                icon: "fas fa-book",
                description: "Essential guide for software developers",
                features: ["Clean Coding", "Best Practices", "Refactoring", "Professional Development"],
                tags: ["book", "programming", "clean-code", "software-development", "coding"],
                brand: "Prentice Hall",
                inStock: true,
                discount: 16
            },
            {
                id: 4,
                name: "Nike Air Max 270",
                price: 12999,
                originalPrice: 14999,
                rating: 4.5,
                category: "clothing",
                icon: "fas fa-running",
                description: "Comfortable running shoes with Air Max technology",
                features: ["Air Max Technology", "Breathable Mesh", "Lightweight", "All-day Comfort"],
                tags: ["shoes", "nike", "running", "sports", "comfortable", "air-max"],
                brand: "Nike",
                inStock: true,
                discount: 13
            },
            {
                id: 5,
                name: "Smart Security Camera",
                price: 8999,
                originalPrice: 11999,
                rating: 4.4,
                category: "home",
                icon: "fas fa-camera",
                description: "AI-powered security camera with night vision",
                features: ["1080p HD", "Night Vision", "Motion Detection", "Cloud Storage", "AI Detection"],
                tags: ["camera", "security", "smart-home", "surveillance", "ai"],
                brand: "Xiaomi",
                inStock: true,
                discount: 25
            },
            {
                id: 6,
                name: "Professional Yoga Mat",
                price: 3999,
                originalPrice: 4999,
                rating: 4.3,
                category: "sports",
                icon: "fas fa-dumbbell",
                description: "Premium yoga mat for all fitness levels",
                features: ["Non-slip Surface", "Eco-friendly", "6mm Thickness", "Carrying Strap"],
                tags: ["yoga", "fitness", "exercise", "mat", "wellness", "eco-friendly"],
                brand: "Manduka",
                inStock: true,
                discount: 20
            },
            {
                id: 7,
                name: "iPhone 15 Pro Max",
                price: 134999,
                originalPrice: 139999,
                rating: 4.9,
                category: "electronics",
                icon: "fas fa-mobile-alt", 
                description: "Latest iPhone with titanium design and A17 Pro chip",
                features: ["A17 Pro Chip", "48MP Camera", "Titanium Build", "USB-C", "Action Button"],
                tags: ["iphone", "apple", "smartphone", "camera", "premium", "titanium"],
                brand: "Apple",
                inStock: true,
                discount: 4
            },
            {
                id: 8,
                name: "Wireless Gaming Mouse",
                price: 7999,
                originalPrice: 9999,
                rating: 4.6,
                category: "electronics",
                icon: "fas fa-mouse",
                description: "High-performance wireless gaming mouse",
                features: ["25,000 DPI", "Wireless", "RGB Lighting", "Programmable Buttons", "Ultra-fast Response"],
                tags: ["mouse", "gaming", "wireless", "rgb", "high-performance", "esports"],
                brand: "Logitech",
                inStock: true,
                discount: 20
            }
        ];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = utils.$('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }

        // Filter buttons
        utils.$$('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
                this.updateActiveFilter(e.target);
            });
        });

        // Price range sliders
        const priceMin = utils.$('#priceMin');
        const priceMax = utils.$('#priceMax');
        
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', utils.throttle(() => {
                this.updatePriceRange();
            }, 100));

            priceMax.addEventListener('input', utils.throttle(() => {
                this.updatePriceRange();
            }, 100));
        }

        // Sort dropdown
        const sortSelect = utils.$('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }

        // View toggle
        utils.$$('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });

        // Cart toggle
        const cartIcon = utils.$('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        // Modal close
        const modal = utils.$('#productModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Navigation smooth scroll
        utils.$$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                if (target.startsWith('#')) {
                    utils.scrollToElement(target);
                }
            });
        });

        // Load more products
        const loadMoreBtn = utils.$('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // Initialize counters
        this.initializeCounters();
        
        // Initialize suggestion chips
        this.updateSuggestionChips();
        
        // Initialize cart UI
        this.updateCartUI();
        
        // Setup intersection observer for scroll animations
        this.setupIntersectionObserver();
    }

    /**
     * Initialize animated counters
     */
    initializeCounters() {
        const counters = [
            { element: utils.$('[data-target="10000"]'), target: 10000 },
            { element: utils.$('[data-target="95"]'), target: 95 },
            { element: utils.$('[data-target="50000"]'), target: 50000 }
        ];

        counters.forEach(({ element, target }) => {
            if (element) {
                utils.animateCounter(element, 0, target, 2000, utils.formatNumber);
            }
        });
    }

    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe elements with scroll animations
        utils.$$('.scroll-reveal, .scroll-slide-left, .scroll-slide-right').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize hero 3D animation
     */
    initializeHeroAnimation() {
        const canvas = utils.$('#heroCanvas');
        if (!canvas || !window.THREE) return;

        try {
            // Create 3D scene
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            
            renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
            renderer.setClearColor(0x000000, 0);

            // Create geometric shapes
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x667eea,
                wireframe: true 
            });
            
            const cubes = [];
            for (let i = 0; i < 20; i++) {
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                cube.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                scene.add(cube);
                cubes.push(cube);
            }

            camera.position.z = 5;

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                
                cubes.forEach(cube => {
                    cube.rotation.x += 0.01;
                    cube.rotation.y += 0.01;
                });
                
                renderer.render(scene, camera);
            }
            
            animate();

            // Handle resize
            window.addEventListener('resize', () => {
                if (canvas.offsetWidth > 0) {
                    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
                }
            });

        } catch (error) {
            console.warn('⚠️ 3D animation failed to initialize:', error);
        }
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        // Parallax effect for hero section
        window.addEventListener('scroll', utils.throttle(() => {
            const scrollY = window.pageYOffset;
            const hero = utils.$('.hero-section');
            
            if (hero) {
                hero.style.transform = `translateY(${scrollY * 0.5}px)`;
            }

            // Navbar background on scroll
            const navbar = utils.$('.navbar');
            if (navbar) {
                if (scrollY > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }
            }
        }, 10));
    }

    /**
     * Load user data from storage
     */
    loadUserData() {
        const userData = utils.storage.get('shopmart_user', {});
        this.currentUser = { ...this.currentUser, ...userData };
        
        // Load cart data
        this.cart = utils.storage.get('shopmart_cart', []);
        this.updateCartUI();
    }

    /**
     * Save user data to storage
     */
    saveUserData() {
        utils.storage.set('shopmart_user', this.currentUser);
        utils.storage.set('shopmart_cart', this.cart);
    }

    /**
     * Handle search functionality
     */
    async handleSearch(query) {
        this.currentSearch = query.trim();
        this.currentPage = 1;
        
        // Track search event
        if (this.currentSearch) {
            window.analyticsEngine?.trackEvent('search', {
                query: this.currentSearch,
                userId: this.currentUser.id
            });

            // Update AI user behavior
            window.shopMartAI?.updateUserBehavior(this.currentUser.id, 'search', {
                query: this.currentSearch
            });
        }

        // Update suggestion chips
        this.updateSuggestionChips();
        
        await this.applyFiltersAndSearch();
    }

    /**
     * Handle filter changes
     */
    async handleFilterChange(filter) {
        this.currentFilter = filter;
        this.currentPage = 1;
        
        // Track filter event
        window.analyticsEngine?.trackEvent('filter_change', {
            filter: filter,
            userId: this.currentUser.id
        });

        await this.applyFiltersAndSearch();
    }

    /**
     * Update active filter button
     */
    updateActiveFilter(activeButton) {
        utils.$('.filter-btn').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    /**
     * Handle sort changes
     */
    async handleSortChange(sortBy) {
        this.currentSort = sortBy;
        
        // Track sort event
        window.analyticsEngine?.trackEvent('sort_change', {
            sortBy: sortBy,
            userId: this.currentUser.id
        });

        await this.applyFiltersAndSearch();
    }

    /**
     * Update price range
     */
    updatePriceRange() {
        const priceMin = utils.$('#priceMin');
        const priceMax = utils.$('#priceMax');
        const priceMinLabel = utils.$('#priceMinLabel');
        const priceMaxLabel = utils.$('#priceMaxLabel');

        if (priceMin && priceMax) {
            this.priceRange.min = parseInt(priceMin.value);
            this.priceRange.max = parseInt(priceMax.value);

            // Ensure min <= max
            if (this.priceRange.min > this.priceRange.max) {
                [this.priceRange.min, this.priceRange.max] = [this.priceRange.max, this.priceRange.min];
                priceMin.value = this.priceRange.min;
                priceMax.value = this.priceRange.max;
            }

            // Update labels
            if (priceMinLabel) priceMinLabel.textContent = utils.formatCurrency(this.priceRange.min);
            if (priceMaxLabel) priceMaxLabel.textContent = utils.formatCurrency(this.priceRange.max);

            // Apply filters
            utils.debounce(() => {
                this.applyFiltersAndSearch();
            }, 500)();
        }
    }

    /**
     * Apply filters and search
     */
    async applyFiltersAndSearch() {
        this.showLoading();

        try {
            // Filter products
            let filtered = this.filterProducts();
            
            // Get AI recommendations
            if (window.shopMartAI) {
                filtered = await window.shopMartAI.getRecommendations(
                    this.currentUser,
                    filtered,
                    {
                        searchQuery: this.currentSearch,
                        category: this.currentFilter,
                        priceRange: this.priceRange
                    }
                );
            }

            // Sort products
            filtered = this.sortProducts(filtered);
            
            this.filteredProducts = filtered;
            
            // Track recommendations shown
            window.analyticsEngine?.trackEvent('recommendations_shown', {
                count: filtered.length,
                search: this.currentSearch,
                filter: this.currentFilter,
                userId: this.currentUser.id
            });

            setTimeout(() => {
                this.hideLoading();
                this.displayProducts();
            }, 800); // Simulate processing time

        } catch (error) {
            console.error('Filter application failed:', error);
            this.hideLoading();
            this.showToast('Search Error', 'error', 'Failed to load products');
        }
    }

    /**
     * Filter products based on current criteria
     */
    filterProducts() {
        return this.products.filter(product => {
            // Category filter
            const matchesCategory = this.currentFilter === 'all' || product.category === this.currentFilter;
            
            // Search filter
            const matchesSearch = !this.currentSearch || 
                product.name.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                product.description.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                product.tags.some(tag => tag.toLowerCase().includes(this.currentSearch.toLowerCase()));
            
            // Price filter
            const matchesPrice = product.price >= this.priceRange.min && product.price <= this.priceRange.max;
            
            return matchesCategory && matchesSearch && matchesPrice;
        });
    }

    /**
     * Sort products based on current sort criteria
     */
    sortProducts(products) {
        return products.sort((a, b) => {
            switch (this.currentSort) {
                case 'ai-score':
                    return (b.aiScore || 0) - (a.aiScore || 0);
                    
                case 'rating':
                    return b.rating - a.rating;
                    
                case 'price-low':
                    return a.price - b.price;
                    
                case 'price-high':
                    return b.price - a.price;
                    
                case 'popular':
                    // Simulate popularity based on rating and random factor
                    const aPopularity = a.rating * Math.random();
                    const bPopularity = b.rating * Math.random();
                    return bPopularity - aPopularity;
                    
                default:
                    return 0;
            }
        });
    }

    /**
     * Display products in grid
     */
    displayProducts() {
        const grid = utils.$('#productsGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(0, endIndex);

        if (productsToShow.length === 0) {
            grid.innerHTML = this.getNoProductsHTML();
            return;
        }

        const productsHTML = productsToShow.map((product, index) => 
            this.createProductCardHTML(product, index)
        ).join('');

        grid.innerHTML = productsHTML;
        
        // Animate product cards
        utils.staggerAnimation(utils.$('.product-card'), 'fade-in', 100);
        
        // Update load more button
        this.updateLoadMoreButton();
    }

    /**
     * Create product card HTML
     */
    createProductCardHTML(product, index) {
        const discountBadge = product.discount ? 
            `<div class="product-discount">${product.discount}% OFF</div>` : '';
            
        const recommendationBadge = product.aiScore > 0.7 ? 
            `<div class="recommendation-badge">
                <i class="fas fa-star"></i> AI Pick
            </div>` : '';
            
        const confidenceBadge = product.confidence ? 
            `<div class="ai-confidence">${Math.round(product.confidence * 100)}%</div>` : '';

        return `
            <div class="product-card" 
                 data-product-id="${product.id}" 
                 data-category="${product.category}"
                 onclick="window.shopMartApp.showProductDetails(${product.id})"
                 style="animation-delay: ${index * 0.1}s">
                
                ${recommendationBadge}
                ${confidenceBadge}
                
                <div class="product-image">
                    <i class="${product.icon}"></i>
                </div>
                
                <div class="product-title">${product.name}</div>
                
                <div class="product-price">
                    ${utils.formatCurrency(product.price)}
                    ${product.originalPrice ? 
                        `<span class="product-original-price">${utils.formatCurrency(product.originalPrice)}</span>
                         ${discountBadge}` : ''
                    }
                </div>
                
                <div class="product-rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                
                <div class="product-description">${product.description}</div>
                
                <div class="product-features">
                    ${product.features.slice(0, 3).map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                </div>
                
                ${product.reasons ? `
                    <div class="ai-reasons">
                        <small><i class="fas fa-lightbulb"></i> ${product.reasons[0]}</small>
                    </div>
                ` : ''}
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="window.shopMartApp.addToCart(${product.id}, event)">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="wishlist-btn" onclick="window.shopMartApp.toggleWishlist(${product.id}, event)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get no products found HTML
     */
    getNoProductsHTML() {
        return `
            <div style="text-align: center; padding: 80px 20px; color: #7f8c8d; grid-column: 1 / -1;">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button class="btn btn-primary" onclick="window.shopMartApp.clearFilters()" style="margin-top: 20px;">
                    <i class="fas fa-refresh"></i> Clear Filters
                </button>
            </div>
        `;
    }

    /**
     * Show product details modal
     */
    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Track product click
        window.analyticsEngine?.trackEvent('product_click', {
            productId: productId,
            category: product.category,
            userId: this.currentUser.id
        });

        // Update AI user behavior
        window.shopMartAI?.updateUserBehavior(this.currentUser.id, 'click', {
            productId: productId,
            category: product.category,
            price: product.price
        });

        const modal = utils.$('#productModal');
        const modalTitle = utils.$('#modalTitle');
        const modalContent = utils.$('#modalContent');

        if (modalTitle) modalTitle.textContent = product.name;
        if (modalContent) {
            modalContent.innerHTML = this.createProductModalHTML(product);
        }

        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Create product modal HTML
     */
    createProductModalHTML(product) {
        const discountBadge = product.discount ? 
            `<span class="product-discount">${product.discount}% OFF</span>` : '';

        return `
            <div class="modal-product-grid">
                <div class="modal-product-image">
                    <div class="product-image">
                        <i class="${product.icon}"></i>
                    </div>
                </div>
                
                <div class="modal-product-details">
                    <div class="modal-product-price">
                        ${utils.formatCurrency(product.price)}
                        ${product.originalPrice ? `
                            <span class="product-original-price">${utils.formatCurrency(product.originalPrice)}</span>
                            ${discountBadge}
                        ` : ''}
                    </div>
                    
                    <div class="modal-product-rating">
                        <div class="stars">
                            ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span>(${product.rating}/5.0) • ${Math.floor(Math.random() * 500) + 100} reviews</span>
                    </div>
                    
                    <div class="modal-product-description">
                        ${product.description}
                    </div>
                    
                    <div class="modal-features-list">
                        <h4>Key Features:</h4>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${product.reasons ? `
                        <div class="ai-recommendation-reasons">
                            <h4><i class="fas fa-brain"></i> AI Recommendation:</h4>
                            <ul>
                                ${product.reasons.map(reason => `<li>${reason}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.shopMartApp.addToCart(${product.id}, event)" style="flex: 1;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-outline" onclick="window.shopMartApp.toggleWishlist(${product.id}, event)">
                    <i class="far fa-heart"></i> Wishlist
                </button>
            </div>
        `;
    }

    /**
     * Close product modal
     */
    closeModal() {
        const modal = utils.$('#productModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Add product to cart
     */
    addToCart(productId, event) {
        if (event) event.stopPropagation();
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Check if product already in cart
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: Date.now()
            });
        }

        // Track cart addition
        window.analyticsEngine?.trackEvent('add_to_cart', {
            productId: productId,
            price: product.price,
            userId: this.currentUser.id
        });

        // Update AI user behavior
        window.shopMartAI?.updateUserBehavior(this.currentUser.id, 'purchase', {
            productId: productId,
            price: product.price
        });

        // Update UI
        this.updateCartUI();
        this.saveUserData();
        
        // Show success message
        this.showToast('Added to Cart', 'success', `${product.name} has been added to your cart`);

        // Add visual feedback
        this.addCartAnimation(event?.target);
    }

    /**
     * Add cart animation effect
     */
    addCartAnimation(button) {
        if (!button) return;
        
        button.classList.add('click-ripple');
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.classList.remove('click-ripple');
        }, 200);
    }

    /**
     * Toggle wishlist
     */
    toggleWishlist(productId, event) {
        if (event) event.stopPropagation();
        
        // This would integrate with a wishlist system
        this.showToast('Wishlist', 'success', 'Added to wishlist');
        
        // Track wishlist action
        window.analyticsEngine?.trackEvent('wishlist_toggle', {
            productId: productId,
            userId: this.currentUser.id
        });
    }

    /**
     * Update cart UI
     */
    updateCartUI() {
        const cartCount = utils.$('.cart-count');
        const cartItems = utils.$('#cartItems');
        const cartTotal = utils.$('#cartTotal');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update cart items
        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
            }
        }

        // Update cart total
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) {
            cartTotal.textContent = totalPrice.toLocaleString();
        }
    }

    /**
     * Create cart item HTML
     */
    createCartItemHTML(item) {
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="${item.icon}"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${utils.formatCurrency(item.price)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="window.shopMartApp.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.shopMartApp.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="window.shopMartApp.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update cart item quantity
     */
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.updateCartUI();
            this.saveUserData();
        }
    }

    /**
     * Remove item from cart
     */
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
        this.saveUserData();
        this.showToast('Removed', 'success', 'Item removed from cart');
    }

    /**
     * Toggle cart sidebar
     */
    toggleCart() {
        const cartSidebar = utils.$('#cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    }

    /**
     * Update suggestion chips
     */
    updateSuggestionChips() {
        const chipsContainer = utils.$('#suggestionChips');
        if (!chipsContainer) return;

        const suggestions = this.generateSearchSuggestions();
        chipsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-chip" onclick="window.shopMartApp.applySuggestion('${suggestion}')">
                ${suggestion}
            </div>`
        ).join('');
    }

    /**
     * Generate search suggestions
     */
    generateSearchSuggestions() {
        const baseSuggestions = ['laptop', 'headphones', 'books', 'shoes', 'camera', 'phone'];
        
        if (this.currentSearch) {
            // Generate related suggestions based on current search
            return this.products
                .filter(p => p.tags.some(tag => tag.includes(this.currentSearch.toLowerCase())))
                .slice(0, 5)
                .map(p => p.tags[0]);
        }
        
        return baseSuggestions.slice(0, 6);
    }

    /**
     * Apply suggestion chip
     */
    applySuggestion(suggestion) {
        const searchInput = utils.$('#searchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            this.handleSearch(suggestion);
        }
    }

    /**
     * Toggle view (grid/list)
     */
    toggleView(view) {
        const grid = utils.$('#productsGrid');
        const viewBtns = utils.$('.view-btn');
        
        viewBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        if (grid) {
            grid.classList.toggle('list-view', view === 'list');
        }
    }

    /**
     * Load more products
     */
    loadMoreProducts() {
        this.currentPage++;
        this.displayProducts();
    }

    /**
     * Update load more button
     */
    updateLoadMoreButton() {
        const loadMoreBtn = utils.$('.load-more-btn');
        if (!loadMoreBtn) return;

        const totalShown = this.currentPage * this.productsPerPage;
        const hasMore = totalShown < this.filteredProducts.length;
        
        loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        
        if (hasMore) {
            const remaining = this.filteredProducts.length - totalShown;
            loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Load ${Math.min(remaining, this.productsPerPage)} More Products`;
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'ai-score';
        this.priceRange = { min: 0, max: 200000 };
        this.currentPage = 1;

        // Reset UI
        const searchInput = utils.$('#searchInput');
        if (searchInput) searchInput.value = '';

        const priceMin = utils.$('#priceMin');
        const priceMax = utils.$('#priceMax');
        if (priceMin) priceMin.value = 0;
        if (priceMax) priceMax.value = 200000;

        utils.$('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });

        this.updatePriceRange();
        this.applyFiltersAndSearch();
    }

    /**
     * Show loading animation
     */
    showLoading() {
        this.isLoading = true;
        const loadingSection = utils.$('#loadingSection');
        const progressFill = utils.$('#progressFill');
        const loadingText = utils.$('#loadingText');

        if (loadingSection) {
            loadingSection.classList.add('active');
        }

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
        }, 100);

        // Update loading text
        const loadingTexts = [
            'Analyzing your preferences...',
            'Applying AI recommendations...',
            'Filtering products...',
            'Optimizing results...'
        ];
        
        let textIndex = 0;
        const textInterval = setInterval(() => {
            if (loadingText) {
                loadingText.textContent = loadingTexts[textIndex];
                textIndex = (textIndex + 1) % loadingTexts.length;
            }
        }, 800);

        setTimeout(() => {
            clearInterval(textInterval);
        }, 3000);
    }

    /**
     * Hide loading animation
     */
    hideLoading() {
        this.isLoading = false;
        const loadingSection = utils.$('#loadingSection');
        
        if (loadingSection) {
            loadingSection.classList.remove('active');
        }
    }

    /**
     * Show toast notification
     */
    showToast(title, type = 'info', message = '') {
        const toastContainer = utils.$('#toastContainer');
        if (!toastContainer) return;

        const toastId = 'toast_' + Date.now();
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle', 
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const toast = utils.createElement('div', {
            className: `toast ${type}`,
            id: toastId
        }, `
            <div class="toast-icon">
                <i class="${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="window.shopMartApp.closeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `);

        toastContainer.appendChild(toast);
        
        // Show with animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            this.closeToast(toastId);
        }, 5000);
    }

    /**
     * Close toast notification
     */
    closeToast(toastId) {
        const toast = utils.$('#' + toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Start voice search (placeholder)
     */
    startVoiceSearch() {
        this.showToast('Voice Search', 'info', 'Voice search feature coming soon!');
    }

    /**
     * Scroll to products section
     */
    scrollToProducts() {
        utils.scrollToElement('#products');
    }
}

// Initialize app when DOM is loaded
function initializeApp() {
    window.shopMartApp = new ShopMartApp();
}

// Expose scroll function globally
window.scrollToProducts = () => {
    utils.scrollToElement('#products');
};

console.log('🚀 ShopMart App loaded successfully');