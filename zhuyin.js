"use strict";

const symbols = Array.from("ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ", sound => ({sound, word: sound}));

const blends = [
  {sound: "ㄧㄚ", word: "鴨", art: "🦆"},
  {sound: "ㄧㄝ", word: "噎", art: "😮"},
  {sound: "ㄨㄚ", word: "蛙", art: "🐸"},
  {sound: "ㄨㄛ", word: "窩", art: "🪺"},
  {sound: "ㄩㄝ", word: "約", art: "🤙"},
  {sound: "ㄩㄢ", word: "冤", art: "😟"}
];

const syllables = [
  {onset: "ㄒ", rime: "ㄧㄚ", tone: "ˋ", base: "蝦", word: "下", art: "⬇️"},
  {onset: "ㄒ", rime: "ㄧㄝ", tone: "ˊ", base: "些", word: "鞋", art: "👟"},
  {onset: "ㄍ", rime: "ㄨㄚ", tone: "", base: "瓜", word: "瓜", art: "🍉"},
  {onset: "ㄍ", rime: "ㄨㄛ", tone: "ˇ", base: "鍋", word: "果", art: "🍎"},
  {onset: "ㄒ", rime: "ㄩㄝ", tone: "ˊ", base: "靴", word: "學", art: "📚"},
  {onset: "ㄑ", rime: "ㄩㄢ", tone: "ˊ", base: "圈", word: "全", art: "🧩"}
].map(entry => ({...entry, sound: entry.onset + entry.rime + entry.tone}));

const tones = {"": "一聲", "ˊ": "二聲", "ˇ": "三聲", "ˋ": "四聲"};
const roundSize = 5;
const stages = [...document.querySelectorAll("[data-stage]")];
const ui = Object.fromEntries([
  "symbol-guide", "guide-buttons", "round", "stars", "progress", "lesson", "lesson-title", "cars",
  "model", "example", "ready", "quiz", "quiz-title", "hear", "answers", "feedback", "finished",
  "finish-title", "again", "audio-note", "recording"
].map(id => [id, document.getElementById(id)]));
const audio = ui.recording;
const recordings = window.zhuyinRecordings || {};

let stage = "single";
let pool = [];
let questions = [];
let position = 0;
let stars = 0;
let answered = false;
let stepTimer;
let audioRequest = 0;

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function stopAudio() {
  audioRequest++;
  audio.pause();
  ui["audio-note"].hidden = true;
}

function play(key) {
  stopAudio();
  const request = audioRequest;
  const source = recordings[key];
  function showError() {
    if (request !== audioRequest) return;
    ui["audio-note"].textContent = "這段錄音暫時播不出來，可以再點一次。";
    ui["audio-note"].hidden = false;
  }
  if (!source) {
    showError();
    return;
  }
  audio.src = source;
  audio.play().catch(showError);
}

function current() {
  return questions[position];
}

function addCar(label, key, hint, single = false) {
  if (ui.cars.children.length) {
    const plus = document.createElement("span");
    plus.className = "coupler";
    plus.textContent = "＋";
    plus.setAttribute("aria-hidden", "true");
    ui.cars.append(plus);
  }
  const car = document.createElement("button");
  car.type = "button";
  car.className = single ? "car single" : "car";
  car.setAttribute("aria-label", "聽 " + label);
  const symbol = document.createElement("span");
  symbol.textContent = label;
  const caption = document.createElement("small");
  caption.textContent = "🔊 " + hint;
  car.append(symbol, caption);
  car.addEventListener("click", () => play(key));
  ui.cars.append(car);
}

function addModelButton(label, key, entry, spelling) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "listen";
  button.textContent = "🔊 " + label;
  button.addEventListener("click", () => {
    play(key);
    ui.example.textContent = entry ? entry.art + " " + entry.word + " · " + spelling : spelling;
    ui.example.hidden = false;
  });
  ui.model.append(button);
}

function showLesson(focus = false) {
  answered = false;
  ui.lesson.hidden = false;
  ui.quiz.hidden = true;
  ui.finished.hidden = true;
  ui.round.textContent = "第 " + (position + 1) + " / " + roundSize + " 題";
  updateStars();
  ui.cars.replaceChildren();
  ui.model.replaceChildren();
  ui.model.hidden = stage === "single";
  ui.example.hidden = true;
  ui.feedback.textContent = "";

  const entry = current();
  if (stage === "single") {
    ui["lesson-title"].textContent = "看符號，跟著念";
    addCar(entry.sound, entry.sound, "點我念", true);
  } else if (stage === "blend") {
    ui["lesson-title"].textContent = "先分開念，再合起來";
    const [medial, final] = entry.sound;
    addCar(medial, medial, "第一個音");
    addCar(final, final, "第二個音");
    addModelButton("合起來念", entry.word, entry, entry.sound);
  } else {
    ui["lesson-title"].textContent = "聲母接上結合韻";
    addCar(entry.onset, entry.onset, "聲母");
    addCar(entry.rime, blends.find(blend => blend.sound === entry.rime).word, "結合韻");
    addModelButton("聽合音", entry.base, null, entry.onset + entry.rime);
    addModelButton("聽" + tones[entry.tone] + "・" + entry.word, entry.word, entry, entry.sound);
  }
  if (focus) ui["lesson-title"].focus();
}

function updateStars() {
  ui.stars.textContent = "⭐ " + stars + " 顆星";
  ui.progress.value = stars;
}

function beginRound(focus = false) {
  clearTimeout(stepTimer);
  stopAudio();
  pool = {single: symbols, blend: blends, spell: syllables}[stage];
  ui["symbol-guide"].hidden = stage !== "single";
  questions = shuffle(pool).slice(0, roundSize);
  position = 0;
  stars = 0;
  showLesson(focus);
}

function makeChoices(entry) {
  if (stage === "spell") {
    const alternatives = shuffle(Object.keys(tones).filter(tone => tone !== entry.tone))
      .slice(0, 2)
      .map(tone => entry.onset + entry.rime + tone);
    return shuffle([entry.sound, ...alternatives]);
  }
  const alternatives = shuffle(pool.filter(item => item.sound !== entry.sound)).slice(0, 2);
  return shuffle([entry.sound, ...alternatives.map(item => item.sound)]);
}

function showQuiz() {
  ui.lesson.hidden = true;
  ui.quiz.hidden = false;
  ui.answers.replaceChildren();
  ui["quiz-title"].textContent = stage === "spell" ? "聽一聽，選對聲調" : "聽聲音，選一個";
  const entry = current();
  for (const choice of makeChoices(entry)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = choice;
    button.addEventListener("click", () => answer(button, choice === entry.sound));
    ui.answers.append(button);
  }
  ui.hear.focus();
  play(entry.word);
}

function answer(button, correct) {
  if (answered || button.disabled) return;
  if (!correct) {
    button.disabled = true;
    button.classList.add("wrong");
    ui.feedback.textContent = "再聽一次，試試看！";
    ui.hear.focus();
    return;
  }

  answered = true;
  button.classList.add("correct");
  for (const option of ui.answers.children) option.disabled = true;
  stars++;
  updateStars();
  ui.feedback.textContent = "答對了！" + current().sound + " ⭐";
  play(current().word);
  stepTimer = setTimeout(advance, 2200);
}

function advance() {
  stopAudio();
  position++;
  if (position < questions.length) {
    showLesson(true);
    return;
  }
  ui.quiz.hidden = true;
  ui.finished.hidden = false;
  ui["finish-title"].focus();
}

for (const {sound} of symbols) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = sound;
  button.setAttribute("aria-label", "聽 " + sound);
  button.addEventListener("click", () => play(sound));
  ui["guide-buttons"].append(button);
}
for (const button of stages) {
  button.addEventListener("click", () => {
    if (stage === button.dataset.stage) return;
    stage = button.dataset.stage;
    for (const item of stages) item.setAttribute("aria-pressed", String(item === button));
    beginRound(true);
  });
}
ui.ready.addEventListener("click", showQuiz);
ui.hear.addEventListener("click", () => play(current().word));
ui.again.addEventListener("click", () => beginRound(true));
beginRound();
