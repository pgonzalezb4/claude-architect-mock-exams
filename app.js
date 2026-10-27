/* CCAR-F mock exam runner. Vanilla JS, no dependencies. Data comes from data.js (window.DATA). */
(function () {
  "use strict";

  /* ---------- static reference data (from the official Exam Guide v1.0) ---------- */
  var DOMAINS = {
    1: { name: "Agentic Architecture & Orchestration", weight: 27 },
    2: { name: "Tool Design & MCP Integration", weight: 18 },
    3: { name: "Claude Code Configuration & Workflows", weight: 20 },
    4: { name: "Prompt Engineering & Structured Output", weight: 20 },
    5: { name: "Context Management & Reliability", weight: 15 }
  };
  var TS = {
    "1.1": "Design and implement agentic loops for autonomous task execution",
    "1.2": "Orchestrate multi-agent systems with coordinator-subagent patterns",
    "1.3": "Configure subagent invocation, context passing, and spawning",
    "1.4": "Implement multi-step workflows with enforcement and handoff patterns",
    "1.5": "Apply Agent SDK hooks for tool call interception and data normalization",
    "1.6": "Design task decomposition strategies for complex workflows",
    "1.7": "Manage session state, resumption, and forking",
    "2.1": "Design effective tool interfaces with clear descriptions and boundaries",
    "2.2": "Implement structured error responses for MCP tools",
    "2.3": "Distribute tools appropriately across agents and configure tool choice",
    "2.4": "Integrate MCP servers into Claude Code and agent workflows",
    "2.5": "Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively",
    "3.1": "Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization",
    "3.2": "Create and configure custom slash commands and skills",
    "3.3": "Apply path-specific rules for conditional convention loading",
    "3.4": "Determine when to use plan mode vs direct execution",
    "3.5": "Apply iterative refinement techniques for progressive improvement",
    "3.6": "Integrate Claude Code into CI/CD pipelines",
    "4.1": "Design prompts with explicit criteria to improve precision and reduce false positives",
    "4.2": "Apply few-shot prompting to improve output consistency and quality",
    "4.3": "Enforce structured output using tool use and JSON schemas",
    "4.4": "Implement validation, retry, and feedback loops for extraction quality",
    "4.5": "Design efficient batch processing strategies",
    "4.6": "Design multi-instance and multi-pass review architectures",
    "5.1": "Manage conversation context to preserve critical information across long interactions",
    "5.2": "Design effective escalation and ambiguity resolution patterns",
    "5.3": "Implement error propagation strategies across multi-agent systems",
    "5.4": "Manage context effectively in large codebase exploration",
    "5.5": "Design human review workflows and confidence calibration",
    "5.6": "Preserve information provenance and handle uncertainty in multi-source synthesis"
  };
  var PASS_SCALED = 720;
  var EXAM_SECONDS = 120 * 60;
  var LS_SESSION = "ccarf.session.v1";
  var LS_ATTEMPTS = "ccarf.attempts.v1";

  var DATA = window.DATA || { scenarios: [], exams: [] };
  var SCEN = {};
  DATA.scenarios.forEach(function (s) { SCEN[s.id] = s; });
  var QINDEX = {}; // "examId:n" -> question (+ examId)
  var ALL_SETS = DATA.exams.slice();
  if (DATA.sample) ALL_SETS.push(DATA.sample);
  ALL_SETS.forEach(function (ex) {
    ex.questions.forEach(function (q) { q.key = ex.id + ":" + q.n; q.examId = ex.id; QINDEX[q.key] = q; });
  });

  /* ---------- helpers ---------- */
  var $app = document.getElementById("app");
  var $topRight = document.getElementById("topbar-right");
  var timerHandle = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function inline(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  }
  // minimal markdown: fenced code, inline code, bold, paragraphs
  function md(src) {
    var out = [], parts = String(src).split(/```[a-zA-Z]*\n?/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) { out.push("<pre><code>" + esc(parts[i].replace(/\n$/, "")) + "</code></pre>"); continue; }
      parts[i].split(/\n{2,}/).forEach(function (p) {
        if (!p.trim()) return;
        var lines = p.split("\n");
        if (lines.every(function (l) { return /^\s*[-*] /.test(l); })) {
          out.push("<ul>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*[-*] /, "")) + "</li>"; }).join("") + "</ul>");
        } else {
          out.push("<p>" + lines.map(inline).join("<br>") + "</p>");
        }
      });
    }
    return out.join("");
  }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be unavailable */ } }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
  function fmtDate(t) { return new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  function sameSet(a, b) { if (a.length !== b.length) return false; var s = {}; a.forEach(function (x) { s[x] = 1; }); return b.every(function (x) { return s[x]; }); }
  function isCorrect(q, ans) { return !!ans && sameSet(ans, q.answer); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function scaledFromPct(p) { return Math.round(100 + 900 * p); }

  function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

  /* ---------- state ---------- */
  var session = load(LS_SESSION, null);
  var attempts = load(LS_ATTEMPTS, []);
  function saveSession() { if (session) save(LS_SESSION, session); }
  function saveAttempts() { save(LS_ATTEMPTS, attempts); }

  /* ---------- router ---------- */
  function route() {
    stopTimer();
    var h = location.hash || "#/";
    var m;
    window.scrollTo(0, 0);
    $topRight.innerHTML = "";
    if ((m = h.match(/^#\/results\/(.+)$/))) return viewResults(m[1]);
    if (h === "#/run") return viewRun();
    return viewHome();
  }
  window.addEventListener("hashchange", route);

  /* ---------- HOME ---------- */
  function viewHome() {
    var resumable = session && !session.finished;
    var html = "";
    html += '<section class="hero"><h1>Claude Certified Architect – Foundations</h1>' +
      '<p>Interactive practice for exam <b>CCAR-F</b>. Five full-length mock exams that mirror the real format (60 scenario-based items, 120 minutes, 4 of 6 scenarios), plus the 12 official sample questions from the Exam Guide. Everything runs locally; your attempts are saved in this browser.</p></section>';

    if (resumable) {
      var done = Object.keys(session.answers).filter(function (k) { return session.answers[k].length; }).length;
      html += '<div class="card" style="margin-bottom:20px;border-color:var(--accent)"><div class="row"><div><b>Session in progress:</b> ' + esc(session.title) +
        ' <span class="pill accent">' + (session.mode === "exam" ? "Exam mode" : "Practice mode") + '</span><div class="muted small">' + done + " of " + session.qkeys.length + " answered" +
        (session.mode === "exam" ? " · " + fmtTime((session.endsAt - Date.now()) / 1000) + " left" : "") + '</div></div><div class="spacer"></div>' +
        '<a class="btn primary" href="#/run">Resume</a><button class="btn danger" data-act="discard">Discard</button></div></div>';
    }

    html += '<div class="facts">' +
      fact("60", "items per exam") + fact("120 min", "time limit") + fact("720 / 1000", "passing scaled score") +
      fact("4 of 6", "scenarios per sitting") + fact("MC + MR", "single and multi-select") + fact("$125", "exam fee · 12-month validity") + "</div>";

    html += '<h2 class="section-title">Mock exams</h2><div class="grid cols-3">';
    DATA.exams.forEach(function (ex) { html += examCard(ex); });
    if (DATA.sample) html += examCard(DATA.sample);
    html += customCard();
    html += "</div>";

    html += historyHtml();
    html += guideHtml();
    html += '<p class="muted small" style="margin-top:28px">Mock questions are original practice items written against the public Exam Guide blueprint (task statements, scenarios, sample-question style). The real exam content is confidential under Anthropic\'s NDA and is not reproduced here. The scaled score shown for mocks is a rough estimate only; the real exam uses equated scaling.</p>';
    $app.innerHTML = html;
  }
  function fact(a, b) { return '<div class="fact"><b>' + a + "</b><span>" + b + "</span></div>"; }
  function examCard(ex) {
    var last = attempts.filter(function (a) { return a.examId === ex.id; });
    var best = last.reduce(function (m, a) { return Math.max(m, a.scaled); }, 0);
    var sc = ex.scenarioIds.map(function (id) { return '<span class="pill">S' + id + " · " + esc(SCEN[id].title) + "</span>"; }).join("");
    return '<div class="card exam-card"><div class="row"><h3 style="margin:0">' + esc(ex.title) + "</h3>" + (ex.official ? '<span class="pill ok">Official</span>' : "") + '<div class="spacer"></div><span class="pill">' + ex.questions.length + " items</span></div>" +
      (ex.subtitle ? '<div class="muted small">' + esc(ex.subtitle) + "</div>" : "") +
      '<div class="scen">' + sc + "</div>" +
      '<div class="best">' + (last.length ? "Attempts: " + last.length + " · Best est. score: <b>" + best + "</b>" : "Not attempted yet") + "</div>" +
      '<div class="row" style="margin-top:auto"><button class="btn primary" data-act="start" data-id="' + ex.id + '">Start</button></div></div>';
  }
  function customCard() {
    var opts = Object.keys(DOMAINS).map(function (d) { return '<option value="' + d + '">D' + d + " · " + esc(DOMAINS[d].name) + "</option>"; }).join("");
    var total = DATA.exams.reduce(function (n, e) { return n + e.questions.length; }, 0);
    return '<div class="card exam-card"><h3 style="margin:0">Targeted practice</h3><div class="muted small">Draw random questions from all ' + total + ' mock items, with instant feedback.</div>' +
      '<label class="small">Domain<br><select id="cp-domain" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"><option value="0">All domains</option>' + opts + "</select></label>" +
      '<label class="small">Questions<br><select id="cp-count" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"><option>10</option><option selected>20</option><option>30</option></select></label>' +
      '<div class="row" style="margin-top:auto"><button class="btn primary" data-act="custom">Start practice</button></div></div>';
  }
  function historyHtml() {
    if (!attempts.length) return "";
    var rows = attempts.slice().reverse().slice(0, 15).map(function (a) {
      return "<tr><td>" + fmtDate(a.date) + "</td><td>" + esc(a.title) + '</td><td><span class="pill">' + (a.mode === "exam" ? "Exam" : "Practice") + "</span></td><td>" + a.correct + "/" + a.total +
        " (" + Math.round(a.pct * 100) + '%)</td><td><b>' + a.scaled + '</b> <span class="pill ' + (a.scaled >= PASS_SCALED ? "ok" : "bad") + '">' + (a.scaled >= PASS_SCALED ? "≥ 720" : "< 720") + '</span></td><td><a href="#/results/' + a.id + '">Review</a></td></tr>';
    }).join("");
    return '<h2 class="section-title">History</h2><div class="card" style="padding:6px 10px;overflow-x:auto"><table><thead><tr><th>When</th><th>Set</th><th>Mode</th><th>Score</th><th>Est. scaled</th><th></th></tr></thead><tbody>' + rows + '</tbody></table><div class="row" style="padding:8px"><button class="btn small danger" data-act="clear-history">Clear history</button></div></div>';
  }
  function guideHtml() {
    var w = Object.keys(DOMAINS).map(function (d) {
      return '<div class="wrow"><div>D' + d + " · " + esc(DOMAINS[d].name) + '</div><div class="bar"><i style="width:' + DOMAINS[d].weight * 3 + '%"></i></div><b>' + DOMAINS[d].weight + "%</b></div>";
    }).join("");
    var domFolds = Object.keys(DOMAINS).map(function (d) {
      var items = Object.keys(TS).filter(function (k) { return k.charAt(0) === d; }).map(function (k) { return "<li><b>" + k + "</b> " + esc(TS[k]) + "</li>"; }).join("");
      return '<details class="fold"><summary>Domain ' + d + " · " + esc(DOMAINS[d].name) + " (" + DOMAINS[d].weight + "%)</summary><div><ul>" + items + "</ul></div></details>";
    }).join("");
    var scen = DATA.scenarios.map(function (s) {
      return '<details class="fold"><summary>Scenario ' + s.id + " · " + esc(s.title) + '</summary><div><p>' + esc(s.context) + '</p><p class="muted small">Primary domains: ' + s.domains.map(function (d) { return DOMAINS[d].name; }).join(", ") + "</p></div></details>";
    }).join("");
    return '<h2 class="section-title">What the exam covers</h2><div class="card"><div class="weights">' + w + "</div></div>" +
      '<h2 class="section-title">Task statements by domain</h2>' + domFolds +
      '<h2 class="section-title">The six scenarios (4 are drawn at random)</h2>' + scen +
      '<h2 class="section-title">How the real exam is scored and run</h2><div class="card"><ul style="margin:0;padding-left:1.2em">' +
      "<li>Criterion-referenced: you are measured against a fixed standard (cut score <b>720</b> on a <b>100–1,000</b> scaled range), not against other candidates.</li>" +
      "<li>Pass/fail with scaled score; the report also shows percent correct per domain. Domain percentages are informational and do not decide pass/fail.</li>" +
      "<li>Each item states how many answers to select. Multiple-response items need the full correct set.</li>" +
      "<li>Proctored via Pearson VUE (online or test center). No notes, phones or other materials. Retakes: 14 days after the 1st fail, 30 after the 2nd, 90 after the 3rd; max 4 attempts per rolling 12 months.</li>" +
      "<li>Out of scope: fine-tuning, API auth/billing, computer use, vision, streaming, rate limits/pricing math, cloud-provider config, prompt-caching internals, tokenization.</li></ul></div>" +
      '<h2 class="section-title">Answer-selection patterns the exam rewards</h2><div class="card"><ul style="margin:0;padding-left:1.2em">' +
      "<li><b>Deterministic beats probabilistic</b> when a rule is critical (identity checks, refund limits): hooks and programmatic prerequisites, not more prompt text or few-shot examples.</li>" +
      "<li><b>Proportionate first step</b>: fix the root cause with the least machinery (better tool descriptions, explicit criteria) before classifiers, routing layers or new infrastructure.</li>" +
      "<li><b>Find the upstream root cause</b>: if every subagent did its job, look at the coordinator's decomposition.</li>" +
      "<li><b>Structured context over generic status</b>: errors carry type, attempted query, partial results, alternatives; handoffs carry customer, root cause, recommended action.</li>" +
      "<li><b>Least privilege for tools</b>: scoped tools per role, 4–5 not 18; scoped cross-role tools for high-frequency needs.</li>" +
      "<li><b>Batch only when latency-tolerant</b>; blocking checks stay synchronous. Retries fix format errors, not missing source information.</li>" +
      "<li><b>Independent review beats self-review</b>; split big reviews into per-file passes plus an integration pass.</li>" +
      "<li><b>Distrust fake features</b> and popular misconceptions (bigger context window fixes attention, sentiment or self-reported confidence as escalation proxies).</li></ul></div>";
  }

  /* ---------- home actions ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "start") return openStart(t.getAttribute("data-id"));
    if (act === "custom") return startCustom();
    if (act === "discard") { if (confirm("Discard the session in progress?")) { session = null; localStorage.removeItem(LS_SESSION); viewHome(); } return; }
    if (act === "clear-history") { if (confirm("Delete all saved attempts?")) { attempts = []; saveAttempts(); viewHome(); } return; }
    if (act === "close-modal") return closeModal();
  });

  function closeModal() { var m = document.getElementById("modal"); if (m) m.remove(); }
  function openStart(id) {
    var ex = ALL_SETS.filter(function (e) { return e.id === id; })[0];
    var examDefault = !ex.official;
    var timedOnly = !ex.official; // the five full mocks are always timed
    var html = '<div class="overlay" id="modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">' + esc(ex.title) + "</h2>" +
      (timedOnly ? '<p class="muted">' + ex.questions.length + ' items · <b>120-minute countdown</b>. The exam auto-submits when time runs out. No answer feedback until you submit; you can flag items and revisit them. If you reload, the clock keeps running.</p>' +
        '<input type="radio" name="mode" value="exam" checked hidden>' :
      '<p class="muted">' + ex.questions.length + " items. Choose how you want to take it.</p>" +
      '<div class="opt-group">' +
      '<label><input type="radio" name="mode" value="exam"' + (examDefault ? " checked" : "") + '><span><b>Exam mode</b><br><span class="muted small">' + (ex.questions.length === 60 ? "120-minute countdown" : "Timed at 2 min per item") + ", no feedback until you submit, flag items for review. Closest to test day.</span></span></label>" +
      '<label><input type="radio" name="mode" value="practice"' + (!examDefault ? " checked" : "") + '><span><b>Practice mode</b><br><span class="muted small">Untimed. Check each answer for instant explanations.</span></span></label></div>') +
      '<div class="row"><button class="btn primary" id="go">' + (timedOnly ? "Start timed exam" : "Begin") + '</button><button class="btn" data-act="close-modal">Cancel</button></div></div></div>';
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("go").onclick = function () {
      var mode = document.querySelector('input[name="mode"]:checked').value;
      closeModal();
      beginSession(ex.title, ex.id, ex.questions.map(function (q) { return q.key; }), mode, ex.questions.length === 60 ? EXAM_SECONDS : ex.questions.length * 120);
    };
  }
  function startCustom() {
    var d = parseInt(document.getElementById("cp-domain").value, 10);
    var n = parseInt(document.getElementById("cp-count").value, 10);
    var pool = [];
    DATA.exams.forEach(function (ex) { ex.questions.forEach(function (q) { if (!d || q.domain === d) pool.push(q.key); }); });
    var keys = shuffle(pool).slice(0, n);
    beginSession("Targeted practice" + (d ? " · D" + d : " · all domains"), "custom", keys, "practice", 0);
  }
  function beginSession(title, examId, keys, mode, seconds) {
    if (session && !session.finished && !confirm("This replaces the session in progress. Continue?")) return;
    session = { id: uid(), title: title, examId: examId, mode: mode, qkeys: keys, answers: {}, flags: {}, checked: {}, idx: 0,
      startedAt: Date.now(), endsAt: mode === "exam" ? Date.now() + seconds * 1000 : 0, limit: seconds, finished: false };
    saveSession();
    location.hash = "#/run";
  }

  /* ---------- RUN ---------- */
  function viewRun() {
    if (!session || session.finished) { location.hash = "#/"; return; }
    renderRun();
    if (session.mode === "exam") {
      timerHandle = setInterval(tick, 1000);
      tick();
    }
  }
  function tick() {
    var left = (session.endsAt - Date.now()) / 1000;
    var el = document.getElementById("timer");
    if (el) { el.textContent = fmtTime(left); el.className = "timer" + (left < 300 ? " crit" : left < 900 ? " low" : ""); }
    if (left <= 0) { stopTimer(); finish(true); }
  }
  function curQ() { return QINDEX[session.qkeys[session.idx]]; }

  function renderRun() {
    var q = curQ(), s = session, key = q.key;
    var ans = s.answers[key] || [];
    var practice = s.mode === "practice";
    var checked = practice && s.checked[key];
    var answered = Object.keys(s.answers).filter(function (k) { return s.answers[k] && s.answers[k].length; }).length;

    $topRight.innerHTML = (s.mode === "exam" ? '<span class="timer" id="timer"></span>' : '<span class="pill">Practice</span>') +
      '<button class="btn small primary" data-run="submit">' + (practice ? "Finish" : "Submit exam") + "</button>";

    var scen = SCEN[q.scenario];
    var firstOfScenario = s.idx === 0 || QINDEX[s.qkeys[s.idx - 1]].scenario !== q.scenario;
    var multi = q.type === "multi";

    var opts = q.options.map(function (o) {
      var sel = ans.indexOf(o.id) >= 0, cls = "option";
      var tag = "";
      if (checked) {
        cls += " locked";
        var isAns = q.answer.indexOf(o.id) >= 0;
        if (isAns) { cls += " correct"; tag = '<span class="tag" style="color:var(--ok)">Correct</span>'; }
        else if (sel) { cls += " wrong"; tag = '<span class="tag" style="color:var(--bad)">Your answer</span>'; }
        else if (sel === false) { /* neutral */ }
        if (isAns && sel) tag = '<span class="tag" style="color:var(--ok)">Your answer ✓</span>';
      } else if (sel) cls += " selected";
      return '<button class="' + cls + '" data-run="opt" data-id="' + o.id + '" ' + (checked ? "disabled" : "") + ' aria-pressed="' + sel + '"><span class="letter">' + o.id + '</span><span class="text">' + inline(o.text) + "</span>" + tag + "</button>";
    }).join("");

    var html = '<div class="progress"><i style="width:' + Math.round(answered / s.qkeys.length * 100) + '%"></i></div><div class="exam-layout"><div>' +
      '<div class="card">' +
      '<div class="qhead"><span class="qnum">Question ' + (s.idx + 1) + ' <span class="muted">of ' + s.qkeys.length + '</span></span><span class="pill accent">Scenario ' + q.scenario + '</span><span class="pill">D' + q.domain + "</span>" +
      (practice ? '<span class="pill">TS ' + esc(q.ts) + "</span>" : "") +
      '<div class="spacer"></div><button class="btn small" data-run="flag" aria-pressed="' + !!s.flags[key] + '">' + (s.flags[key] ? "⚑ Flagged" : "⚐ Flag for review") + "</button></div>" +
      '<details class="scenario-box"' + (firstOfScenario ? " open" : "") + "><summary>Scenario: " + esc(scen.title) + "</summary><p>" + esc(scen.context) + "</p></details>" +
      '<div class="stem">' + md(q.stem) + "</div>" +
      (multi ? '<div class="selecthint">Select ' + q.select + " answers (" + ans.length + " selected)</div>" : '<div class="selecthint">Select ONE answer</div>') +
      '<div class="options ' + (multi ? "multi" : "") + '">' + opts + "</div>" +
      (checked ? explainHtml(q, ans) : "") +
      '<div class="actions"><button class="btn" data-run="prev"' + (s.idx === 0 ? " disabled" : "") + ">← Previous</button>" +
      '<button class="btn" data-run="next"' + (s.idx === s.qkeys.length - 1 ? " disabled" : "") + ">Next →</button><div class=\"spacer\"></div>" +
      (practice && !checked ? '<button class="btn primary" data-run="check"' + (ans.length ? "" : " disabled") + ">Check answer</button>" : "") +
      "</div>" +
      '<p class="muted small" style="margin:14px 0 0">Shortcuts: <span class="kbd">A</span>–<span class="kbd">E</span> select · <span class="kbd">←</span>/<span class="kbd">→</span> navigate · <span class="kbd">F</span> flag' + (practice ? ' · <span class="kbd">Enter</span> check' : "") + "</p>" +
      "</div></div>" + navHtml() + "</div>";
    $app.innerHTML = html;
    if (s.mode === "exam") tick();
  }

  function explainHtml(q, ans) {
    var ok = isCorrect(q, ans);
    var wrong = q.answer.length ? Object.keys(q.explanation.wrong || {}).sort().map(function (k) {
      return "<li><b>" + k + ".</b> " + inline(q.explanation.wrong[k]) + "</li>";
    }).join("") : "";
    return '<div class="explain"><h3>' + (ok ? '<span style="color:var(--ok)">Correct</span>' : '<span style="color:var(--bad)">Incorrect</span>') + " · answer: " + q.answer.join(", ") + "</h3>" +
      "<p>" + inline(q.explanation.correct) + "</p>" + (wrong ? "<p class=\"muted small\" style=\"margin-bottom:0\">Why the others are wrong</p><ul>" + wrong + "</ul>" : "") +
      '<p class="muted small" style="margin:10px 0 0">Study: ' + inline(q.studyRef || "Task Statement " + q.ts) + "</p></div>";
  }

  function navHtml() {
    var s = session;
    var cells = s.qkeys.map(function (k, i) {
      var a = s.answers[k] && s.answers[k].length, cls = [];
      if (a) cls.push("answered");
      if (i === s.idx) cls.push("current");
      if (s.flags[k]) cls.push("flagged");
      if (s.mode === "practice" && s.checked[k]) cls.push(isCorrect(QINDEX[k], s.answers[k]) ? "ok" : "bad");
      return '<button class="' + cls.join(" ") + '" data-run="goto" data-i="' + i + '" aria-label="Question ' + (i + 1) + (a ? ", answered" : "") + (s.flags[k] ? ", flagged" : "") + '">' + (i + 1) + "</button>";
    }).join("");
    var flagged = Object.keys(s.flags).filter(function (k) { return s.flags[k]; }).length;
    var answered = Object.keys(s.answers).filter(function (k) { return s.answers[k] && s.answers[k].length; }).length;
    return '<aside class="navpanel card"><b>Navigator</b><div class="muted small">' + answered + " answered · " + (s.qkeys.length - answered) + " unanswered · " + flagged + " flagged</div>" +
      '<div class="navgrid">' + cells + '</div><div class="legend"><span><i style="background:var(--accent-soft);border-color:var(--accent)"></i>answered</span><span><i style="background:var(--warn)"></i>flagged</span>' +
      (s.mode === "practice" ? '<span><i style="background:var(--ok-soft);border-color:var(--ok)"></i>correct</span><span><i style="background:var(--bad-soft);border-color:var(--bad)"></i>wrong</span>' : "") + "</div></aside>";
  }

  function runAction(act, el) {
    var s = session, q = curQ(), key = q.key;
    if (act === "opt") {
      if (s.mode === "practice" && s.checked[key]) return;
      var id = el.getAttribute("data-id"), cur = (s.answers[key] || []).slice();
      if (q.type === "multi") {
        var i = cur.indexOf(id);
        if (i >= 0) cur.splice(i, 1); else if (cur.length < q.select) cur.push(id); else { cur.shift(); cur.push(id); }
      } else cur = [id];
      s.answers[key] = cur;
    } else if (act === "flag") s.flags[key] = !s.flags[key];
    else if (act === "prev") s.idx = Math.max(0, s.idx - 1);
    else if (act === "next") s.idx = Math.min(s.qkeys.length - 1, s.idx + 1);
    else if (act === "goto") s.idx = parseInt(el.getAttribute("data-i"), 10);
    else if (act === "check") { if (!(s.answers[key] || []).length) return; s.checked[key] = true; }
    else if (act === "submit") return confirmFinish();
    saveSession();
    var keep = window.scrollY;
    renderRun();
    if (act === "opt" || act === "flag" || act === "check") window.scrollTo(0, keep);
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-run]");
    if (t && session && !session.finished && location.hash === "#/run") runAction(t.getAttribute("data-run"), t);
  });
  document.addEventListener("keydown", function (e) {
    if (location.hash !== "#/run" || !session || session.finished || document.getElementById("modal")) return;
    if (e.target.matches("input,select,textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    var q = curQ(), k = e.key.toLowerCase();
    if (k === "arrowright") runAction("next");
    else if (k === "arrowleft") runAction("prev");
    else if (k === "f") runAction("flag");
    else if (k === "enter" && session.mode === "practice" && !session.checked[q.key]) runAction("check");
    else if (/^[a-e]$/.test(k)) { var opt = document.querySelector('[data-run="opt"][data-id="' + k.toUpperCase() + '"]'); if (opt) runAction("opt", opt); }
  });

  function confirmFinish() {
    var s = session;
    var unanswered = s.qkeys.filter(function (k) { return !(s.answers[k] && s.answers[k].length); }).length;
    var flagged = Object.keys(s.flags).filter(function (k) { return s.flags[k]; }).length;
    var html = '<div class="overlay" id="modal"><div class="modal"><h2>' + (s.mode === "exam" ? "Submit exam?" : "Finish practice?") + "</h2>" +
      "<p>" + (unanswered ? '<b style="color:var(--bad)">' + unanswered + " unanswered</b> question" + (unanswered > 1 ? "s" : "") + ". " : "All questions answered. ") +
      (flagged ? flagged + " flagged for review. " : "") + (s.mode === "exam" ? "You cannot change answers after submitting." : "") + '</p><div class="row"><button class="btn primary" id="yes">Submit</button><button class="btn" data-act="close-modal">Keep working</button></div></div></div>';
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("yes").onclick = function () { closeModal(); finish(false); };
  }

  function finish(timeUp) {
    stopTimer();
    var s = session, correct = 0, byDomain = {}, byScen = {}, byTs = {};
    s.qkeys.forEach(function (k) {
      var q = QINDEX[k], ok = isCorrect(q, s.answers[k]);
      if (ok) correct++;
      [[byDomain, q.domain], [byScen, q.scenario], [byTs, q.ts]].forEach(function (p) {
        var m = p[0], id = p[1]; m[id] = m[id] || { c: 0, t: 0 }; m[id].t++; if (ok) m[id].c++;
      });
    });
    var pct = correct / s.qkeys.length;
    var att = { id: s.id, examId: s.examId, title: s.title, mode: s.mode, date: Date.now(), total: s.qkeys.length, correct: correct, pct: pct, scaled: scaledFromPct(pct),
      durationSec: Math.round((Date.now() - s.startedAt) / 1000), timeUp: !!timeUp, byDomain: byDomain, byScen: byScen, byTs: byTs,
      qkeys: s.qkeys, answers: s.answers, flags: s.flags };
    attempts.push(att); saveAttempts();
    s.finished = true;
    session = null; localStorage.removeItem(LS_SESSION);
    location.hash = "#/results/" + att.id;
  }

  /* ---------- RESULTS ---------- */
  var reviewFilter = "all";
  function viewResults(id) {
    var a = attempts.filter(function (x) { return x.id === id; })[0];
    if (!a) { $app.innerHTML = '<div class="empty">Attempt not found. <a href="#/">Back home</a></div>'; return; }
    var pass = a.scaled >= PASS_SCALED, deg = Math.round(a.pct * 360), col = pass ? "var(--ok)" : "var(--bad)";
    var mockish = a.total >= 30;
    var dom = Object.keys(DOMAINS).filter(function (d) { return a.byDomain[d]; }).map(function (d) { return barRow("D" + d + " · " + DOMAINS[d].name, a.byDomain[d]); }).join("");
    var scen = Object.keys(a.byScen).map(function (s) { return barRow("S" + s + " · " + SCEN[s].title, a.byScen[s]); }).join("");
    var weak = Object.keys(a.byTs).map(function (k) { var v = a.byTs[k]; return { k: k, v: v, p: v.c / v.t }; }).filter(function (x) { return x.p < 0.67; }).sort(function (x, y) { return x.p - y.p; });
    var weakHtml = weak.length ? weak.map(function (x) { return '<li><b>' + x.k + "</b> " + esc(TS[x.k] || "") + ' <span class="pill bad">' + x.v.c + "/" + x.v.t + "</span></li>"; }).join("") : '<li class="muted">No weak task statements detected. Nice.</li>';

    var html = '<div class="row" style="margin-bottom:12px"><a class="btn small" href="#/">← Home</a><div class="spacer"></div><button class="btn small primary" data-res="retake" data-id="' + a.examId + '">' + (a.examId === "custom" ? "New practice" : "Retake") + "</button></div>" +
      '<div class="card"><div class="score-hero"><div class="scorering" style="background:conic-gradient(' + col + " " + deg + 'deg,var(--surface-2) 0)"><div><span><b>' + Math.round(a.pct * 100) + "%</b>correct</span></div></div>" +
      "<div><h1 style=\"margin-bottom:.2em\">" + esc(a.title) + "</h1><p style=\"margin-bottom:.3em\">" + a.correct + " of " + a.total + " correct · " + (a.mode === "exam" ? "Exam mode" : "Practice mode") + " · " + fmtTime(a.durationSec) + " used" + (a.timeUp ? " (time expired)" : "") + "</p>" +
      (mockish ? '<p style="margin:0"><span class="pill ' + (pass ? "ok" : "bad") + '">Estimated scaled score ≈ ' + a.scaled + (pass ? " · would pass" : " · below 720") + '</span></p><p class="muted small" style="margin-top:6px">Rough linear estimate (100 + 900 × fraction correct). The real exam equates scores across forms; 720 corresponds to roughly 69% on this simple scale. Aim for 80%+ on mocks for margin.</p>' :
        '<p class="muted small">Short set: scaled-score estimate not shown.</p>') + "</div></div></div>" +
      '<div class="grid cols-2" style="margin-top:16px"><div class="card"><h3>By domain</h3><div class="weights">' + dom + '</div></div><div class="card"><h3>By scenario</h3><div class="weights">' + scen + "</div></div></div>" +
      '<div class="card" style="margin-top:16px"><h3>Where to study next</h3><ul style="margin:0;padding-left:1.2em">' + weakHtml + "</ul></div>" +
      '<h2 class="section-title">Review answers</h2><div class="filters" id="filters">' + ["all", "incorrect", "flagged", "unanswered"].map(function (f) { return '<button class="btn small ' + (reviewFilter === f ? "active" : "") + '" data-res="filter" data-f="' + f + '">' + f[0].toUpperCase() + f.slice(1) + "</button>"; }).join("") + '</div><div id="review">' + reviewHtml(a) + "</div>";
    $app.innerHTML = html;
    $app.onclick = function (e) {
      var t = e.target.closest("[data-res]"); if (!t) return;
      if (t.getAttribute("data-res") === "filter") { reviewFilter = t.getAttribute("data-f"); viewResults(id); }
      if (t.getAttribute("data-res") === "retake") { var ex = t.getAttribute("data-id"); location.hash = "#/"; if (ex === "custom") return; setTimeout(function () { openStart(ex); }, 0); }
    };
  }
  function barRow(label, v) {
    var p = Math.round(v.c / v.t * 100), cls = p >= 80 ? "ok" : p >= 65 ? "warn" : "bad";
    return '<div class="wrow"><div>' + esc(label) + '</div><div class="bar ' + cls + '"><i style="width:' + p + '%"></i></div><b>' + p + "%</b></div>";
  }
  function reviewHtml(a) {
    var out = [];
    a.qkeys.forEach(function (k, i) {
      var q = QINDEX[k], ans = a.answers[k] || [], ok = isCorrect(q, ans);
      var f = reviewFilter;
      if (f === "incorrect" && (ok)) return;
      if (f === "flagged" && !a.flags[k]) return;
      if (f === "unanswered" && ans.length) return;
      var opts = q.options.map(function (o) {
        var isAns = q.answer.indexOf(o.id) >= 0, sel = ans.indexOf(o.id) >= 0, cls = "option locked";
        if (isAns) cls += " correct"; else if (sel) cls += " wrong";
        return '<div class="' + cls + '"><span class="letter">' + o.id + '</span><span class="text">' + inline(o.text) + '</span><span class="tag">' + (isAns && sel ? "✓ your answer" : isAns ? "correct" : sel ? "your answer" : "") + "</span></div>";
      }).join("");
      out.push('<div class="card review-item"><div class="qhead"><span class="qnum">Q' + (i + 1) + '</span><span class="pill ' + (ok ? "ok" : ans.length ? "bad" : "warn") + '">' + (ok ? "Correct" : ans.length ? "Incorrect" : "Unanswered") + '</span><span class="pill accent">S' + q.scenario + '</span><span class="pill">D' + q.domain + '</span><span class="pill">TS ' + esc(q.ts) + "</span>" + (a.flags[k] ? '<span class="pill warn">⚑ flagged</span>' : "") + "</div>" +
        '<div class="stem">' + md(q.stem) + '</div><div class="options ' + (q.type === "multi" ? "multi" : "") + '">' + opts + "</div>" + explainHtml(q, ans).replace(/<h3>.*?<\/h3>/, "<h3>Explanation</h3>") + "</div>");
    });
    return out.length ? out.join("") : '<div class="empty">Nothing in this filter.</div>';
  }

  /* ---------- boot ---------- */
  if (!ALL_SETS.length) {
    $app.innerHTML = '<div class="empty"><h2>No exam data found</h2><p>Run <code>python3 build/build.py</code> to generate <code>data.js</code>.</p></div>';
  } else route();
})();
