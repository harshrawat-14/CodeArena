const axios = require('axios');
const { db } = require('./firebaseConfigAdmin'); // Firebase Firestore instance
const scrapeProblem = require('./scrapeProblem'); // contestId + index -> { title, html... }

async function getLast200ContestsByDiv() {
    const res = await axios.get('https://codeforces.com/api/contest.list');
    const allContests = res.data.result;

    const recent = allContests
        .filter(c => c.phase === 'FINISHED')
        .slice(0, 200);

    const divisions = { "Div. 1": [], "Div. 2": [], "Div. 3": [], "Div. 4": [] };

    for (const contest of recent) {
        const pattern = /\bDiv\. ?[4]\b/g;
        const matches = contest.name.match(pattern);

        if (matches) {
            for (const match of matches) {
                if (divisions[match]) {
                    divisions[match].push({ id: contest.id, name: contest.name });
                    
                }
            }
        }
    }

    return divisions;
}

async function getProblemIndices(contestId) {
    const res = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
    return res.data.result.problems.map(p => p.index);
}

async function storeProblemInFirebase(div, contestId, problemIndex, data) {
    // console.log(data,problemIndex , contestId) ; 
    const docRef = db
        .collection('contests')
        .doc(`div-${div.replace(/\s/g, '')}`)
        .collection(`contest_${contestId}`)
        .doc(`problem_${problemIndex}`);

    await docRef.set(data, { merge: true });
}

async function run() {
    console.log("Fetching contests...");
    const divisions = await getLast200ContestsByDiv();

    for (const [div, contests] of Object.entries(divisions)) {
        console.log(`Processing ${contests.length} contests from ${div}...`);

        for (const contest of contests) {
            const { id: contestId, name: contestName } = contest;
            console.log(`→ Contest ${contestId}: ${contestName}`);

            let indices;
            try {
                indices = await getProblemIndices(contestId);
                console.log(indices) ; 
            } catch (e) {
                console.error(`Failed to get problems for contest ${contestId}`, e.message);
                continue;
            }

            for (const index of indices) {
                try {
                    console.log(`  → Scraping ${contestId}${index}...`);
                    const problemData = await scrapeProblem(contestId, index);

                    await storeProblemInFirebase(div, contestId, index, {
                        contestId,
                        contestName,
                        problemIndex: index,
                        ...problemData
                    });

                    console.log(`    ✔️ Stored problem ${index}`);
                } catch (e) {
                    console.error(`    ❌ Failed to store ${contestId}${index}:`, e.message);
                }
            }
        }
    }

    console.log("✅ All done!");
}

run().catch(console.error);
