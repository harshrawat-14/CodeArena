/**
 * BUILD-TIME CONTEST PROCESSOR
 * 
 * This script runs during build time to:
 * 1. Scrape all contest data with problems and test cases
 * 2. Store everything in Firebase for lightning-fast runtime access
 * 3. Create optimized data structures for instant queries
 * 4. Build search indices for premium user experience
 */

require('dotenv').config(); // Load environment variables
const UltimateCodeforcesScraper = require('./ultimateScraper');
const { db } = require('./firebaseConfigAdmin');
const axios = require('axios');

class ContestProcessor {
    constructor() {
        this.scraper = null;
        this.processedContests = new Set();
        this.statistics = {
            totalContests: 0,
            totalProblems: 0,
            successfulScrapes: 0,
            failedScrapes: 0,
            startTime: Date.now()
        };
    }

    /**
     * Initialize the processor
     */
    async init() {
        console.log('🚀 Initializing Build-Time Contest Processor...');
        this.scraper = await UltimateCodeforcesScraper.getInstance();
        console.log('✅ Processor ready');
    }

    /**
     * Get all contests from Codeforces API
     */
    async getAllContests() {
        console.log('📊 Fetching all contests from Codeforces API...');
        
        try {
            const response = await axios.get('https://codeforces.com/api/contest.list');
            const contests = response.data.result;
            
            // Filter for finished contests only
            const finishedContests = contests.filter(contest => 
                contest.phase === 'FINISHED' && 
                contest.type === 'CF' // Only Codeforces rounds
            );
            
            console.log(`✅ Found ${finishedContests.length} finished contests`);
            this.statistics.totalContests = finishedContests.length;
            
            return finishedContests;
        } catch (error) {
            console.error('❌ Failed to fetch contests:', error.message);
            throw error;
        }
    }

    /**
     * Get contest problems from API
     */
    async getContestProblems(contestId) {
        try {
            const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`;
            const response = await axios.get(url);
            return response.data.result.problems;
        } catch (error) {
            console.warn(`⚠️ Failed to get problems for contest ${contestId}:`, error.message);
            return [];
        }
    }

    /**
     * Process a single contest - scrape all problems and store in DB
     */
    async processContest(contest) {
        const contestId = contest.id;
        console.log(`\n🎯 Processing Contest ${contestId}: ${contest.name}`);
        
        try {
            // Check if already processed
            const contestRef = db.collection('contests').doc(contestId.toString());
            const contestDoc = await contestRef.get();
            
            if (contestDoc.exists && contestDoc.data().processed) {
                console.log(`⏭️ Contest ${contestId} already processed, skipping...`);
                return;
            }

            // Get problems from API
            const problems = await this.getContestProblems(contestId);
            if (problems.length === 0) {
                console.log(`⚠️ No problems found for contest ${contestId}`);
                return;
            }

            console.log(`📝 Found ${problems.length} problems: ${problems.map(p => p.index).join(', ')}`);
            this.statistics.totalProblems += problems.length;

            // Scrape all problems
            const problemIndices = problems.map(p => p.index);
            const scrapeResults = await this.scraper.batchScrape(contestId, problemIndices);

            // Process and store each problem
            const processedProblems = [];
            for (const result of scrapeResults) {
                if (result.success) {
                    const problemData = this.optimizeProblemData(contest, result.data, result.index);
                    processedProblems.push(problemData);
                    
                    // Store individual problem
                    await this.storeProblem(contestId, result.index, problemData);
                    this.statistics.successfulScrapes++;
                } else {
                    this.statistics.failedScrapes++;
                }
            }

            // Store contest metadata
            await this.storeContest(contest, processedProblems);
            
            console.log(`✅ Contest ${contestId} processed successfully`);
            this.processedContests.add(contestId);

        } catch (error) {
            console.error(`❌ Failed to process contest ${contestId}:`, error.message);
        }
    }

    /**
     * Optimize problem data for storage and retrieval
     */
    optimizeProblemData(contest, scrapedData, problemIndex) {
        return {
            // Core identification
            contestId: contest.id,
            contestName: contest.name,
            problemIndex,
            
            // Problem metadata
            title: scrapedData.title,
            timeLimit: this.parseTimeLimit(scrapedData.timeLimit),
            memoryLimit: this.parseMemoryLimit(scrapedData.memoryLimit),
            
            // Problem content (optimized)
            statement: {
                html: scrapedData.html,
                inputSpec: scrapedData.inputSpec,
                outputSpec: scrapedData.outputSpec,
                note: scrapedData.note
            },
            
            // Test cases
            sampleTests: scrapedData.sampleTests,
            
            // Metadata for search and filtering
            tags: scrapedData.tags,
            difficulty: this.estimateDifficulty(contest, problemIndex),
            
            // Optimization data
            searchTerms: this.generateSearchTerms(scrapedData),
            processedAt: new Date().toISOString(),
            
            // URLs for reference
            problemUrl: `https://codeforces.com/contest/${contest.id}/problem/${problemIndex}`,
            
            // Contest context
            contestType: this.determineContestType(contest.name),
            contestDate: new Date(contest.startTimeSeconds * 1000).toISOString()
        };
    }

    /**
     * Parse time limit to standardized format
     */
    parseTimeLimit(timeLimit) {
        const match = timeLimit.match(/(\d+(?:\.\d+)?)\s*seconds?/i);
        return match ? parseFloat(match[1]) : null;
    }

    /**
     * Parse memory limit to standardized format (MB)
     */
    parseMemoryLimit(memoryLimit) {
        const match = memoryLimit.match(/(\d+)\s*megabytes?/i);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Estimate difficulty based on contest and problem position
     */
    estimateDifficulty(contest, problemIndex) {
        const position = problemIndex.charCodeAt(0) - 65; // A=0, B=1, etc.
        
        // Base difficulty by position
        const baseDifficulty = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200][position] || 2400;
        
        // Adjust based on contest type
        if (contest.name.includes('Div. 1')) return baseDifficulty + 400;
        if (contest.name.includes('Div. 2')) return baseDifficulty;
        if (contest.name.includes('Div. 3')) return baseDifficulty - 200;
        if (contest.name.includes('Div. 4')) return baseDifficulty - 400;
        
        return baseDifficulty;
    }

    /**
     * Determine contest type for categorization
     */
    determineContestType(contestName) {
        if (contestName.includes('Div. 1')) return 'div1';
        if (contestName.includes('Div. 2')) return 'div2';
        if (contestName.includes('Div. 3')) return 'div3';
        if (contestName.includes('Div. 4')) return 'div4';
        if (contestName.includes('Educational')) return 'educational';
        if (contestName.includes('Global')) return 'global';
        return 'other';
    }

    /**
     * Generate search terms for fast problem discovery
     */
    generateSearchTerms(scrapedData) {
        const terms = new Set();
        
        // Add title words
        scrapedData.title.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .forEach(word => word.length > 2 && terms.add(word));
        
        // Add tags
        scrapedData.tags.forEach(tag => terms.add(tag.toLowerCase()));
        
        // Extract key terms from problem statement
        const htmlText = scrapedData.html.replace(/<[^>]*>/g, ' ').toLowerCase();
        const keywords = htmlText.match(/\b(array|string|tree|graph|dp|greedy|sort|binary|search|math|geometry|game|interactive)\b/g);
        if (keywords) {
            keywords.forEach(keyword => terms.add(keyword));
        }
        
        return Array.from(terms);
    }

    /**
     * Store problem in optimized database structure
     */
    async storeProblem(contestId, problemIndex, problemData) {
        const problemRef = db.collection('problems').doc(`${contestId}_${problemIndex}`);
        
        // Store main problem data
        await problemRef.set(problemData);
        
        // Store in search index
        const searchRef = db.collection('searchIndex').doc(`${contestId}_${problemIndex}`);
        await searchRef.set({
            contestId,
            problemIndex,
            title: problemData.title,
            tags: problemData.tags,
            searchTerms: problemData.searchTerms,
            difficulty: problemData.difficulty,
            contestType: problemData.contestType
        });
        
        console.log(`💾 Stored problem ${contestId}/${problemIndex}`);
    }

    /**
     * Store contest metadata
     */
    async storeContest(contest, problems) {
        const contestRef = db.collection('contests').doc(contest.id.toString());
        
        const contestData = {
            id: contest.id,
            name: contest.name,
            type: contest.type,
            phase: contest.phase,
            durationSeconds: contest.durationSeconds,
            startTimeSeconds: contest.startTimeSeconds,
            problems: problems.map(p => ({
                index: p.problemIndex,
                title: p.title,
                difficulty: p.difficulty,
                tags: p.tags
            })),
            processed: true,
            processedAt: new Date().toISOString(),
            totalProblems: problems.length
        };
        
        await contestRef.set(contestData);
        console.log(`💾 Stored contest ${contest.id} metadata`);
    }

    /**
     * Build search indices for lightning-fast queries
     */
    async buildSearchIndices() {
        console.log('🔍 Building search indices...');
        
        // Difficulty-based index
        const difficultyIndex = {};
        const tagsIndex = {};
        const typeIndex = {};
        
        const searchDocs = await db.collection('searchIndex').get();
        
        searchDocs.forEach(doc => {
            const data = doc.data();
            
            // Group by difficulty ranges
            const diffRange = Math.floor(data.difficulty / 200) * 200;
            if (!difficultyIndex[diffRange]) difficultyIndex[diffRange] = [];
            difficultyIndex[diffRange].push(doc.id);
            
            // Group by tags
            data.tags.forEach(tag => {
                if (!tagsIndex[tag]) tagsIndex[tag] = [];
                tagsIndex[tag].push(doc.id);
            });
            
            // Group by contest type
            if (!typeIndex[data.contestType]) typeIndex[data.contestType] = [];
            typeIndex[data.contestType].push(doc.id);
        });
        
        // Store indices
        await db.collection('indices').doc('difficulty').set(difficultyIndex);
        await db.collection('indices').doc('tags').set(tagsIndex);
        await db.collection('indices').doc('types').set(typeIndex);
        
        console.log('✅ Search indices built');
    }

    /**
     * Process recent contests (last N months)
     */
    async processRecentContests(months = 24) {
        console.log(`🕐 Processing contests from the last ${months} months...`);
        
        try {
            const contests = await this.getAllContests();
            
            // Calculate cutoff date (N months ago)
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - months);
            const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
            
            // Filter recent contests
            const recentContests = contests.filter(contest => 
                contest.startTimeSeconds >= cutoffTimestamp
            );
            
            console.log(`📊 Found ${recentContests.length} recent contests out of ${contests.length} total`);
            
            // Sort by most recent first
            recentContests.sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);
            
            // Process in batches
            const batchSize = 5;
            for (let i = 0; i < recentContests.length; i += batchSize) {
                const batch = recentContests.slice(i, i + batchSize);
                
                console.log(`\n📦 Processing recent contest batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(recentContests.length/batchSize)}`);
                
                // Process contests in parallel within batch
                await Promise.all(batch.map(contest => this.processContest(contest)));
                
                // Progress update
                this.printProgress();
                
                // Brief pause between batches
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            console.log(`✅ Recent contests processing completed`);
            
        } catch (error) {
            console.error('❌ Recent contests processing failed:', error.message);
            throw error;
        }
    }

    /**
     * Process exactly N recent contests (for production build)
     */
    async processRecentContestsLimit(contestLimit = 50) {
        console.log(`🕐 Processing the ${contestLimit} most recent contests...`);
        
        try {
            const contests = await this.getAllContests();
            
            // Sort by most recent first
            contests.sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);
            
            // Take only the specified number of most recent contests
            const recentContests = contests.slice(0, contestLimit);
            
            console.log(`📊 Selected ${recentContests.length} most recent contests out of ${contests.length} total`);
            
            // Process in batches
            const batchSize = 5;
            for (let i = 0; i < recentContests.length; i += batchSize) {
                const batch = recentContests.slice(i, i + batchSize);
                
                console.log(`\n📦 Processing contest batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(recentContests.length/batchSize)}`);
                
                // Process contests in parallel within batch
                await Promise.all(batch.map(contest => this.processContest(contest)));
                
                // Progress update
                this.printProgress();
                
                // Brief pause between batches to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log(`✅ Successfully processed ${contestLimit} recent contests`);
            return this.statistics;
            
        } catch (error) {
            console.error('❌ Error processing recent contests:', error);
            throw error;
        }
    }

    /**
     * Process popular problems (high solved count, diverse difficulty)
     */
    async processPopularProblems(limit = 500) {
        console.log(`🔥 Processing top ${limit} popular problems...`);
        
        try {
            // Get problemset API data for popularity info
            const response = await axios.get('https://codeforces.com/api/problemset.problems');
            const { problems, problemStatistics } = response.data.result;
            
            // Create popularity map
            const popularityMap = new Map();
            problemStatistics.forEach(stat => {
                const key = `${stat.contestId}-${stat.index}`;
                popularityMap.set(key, stat.solvedCount || 0);
            });
            
            // Score and sort problems by popularity and rating diversity
            const scoredProblems = problems
                .filter(p => p.rating && p.contestId) // Must have rating and contest
                .map(problem => {
                    const key = `${problem.contestId}-${problem.index}`;
                    const solvedCount = popularityMap.get(key) || 0;
                    
                    // Scoring formula: balanced between popularity and rating diversity
                    let score = solvedCount;
                    
                    // Bonus for good rating ranges (not too easy, not too hard)
                    if (problem.rating >= 1000 && problem.rating <= 2500) {
                        score *= 1.5;
                    }
                    
                    // Bonus for classic problem types
                    const tags = problem.tags || [];
                    if (tags.includes('dp') || tags.includes('greedy') || 
                        tags.includes('graphs') || tags.includes('data structures')) {
                        score *= 1.2;
                    }
                    
                    return { ...problem, popularityScore: score, solvedCount };
                })
                .sort((a, b) => b.popularityScore - a.popularityScore)
                .slice(0, limit);
            
            console.log(`📈 Selected ${scoredProblems.length} popular problems for processing`);
            
            // Group by contest to process efficiently
            const contestGroups = new Map();
            scoredProblems.forEach(problem => {
                const contestId = problem.contestId;
                if (!contestGroups.has(contestId)) {
                    contestGroups.set(contestId, []);
                }
                contestGroups.get(contestId).push(problem);
            });
            
            console.log(`📊 Popular problems span ${contestGroups.size} contests`);
            
            // Process each contest that contains popular problems
            const contests = Array.from(contestGroups.keys());
            for (let i = 0; i < contests.length; i++) {
                const contestId = contests[i];
                const contestProblems = contestGroups.get(contestId);
                
                console.log(`\n🔥 Processing popular problems from contest ${contestId} (${i + 1}/${contests.length})`);
                console.log(`   Problems: ${contestProblems.map(p => p.index).join(', ')}`);
                
                try {
                    // Get contest metadata from API
                    const contestResponse = await axios.get(`https://codeforces.com/api/contest.list`);
                    const allContests = contestResponse.data.result;
                    const contestData = allContests.find(c => c.id === contestId);
                    
                    if (contestData) {
                        // Only scrape the popular problems from this contest
                        const problemIndices = contestProblems.map(p => p.index);
                        const scrapeResults = await this.scraper.batchScrape(contestId, problemIndices);
                        
                        // Process and store each problem
                        for (const result of scrapeResults) {
                            if (result.success) {
                                const originalProblem = contestProblems.find(p => p.index === result.index);
                                const problemData = this.optimizeProblemData(contestData, result.data, result.index);
                                
                                // Add popularity metadata
                                problemData.popularity = {
                                    solvedCount: originalProblem.solvedCount,
                                    popularityScore: originalProblem.popularityScore,
                                    isPopular: true
                                };
                                
                                // Store individual problem
                                await this.storeProblem(contestId, result.index, problemData);
                                this.statistics.successfulScrapes++;
                            } else {
                                this.statistics.failedScrapes++;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`❌ Failed to process popular problems from contest ${contestId}:`, error.message);
                }
                
                // Brief pause between contests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`✅ Popular problems processing completed`);
            
        } catch (error) {
            console.error('❌ Popular problems processing failed:', error.message);
            throw error;
        }
    }

    /**
     * Get processing statistics
     */
    getStatistics() {
        return {
            totalContests: this.statistics.totalContests,
            totalProblems: this.statistics.totalProblems,
            successfulScrapes: this.statistics.successfulScrapes,
            failedScrapes: this.statistics.failedScrapes,
            processedContests: this.processedContests.size,
            startTime: this.statistics.startTime,
            elapsedTime: Date.now() - this.statistics.startTime
        };
    }

    /**
     * Main processing function
     */
    async processAllContests() {
        console.log('🚀 Starting complete contest processing...');
        
        try {
            const contests = await this.getAllContests();
            
            // Process recent contests first (they're more likely to be accessed)
            contests.sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);
            
            // Process in batches to avoid overwhelming the system
            const batchSize = 5;
            for (let i = 0; i < contests.length; i += batchSize) {
                const batch = contests.slice(i, i + batchSize);
                
                console.log(`\n📦 Processing contest batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contests.length/batchSize)}`);
                
                // Process contests in parallel within batch
                await Promise.all(batch.map(contest => this.processContest(contest)));
                
                // Progress update
                this.printProgress();
                
                // Brief pause between batches
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Build search indices
            await this.buildSearchIndices();
            
            // Final statistics
            this.printFinalStats();
            
        } catch (error) {
            console.error('❌ Processing failed:', error.message);
            throw error;
        } finally {
            if (this.scraper) {
                await this.scraper.close();
            }
        }
    }

    /**
     * Print processing progress
     */
    printProgress() {
        const elapsed = (Date.now() - this.statistics.startTime) / 1000;
        console.log(`\n📊 Progress Update:`);
        console.log(`   Contests processed: ${this.processedContests.size}/${this.statistics.totalContests}`);
        console.log(`   Problems scraped: ${this.statistics.successfulScrapes}/${this.statistics.totalProblems}`);
        console.log(`   Success rate: ${((this.statistics.successfulScrapes / this.statistics.totalProblems) * 100).toFixed(1)}%`);
        console.log(`   Elapsed time: ${elapsed.toFixed(1)}s`);
    }

    /**
     * Print final statistics
     */
    printFinalStats() {
        const elapsed = (Date.now() - this.statistics.startTime) / 1000;
        console.log(`\n🎉 Processing Complete!`);
        console.log(`==========================================`);
        console.log(`Total contests processed: ${this.processedContests.size}`);
        console.log(`Total problems scraped: ${this.statistics.successfulScrapes}`);
        console.log(`Failed scrapes: ${this.statistics.failedScrapes}`);
        console.log(`Success rate: ${((this.statistics.successfulScrapes / this.statistics.totalProblems) * 100).toFixed(1)}%`);
        console.log(`Total time: ${(elapsed / 60).toFixed(1)} minutes`);
        console.log(`Average time per problem: ${(elapsed / this.statistics.successfulScrapes).toFixed(1)}s`);
        console.log(`==========================================`);
    }
}

// Export for use in build scripts
module.exports = ContestProcessor;

// CLI usage
if (require.main === module) {
    const processor = new ContestProcessor();
    
    processor.init()
        .then(() => processor.processAllContests())
        .then(() => {
            console.log('✅ Build-time processing completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Build-time processing failed:', error);
            process.exit(1);
        });
}
