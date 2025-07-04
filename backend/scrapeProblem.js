const puppeteer = require('puppeteer');

async function scrapeProblem(contestId, problemIndex) {
    const url = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;

    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for .problem-statement to load
    await page.waitForSelector('.problem-statement', { timeout: 10000 });

    const content = await page.evaluate(() => {
        const el = (sel) => document.querySelector(sel);

        const getHTML = (sel) => el(sel)?.innerHTML.trim() || '';
        const getText = (sel) => el(sel)?.innerText.trim() || '';

        return {
            title: getText('.problem-statement .title'),
            timeLimit: getText('.problem-statement .time-limit'),
            memoryLimit: getText('.problem-statement .memory-limit'),
            inputSpec: getHTML('.problem-statement .input-specification'),
            outputSpec: getHTML('.problem-statement .output-specification'),
            statement: (() => {
                const ps = document.querySelector('.problem-statement');
                let html = '';
                let found = false;
                for (let node of ps.children) {
                    if (found) {
                        if (
                            node.classList.contains('input-specification') ||
                            node.classList.contains('output-specification') ||
                            node.classList.contains('sample-tests') ||
                            node.classList.contains('note')
                        ) break;
                        html += node.outerHTML;
                    }
                    if (node.classList.contains('header')) found = true;
                }
                return html;
            })(),
            examples: getHTML('.problem-statement .sample-tests'),
            note: getHTML('.problem-statement .note'),
        };
    });

    await browser.close();
    return content;
}

module.exports = scrapeProblem;
