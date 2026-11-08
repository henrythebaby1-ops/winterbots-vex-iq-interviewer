# ❄️ WinterBots VEX IQ AI Interviewer

Practice your VEX IQ judge interview with an AI judge ("Judge Frost") that runs **on your own computer** with [Ollama](https://ollama.com). Nothing you say leaves your machine.

**Live site:** https://henrythebaby1-ops.github.io/winterbots-vex-iq-interviewer/

## Features

- **191 questions in 17 categories**: engineering design process, notebook, game strategy, robot design, build, programming, sensors, driving, testing, creativity, project management, teamwork, sportsmanship, outreach, reflection, and curveballs
- **9 interview modes**: Full Judge Interview, Quick Practice, Design & Excellence, Think Award, Amaze/Build/Create, Teamwork & Character, Rapid Fire, Curveball Challenge, and Custom
- **Real follow-up questions**: the AI digs deeper when an answer is vague, just like real judges
- **Live coach tips and a 0–5 score** for every answer
- **Final report** with rubric-style scores, strengths, things to improve, a rewritten "upgraded" answer, and a practice plan
- **Voice mode**: answer by speaking (Chrome/Edge) and have questions read aloud
- Judge styles (friendly, standard, tough), difficulty levels, a timer, your own custom questions, a searchable question bank, history, and transcript download
- Works without AI too (questions only)

## Setup

1. Install Ollama: https://ollama.com/download
2. Pull a model:
   ```bash
   ollama pull llama3.2:3b
   ```
   (`llama3.1:8b`, `qwen2.5:7b`, or `gemma3:4b` give better feedback if your computer can run them.)
3. Allow the website to talk to Ollama, then **quit and reopen Ollama**.

   macOS:
   ```bash
   launchctl setenv OLLAMA_ORIGINS "https://henrythebaby1-ops.github.io"
   ```
   Windows:
   ```bash
   setx OLLAMA_ORIGINS "https://henrythebaby1-ops.github.io"
   ```
4. Open the site in **Chrome, Edge, or Firefox** (Safari blocks sites from reaching local apps). If the browser asks about local network access, click **Allow**.

## Run locally

```bash
python3 -m http.server 8000
```
Then open http://localhost:8000. Ollama allows `localhost` by default, so step 3 isn't needed for local use.

---
A practice tool made for the WinterBots. Not affiliated with VEX Robotics or the REC Foundation.
