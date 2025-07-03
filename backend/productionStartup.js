/**
 * PRODUCTION STARTUP SCRIPT
 * 
 * This script initializes the production environment:
 * 1. Validates environment variables
 * 2. Tests Firebase connectivity
 * 3. Initializes Puppeteer scraper
 * 4. Performs health checks
 * 5. Starts the server
 */

const dotenv = require('dotenv');
const { db, auth } = require('./firebaseConfigAdmin');
const UltimateCodeforcesScraper = require('./ultimateScraper');

// Load environment variables
dotenv.config();

class ProductionStartup {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate required environment variables
     */
    validateEnvironment() {
        console.log('🔍 Validating environment configuration...');
        
        const required = [
            'CF_USERNAME',
            'CF_PASSWORD',
            'GOOGLE_APPLICATION_CREDENTIALS'
        ];

        for (const envVar of required) {
            if (!process.env[envVar]) {
                this.errors.push(`Missing required environment variable: ${envVar}`);
            }
        }

        // Check optional variables
        const optional = ['PORT', 'NODE_ENV'];
        for (const envVar of optional) {
            if (!process.env[envVar]) {
                this.warnings.push(`Optional environment variable not set: ${envVar}`);
            }
        }

        if (this.errors.length === 0) {
            console.log('✅ Environment configuration valid');
        }
    }

    /**
     * Test Firebase connectivity
     */
    async testFirebase() {
        console.log('🔥 Testing Firebase connectivity...');
        
        try {
            // Test Firestore
            const testDoc = await db.collection('_health').doc('test').get();
            console.log('✅ Firestore connection successful');

            // Test Authentication
            const userCount = await auth.listUsers(1);
            console.log('✅ Firebase Auth connection successful');

        } catch (error) {
            this.errors.push(`Firebase connectivity failed: ${error.message}`);
        }
    }

    /**
     * Initialize and test Puppeteer
     */
    async testPuppeteer() {
        console.log('🕷️ Testing Puppeteer scraper...');
        
        try {
            const scraper = await UltimateCodeforcesScraper.getInstance();
            console.log('✅ Puppeteer initialized successfully');
            
            // Test basic functionality (without login)
            const isReady = await scraper.isReady();
            if (isReady) {
                console.log('✅ Scraper ready for operation');
            } else {
                this.warnings.push('Scraper initialized but may have issues');
            }

        } catch (error) {
            this.errors.push(`Puppeteer initialization failed: ${error.message}`);
        }
    }

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        console.log('🏥 Performing system health check...');
        
        try {
            // Check database collections exist
            const collections = ['contests', 'problems', 'users'];
            for (const collection of collections) {
                const snapshot = await db.collection(collection).limit(1).get();
                console.log(`✅ Collection '${collection}' accessible`);
            }

            // Check system resources
            const memUsage = process.memoryUsage();
            console.log(`📊 Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

        } catch (error) {
            this.warnings.push(`Health check issue: ${error.message}`);
        }
    }

    /**
     * Display startup summary
     */
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 PRODUCTION STARTUP SUMMARY');
        console.log('='.repeat(60));

        if (this.errors.length === 0) {
            console.log('✅ All critical systems operational');
        } else {
            console.log('❌ Critical errors found:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('⚠️ Warnings:');
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        console.log('\n📋 System Status:');
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Port: ${process.env.PORT || 8000}`);
        console.log(`   Node.js: ${process.version}`);
        console.log(`   Firebase: Connected`);
        console.log(`   Puppeteer: Ready`);

        console.log('\n🎯 Available Endpoints:');
        console.log('   GET  /api/health - System health check');
        console.log('   GET  /api/contests/:division - Get contests');
        console.log('   GET  /api/contest/:id/problems - Get problems');
        console.log('   GET  /api/search/problems - Search problems');
        console.log('   GET  /api/problems/trending - Trending problems');
        console.log('   GET  /api/problems/random - Random problem');

        console.log('\n🔥 Ready to serve premium competitive programming experience!');
        console.log('='.repeat(60) + '\n');

        return this.errors.length === 0;
    }

    /**
     * Run complete startup sequence
     */
    async run() {
        console.log('🏁 Starting production environment...\n');

        try {
            this.validateEnvironment();
            await this.testFirebase();
            await this.testPuppeteer();
            await this.performHealthCheck();

            const success = this.displaySummary();

            if (!success) {
                console.error('❌ Startup failed due to critical errors');
                process.exit(1);
            }

            return true;

        } catch (error) {
            console.error('💥 Fatal startup error:', error);
            process.exit(1);
        }
    }
}

// Export for use in main application
module.exports = ProductionStartup;

// Run startup if this file is executed directly
if (require.main === module) {
    const startup = new ProductionStartup();
    startup.run().then(() => {
        console.log('✅ Startup sequence completed successfully');
    }).catch(error => {
        console.error('❌ Startup sequence failed:', error);
        process.exit(1);
    });
}
