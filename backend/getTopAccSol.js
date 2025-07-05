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

async function getTopAccSol(contestId = '2065', index = 'A', languageFilter = 'C++17 (GCC 7-32)') {
    // Enhanced language normalization with broader matching
    const normalizedLanguage = languageFilter.toLowerCase();
    let searchLanguage = languageFilter;
    
    // Handle common language variations and aliases
    if (normalizedLanguage.includes('c++') || normalizedLanguage === 'cpp' || normalizedLanguage.includes('gnu') || normalizedLanguage.includes('clang')) {
        searchLanguage = 'C++';
    } else if (normalizedLanguage.includes('java') || normalizedLanguage.includes('openjdk')) {
        searchLanguage = 'Java';
    } else if (normalizedLanguage.includes('python') || normalizedLanguage.includes('pypy')) {
        searchLanguage = 'Python';
    } else if (normalizedLanguage.includes('javascript') || normalizedLanguage === 'js' || normalizedLanguage.includes('node')) {
        searchLanguage = 'JavaScript';
    } else if (normalizedLanguage.includes('go') || normalizedLanguage.includes('golang')) {
        searchLanguage = 'Go';
    } else if (normalizedLanguage.includes('rust')) {
        searchLanguage = 'Rust';
    } else if (normalizedLanguage.includes('kotlin')) {
        searchLanguage = 'Kotlin';
    } else if (normalizedLanguage.includes('swift')) {
        searchLanguage = 'Swift';
    } else if (normalizedLanguage.includes('scala')) {
        searchLanguage = 'Scala';
    }
    
    console.log(`🎯 Searching for ${searchLanguage} solutions (input: ${languageFilter})...`);
    
    // Enhanced browser configuration for better stealth and reliability
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
        console.log(`🚀 Starting premium solution scraper for ${contestId}/${index} (${languageFilter})`);
        const statusUrl = `https://codeforces.com/contest/${contestId}/status?submittedProblemIndex=${index}`;
        
        // Enhanced navigation with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                await page.goto(statusUrl, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 20000 
                });
                console.log(`✅ Status page loaded (attempt ${retryCount + 1})`);
                break;
            } catch (error) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw new Error(`Failed to load status page after ${maxRetries} attempts: ${error.message}`);
                }
                console.log(`⚠️ Retry ${retryCount}/${maxRetries} for status page...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Enhanced selector waiting with fallback
        try {
            await page.waitForSelector('table.status-frame-datatable', { timeout: 15000 });
            console.log("selector found");
        } catch (error) {
            // Fallback: try alternative selectors
            try {
                await page.waitForSelector('.datatable', { timeout: 10000 });
                console.log("✅ Fallback: Alternative table found");
            } catch (fallbackError) {
                throw new Error(`Status table not found. Original error: ${error.message}, Fallback error: ${fallbackError.message}`);
            }
        }
        
        // Simplified submission finding
        const submissionPath = await page.evaluate((languageFilter) => {
            const rows = Array.from(document.querySelectorAll('tr[data-submission-id]'));
            console.log("QS1");
            for (const row of rows) {
                const verdict = row.querySelector('td[data-verdict]')?.innerText || '';
                const lang = row.querySelector('td:nth-child(5)')?.innerText || '';
                if (verdict.includes("Accepted") && lang.includes(languageFilter)) {
                    console.log("QS2");
                    const a = row.querySelector('a[href*="/submission/"]');
                    return a?.getAttribute('href');
                }
            }
            return null;
        }, languageFilter);
        
        console.log(`🔗 Submission path: ${submissionPath || 'Not found'}`);

        if (!submissionPath) {
            throw new Error(`No accepted ${languageFilter} submission found for problem ${contestId}${index}. Try different language or check if contest/problem exists.`);
        }

        console.log(`🔗 Navigating to submission: ${submissionPath}`);
        const submissionUrl = submissionPath.startsWith('http') ? submissionPath : `https://codeforces.com${submissionPath}`;
        
        // Enhanced navigation to submission page
        await page.goto(submissionUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Enhanced source code extraction with multiple selectors
        let sourceCode = '';
        try {
            await page.waitForSelector('#program-source-text', { timeout: 15000 });
            sourceCode = await page.$eval('#program-source-text', el => el.textContent);
            console.log("✅ Source code extracted from #program-source-text");
        } catch (error) {
            console.log("⚠️ Trying alternative source code selectors...");
            try {
                // Try alternative selectors
                const alternatives = [
                    'pre.prettyprint',
                    '.source-code pre',
                    '.program-source pre',
                    'pre',
                    '.code-block'
                ];
                
                for (const selector of alternatives) {
                    try {
                        sourceCode = await page.$eval(selector, el => el.textContent);
                        if (sourceCode && sourceCode.trim()) {
                            console.log(`✅ Source code extracted from ${selector}`);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!sourceCode || !sourceCode.trim()) {
                    throw new Error('Could not extract source code from any selector');
                }
            } catch (fallbackError) {
                throw new Error(`Failed to extract source code: ${error.message}. Fallback also failed: ${fallbackError.message}`);
            }
        }

        await browser.close();

        return {
            success: true,
            submissionUrl,
            sourceCode: sourceCode.trim(),
            language: searchLanguage,
            originalLanguageFilter: languageFilter,
            contestId,
            problemIndex: index,
            scrapedAt: new Date().toISOString(),
            codeLength: sourceCode.trim().length,
            message: `Successfully scraped ${searchLanguage} solution for ${contestId}${index}`
        };
    } catch (err) {
        console.error(`❌ Premium scraper failed for ${contestId}/${index} (${languageFilter}):`, err.message);
        
        // Ensure browser is closed even on error
        try {
            await browser.close();
        } catch (closeError) {
            console.error('⚠️ Error closing browser:', closeError.message);
        }
        
        // Enhanced error reporting
        const errorMessage = err.message.includes('No accepted') ? 
            `No accepted ${searchLanguage} solution found for problem ${contestId}${index}. Available languages may be different.` :
            `Failed to scrape ${searchLanguage} solution for ${contestId}/${index}: ${err.message}`;
            
        throw new Error(errorMessage);
    }
}

module.exports = getTopAccSol;
