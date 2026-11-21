"use strict";

const $ = id => document.getElementById(id);
const storageKey = "practice-island-v1";
const mathUnits = [
  ["sequence", "數字排排隊", "找出 10 以內缺少的數字"],
  ["ten", "湊成 10", "想一想，還要幾個才有 10？"],
  ["addition", "加法往前走", "練習 20 以內的加法"],
  ["subtraction", "減法往回走", "練習 20 以內的減法"]
];
const englishUnits = [
  ["phonics", "自然發音", "聽單字，找出常見的字母組合"],
  ["sight", "常見字", "認識短句裡經常出現的字"],
  ["spelling", "單字聽寫", "聽一聽，再拼出完整單字"],
  ["sentences", "短句填空", "讀短句，選擇適合的字"]
];

function dayKey() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-");
}
function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && saved.units && Array.isArray(saved.today)) {
      if (saved.day !== dayKey()) return {day: dayKey(), today: [], units: saved.units};
      return saved;
    }
  } catch {}
  return {day: dayKey(), today: [], units: {}};
}
function saveProgress(state) {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
}
function mix(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function formatTime(seconds) {
  return [Math.floor(seconds / 60), seconds % 60].map(n => String(n).padStart(2, "0")).join(":");
}

function initializeHome() {
  const render = () => {
    const today = readProgress().today;
    const finished = ["math", "english"].filter(subject => today.includes(subject));
    $("daily-progress").value = finished.length;
    $("daily-copy").textContent = finished.length === 2
      ? "數學和英文都練過了，今天的任務完成！"
      : finished.length === 0
        ? "完成數學和英文各一回合。"
        : (finished[0] === "math" ? "數學已完成，接著練英文。" : "英文已完成，接著練數學。");
  };
  render();
  window.addEventListener("pageshow", render);
}

function mathQuestions(unit) {
  if (unit === "sequence") {
    return Array.from({length: 8}, (_, i) => ({
      prompt: (i + 1) + " → □ → " + (i + 3), expected: String(i + 2),
      hint: "數字照順序排，中間少了哪一個？"
    }));
  }
  if (unit === "ten") {
    return Array.from({length: 9}, (_, i) => ({
      prompt: (i + 1) + " + □ = 10", expected: String(9 - i),
      hint: "數一數，還差幾個圓點？", visual: "●".repeat(i + 1) + "○".repeat(9 - i)
    }));
  }
  const plus = unit === "addition";
  const items = [];
  for (let a = 2; a <= 20; a++) {
    for (let b = 1; b <= a; b++) {
      if (plus && a + b > 20) continue;
      items.push({prompt: a + (plus ? " + " : " − ") + b + " = □",
        expected: String(plus ? a + b : a - b), hint: plus ? "把兩個數加起來。" : "從前面的數拿走後面的數。"});
    }
  }
  return items;
}

function englishQuestions(unit) {
  if (unit === "phonics") {
    return [
      ["ship", "sh"], ["shop", "sh"], ["chair", "ch"], ["chip", "ch"], ["chin", "ch"], ["the", "th"]
    ].map(([word, expected]) => ({prompt: "聽單字，選開頭的字母組合", expected,
      hint: "聽完再選。", choices: ["sh", "ch", "th"], audio: word}));
  }
  if (unit === "sight") {
    return [
      ["I", "我", "我們", "他"], ["you", "你", "我", "她"], ["we", "我們", "你", "他"],
      ["my", "我的", "他的", "他們"], ["and", "和", "在上面", "可以"],
      ["have", "有", "說", "來"], ["can", "可以", "我的", "去"]
    ].map(([word, expected, ...wrong]) => ({prompt: word, expected, choices: [expected, ...wrong],
      hint: "選出這個字的中文意思。", audio: word, lang: "en"}));
  }
  if (unit === "spelling") {
    return [["cat", "貓"], ["dog", "狗"], ["sun", "太陽"], ["pen", "筆"],
      ["hat", "帽子"], ["cup", "杯子"], ["book", "書"], ["fish", "魚"]]
      .map(([expected, chinese]) => ({prompt: "聽一聽，再拼出單字", hint: "中文提示：" + chinese,
        expected, audio: expected}));
  }
  return [
    ["A frog ___ jump.", "can", "a", "in", "青蛙會跳。"],
    ["I ___ two cats.", "have", "on", "a", "我有兩隻貓。"],
    ["I like cats ___ dogs.", "and", "can", "my", "我喜歡貓和狗。"],
    ["This is ___ bag.", "my", "go", "and", "這是我的袋子。"],
    ["The books ___ on the desk.", "are", "is", "can", "這些書在桌上。"],
    ["The pencil is ___ the box.", "in", "can", "my", "鉛筆在盒子裡。"]
  ].map(([prompt, expected, one, two, hint]) => ({prompt, expected, choices: [expected, one, two], hint, lang:"en"}));
}

function initializeBook() {
  const subject = new URLSearchParams(location.search).get("subject") === "english" ? "english" : "math";
  const math = subject === "math";
  const units = math ? mathUnits : englishUnits;
  $(subject + "-tab").setAttribute("aria-current", "page");
  $("book-title").textContent = math ? "數學練習本" : "英文練習本";
  $("book-description").textContent = "選一個單元。每回合 5 題，寫完還能訂正錯題。";
  $("answer").inputMode = math ? "numeric" : "text";
  $("answer-label").textContent = math ? "輸入數字答案" : "輸入英文單字";

  const canvas = $("canvas");
  const ink = canvas.getContext("2d");
  let drawing = null;
  function clearCanvas() {
    drawing = null;
    ink.clearRect(0, 0, canvas.width, canvas.height);
  }
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return [(event.clientX - bounds.left) * canvas.width / bounds.width,
      (event.clientY - bounds.top) * canvas.height / bounds.height];
  }
  canvas.addEventListener("pointerdown", event => {
    if (drawing !== null || event.button !== 0) return;
    drawing = event.pointerId;
    canvas.setPointerCapture(drawing);
    const [x, y] = point(event);
    ink.fillStyle = "#263b58";
    ink.beginPath();
    ink.arc(x, y, 2.5, 0, 2 * Math.PI);
    ink.fill();
    ink.beginPath();
    ink.moveTo(x, y);
  });
  canvas.addEventListener("pointermove", event => {
    if (drawing !== event.pointerId) return;
    ink.lineWidth = 5;
    ink.lineCap = "round";
    ink.lineJoin = "round";
    ink.strokeStyle = "#263b58";
    ink.lineTo(...point(event));
    ink.stroke();
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    canvas.addEventListener(type, event => { if (drawing === event.pointerId) drawing = null; });
  }
  $("clear").addEventListener("click", clearCanvas);

  let selected = "";
  let questions = [];
  let missed = [];
  let position = 0;
  let correct = 0;
  let checked = false;
  let correction = false;
  let started = 0;
  let clock;
  let audioVersion = 0;

  function resetAudio() {
    audioVersion++;
    $("recording").pause();
    $("audio-error").hidden = true;
  }

  function renderUnits() {
    const progress = readProgress();
    $("unit-list").replaceChildren();
    for (const [id, title, description] of units) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unit";
      button.setAttribute("aria-pressed", String(id === selected));
      const label = document.createElement("strong");
      label.textContent = title;
      const detail = document.createElement("small");
      detail.textContent = description;
      const score = document.createElement("small");
      const record = progress.units[id];
      score.textContent = record ? "最佳 " + record.best + " / 5 題" : "尚未練習";
      button.append(label, detail, score);
      button.addEventListener("click", () => {
        selected = id;
        startRound(mix(math ? mathQuestions(id) : englishQuestions(id)).slice(0, 5));
      });
      $("unit-list").append(button);
    }
  }
  function seconds() { return Math.floor((Date.now() - started) / 1000); }

  function startRound(items, correcting = false) {
    clearInterval(clock);
    questions = items;
    missed = [];
    position = 0;
    correct = 0;
    correction = correcting;
    started = Date.now();
    $("timer").textContent = "00:00";
    $("exercise").hidden = false;
    $("result").hidden = true;
    $("unit-list").hidden = true;
    $("question-progress").max = questions.length;
    clock = setInterval(() => { $("timer").textContent = formatTime(seconds()); }, 1000);
    showQuestion();
  }
  function showQuestion() {
    resetAudio();
    const current = questions[position];
    checked = false;
    $("steps").textContent = (correction ? "訂正 " : "第 ") + (position + 1) + " / " + questions.length + " 題";
    $("question-progress").value = position;
    $("question").textContent = current.prompt;
    $("question").lang = current.lang || "zh-Hant-TW";
    $("hint").textContent = current.hint;
    $("visual").textContent = current.visual || "";
    $("visual").hidden = !current.visual;
    $("listen").hidden = !current.audio;
    $("feedback").textContent = "";
    $("advance").hidden = true;
    $("answer-form").hidden = Boolean(current.choices);
    $("answer").value = "";
    $("answer").disabled = false;
    $("choices").replaceChildren();
    $("choices").hidden = !current.choices;
    for (const value of mix(current.choices || [])) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = value;
      if (current.lang || selected === "phonics") button.lang = "en";
      button.addEventListener("click", () => submit(value));
      $("choices").append(button);
    }
    clearCanvas();
    $("question").focus();
  }
  function submit(value) {
    if (checked) return;
    const current = questions[position];
    const normalized = value.normalize("NFKC").trim().toLowerCase();
    if (!normalized || (math && !/^\d+$/.test(normalized))) {
      $("feedback").dataset.kind = "wrong";
      $("feedback").textContent = math ? "請先輸入一個整數。" : "請先輸入答案。";
      return;
    }
    checked = true;
    const right = math ? Number(normalized) === Number(current.expected) : normalized === current.expected.toLowerCase();
    if (right) correct++;
    else missed.push(current);
    $("feedback").dataset.kind = right ? "right" : "wrong";
    $("feedback").textContent = right ? "答對了！" : "再練一次。正確答案是 " + current.expected + "。";
    $("question-progress").value = position + 1;
    $("answer").disabled = true;
    for (const button of $("choices").children) button.disabled = true;
    $("advance").textContent = position + 1 === questions.length ? "看結果 →" : "下一題 →";
    $("advance").hidden = false;
    $("advance").focus();
  }
  function finish() {
    clearInterval(clock);
    resetAudio();
    $("exercise").hidden = true;
    $("result").hidden = false;
    $("result-copy").textContent = "答對 " + correct + " / " + questions.length + " 題 · 用時 " + formatTime(seconds());
    $("retry").hidden = missed.length === 0;
    if (!correction) {
      const state = readProgress();
      if (!state.today.includes(subject)) state.today.push(subject);
      const previous = Number(state.units[selected]?.best) || 0;
      state.units[selected] = {best: Math.max(correct, previous)};
      saveProgress(state);
    }
    $("result-title").focus();
  }

  $("answer-form").addEventListener("submit", event => {
    event.preventDefault();
    submit($("answer").value);
  });
  $("advance").addEventListener("click", () => {
    if (!checked) return;
    position++;
    if (position === questions.length) finish();
    else showQuestion();
  });
  $("listen").addEventListener("click", () => {
    resetAudio();
    const request = audioVersion;
    const source = window.englishRecordings?.[questions[position].audio];
    if (!source) {
      $("audio-error").hidden = false;
      return;
    }
    $("recording").src = source;
    $("recording").play().catch(() => {
      if (audioVersion === request) $("audio-error").hidden = false;
    });
  });
  $("retry").addEventListener("click", () => { if (missed.length) startRound([...missed], true); });
  $("another").addEventListener("click", () => {
    $("result").hidden = true;
    $("unit-list").hidden = false;
    renderUnits();
    $("unit-list").querySelector('[aria-pressed="true"]')?.focus();
  });
  renderUnits();
}

if (document.querySelector('[data-view="home"]')) initializeHome();
if (document.querySelector('[data-view="practice"]')) initializeBook();
