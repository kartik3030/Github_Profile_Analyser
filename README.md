# GitHub Profile Analyzer

A full-stack application that transforms raw GitHub data into meaningful insights using LLM-powered analysis.

## Overview

This project goes beyond basic GitHub statistics. It fetches user profile and repository data via the GitHub API and processes it through a Groq-powered LLM to generate structured, human-like evaluations.

The goal is to simulate how recruiters or engineers assess a developer’s GitHub presence.

## Features

- Profile summary generation  
- Identification of top repositories  
- Most starred projects analysis  
- Strengths and weaknesses detection  
- Actionable improvement suggestions  

## Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express  
- **APIs:** GitHub API  
- **LLM:** Groq (for analysis and insights)  

## How It Works

1. Fetch user data from GitHub API  
2. Extract and structure repository + profile information  
3. Send structured data to Groq LLM  
4. Generate analyzed output including strengths, weaknesses, and recommendations  
5. Display results in a clean UI  

## Repository

[GitHub Repo](https://github.com/kartik3030/Github_Profile_Analyser)

## Key Focus Areas

- API design and integration  
- Data transformation and structuring  
- Applying LLMs for analysis (not just text generation)  
- Building practical GenAI use-cases  

## Future Improvements

- Add authentication for personalized insights  
- Improve ranking algorithms for repositories  
- Introduce historical activity analysis  
- Enhance UI/UX for better visualization  
