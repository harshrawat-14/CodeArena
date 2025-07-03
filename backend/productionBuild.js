/**
 * PRODUCTION BUILD SCRIPT
 * 
 * This script builds the production database by:
 * 1. Scraping all recent contests and problems
 * 2. Processing and optimizing data
 * 3. Building search indices
 * 4. Populating Firebase collections
 * 5. Creating backups and statistics
 */

require('dotenv').config(); // Load environment variables
const ContestProcessor = require('./buildProcessor');
const { db } = require('./firebaseConfigAdmin');
const fs = require('fs').promises;
const path = require('path');

class ProductionBuilder {
    constructor() {
        this.processor = null;
        this.stats = {
            totalContests: 0,
            totalProblems: 0,
            successRate: 0,
            buildTime: 0,
            errors: [],
            warnings: []
        };
        this.startTime = Date.now();
    }

    /**
     * Initialize the build process
     */
    async init() {
        console.log('🏗️ Initializing Production Build Process...');
        console.log('=' .repeat(60));
        
        this.processor = new ContestProcessor();
        await this.processor.init();
        
        console.log('✅ Build processor initialized');
    }

    /**
     * Build the complete database
     */
    async buildDatabase() {
        console.log('\n🗄️ Building production database...');
        console.log(`🔐 Using credentials for: ${process.env.CF_USERNAME || 'NOT SET'}`);
        
        try {
            // Process exactly 50 most recent contests
            console.log('📊 Processing 50 most recent contests...');
            await this.processor.processRecentContestsLimit(50);
            
            // Process popular problems
            console.log('🔥 Processing popular problems...');
            await this.processor.processPopularProblems();
            
            // Build search indices
            console.log('🔍 Building search indices...');
            await this.buildSearchIndices();
            
            // Update statistics
            await this.updateStats();
            
            console.log('✅ Database build completed successfully');
            
        } catch (error) {
            console.error('❌ Database build failed:', error);
            this.stats.errors.push(`Database build: ${error.message}`);
            throw error;
        }
    }

    /**
     * Build search indices for fast querying
     */
    async buildSearchIndices() {
        console.log('🔍 Building search indices...');
        
        try {
            // Create problem name index
            const problemsRef = db.collection('problems');
            const problemsSnapshot = await problemsRef.get();
            
            const searchIndex = {};
            
            problemsSnapshot.forEach(doc => {
                const problem = doc.data();
                const searchKey = problem.name?.toLowerCase() || '';
                
                if (searchKey) {
                    // Create searchable terms
                    const terms = searchKey.split(/\s+/).filter(term => term.length > 2);
                    
                    terms.forEach(term => {
                        if (!searchIndex[term]) {
                            searchIndex[term] = [];
                        }
                        searchIndex[term].push(doc.id);
                    });
                }
            });
            
            // Store search index
            await db.collection('_indices').doc('problemNames').set({
                index: searchIndex,
                updatedAt: new Date().toISOString(),
                totalProblems: problemsSnapshot.size
            });
            
            console.log(`✅ Search index built with ${Object.keys(searchIndex).length} terms`);
            
        } catch (error) {
            console.error('❌ Failed to build search indices:', error);
            this.stats.warnings.push(`Search index: ${error.message}`);
        }
    }

    /**
     * Update system statistics
     */
    async updateStats() {
        console.log('📊 Updating system statistics...');
        
        try {
            // Count contests
            const contestsSnapshot = await db.collection('contests').get();
            this.stats.totalContests = contestsSnapshot.size;
            
            // Count problems
            const problemsSnapshot = await db.collection('problems').get();
            this.stats.totalProblems = problemsSnapshot.size;
            
            // Calculate success rate
            const processorStats = this.processor.getStatistics();
            this.stats.successRate = processorStats.successfulScrapes / 
                (processorStats.successfulScrapes + processorStats.failedScrapes) * 100;
            
            // Store stats in database
            await db.collection('_system').doc('stats').set({
                ...this.stats,
                lastUpdated: new Date().toISOString(),
                buildVersion: '2.0.0'
            });
            
            console.log(`✅ Statistics updated: ${this.stats.totalContests} contests, ${this.stats.totalProblems} problems`);
            
        } catch (error) {
            console.error('❌ Failed to update statistics:', error);
            this.stats.warnings.push(`Statistics: ${error.message}`);
        }
    }

    /**
     * Create database backup
     */
    async createBackup() {
        console.log('💾 Creating database backup...');
        
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                stats: this.stats,
                collections: {}
            };
            
            // Backup critical collections
            const collections = ['contests', 'problems', '_indices', '_system'];
            
            for (const collectionName of collections) {
                const snapshot = await db.collection(collectionName).get();
                backupData.collections[collectionName] = {};
                snapshot.forEach(doc => {
                    backupData.collections[collectionName][doc.id] = doc.data();
                });
                
                console.log(`✅ Backed up ${collectionName}: ${snapshot.size} documents`);
            }
            
            // Save backup to file
            const backupPath = path.join(__dirname, 'backups', 
                `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
            
            await fs.mkdir(path.dirname(backupPath), { recursive: true });
            await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
            
            console.log(`✅ Backup created: ${backupPath}`);
            
        } catch (error) {
            console.error('❌ Failed to create backup:', error);
            this.stats.warnings.push(`Backup: ${error.message}`);
        }
    }

    /**
     * Generate build report
     */
    generateReport() {
        this.stats.buildTime = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 PRODUCTION BUILD REPORT');
        console.log('='.repeat(60));
        
        console.log(`🏗️ Build completed in: ${Math.round(this.stats.buildTime / 1000)}s`);
        console.log(`📊 Total contests: ${this.stats.totalContests}`);
        console.log(`🎯 Total problems: ${this.stats.totalProblems}`);
        console.log(`✅ Success rate: ${this.stats.successRate.toFixed(1)}%`);
        
        if (this.stats.errors.length > 0) {
            console.log(`❌ Errors: ${this.stats.errors.length}`);
            this.stats.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.stats.warnings.length > 0) {
            console.log(`⚠️ Warnings: ${this.stats.warnings.length}`);
            this.stats.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        console.log('\n🎉 Production database is ready for lightning-fast queries!');
        console.log('='.repeat(60));
        
        return this.stats.errors.length === 0;
    }

    /**
     * Run the complete build process
     */
    async build() {
        try {
            await this.init();
            await this.buildDatabase();
            await this.createBackup();
            
            const success = this.generateReport();
            
            if (!success) {
                console.error('❌ Build completed with errors');
                process.exit(1);
            }
            
            console.log('🚀 Production build successful!');
            return true;
            
        } catch (error) {
            console.error('💥 Build process failed:', error);
            this.stats.errors.push(`Build process: ${error.message}`);
            this.generateReport();
            process.exit(1);
        }
    }
}

// Export for use in other modules
module.exports = ProductionBuilder;

// Run build if this file is executed directly
if (require.main === module) {
    const builder = new ProductionBuilder();
    
    console.log('🏗️ Starting Production Build...');
    console.log('This may take 30-60 minutes depending on network speed.\n');
    
    builder.build().then(() => {
        console.log('✅ Build process completed successfully');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Build process failed:', error);
        process.exit(1);
    });
}
