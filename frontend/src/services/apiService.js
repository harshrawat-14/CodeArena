/**
 * PREMIUM API SERVICE - FRONTEND INTEGRATION
 * 
 * This service provides a seamless interface to the production-ready backend API
 * with intelligent caching, error handling, and premium features.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Import toast notifications (will be set by the app)
let premiumToast = null;

export const setPremiumToast = (toast) => {
    premiumToast = toast;
};

class PremiumAPIService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Response interceptor for better error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error);
                if (error.response?.status === 500) {
                    this.showErrorToast('Server error. Please try again.');
                } else if (error.code === 'ECONNABORTED') {
                    this.showErrorToast('Request timeout. Check your connection.');
                }
                return Promise.reject(error);
            }
        );

        // Cache for frequently accessed data
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Show error toast (to be implemented by UI)
     */
    showErrorToast(message) {
        // This will be overridden by the UI component
        console.warn('API Error:', message);
    }

    /**
     * Cache management
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * System Health Check
     */
    async getSystemHealth() {
        try {
            const response = await this.api.get('/api/health');
            return response.data;
        } catch (error) {
            throw new Error('System health check failed');
        }
    }

    /**
     * Get contests by division - Lightning fast Firebase response
     */
    async getContestsByDivision(division, limit = 20) {
        const cacheKey = `contests_div${division}_${limit}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await this.api.get(`/api/contests/${division}`, {
                params: { limit }
            });
            
            const data = response.data;
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch Div.${division} contests: ${error.message}`);
        }
    }

    /**
     * Get contest problems - Instant Firebase response
     */
    async getContestProblems(contestId) {
        const cacheKey = `problems_${contestId}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await this.api.get(`/api/contest/${contestId}/problems`);
            
            const data = response.data;
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch problems for contest ${contestId}: ${error.message}`);
        }
    }

    /**
     * Get complete problem data with test cases - Premium feature
     */
    async getProblemData(contestId, problemIndex) {
        const cacheKey = `problem_${contestId}_${problemIndex}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await this.api.get(`/api/contest/${contestId}/problem/${problemIndex}`);
            
            const data = response.data;
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch problem ${contestId}/${problemIndex}: ${error.message}`);
        }
    }

    /**
     * Advanced search - Premium feature
     */
    async searchProblems(query, options = {}) {
        const params = {
            q: query,
            ...options
        };

        try {
            const response = await this.api.get('/api/search/problems', { params });
            return response.data;
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Get trending problems - Premium feature
     */
    async getTrendingProblems(limit = 20) {
        const cacheKey = `trending_${limit}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await this.api.get('/api/problems/trending', {
                params: { limit }
            });
            
            const data = response.data;
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch trending problems: ${error.message}`);
        }
    }

    /**
     * Get problems by difficulty range - Premium feature
     */
    async getProblemsByDifficulty(minRating, maxRating, limit = 20) {
        const cacheKey = `difficulty_${minRating}_${maxRating}_${limit}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await this.api.get(`/api/problems/difficulty/${minRating}/${maxRating}`, {
                params: { limit }
            });
            
            const data = response.data;
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch problems by difficulty: ${error.message}`);
        }
    }

    /**
     * Get random problem for practice - Premium feature
     */
    async getRandomProblem(rating = null) {
        try {
            const params = rating ? { rating } : {};
            const response = await this.api.get('/api/problems/random', { params });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch random problem: ${error.message}`);
        }
    }

    /**
     * Test contest availability
     */
    async testContest(contestId) {
        try {
            const response = await this.api.get(`/api/contest/${contestId}/test`);
            return response.data;
        } catch (error) {
            throw new Error(`Contest ${contestId} not available: ${error.message}`);
        }
    }

    /**
     * Get system diagnostics
     */
    async getDiagnostics() {
        try {
            const response = await this.api.get('/api/diagnostics');
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch diagnostics');
        }
    }

    /**
     * Code execution (existing functionality)
     */
    async runCode(language, code, input = '') {
        try {
            const response = await this.api.post('/run', {
                language,
                code,
                input
            });
            return response.data;
        } catch (error) {
            throw new Error(`Code execution failed: ${error.message}`);
        }
    }

    /**
     * AI Code Review (existing functionality)
     */
    async getAIReview(code, language) {
        try {
            const response = await this.api.post('/ai-review', {
                code,
                language
            });
            return response.data;
        } catch (error) {
            throw new Error(`AI review failed: ${error.message}`);
        }
    }

    /**
     * Authentication endpoints (existing functionality)
     */
    async googleAuth(token) {
        try {
            const response = await this.api.post('/auth/google', { token });
            return response.data;
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async getUserProfile(uid) {
        try {
            const response = await this.api.get(`/auth/profile/${uid}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
        }
    }

    async saveSubmission(submissionData) {
        try {
            const response = await this.api.post('/auth/submission', submissionData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to save submission: ${error.message}`);
        }
    }

    async getUserSubmissions(uid) {
        try {
            const response = await this.api.get(`/auth/submissions/${uid}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch submissions: ${error.message}`);
        }
    }

    async getLeaderboard() {
        try {
            const response = await this.api.get('/auth/leaderboard');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch leaderboard: ${error.message}`);
        }
    }

    /**
     * Clear cache (useful for development/testing)
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create and export singleton instance
const apiService = new PremiumAPIService();
export default apiService;
