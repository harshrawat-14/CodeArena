const axios = require('axios');

async function getContestByDiv(divName = "Div. 2") {
    try {
        // 1. Get all contests (past & upcoming)
        const contestRes = await axios.get('https://codeforces.com/api/contest.list?gym=false');
        const allContests = contestRes.data.result;
        return allContests ;  

        

        // const filtered = allContests
        //     .filter(c => c.phase === 'FINISHED' && c.name.includes(divName))
        //     .slice(0, 5); // Get latest 5

        // const results = [];

        // // 3. For each contest, fetch problems
        // for (const contest of filtered) {
        //     const { id, name } = contest;
        //     const problemRes = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${id}&from=1&count=1`);
        //     const problems = problemRes.data.result.problems;

        //     results.push({
        //         id,
        //         name,
        //         url: `https://codeforces.com/contest/${id}`,
        //         problems: problems.map(p => ({
        //             index: p.index,
        //             name: p.name,
        //             url: `https://codeforces.com/contest/${id}/problem/${p.index}`
        //         }))
        //     });
        // }

        // return results;

    } catch (err) {
        console.error("Failed to fetch recent contests:", err.message);
        throw err;
    }
}

module.exports = getContestByDiv;
