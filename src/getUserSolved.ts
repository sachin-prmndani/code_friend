const url = "https://codeforces.com/api/user.status?handle=";

async function getUserSolved(handle: string): Promise<[string, string, number][]> {
    const res = await fetch(url + handle);
    const data = await res.json();

    if (data.status !== "OK") throw new Error(data.comment);

    const seen = new Set<string>();
    const solvedProblems: [string, string, number][] = [];

    for (const sub of data.result) {
        if (sub.verdict === "OK") {
            const contestId = sub.problem.contestId;
            const index = sub.problem.index;
            const key = `${contestId}-${index}`;

            if (!seen.has(key)) {
                seen.add(key);
                const problemUrl = `https://codeforces.com/contest/${contestId}/problem/${index}`;
                const problemName = sub.problem.name;
                const rating = sub.problem.rating ?? 0;
                solvedProblems.push([problemName, problemUrl, rating]);
            }
        }
    }

    return solvedProblems;
}

export default getUserSolved;