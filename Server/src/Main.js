require("dotenv").config();
const express = require("express");
const path = require("path");
const Groq = require("groq-sdk");
const cors = require("cors")

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

// Path of dist folder
// const distPath = path.resolve(__dirname, "../../Client/dist");

// Groq client
const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// GitHub headers
const githubHeaders = {
    Accept: "application/vnd.github+json",
};

// Helper: Extract Repo Insights
function extractRepoInsights(repos) {
    let totalStars = 0;
    let languages = {};

    repos.forEach((repo) => {
        totalStars += repo.stargazers_count;

        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });

    const topLanguages = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        totalRepos: repos.length,
        totalStars,
        topLanguages,
    };
}

// Helper: Parse LLM output
function parseLLMOutput(raw) {
    try {
        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleaned);
    } catch {
        return { raw };
    }
}

// Route: Analyse GitHub User
app.get("/user/:username", async (req, res) => {
    try {
        const { username } = req.params;

        if (!username || username.length > 50 || !/^[a-zA-Z0-9-]+$/.test(username)) {
            return res.status(400).json({ error: "Invalid username" });
        }


        // https://api.github.com/users/${username}         github openAPI
        const [userRes, repoRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers: githubHeaders }),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`, { headers: githubHeaders }),
        ]);

        if (!userRes.ok) {
            return res.status(userRes.status).json({
                error: userRes.status === 404 ? "GitHub user not found" : "GitHub API error",
            });
        }

        if (!repoRes.ok) {
            return res.status(repoRes.status).json({
                error: "Failed to fetch repositories",
            });
        }

        const userData = await userRes.json();
        const repos = await repoRes.json();

        if (!Array.isArray(repos)) {
            return res.status(500).json({ error: "Unexpected repos response" });
        }

        const insights = extractRepoInsights(repos);

        const prompt = `
You are a strict software engineer evaluator.

Return STRICT JSON only:
{
  "summary": "",
  "level": "Beginner | Intermediate | Advanced",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Profile:
${JSON.stringify({
            name: userData.name,
            bio: userData.bio,
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            created_at: userData.created_at,
        })}

Repo Insights:
${JSON.stringify(insights)}

Top Repos:
${JSON.stringify(
            repos.slice(0, 5).map((r) => ({
                name: r.name,
                stars: r.stargazers_count,
                forks: r.forks_count,
                language: r.language,
                description: r.description,
            }))
        )}
`;

        // grok 
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Return valid JSON only." },
                { role: "user", content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 600,
        });

        const rawOutput = completion.choices[0].message.content;
        const analysis = parseLLMOutput(rawOutput);

        return res.json({
            github: userData,
            insights,
            analysis,
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message || "Internal server error",
        });
    }
});

// Serve frontend
// app.use(express.static(distPath));

// app.get(/.*/, (req, res) => {
//     res.sendFile(path.resolve(distPath, "index.html"));
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});