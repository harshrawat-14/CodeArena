const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const cookies = [
  { name: '_ga', value: 'GA1.1.157251224.1721571040', domain: 'codeforces.com', path: '/' },
  { name: '_ga_K230KVN22K', value: 'GS2.1.s1751666028$o23$g1$t1751666032$j56$l0$h0', domain: 'codeforces.com', path: '/' },
  { name: '_gid', value: 'GA1.2.1140164291.1751585402', domain: 'codeforces.com', path: '/' },
  { name: '39ce7', value: 'CFgDjS5p', domain: 'codeforces.com', path: '/' },
  { name: '70a7c28f3de', value: 'eky2ms42o6olrih067', domain: 'codeforces.com', path: '/' },
  { name: 'cf_clearance', value: '4mwLVDREml68HmnqLouR7R3zQXbR0.F1KzrvjiW0qno-1751666036-1.2.1.1-1zqosQp.oI5KcEhQpzhxgq2ou6B8S9WyTC8rxuOo8lPnjZ2otSwpgGwZhqNsVjjnvPPRhYTRxqNTCrqyZfWepcouwa7UWJCgftzAyg4C.4u5MS5VhwtsNSy2azVxZHvOSXIy4JQ953paFrESkpFo9XJdWEeD0W6EBRxVOC3EGdbhUb0jhCh_MIZf0oj_tx6Og2D_FghEAiTHQtfRM7nhvgHVYI2hRNa7nPe6fHFvviY', domain: 'codeforces.com', path: '/', secure: true, sameSite: 'None' },
  { name: 'evercookie_cache', value: 'eky2ms42o6olrih067', domain: 'codeforces.com', path: '/' },
  { name: 'evercookie_etag', value: 'eky2ms42o6olrih067', domain: 'codeforces.com', path: '/' },
  { name: 'evercookie_png', value: 'eky2ms42o6olrih067', domain: 'codeforces.com', path: '/' },
  { name: 'JSESSIONID', value: '4D2683E78B6D3AB482D36A86654EE26D', domain: 'codeforces.com', path: '/', httpOnly: true, sameSite: 'Lax' },
  { name: 'lastOnlineTimeUpdaterInvocation', value: '1751666434215', domain: 'codeforces.com', path: '/' },
  { name: 'pow', value: '6e3feb2ea057bb2a0c8b594cd9c43f730237091d', domain: 'codeforces.com', path: '/', sameSite: 'Lax' },
  { name: 'X-User-Sha1', value: '8586e6c59d120cc0699148b04b6ff4725b65482d', domain: 'codeforces.com', path: '/', httpOnly: true, sameSite: 'Lax' }
];

/**
 * Get available programming languages for a specific problem
 * @param {string} contestId - Contest ID
 * @param {string} index - Problem index (A, B, C, etc.)
 * @returns {Promise<Array>} Array of available languages with submission counts
 */
async function getAvailableLanguages(contestId, index) {
    console.log(`🔍 Getting available languages for ${contestId}/${index}`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    });
    
    const page = await browser.newPage();
    
    // Enhanced page configuration for better stealth
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    });

    await page.setCookie(...cookies);

    try {
        const statusUrl = `https://codeforces.com/contest/${contestId}/status?submittedProblemIndex=${index}`;
        console.log(`🚀 Navigating to: ${statusUrl}`);
        
        await page.goto(statusUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        // Wait for the status table to load
        await page.waitForSelector('table.status-frame-datatable', { timeout: 15000 });
        
        // Extract language information from all submissions
        const languageStats = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr[data-submission-id]'));
            const languageMap = new Map();
            
            rows.forEach(row => {
                const verdictCell = row.querySelector('td[data-verdict]');
                const langCell = row.querySelector('td:nth-child(5)');
                
                if (verdictCell && langCell) {
                    const verdict = verdictCell.innerText?.trim() || '';
                    const lang = langCell.innerText?.trim() || '';
                    
                    if (lang) {
                        if (!languageMap.has(lang)) {
                            languageMap.set(lang, {
                                name: lang,
                                totalSubmissions: 0,
                                acceptedSubmissions: 0
                            });
                        }
                        
                        const langStats = languageMap.get(lang);
                        langStats.totalSubmissions++;
                        
                        if (verdict.includes('Accepted') || verdict.includes('OK')) {
                            langStats.acceptedSubmissions++;
                        }
                    }
                }
            });
            
            return Array.from(languageMap.values()).sort((a, b) => b.acceptedSubmissions - a.acceptedSubmissions);
        });
        
        await browser.close();
        
        console.log(`✅ Found ${languageStats.length} languages for ${contestId}/${index}`);
        
        return {
            contestId,
            problemIndex: index,
            languages: languageStats,
            totalLanguages: languageStats.length,
            scrapedAt: new Date().toISOString()
        };
        
    } catch (err) {
        console.error(`❌ Failed to get languages for ${contestId}/${index}:`, err.message);
        
        try {
            await browser.close();
        } catch (closeError) {
            console.error('⚠️ Error closing browser:', closeError.message);
        }
        
        throw new Error(`Failed to get available languages for ${contestId}/${index}: ${err.message}`);
    }
}

module.exports = getAvailableLanguages;
