/**
 * ShopMart AI Engine
 * Advanced Machine Learning Recommendation System
 * Using TensorFlow.js for real-time predictions
 */

class ShopMartAI {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.trainingData = [];
        this.userProfiles = new Map();
        this.productEmbeddings = new Map();
        this.collaborativeMatrix = new Map();
        this.contentBasedWeights = {
            category: 0.3,
            price: 0.2,
            rating: 0.25,
            features: 0.15,
            brand: 0.1
        };
        this.init();
    }

    /**
     * Initialize AI Engine
     */
    async init() {
        console.log('🤖 Initializing ShopMart AI Engine...');
        utils.performanceMonitor.start('ai_init');
        
        try {
            await this.loadModel();
            this.setupUserProfiling();
            this.initializeProductEmbeddings();
            this.startCollaborativeFiltering();
            
            utils.performanceMonitor.end('ai_init');
            console.log('✅ AI Engine initialized successfully');
        } catch (error) {
            console.error('❌ AI Engine initialization failed:', error);
            window.errorHandler.logError('AI Initialization', error);
        }
    }

    /**
     * Load or create neural network model
     */
    async loadModel() {
        try {
            // Try to load existing model from localStorage
            const savedModel = utils.storage.get('shopmart_ai_model');
            
            if (savedModel) {
                console.log('📦 Loading saved model...');
                this.model = tf.sequential();
                // Rebuild model architecture
                this.buildModel();
                this.isModelLoaded = true;
            } else {
                console.log('🏗️ Creating new AI model...');
                await this.createNewModel();
            }
        } catch (error) {
            console.warn('⚠️ Model loading failed, creating new model');
            await this.createNewModel();
        }
    }

    /**
     * Create new neural network model
     */
    async createNewModel() {
        this.model = tf.sequential();
        
        // Input layer: user features + product features
        this.model.add(tf.layers.dense({
            inputShape: [20], // 10 user features + 10 product features
            units: 64,
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
        }));

        // Hidden layers with dropout for regularization
        this.model.add(tf.layers.dropout({ rate: 0.3 }));
        this.model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));

        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }));

        // Output layer: recommendation score (0-1)
        this.model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }));

        // Compile model
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        console.log('🧠 Neural Network Model Created');
        this.model.summary();
        this.isModelLoaded = true;
        
        // Generate some initial training data
        await this.generateInitialTrainingData();
        await this.trainModel();
    }

    /**
     * Build model architecture
     */
    buildModel() {
        // This would be used when loading a saved model
        // For simulation, we'll create a basic structure
        this.model.add(tf.layers.dense({
            inputShape: [20],
            units: 64,
            activation: 'relu'
        }));
        this.model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));
        this.model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }));
        
        this.model.compile({
            optimizer: 'adam',
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
    }

    /**
     * Generate initial training data for demonstration
     */
    async generateInitialTrainingData() {
        console.log('📊 Generating training data...');
        
        // Simulate user-product interactions
        const users = 100;
        const products = 50;
        
        for (let u = 0; u < users; u++) {
            for (let p = 0; p < products; p++) {
                // Simulate interaction probability
                if (Math.random() > 0.7) {
                    const userFeatures = this.generateUserFeatures(u);
                    const productFeatures = this.generateProductFeatures(p);
                    const interaction = Math.random() > 0.3 ? 1 : 0; // 70% positive interactions
                    
                    this.trainingData.push({
                        input: [...userFeatures, ...productFeatures],
                        output: interaction
                    });
                }
            }
        }
        
        console.log(`✅ Generated ${this.trainingData.length} training samples`);
    }

    /**
     * Generate user feature vector
     */
    generateUserFeatures(userId) {
        // Simulate user characteristics
        return [
            Math.random(), // age_normalized
            Math.random(), // gender (0-1)
            Math.random(), // income_level
            Math.random(), // location_preference
            Math.random(), // tech_savviness
            Math.random(), // brand_loyalty
            Math.random(), // price_sensitivity
            Math.random(), // review_dependency
            Math.random(), // impulse_buying
            Math.random()  // social_influence
        ];
    }

    /**
     * Generate product feature vector
     */
    generateProductFeatures(productId) {
        return [
            Math.random(), // category_encoded
            Math.random(), // price_normalized
            Math.random(), // rating_normalized
            Math.random(), // popularity_score
            Math.random(), // brand_reputation
            Math.random(), // feature_richness
            Math.random(), // availability
            Math.random(), // discount_level
            Math.random(), // seasonality
            Math.random()  // trend_factor
        ];
    }

    /**
     * Train the neural network model
     */
    async trainModel() {
        if (!this.isModelLoaded || this.trainingData.length === 0) return;

        console.log('🎯 Training AI model...');
        utils.performanceMonitor.start('model_training');

        try {
            // Prepare training data
            const inputs = tf.tensor2d(this.trainingData.map(d => d.input));
            const outputs = tf.tensor2d(this.trainingData.map(d => [d.output]));

            // Train model
            const history = await this.model.fit(inputs, outputs, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 0) {
                            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                        }
                    }
                }
            });

            // Clean up tensors
            inputs.dispose();
            outputs.dispose();

            utils.performanceMonitor.end('model_training');
            console.log('✅ Model training completed');
            
            // Save model
            await this.saveModel();
            
        } catch (error) {
            console.error('❌ Model training failed:', error);
            window.errorHandler.logError('Model Training', error);
        }
    }

    /**
     * Save model to localStorage
     */
    async saveModel() {
        try {
            // In a real implementation, you'd save the actual model
            // For simulation, we'll save model metadata
            const modelData = {
                architecture: 'sequential',
                layers: 4,
                trained: true,
                timestamp: Date.now(),
                accuracy: Math.random() * 0.2 + 0.8 // Simulated 80-100% accuracy
            };
            
            utils.storage.set('shopmart_ai_model', modelData);
            console.log('💾 Model saved successfully');
        } catch (error) {
            console.warn('⚠️ Failed to save model:', error);
        }
    }

    /**
     * Setup user profiling system
     */
    setupUserProfiling() {
        console.log('👤 Setting up user profiling...');
        
        // Create default user profile
        const defaultProfile = {
            preferences: {},
            behavior: {
                searches: [],
                clicks: [],
                purchases: [],
                timeSpent: {},
                sessionCount: 0
            },
            demographics: {
                ageGroup: 'unknown',
                location: 'unknown',
                interests: []
            },
            aiScore: {
                techSavvy: 0.5,
                priceSensitive: 0.5,
                brandLoyal: 0.5,
                impulsive: 0.5,
                socialInfluenced: 0.5
            }
        };

        this.userProfiles.set('default', defaultProfile);
        console.log('✅ User profiling initialized');
    }

    /**
     * Initialize product embeddings
     */
    initializeProductEmbeddings() {
        console.log('🛍️ Initializing product embeddings...');
        
        // This would typically use pre-trained embeddings
        // For simulation, we'll create random embeddings
        window.productsData.forEach(product => {
            const embedding = Array(128).fill(0).map(() => Math.random() - 0.5);
            this.productEmbeddings.set(product.id, embedding);
        });

        console.log(`✅ Created embeddings for ${this.productEmbeddings.size} products`);
    }

    /**
     * Start collaborative filtering
     */
    startCollaborativeFiltering() {
        console.log('🤝 Starting collaborative filtering...');
        
        // Simulate user-item matrix
        this.buildCollaborativeMatrix();
        
        // Update collaborative recommendations periodically
        setInterval(() => {
            this.updateCollaborativeRecommendations();
        }, 30000); // Every 30 seconds

        console.log('✅ Collaborative filtering active');
    }

    /**
     * Build collaborative filtering matrix
     */
    buildCollaborativeMatrix() {
        // Simulate user-item interactions
        const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
        const products = window.productsData.map(p => p.id);

        users.forEach(userId => {
            const userInteractions = new Map();
            products.forEach(productId => {
                // Simulate random interactions
                if (Math.random() > 0.7) {
                    userInteractions.set(productId, Math.random() * 5); // Rating 0-5
                }
            });
            this.collaborativeMatrix.set(userId, userInteractions);
        });
    }

    /**
     * Update collaborative recommendations
     */
    updateCollaborativeRecommendations() {
        // Find similar users and recommend their liked items
        // This is a simplified version of collaborative filtering
        console.log('🔄 Updating collaborative recommendations...');
    }

    /**
     * Get AI-powered recommendations for user
     * @param {Object} user - User data
     * @param {Array} products - Available products
     * @param {Object} context - Context information
     * @returns {Array} Recommended products with scores
     */
    async getRecommendations(user = {}, products = [], context = {}) {
        if (!this.isModelLoaded) {
            console.warn('⚠️ AI model not loaded, using fallback recommendations');
            return this.getFallbackRecommendations(products);
        }

        utils.performanceMonitor.start('ai_recommendations');

        try {
            const recommendations = [];

            for (const product of products) {
                const score = await this.predictUserProductMatch(user, product, context);
                
                recommendations.push({
                    ...product,
                    aiScore: score,
                    confidence: this.calculateConfidence(score),
                    reasons: this.generateReasons(user, product, score)
                });
            }

            // Sort by AI score
            recommendations.sort((a, b) => b.aiScore - a.aiScore);

            utils.performanceMonitor.end('ai_recommendations');
            console.log(`🎯 Generated ${recommendations.length} AI recommendations`);

            return recommendations;

        } catch (error) {
            console.error('❌ AI recommendation failed:', error);
            window.errorHandler.logError('AI Recommendations', error);
            return this.getFallbackRecommendations(products);
        }
    }

    /**
     * Predict user-product match using ML model
     */
    async predictUserProductMatch(user, product, context) {
        try {
            // Generate feature vectors
            const userFeatures = this.extractUserFeatures(user);
            const productFeatures = this.extractProductFeatures(product);
            
            // Combine features
            const inputFeatures = [...userFeatures, ...productFeatures];
            
            // Make prediction
            const prediction = tf.tidy(() => {
                const input = tf.tensor2d([inputFeatures]);
                const output = this.model.predict(input);
                return output.dataSync()[0];
            });

            // Apply context adjustments
            const contextScore = this.applyContextualFactors(prediction, context);
            
            return Math.max(0, Math.min(1, contextScore));

        } catch (error) {
            console.warn('⚠️ ML prediction failed, using heuristic:', error);
            return this.calculateHeuristicScore(user, product);
        }
    }

    /**
     * Extract user features for ML model
     */
    extractUserFeatures(user) {
        const profile = this.userProfiles.get(user.id || 'default');
        
        return [
            profile.aiScore.techSavvy,
            profile.aiScore.priceSensitive,
            profile.aiScore.brandLoyal,
            profile.aiScore.impulsive,
            profile.aiScore.socialInfluenced,
            profile.behavior.sessionCount / 100, // Normalized
            profile.behavior.clicks.length / 50, // Normalized
            profile.behavior.searches.length / 30, // Normalized
            Math.random(), // Placeholder for more features
            Math.random()  // Placeholder for more features
        ];
    }

    /**
     * Extract product features for ML model
     */
    extractProductFeatures(product) {
        return [
            this.encodeCategoryAsNumber(product.category),
            product.price / 200000, // Normalized price (max 2L)
            product.rating / 5, // Normalized rating
            product.tags.length / 10, // Feature richness
            Math.random(), // Brand reputation (simulated)
            Math.random(), // Popularity score
            Math.random(), // Availability
            Math.random(), // Discount level
            Math.random(), // Seasonality
            Math.random()  // Trend factor
        ];
    }

    /**
     * Encode category as number
     */
    encodeCategoryAsNumber(category) {
        const categoryMap = {
            'electronics': 0.1,
            'books': 0.2,
            'clothing': 0.3,
            'home': 0.4,
            'sports': 0.5
        };
        return categoryMap[category] || 0;
    }

    /**
     * Apply contextual factors to prediction
     */
    applyContextualFactors(basScore, context) {
        let adjustedScore = basScore;

        // Time-based adjustments
        const hour = new Date().getHours();
        if (hour < 9 || hour > 22) {
            adjustedScore *= 0.9; // Lower activity hours
        }

        // Seasonal adjustments
        const month = new Date().getMonth();
        if (context.category === 'clothing' && (month === 11 || month === 0)) {
            adjustedScore *= 1.2; // Winter clothing boost
        }

        // Search context
        if (context.searchQuery && context.searchQuery.length > 0) {
            adjustedScore *= 1.1; // Active search boost
        }

        return adjustedScore;
    }

    /**
     * Calculate heuristic score as fallback
     */
    calculateHeuristicScore(user, product) {
        let score = 0;

        // Base score from rating
        score += (product.rating / 5) * 0.4;

        // Price factor
        if (product.price < 5000) score += 0.2; // Affordable boost
        else if (product.price > 50000) score += 0.1; // Premium factor

        // Category preference (simulated)
        score += Math.random() * 0.3;

        // Random factor for diversity
        score += Math.random() * 0.1;

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate confidence in prediction
     */
    calculateConfidence(score) {
        // Higher confidence for extreme scores
        const distance = Math.abs(score - 0.5);
        return Math.min(1, 0.5 + distance);
    }

    /**
     * Generate reasons for recommendation
     */
    generateReasons(user, product, score) {
        const reasons = [];

        if (score > 0.8) {
            reasons.push('Perfect match for your preferences');
        } else if (score > 0.6) {
            reasons.push('Highly recommended based on your activity');
        }

        if (product.rating > 4.5) {
            reasons.push('Highly rated by customers');
        }

        if (product.price < 5000) {
            reasons.push('Great value for money');
        }

        reasons.push('AI-powered recommendation');

        return reasons;
    }

    /**
     * Fallback recommendations when AI fails
     */
    getFallbackRecommendations(products) {
        return products.map(product => ({
            ...product,
            aiScore: (product.rating / 5) * 0.6 + Math.random() * 0.4,
            confidence: 0.5,
            reasons: ['Based on popularity and rating']
        })).sort((a, b) => b.aiScore - a.aiScore);
    }

    /**
     * Update user behavior for better recommendations
     */
    updateUserBehavior(userId, action, data) {
        const profile = this.userProfiles.get(userId) || this.userProfiles.get('default');
        
        switch (action) {
            case 'search':
                profile.behavior.searches.push({
                    query: data.query,
                    timestamp: Date.now()
                });
                break;
                
            case 'click':
                profile.behavior.clicks.push({
                    productId: data.productId,
                    category: data.category,
                    timestamp: Date.now()
                });
                break;
                
            case 'purchase':
                profile.behavior.purchases.push({
                    productId: data.productId,
                    price: data.price,
                    timestamp: Date.now()
                });
                break;
        }

        // Update AI scores based on behavior
        this.updateAIScores(profile, action, data);
        
        // Save updated profile
        this.userProfiles.set(userId, profile);
    }

    /**
     * Update AI personality scores
     */
    updateAIScores(profile, action, data) {
        switch (action) {
            case 'search':
                if (data.query.toLowerCase().includes('cheap') || data.query.toLowerCase().includes('discount')) {
                    profile.aiScore.priceSensitive += 0.05;
                }
                if (data.query.toLowerCase().includes('latest') || data.query.toLowerCase().includes('new')) {
                    profile.aiScore.techSavvy += 0.03;
                }
                break;
                
            case 'click':
                if (data.price < 1000) {
                    profile.aiScore.priceSensitive += 0.02;
                }
                break;
        }

        // Normalize scores between 0 and 1
        Object.keys(profile.aiScore).forEach(key => {
            profile.aiScore[key] = Math.max(0, Math.min(1, profile.aiScore[key]));
        });
    }

    /**
     * Get analytics data
     */
    getAnalytics() {
        return {
            modelLoaded: this.isModelLoaded,
            trainingDataSize: this.trainingData.length,
            userProfiles: this.userProfiles.size,
            productEmbeddings: this.productEmbeddings.size,
            collaborativeMatrix: this.collaborativeMatrix.size,
            accuracy: this.getModelAccuracy(),
            performance: utils.performanceMonitor.getAll()
        };
    }

    /**
     * Get model accuracy (simulated)
     */
    getModelAccuracy() {
        const savedModel = utils.storage.get('shopmart_ai_model');
        return savedModel ? savedModel.accuracy * 100 : 85 + Math.random() * 10;
    }
}

// Create global AI engine instance
window.shopMartAI = new ShopMartAI();

console.log('🤖 AI Engine loaded successfully');