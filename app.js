/* WinterBots VEX IQ AI Interviewer — app logic */
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const CATS = window.CATEGORIES;
  const MODES = window.MODES;
  const catById = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const JUDGE = "Judge Frost";

  // ---------- storage helpers ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("wb_" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("wb_" + k, JSON.stringify(v)); } catch { /* ignore */ } }
  };

  const toast = (msg, ms = 2600) => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), ms);
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const words = (s) => (s.trim().match(/\S+/g) || []).length;
  const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  const scoreClass = (s) => (s >= 4 ? "s-hi" : s >= 2.5 ? "s-mid" : "s-lo");
  const renderMd = (md) => {
    if (window.marked && window.DOMPurify) return DOMPurify.sanitize(marked.parse(md));
    return `<p style="white-space:pre-wrap">${esc(md)}</p>`;
  };

  // ---------- settings ----------
  const FIELDS = ["teamNumber", "teamName", "robotName", "gradeLevel", "gameName", "robotInfo", "judgeStyle", "followDepth", "difficulty", "questionCount", "customQuestions", "ollamaUrl"];
  const TOGGLES = ["showTips", "speakAloud", "noAI"];
  let selectedMode = store.get("mode", "full");
  let customCatIds = store.get("customCats", ["edp", "design", "programming"]);

  function loadSettings() {
    const s = store.get("settings", {});
    FIELDS.forEach((f) => { if (s[f] != null && $("#" + f)) $("#" + f).value = s[f]; });
    TOGGLES.forEach((f) => { if (s[f] != null) $("#" + f).checked = s[f]; });
    $("#countLabel").textContent = $("#questionCount").value;
  }
  function saveSettings() {
    const s = {};
    FIELDS.forEach((f) => (s[f] = $("#" + f).value));
    TOGGLES.forEach((f) => (s[f] = $("#" + f).checked));
    s.model = $("#modelSelect").value || store.get("settings", {}).model;
    store.set("settings", s);
  }
  const ollamaBase = () => ($("#ollamaUrl").value.trim() || "http://localhost:11434").replace(/\/+$/, "");

  // ---------- tabs ----------
  function showTab(name) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
    if (name === "history") renderHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
  $("#connPill").addEventListener("click", () => showTab("connect"));

  // ---------- Ollama ----------
  let connected = false;
  const THINKERS = /qwen3|deepseek-r1|qwq|magistral|cogito|openthinker|deepscaler|thinking|phi4-reasoning|exaone-deep/i;
  const PREFERRED = ["llama3.1:8b", "qwen2.5:7b", "gemma3:4b", "gemma3:latest", "llama3.2:3b", "llama3.2:latest", "mistral:7b", "qwen3:8b", "phi4-mini:3.8b", "gemma3:12b", "llama3.2:1b", "gemma3:1b"];

  async function fetchModels() {
    const pill = $("#connPill");
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(ollamaBase() + "/api/tags", { signal: ctrl.signal });
      clearTimeout(to);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      const models = (data.models || []).map((m) => m.name)
        .filter((n) => !/embed|ocr|minilm|nomic|bge|mxbai/i.test(n));
      connected = true;
      pill.className = "conn-pill ok";
      pill.querySelector(".conn-text").textContent = `Ollama connected · ${models.length} models`;
      const sel = $("#modelSelect");
      const saved = store.get("settings", {}).model;
      sel.innerHTML = models.length ? "" : `<option value="">No models — run: ollama pull llama3.2:3b</option>`;
      models.forEach((m) => sel.add(new Option(m, m)));
      const pick = models.includes(saved) ? saved : PREFERRED.find((p) => models.includes(p)) || models[0];
      if (pick) sel.value = pick;
      return { ok: true, models };
    } catch (e) {
      connected = false;
      pill.className = "conn-pill bad";
      pill.querySelector(".conn-text").textContent = "Ollama not connected";
      $("#modelSelect").innerHTML = `<option value="">— not connected (see Connect tab) —</option>`;
      return { ok: false, error: e };
    }
  }

  const stripThink = (s) => s.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^[\s\S]*?<\/think>/, "").trim();

  async function ollamaChat({ messages, format, stream = false, onToken, temperature = 0.6 }) {
    const model = $("#modelSelect").value;
    if (!model) throw new Error("No model selected");
    const body = { model, messages, stream, keep_alive: "15m", options: { temperature, num_ctx: 8192 } };
    if (format) body.format = format;
    if (THINKERS.test(model)) body.think = false;

    let r = await fetch(ollamaBase() + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok && body.think !== undefined) {
      delete body.think;
      r = await fetch(ollamaBase() + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    if (!r.ok) throw new Error(`Ollama error ${r.status}: ${(await r.text()).slice(0, 200)}`);

    if (!stream) {
      const data = await r.json();
      return stripThink(data.message?.content || "");
    }
    const reader = r.body.getReader(); const dec = new TextDecoder();
    let buf = "", full = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const j = JSON.parse(line);
          if (j.error) throw new Error(j.error);
          const piece = j.message?.content || "";
          if (piece) { full += piece; onToken && onToken(stripThink(full)); }
        } catch (err) { if (err.message && !/JSON/.test(err.message)) throw err; }
      }
    }
    return stripThink(full);
  }

  // ---------- mode picker ----------
  function renderModes() {
    const g = $("#modeGrid"); g.innerHTML = "";
    MODES.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mode" + (m.id === selectedMode ? " active" : "");
      b.innerHTML = `<span class="m-title">${m.icon} ${esc(m.name)}</span><span class="m-desc">${esc(m.desc)}</span><span class="m-meta">~${m.minutes} min · ${m.defaultCount} questions${m.noFollowups ? " · no follow-ups" : ""}</span>`;
      b.addEventListener("click", () => {
        selectedMode = m.id; store.set("mode", m.id);
        $("#questionCount").value = m.defaultCount; $("#countLabel").textContent = m.defaultCount;
        renderModes(); saveSettings();
      });
      g.appendChild(b);
    });
    const cc = $("#customCats");
    cc.classList.toggle("hidden", selectedMode !== "custom");
    if (selectedMode === "custom") {
      cc.innerHTML = "";
      CATS.forEach((c) => {
        const l = document.createElement("label"); l.className = "chk";
        l.innerHTML = `<input type="checkbox" value="${c.id}" ${customCatIds.includes(c.id) ? "checked" : ""}> ${c.icon} ${esc(c.name)}`;
        l.querySelector("input").addEventListener("change", () => {
          customCatIds = $$("#customCats input:checked").map((i) => i.value);
          store.set("customCats", customCatIds);
        });
        cc.appendChild(l);
      });
    }
  }

  // ---------- question selection ----------
  function weightFor(diff, pref, hardBias) {
    if (hardBias || pref === "hard") return { e: 0.3, m: 1, h: 2.5 }[diff];
    if (pref === "easy") return { e: 2.5, m: 1, h: 0.25 }[diff];
    return 1;
  }
  function pickFrom(catId, used, pref, hardBias) {
    const cat = catById[catId]; if (!cat) return null;
    const avail = cat.q.filter(([, t]) => !used.has(t));
    if (!avail.length) return null;
    const ws = avail.map(([d]) => weightFor(d, pref, hardBias));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < avail.length; i++) { r -= ws[i]; if (r <= 0) return mk(cat, avail[i]); }
    return mk(cat, avail[avail.length - 1]);
  }
  const mk = (cat, [d, t]) => ({ catId: cat.id, catName: cat.name, icon: cat.icon, diff: d, text: t });

  function buildQuestions(mode, count, pref) {
    const used = new Set(); const out = [];
    const add = (q) => { if (q && !used.has(q.text)) { used.add(q.text); out.push(q); } };
    if (mode.closer) used.add(CLOSER_TEXT);
    const custom = $("#customQuestions").value.split("\n").map((s) => s.trim()).filter(Boolean)
      .map((t) => ({ catId: "custom", catName: "Your Questions", icon: "⭐", diff: "m", text: t }));

    if (mode.plan) {
      for (const [cid, n] of mode.plan) for (let i = 0; i < n; i++) add(pickFrom(cid, used, pref, mode.hardBias));
      // keep intro first, then trim/shuffle middle to the requested count
      const first = out.shift();
      let mid = out;
      const reserve = mode.closer ? 1 : 0;
      if (custom.length) mid = shuffle(mid).slice(0, Math.max(0, count - 1 - reserve - Math.min(custom.length, Math.ceil(count / 3)))).concat(shuffle(custom).slice(0, Math.ceil(count / 3)));
      else mid = shuffle(mid).slice(0, Math.max(0, count - 1 - reserve));
      // keep a sensible order: by plan order
      const order = mode.plan.map(([c]) => c);
      mid.sort((a, b) => (order.indexOf(a.catId) + (a.catId === "custom" ? 99 : 0)) - (order.indexOf(b.catId) + (b.catId === "custom" ? 99 : 0)));
      // fill if plan ran short
      while (mid.length < count - 1 - reserve) { const q = pickFrom(shuffle(CATS)[0].id, used, pref); if (!q) break; used.add(q.text); mid.push(q); }
      const res = [first, ...mid];
      if (mode.closer) res.push(closer(used));
      return res.filter(Boolean);
    }

    let pool = mode.id === "custom" ? customCatIds.slice() : mode.pool.slice();
    if (!pool.length) pool = ["edp", "design", "programming"];
    if (mode.intro) add(pickFrom("intro", used, "easy"));
    const reserve = mode.closer ? 1 : 0;
    const customTake = shuffle(custom).slice(0, Math.ceil(count / 3));
    let target = count - out.length - reserve - customTake.length;
    let rot = shuffle(pool), guard = 0;
    while (target > 0 && guard++ < 500) {
      if (!rot.length) rot = shuffle(pool);
      const q = pickFrom(rot.pop(), used, pref, mode.hardBias);
      if (q) { add(q); target--; }
    }
    const head = mode.intro ? [out.shift()] : [];
    const body = shuffle(out.concat(customTake));
    const res = head.concat(body);
    if (mode.closer) res.push(closer(used));
    return res.filter(Boolean);
  }
  const CLOSER_TEXT = "Is there anything else you'd like the judges to know about your team?";
  function closer() {
    return { catId: "reflection", catName: "Reflection & Goals", icon: "🪞", diff: "e", text: CLOSER_TEXT };
  }

  // ---------- interview session ----------
  let S = null; // session
  let timerId = null;

  function teamLabel() {
    const n = $("#teamName").value.trim(), num = $("#teamNumber").value.trim();
    return n && num ? `${n} (${num})` : n || num || "your team";
  }

  function startInterview(overrideQuestions) {
    saveSettings();
    const noAI = $("#noAI").checked;
    if (!noAI && (!connected || !$("#modelSelect").value)) {
      $("#startHint").innerHTML = `Ollama isn't connected. <a href="#" id="goConnect">Set it up</a> or turn on <b>Practice without AI</b>.`;
      $("#goConnect").onclick = (e) => { e.preventDefault(); showTab("connect"); };
      toast("Connect Ollama first, or turn on Practice without AI");
      return;
    }
    const mode = MODES.find((m) => m.id === selectedMode) || MODES[0];
    if (mode.id === "custom" && !customCatIds.length && !overrideQuestions) { toast("Pick at least one category"); return; }
    const count = +$("#questionCount").value;
    const questions = overrideQuestions || buildQuestions(mode, count, $("#difficulty").value);
    S = {
      id: Date.now(), mode, questions, idx: 0, follows: 0, busy: false, ended: false,
      noAI, depth: mode.noFollowups ? 0 : +$("#followDepth").value,
      team: teamLabel(), start: Date.now(), elapsed: 0,
      answers: questions.map((q) => ({ q, exchanges: [], score: null, tip: "", skipped: false })),
      log: [] // {who, text}
    };
    $("#setupView").classList.add("hidden");
    $("#reportView").classList.add("hidden");
    $("#liveView").classList.remove("hidden");
    $("#chat").innerHTML = "";
    $("#liveMode").textContent = `${mode.icon} ${mode.name}`;
    clearInterval(timerId);
    const target = mode.minutes * 60;
    timerId = setInterval(() => {
      S.elapsed = (Date.now() - S.start) / 1000;
      const t = $("#timer"); t.textContent = fmtTime(S.elapsed);
      t.classList.toggle("over", S.elapsed > target);
      t.title = `Target: about ${mode.minutes} minutes`;
    }, 500);

    const robot = $("#robotName").value.trim();
    const greet = {
      friendly: `Hi ${S.team}! I'm ${JUDGE}, and I'm so excited to hear about your robot${robot ? `, ${robot}` : ""}. There are no wrong answers — just tell me about your work. Remember, everyone on the team should get a chance to talk!`,
      standard: `Hello ${S.team}, I'm ${JUDGE}, one of the judges today. Thanks for meeting with me. I'll ask you some questions about your robot${robot ? `, ${robot},` : ""} and your season. Make sure everyone gets a chance to speak.`,
      tough: `Good afternoon, ${S.team}. I'm ${JUDGE}. I've seen a lot of strong teams today, so I'm going to ask you to be specific — give me examples, numbers, and reasons. Let's begin.`
    }[$("#judgeStyle").value];
    addMsg("judge", greet);
    S.log.push({ who: "judge", text: greet });
    setTimeout(() => askCurrent(), 700);
    $("#answerInput").focus();
  }

  function updateHeader() {
    const q = S.questions[S.idx];
    $("#liveCat").textContent = q ? `${q.icon} ${q.catName}` : "Wrap-up";
    $("#liveProgress").textContent = q ? `Question ${S.idx + 1} of ${S.questions.length}` : "Done";
    $("#progressBar").style.width = `${(Math.min(S.idx, S.questions.length) / S.questions.length) * 100}%`;
  }

  function askCurrent(prefix = "") {
    updateHeader();
    if (S.idx >= S.questions.length) return finish();
    const q = S.questions[S.idx];
    S.follows = 0;
    const text = (prefix ? prefix + "\n\n" : "") + q.text;
    addMsg("judge", text, { tag: `Q${S.idx + 1} · ${q.catName}` });
    S.log.push({ who: "judge", text: q.text, main: true });
    S.lastJudge = q.text;
    speak(text);
    setBusy(false);
  }

  function addMsg(who, text, opts = {}) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + who;
    if (who === "system") {
      wrap.innerHTML = `<div class="bubble"></div>`;
      wrap.querySelector(".bubble").textContent = text;
    } else {
      const av = who === "judge" ? "❄️" : "🤖";
      const name = who === "judge" ? JUDGE : S?.team || "Team";
      wrap.innerHTML = `<div class="avatar">${av}</div><div><div class="who"></div><div class="bubble"></div></div>`;
      wrap.querySelector(".who").textContent = name;
      const b = wrap.querySelector(".bubble");
      if (opts.tag) { const t = document.createElement("span"); t.className = "q-tag"; t.textContent = opts.tag; b.appendChild(t); b.appendChild(document.createElement("br")); }
      if (opts.typing) b.innerHTML = `<span class="typing"><i></i><i></i><i></i></span>`;
      else b.appendChild(document.createTextNode(text));
    }
    $("#chat").appendChild(wrap);
    $("#chat").scrollTop = $("#chat").scrollHeight;
    return wrap;
  }

  function addTip(msgEl, score, tip) {
    if (!$("#showTips").checked || (!tip && score == null)) return;
    const d = document.createElement("div"); d.className = "tip";
    d.innerHTML = `<b>Coach tip</b>${score != null ? `<span class="score-pill ${scoreClass(score)}">${score}/5</span>` : ""}<br>`;
    d.appendChild(document.createTextNode(tip || ""));
    msgEl.querySelector(".bubble").appendChild(d);
    $("#chat").scrollTop = $("#chat").scrollHeight;
  }

  function setBusy(b) {
    if (!S) return;
    S.busy = b;
    $("#sendBtn").disabled = b; $("#skipBtn").disabled = b;
    $("#answerInput").placeholder = b ? `${JUDGE} is thinking…` : "Type your team's answer… (Enter to send, Shift+Enter for a new line)";
  }

  // ---------- judging a turn ----------
  const TURN_SCHEMA = {
    type: "object",
    properties: {
      reaction: { type: "string" },
      follow_up: { type: "string" },
      score: { type: "integer", minimum: 0, maximum: 5 },
      coach_tip: { type: "string" }
    },
    required: ["reaction", "follow_up", "score", "coach_tip"]
  };

  function contextBlock() {
    const lines = [
      `Team: ${S.team}`,
      `Level: ${$("#gradeLevel").value} (VEX IQ Robotics Competition)`
    ];
    const robot = $("#robotName").value.trim(); if (robot) lines.push(`Robot nickname: ${robot}`);
    const game = $("#gameName").value.trim(); if (game) lines.push(`This season's game: ${game}`);
    const info = $("#robotInfo").value.trim(); if (info) lines.push(`What the team told us about their robot: ${info.slice(0, 800)}`);
    return lines.join("\n");
  }

  function styleRules() {
    return {
      friendly: "You are warm, encouraging, and upbeat, like a kind teacher. Use simple words.",
      standard: "You are professional, friendly, and curious, like a typical VEX IQ event judge.",
      tough: "You are polite but demanding, like a World Championship judge. You expect specific examples, data, and clear reasoning, and you notice vague answers."
    }[$("#judgeStyle").value];
  }

  async function judgeTurn(answerText) {
    const a = S.answers[S.idx];
    const canFollow = S.follows < S.depth;
    const exchange = a.exchanges.map((x, i) => `${i === 0 ? "Main question" : "Follow-up"}: ${x.q}\nTeam answer: ${x.a}`).join("\n\n");
    const sys = `You are ${JUDGE}, a judge at a VEX IQ Robotics Competition event, interviewing a team of ${$("#gradeLevel").value.toLowerCase()} students about their robot and season. ${styleRules()}

VEX IQ judges look for: the engineering design process, an engineering notebook, game strategy, robot design and build quality, programming (VEXcode IQ Blocks, Python, or C++), use of sensors, testing and iteration, creativity, team and project management, teamwork and communication, and evidence that STUDENTS (not adults) did the work. Strong answers are specific, give real examples, explain WHY, mention data or testing, and involve multiple team members.

You reply ONLY with JSON:
- "reaction": 1-2 short, natural sentences reacting to what the team just said. Be specific to their answer. Do not ask a question here. Do not repeat the question. Never give them the answer.
- "follow_up": ${canFollow ? "If the answer was vague, short, off-topic, or missing a reason, example, or evidence, ask ONE short follow-up question (under 25 words) that digs deeper into what they said, like a real judge would. If the answer was already thorough, use an empty string." : 'MUST be an empty string "" (no more follow-ups for this question).'}
- "score": integer 0-5 for the quality of the team's answer(s) to this question so far. 0 = no answer, 1 = very weak, 2 = basic/vague, 3 = solid with some detail, 4 = strong with examples and reasons, 5 = outstanding, specific, evidence-based.
- "coach_tip": ONE sentence of coaching (written to the students) on how to make this answer even stronger for real judges.`;

    const user = `${contextBlock()}

${exchange}

Write your JSON now.`;

    const raw = await ollamaChat({ messages: [{ role: "system", content: sys }, { role: "user", content: user }], format: TURN_SCHEMA, temperature: 0.5 });
    let j;
    try { j = JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); try { j = m ? JSON.parse(m[0]) : null; } catch { j = null; } }
    if (!j) j = { reaction: raw.slice(0, 300), follow_up: "", score: null, coach_tip: "" };
    j.reaction = String(j.reaction || "").trim();
    j.follow_up = canFollow ? String(j.follow_up || "").trim() : "";
    if (j.follow_up && !/\?\s*$/.test(j.follow_up) && j.follow_up.length < 8) j.follow_up = "";
    // Small models sometimes put the follow-up question inside the reaction.
    const qm = j.reaction.match(/^(.*?[.!])?\s*([^.!?]*\?)\s*$/s);
    if (qm && !j.follow_up) {
      if (canFollow) { j.reaction = (qm[1] || "").trim(); j.follow_up = qm[2].trim(); }
      else j.reaction = (qm[1] || "Thank you.").trim();
    }
    j.score = Number.isFinite(+j.score) && j.score !== null ? Math.max(0, Math.min(5, Math.round(+j.score))) : null;
    j.coach_tip = String(j.coach_tip || "").trim();
    return j;
  }

  async function submitAnswer(text) {
    if (!S || S.busy || S.ended) return;
    text = text.trim();
    if (!text) { toast("Type or speak an answer first (or press Skip)"); return; }
    stopMic();
    $("#answerInput").value = ""; updateWordCount();
    const a = S.answers[S.idx];
    a.exchanges.push({ q: S.lastJudge, a: text, t: Date.now() });
    addMsg("team", text);
    S.log.push({ who: "team", text });

    if (S.noAI) {
      S.idx++;
      return askCurrent(randomTransition());
    }

    setBusy(true);
    const thinking = addMsg("judge", "", { typing: true });
    try {
      const j = await judgeTurn(text);
      thinking.remove();
      if (j.score != null) a.score = j.score;
      if (j.coach_tip) a.tip = j.coach_tip;
      if (S.ended) return;
      if (S.endRequested) {
        const el = j.reaction ? addMsg("judge", j.reaction) : null;
        if (el) addTip(el, j.score, j.coach_tip);
        setBusy(false);
        return finish();
      }
      if (j.follow_up) {
        S.follows++;
        const msgText = (j.reaction ? j.reaction + " " : "") + j.follow_up;
        const el = addMsg("judge", msgText, { tag: "Follow-up" });
        S.log.push({ who: "judge", text: msgText });
        S.lastJudge = j.follow_up;
        addTip(el, j.score, j.coach_tip);
        speak(msgText);
        setBusy(false);
      } else {
        const el = j.reaction ? addMsg("judge", j.reaction) : null;
        if (el) { S.log.push({ who: "judge", text: j.reaction }); addTip(el, j.score, j.coach_tip); }
        S.idx++;
        setTimeout(() => askCurrent(j.reaction ? "" : randomTransition()), 500);
      }
    } catch (e) {
      thinking.remove();
      addMsg("system", `⚠️ Couldn't reach the AI judge (${e.message}). Moving on without feedback for this one.`);
      if (S.endRequested) { setBusy(false); return finish(); }
      S.idx++;
      askCurrent();
    }
  }

  function randomTransition() {
    const t = ["Thank you.", "Okay, great.", "Got it, thanks!", "Interesting!", "Thanks for sharing that.", "Nice.", "Alright."];
    return t[Math.floor(Math.random() * t.length)];
  }

  function skipQuestion() {
    if (!S || S.busy) return;
    const a = S.answers[S.idx];
    if (!a.exchanges.length) { a.skipped = true; a.score = 0; }
    addMsg("system", "Question skipped");
    S.idx++;
    askCurrent("No problem, let's try another one.");
  }

  // ---------- finish & report ----------
  async function finish() {
    if (!S || S.ended) return;
    S.ended = true;
    clearInterval(timerId);
    S.elapsed = (Date.now() - S.start) / 1000;
    stopMic();
    const bye = "That's all the time we have. Thank you so much for talking with me — you clearly worked hard this season. Good luck in your matches!";
    addMsg("judge", bye); speak(bye);
    $("#progressBar").style.width = "100%";
    setTimeout(showReport, 1200);
  }

  function computeStats() {
    const answered = S.answers.filter((a) => a.exchanges.length);
    const scored = answered.filter((a) => a.score != null);
    const avg = scored.length ? scored.reduce((s, a) => s + a.score, 0) / scored.length : null;
    const allWords = answered.flatMap((a) => a.exchanges.map((x) => words(x.a)));
    const avgWords = allWords.length ? Math.round(allWords.reduce((a, b) => a + b, 0) / allWords.length) : 0;
    const byCat = {};
    S.answers.forEach((a) => {
      if (a.score == null) return;
      const k = a.q.catName; (byCat[k] ||= { icon: a.q.icon, sum: 0, n: 0 }); byCat[k].sum += a.score; byCat[k].n++;
    });
    return { answered, avg, avgWords, byCat };
  }

  function showReport() {
    $("#liveView").classList.add("hidden");
    $("#reportView").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const st = computeStats();
    $("#reportSub").textContent = `${S.team} · ${S.mode.icon} ${S.mode.name} · ${new Date(S.id).toLocaleString()}`;

    $("#statCards").innerHTML = [
      [st.avg != null ? st.avg.toFixed(1) + "/5" : "—", "Average answer score"],
      [`${st.answered.length}/${S.questions.length}`, "Questions answered"],
      [fmtTime(S.elapsed), `Time (target ~${S.mode.minutes} min)`],
      [st.avgWords, "Avg words per answer"]
    ].map(([b, s]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("");

    const bars = Object.entries(st.byCat).sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n);
    $("#catBars").innerHTML = bars.length
      ? bars.map(([name, v]) => { const avg = v.sum / v.n; return `<div class="bar-row"><span class="name">${v.icon} ${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(avg / 5) * 100}%;background:var(--${avg >= 4 ? "good" : avg >= 2.5 ? "warn" : "bad"})"></div></div><span class="val">${avg.toFixed(1)}</span></div>`; }).join("")
      : `<p class="muted">${S.noAI ? "Scores need the AI judge. Turn off “Practice without AI” to get scores." : "No scored answers yet."}</p>`;

    renderQA();
    const rec = { id: S.id, team: S.team, mode: S.mode.name, modeIcon: S.mode.icon, avg: st.avg, answered: st.answered.length, total: S.questions.length, elapsed: S.elapsed, transcript: transcriptMd(), report: "" };

    if (S.noAI || !st.answered.length) {
      $("#aiReport").innerHTML = `<p class="muted">${st.answered.length ? "AI feedback is off in practice-without-AI mode. Review your answers below and compare them with what judges look for in the Question Bank." : "No answers to review — try again and answer a few questions!"}</p>`;
      saveHistory(rec);
      return;
    }
    $("#aiReport").innerHTML = `<p class="muted"><span class="typing"><i></i><i></i><i></i></span> ${JUDGE} is writing your feedback…</p>`;
    generateReport().then((md) => { rec.report = md; saveHistory(rec); })
      .catch((e) => { $("#aiReport").innerHTML = `<p class="muted">⚠️ Couldn't generate the AI report: ${esc(e.message)}</p>`; saveHistory(rec); });
  }

  function renderQA() {
    $("#qaReview").innerHTML = "";
    S.answers.forEach((a, i) => {
      const d = document.createElement("details"); d.className = "qa";
      const sc = a.score != null ? `<span class="score-pill ${scoreClass(a.score)}">${a.score}/5</span>` : a.exchanges.length ? "" : `<span class="score-pill s-lo">${a.skipped ? "skipped" : "not reached"}</span>`;
      d.innerHTML = `<summary><span class="qtext">${a.q.icon} Q${i + 1}. ${esc(a.q.text)}</span>${sc}</summary><div class="body"></div>`;
      const body = d.querySelector(".body");
      a.exchanges.forEach((x, k) => {
        body.insertAdjacentHTML("beforeend", `${k ? `<div class="lbl">Follow-up</div><p>${esc(x.q)}</p>` : ""}<div class="lbl">Your answer</div><p>${esc(x.a)}</p>`);
      });
      if (a.tip) body.insertAdjacentHTML("beforeend", `<div class="tip"><b>Coach tip</b><br>${esc(a.tip)}</div>`);
      const lf = catById[a.q.catId]?.lookFor;
      if (lf) body.insertAdjacentHTML("beforeend", `<div class="lookfor" style="margin-top:8px">${lf.map((l) => `<span>✓ ${esc(l)}</span>`).join("")}</div>`);
      if (!a.exchanges.length && !a.tip) body.insertAdjacentHTML("beforeend", `<p class="muted">No answer recorded.</p>`);
      $("#qaReview").appendChild(d);
    });
  }

  function transcriptText() {
    return S.answers.filter((a) => a.exchanges.length).map((a, i) =>
      `[${a.q.catName}] (score ${a.score ?? "n/a"}/5)\n` + a.exchanges.map((x, k) => `${k ? "Judge follow-up" : "Judge"}: ${x.q}\nTeam: ${x.a}`).join("\n")
    ).join("\n\n");
  }

  function transcriptMd() {
    let md = `# WinterBots VEX IQ AI Interviewer — Transcript\n\n**Team:** ${S.team}  \n**Mode:** ${S.mode.name}  \n**Date:** ${new Date(S.id).toLocaleString()}  \n**Time:** ${fmtTime(S.elapsed)}\n\n`;
    S.answers.forEach((a, i) => {
      md += `## Q${i + 1}. ${a.q.text}\n*${a.q.catName}*${a.score != null ? ` — score ${a.score}/5` : ""}\n\n`;
      if (!a.exchanges.length) md += `_${a.skipped ? "Skipped" : "Not reached"}_\n\n`;
      a.exchanges.forEach((x, k) => { if (k) md += `**Follow-up:** ${x.q}\n\n`; md += `> ${x.a.replace(/\n/g, "\n> ")}\n\n`; });
      if (a.tip) md += `**Coach tip:** ${a.tip}\n\n`;
    });
    return md;
  }

  async function generateReport() {
    const sys = `You are ${JUDGE}, an experienced VEX IQ Robotics Competition judge and coach. You just interviewed a team of ${$("#gradeLevel").value.toLowerCase()} students. Write feedback that helps them get better at real judge interviews. Be honest, specific, and encouraging. Quote short bits of what they said. Never invent facts about their robot. Write for students: clear, friendly, and concise.`;
    const user = `${contextBlock()}
Interview mode: ${S.mode.name}. Time used: ${fmtTime(S.elapsed)} (target about ${S.mode.minutes} minutes).

TRANSCRIPT:
${transcriptText().slice(0, 14000)}

Write the feedback in Markdown with EXACTLY these sections:

## Overall impression
2-3 sentences.

## Rubric scores
A Markdown table with columns: Area | Level | Points (0-5) | Why. Only include the areas that the interview actually covered, chosen from: Engineering Design Process; Game Strategy; Robot Design; Robot Build; Robot Programming; Creativity / Originality; Team & Project Management; Teamwork, Communication & Professionalism; Respect, Courtesy & Positivity. Level is Expert (4-5), Proficient (2-3), or Emerging (0-1).

## Top 3 strengths
Bullets, each pointing to something they actually said.

## Top 3 things to improve
Bullets with concrete, actionable advice.

## Upgrade an answer
Pick their weakest answer. Show the question, then a stronger example answer written in the team's voice that keeps their real facts and uses [brackets] for details they should fill in (like [number of tests] or [teammate name]).

## Practice plan before the next event
3-4 short bullets.`;
    const out = await ollamaChat({
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      stream: true, temperature: 0.5,
      onToken: (md) => { $("#aiReport").innerHTML = renderMd(md); }
    });
    $("#aiReport").innerHTML = renderMd(out);
    return out;
  }

  // ---------- history ----------
  function saveHistory(rec) {
    const h = store.get("history", []);
    h.unshift(rec);
    store.set("history", h.slice(0, 20));
  }
  function renderHistory() {
    const h = store.get("history", []);
    const el = $("#historyList");
    if (!h.length) { el.innerHTML = `<p class="muted">No interviews yet. Your finished interviews will show up here.</p>`; return; }
    el.innerHTML = "";
    h.forEach((r, i) => {
      const d = document.createElement("div"); d.className = "hist";
      d.innerHTML = `<div><b>${r.modeIcon || ""} ${esc(r.mode)}</b> · ${esc(r.team)}<br><span class="muted">${new Date(r.id).toLocaleString()} · ${r.answered}/${r.total} answered · ${fmtTime(r.elapsed || 0)}</span></div>
        <div class="row">${r.avg != null ? `<span class="score-pill ${scoreClass(r.avg)}" style="font-size:.9rem">${r.avg.toFixed(1)}/5</span>` : ""}<button class="btn ghost small" data-i="${i}">View</button><button class="btn ghost small" data-dl="${i}">⬇</button></div>`;
      el.appendChild(d);
    });
    el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      const r = h[+b.dataset.i];
      const w = document.createElement("div"); w.className = "card md"; w.style.marginTop = "12px";
      w.innerHTML = renderMd((r.report ? r.report + "\n\n---\n\n" : "") + r.transcript);
      const prev = el.querySelector(".card.md"); if (prev) prev.remove();
      b.closest(".hist").after(w);
    }));
    el.querySelectorAll("[data-dl]").forEach((b) => b.addEventListener("click", () => {
      const r = h[+b.dataset.dl];
      download(`interview-${new Date(r.id).toISOString().slice(0, 10)}.md`, (r.report ? r.report + "\n\n---\n\n" : "") + r.transcript);
    }));
  }
  $("#clearHistory").addEventListener("click", () => {
    if (confirm("Delete all saved interviews from this browser?")) { store.set("history", []); renderHistory(); }
  });

  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ---------- question bank ----------
  let bankFilter = "all";
  function renderBank() {
    const q = $("#bankSearch").value.trim().toLowerCase();
    const f = $("#bankFilters");
    if (!f.childElementCount) {
      [["all", "All"], ...CATS.map((c) => [c.id, `${c.icon} ${c.name}`])].forEach(([id, label]) => {
        const b = document.createElement("button"); b.className = "fchip" + (id === "all" ? " active" : ""); b.textContent = label; b.dataset.id = id;
        b.addEventListener("click", () => { bankFilter = id; $$(".fchip").forEach((x) => x.classList.toggle("active", x === b)); renderBank(); });
        f.appendChild(b);
      });
    }
    const list = $("#bankList"); list.innerHTML = "";
    let total = 0;
    CATS.filter((c) => bankFilter === "all" || c.id === bankFilter).forEach((c) => {
      const qs = c.q.filter(([, t]) => !q || t.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
      if (!qs.length) return;
      total += qs.length;
      const card = document.createElement("div"); card.className = "card cat-block";
      card.innerHTML = `<h3>${c.icon} ${esc(c.name)} <span class="count">${qs.length} questions</span></h3><p class="muted" style="margin:0">${esc(c.desc)}</p>
        <div class="lookfor">${c.lookFor.map((l) => `<span>✓ ${esc(l)}</span>`).join("")}</div>`;
      qs.forEach(([d, t]) => {
        const row = document.createElement("div"); row.className = "qrow";
        row.innerHTML = `<span class="diff ${d}">${{ e: "EASY", m: "MEDIUM", h: "HARD" }[d]}</span><span class="qt"></span><button class="btn ghost small" type="button">Practice</button>`;
        row.querySelector(".qt").textContent = t;
        row.querySelector("button").addEventListener("click", () => {
          showTab("interview");
          startInterview([{ catId: c.id, catName: c.name, icon: c.icon, diff: d, text: t }]);
        });
        card.appendChild(row);
      });
      list.appendChild(card);
    });
    if (!total) list.innerHTML = `<div class="card"><p class="muted">No questions match “${esc(q)}”.</p></div>`;
  }
  $("#bankSearch").addEventListener("input", renderBank);

  // ---------- voice ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, recBase = "";
  function stopMic() { if (rec) { try { rec.stop(); } catch {} rec = null; } $("#micBtn").classList.remove("recording"); $("#micBtn").textContent = "🎙️ Speak"; }
  $("#micBtn").addEventListener("click", () => {
    if (!SR) { toast("Voice input needs Chrome or Edge"); return; }
    if (rec) return stopMic();
    window.speechSynthesis?.cancel();
    rec = new SR(); rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    recBase = $("#answerInput").value ? $("#answerInput").value.trim() + " " : "";
    rec.onresult = (e) => {
      let finalT = "", interim = "";
      for (let i = 0; i < e.results.length; i++) (e.results[i].isFinal ? (finalT += e.results[i][0].transcript) : (interim += e.results[i][0].transcript));
      $("#answerInput").value = recBase + finalT + interim; updateWordCount();
    };
    rec.onerror = (e) => { toast("Mic: " + e.error); stopMic(); };
    rec.onend = () => { if (rec) stopMic(); };
    rec.start();
    $("#micBtn").classList.add("recording"); $("#micBtn").textContent = "⏹ Stop";
  });
  function speak(text) {
    if (!$("#speakAloud").checked || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 1;
    const v = speechSynthesis.getVoices().find((v) => /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny|Natural/i.test(v.name));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  $("#repeatBtn").addEventListener("click", () => {
    if (!S) return;
    if (!window.speechSynthesis) return toast("Text-to-speech isn't supported here");
    const was = $("#speakAloud").checked; $("#speakAloud").checked = true; speak(S.lastJudge || ""); $("#speakAloud").checked = was;
  });

  // ---------- composer ----------
  function updateWordCount() { const n = words($("#answerInput").value); $("#wordCount").textContent = `${n} word${n === 1 ? "" : "s"}`; }
  $("#answerInput").addEventListener("input", updateWordCount);
  $("#answerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); submitAnswer($("#answerInput").value); }
  });
  $("#composer").addEventListener("submit", (e) => { e.preventDefault(); submitAnswer($("#answerInput").value); });
  $("#skipBtn").addEventListener("click", skipQuestion);
  $("#endBtn").addEventListener("click", () => {
    if (!S || S.ended) return;
    if (S.busy) { S.endRequested = true; toast("Finishing after the judge responds…"); return; }
    if (S.answers.some((a) => a.exchanges.length) || confirm("End the interview without answering anything?")) finish();
  });

  // ---------- report buttons ----------
  $("#againBtn").addEventListener("click", () => {
    $("#reportView").classList.add("hidden"); $("#setupView").classList.remove("hidden"); window.scrollTo({ top: 0 });
  });
  $("#downloadBtn").addEventListener("click", () => {
    if (!S) return;
    const ai = $("#aiReport").innerText.trim();
    download(`winterbots-interview-${new Date(S.id).toISOString().slice(0, 10)}.md`, transcriptMd() + (ai ? `\n---\n\n# Judge feedback\n\n${ai}\n` : ""));
  });
  $("#retryWeakBtn").addEventListener("click", () => {
    if (!S) return;
    const weak = S.answers.filter((a) => a.score == null || a.score <= 3).sort((a, b) => (a.score ?? -1) - (b.score ?? -1)).slice(0, 6).map((a) => a.q);
    if (!weak.length) return toast("Great job — no weak answers to retry! 🎉");
    startInterview(weak);
  });

  // ---------- connect tab ----------
  function osCommand(os) {
    const origin = location.origin.startsWith("http") ? location.origin : "*";
    return {
      mac: `launchctl setenv OLLAMA_ORIGINS "${origin}"\n# then quit Ollama from the menu bar and open it again`,
      win: `setx OLLAMA_ORIGINS "${origin}"\n# then quit Ollama from the system tray and open it again`,
      linux: `sudo systemctl edit ollama.service\n# add these two lines, save, then run the next command:\n[Service]\nEnvironment="OLLAMA_ORIGINS=${origin}"\n\nsudo systemctl restart ollama`
    }[os];
  }
  let curOS = /Win/i.test(navigator.platform) ? "win" : /Linux/i.test(navigator.platform) ? "linux" : "mac";
  function renderOS() {
    $$(".os").forEach((b) => b.classList.toggle("active", b.dataset.os === curOS));
    $("#osCmd code").textContent = osCommand(curOS);
  }
  $$(".os").forEach((b) => b.addEventListener("click", () => { curOS = b.dataset.os; renderOS(); }));
  $("#copyCmd").addEventListener("click", () => {
    const line = osCommand(curOS).split("\n")[0];
    navigator.clipboard?.writeText(line).then(() => toast("Copied!"), () => toast("Couldn't copy — select it manually"));
  });
  $("#testConn").addEventListener("click", async () => {
    saveSettings();
    const r = $("#connResult"); r.innerHTML = `<span class="muted">Testing…</span>`;
    const res = await fetchModels();
    if (res.ok) {
      r.innerHTML = res.models.length
        ? `<p class="ok">✅ Connected! Found ${res.models.length} model${res.models.length === 1 ? "" : "s"}. You're ready to start an interview.</p>`
        : `<p class="ok">✅ Connected, but no chat models are installed.</p><pre><code>ollama pull llama3.2:3b</code></pre>`;
    } else {
      r.innerHTML = `<p class="err">❌ Couldn't reach Ollama at ${esc(ollamaBase())}</p>
        <div class="help-box"><b>Try this:</b><ol style="margin:.4rem 0 0;padding-left:1.2rem">
        <li>Make sure the Ollama app is running.</li>
        <li>Run the “allow this website” command below, then <b>quit and reopen Ollama</b>.</li>
        <li>Use Chrome, Edge, or Firefox and click <b>Allow</b> if asked about local network access.</li></ol></div>`;
    }
  });
  $("#ollamaUrl").addEventListener("change", () => { saveSettings(); fetchModels(); });

  // ---------- setup wiring ----------
  $("#questionCount").addEventListener("input", (e) => { $("#countLabel").textContent = e.target.value; });
  FIELDS.concat(TOGGLES).forEach((f) => $("#" + f)?.addEventListener("change", saveSettings));
  $("#modelSelect").addEventListener("change", saveSettings);
  $("#refreshModels").addEventListener("click", async () => { const r = await fetchModels(); toast(r.ok ? "Models refreshed" : "Ollama not reachable"); });
  $("#startBtn").addEventListener("click", () => { $("#startHint").textContent = ""; startInterview(); });
  window.addEventListener("beforeunload", (e) => { if (S && !S.ended && S.answers.some((a) => a.exchanges.length)) { e.preventDefault(); e.returnValue = ""; } });

  // ---------- init ----------
  const totalQ = CATS.reduce((n, c) => n + c.q.length, 0);
  $("#statQuestions").textContent = totalQ;
  $("#statCats").textContent = CATS.length;
  loadSettings();
  if (!store.get("settings", null)) $("#questionCount").value = (MODES.find((m) => m.id === selectedMode) || MODES[0]).defaultCount, $("#countLabel").textContent = $("#questionCount").value;
  renderModes();
  renderBank();
  renderOS();
  fetchModels();
})();
