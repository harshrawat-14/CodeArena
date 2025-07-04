const axios = require('axios');

async function getProblemByDivID(divName = "Div. 2", limit = 5) {
    try {
        const contestRes = await axios.get('https://codeforces.com/api/contest.list');
        const allContests = contestRes.data.result;

        const filtered = allContests
            .filter(c => c.phase === 'FINISHED' && c.name.includes(divName))
            .slice(0, limit);

        const result = [];

        for (const contest of filtered) {
            const { id: contestId, name: contestName } = contest;

            const res = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`);
            const problems = res.data.result.problems;

            result.push({
                contestId,
                contestName,
                totalProblems: problems.length,
                problemIndexes: problems.map(p => p.index)
            });
        }

        return result;

    } catch (err) {
        console.error("Error:", err.message);
        throw err;
    }
}

module.exports = getProblemByDivID;
