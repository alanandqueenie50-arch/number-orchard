"use strict";

const words = [
  ["cat", "貓", "🐱"], ["dog", "狗", "🐶"], ["duck", "鴨子", "🦆"],
  ["fish", "魚", "🐟"], ["bird", "鳥", "🐦"], ["frog", "青蛙", "🐸"],
  ["apple", "蘋果", "🍎"], ["banana", "香蕉", "🍌"], ["orange", "柳橙", "🍊"],
  ["grapes", "葡萄", "🍇"], ["lemon", "檸檬", "🍋"], ["watermelon", "西瓜", "🍉"],
  ["book", "書", "📕"], ["pencil", "鉛筆", "✏️"], ["chair", "椅子", "🪑"],
  ["ball", "球", "⚽"], ["kite", "風箏", "🪁"], ["clock", "時鐘", "🕒"],
  ["sun", "太陽", "☀️"], ["moon", "月亮", "🌙"], ["star", "星星", "⭐"],
  ["car", "汽車", "🚗"], ["bus", "公車", "🚌"], ["train", "火車", "🚂"]
].map(([english, chinese, picture]) => ({english, chinese, picture}));

const ui = Object.fromEntries([
  "round", "stars", "progress", "play", "prompt", "clue", "picture", "word", "meaning",
  "sound-tools", "hear", "slow", "answers", "feedback", "ready", "finished", "finish-title",
  "again", "audio", "audio-status", "wordbank-area", "wordbank"
].map(id => [id, document.getElementById(id)]));
const modes = [...document.querySelectorAll("[data-mode]")];
const recordings = window.englishRecordings || {};
const roundSize = 5;
const modesTitle = {
  repeat: "看圖，聽一聽，跟著念",
  listen: "聽英文，找出對的圖片",
  read: "看圖片，選出對的英文"
};

let mode = "repeat";
let questions = [];
let position = 0;
let stars = 0;
let answered = false;
let advanceTimer;
let audioRequest = 0;

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function stopAudio() {
  audioRequest++;
  ui.audio.pause();
  ui["audio-status"].hidden = true;
}

function playWord(entry, speed = 1) {
  stopAudio();
  const request = audioRequest;
  const source = recordings[entry.english];
  function showError() {
    if (request !== audioRequest) return;
    ui["audio-status"].textContent = "這段發音暫時播不出來，可以再點一次。";
    ui["audio-status"].hidden = false;
  }
  if (!source) {
    showError();
    return;
  }
  ui.audio.src = source;
  ui.audio.playbackRate = speed;
  ui.audio.play().catch(showError);
}

function current() {
  return questions[position];
}

function updateStars() {
  ui.stars.textContent = "⭐ " + stars + " 顆星";
  ui.progress.value = stars;
}

function showQuestion(focus = false) {
  answered = false;
  ui.round.textContent = "第 " + (position + 1) + " / " + roundSize + " 題";
  ui.prompt.textContent = modesTitle[mode];
  ui.feedback.textContent = "";
  ui.ready.hidden = mode !== "repeat";
  ui.ready.disabled = false;
  ui.clue.hidden = mode === "listen";
  ui.word.hidden = mode !== "repeat";
  ui.meaning.hidden = mode !== "repeat";
  ui["sound-tools"].hidden = mode === "read";
  ui["wordbank-area"].hidden = mode !== "repeat";
  ui.answers.replaceChildren();

  const entry = current();
  ui.picture.textContent = entry.picture;
  ui.picture.setAttribute("aria-label", entry.chinese);
  ui.word.textContent = entry.english;
  ui.meaning.textContent = entry.chinese;

  if (mode !== "repeat") {
    const distractors = shuffle(words.filter(word => word !== entry)).slice(0, 2);
    for (const option of shuffle([entry, ...distractors])) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = mode === "listen" ? "answer picture" : "answer";
      if (mode === "listen") {
        button.textContent = option.picture;
        button.setAttribute("aria-label", option.chinese);
      } else {
        button.textContent = option.english;
        button.lang = "en";
      }
      button.addEventListener("click", () => checkAnswer(button, option === entry));
      ui.answers.append(button);
    }
  }
  if (focus) (mode === "listen" ? ui.hear : ui.prompt).focus();
}

function begin(focus = false) {
  clearTimeout(advanceTimer);
  stopAudio();
  questions = shuffle(words).slice(0, roundSize);
  position = 0;
  stars = 0;
  updateStars();
  ui.play.hidden = false;
  ui.finished.hidden = true;
  showQuestion(focus);
}

function markComplete(correctButton) {
  if (answered) return;
  answered = true;
  stars++;
  updateStars();
  ui.ready.disabled = true;
  for (const button of ui.answers.children) button.disabled = true;
  if (correctButton) correctButton.classList.add("correct");
  ui.feedback.textContent = correctButton ? "答對了！" : "完成跟念！";
  ui.feedback.textContent += " " + current().english + " · " + current().chinese + " ⭐";
  playWord(current());
  advanceTimer = setTimeout(advance, 2000);
}

function checkAnswer(button, correct) {
  if (answered || button.disabled) return;
  if (correct) {
    markComplete(button);
    return;
  }
  button.disabled = true;
  button.classList.add("wrong");
  ui.feedback.textContent = mode === "listen" ? "再聽一次，試試看！" : "再看看圖片，試試看！";
  const remaining = [...ui.answers.children].find(option => !option.disabled);
  remaining.focus();
}

function advance() {
  stopAudio();
  position++;
  if (position < questions.length) {
    showQuestion(true);
    return;
  }
  ui.play.hidden = true;
  ui.finished.hidden = false;
  ui["finish-title"].focus();
}

for (const entry of words) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = entry.picture + " " + entry.english;
  button.setAttribute("aria-label", "聽 " + entry.english + "，" + entry.chinese);
  button.addEventListener("click", () => playWord(entry));
  ui.wordbank.append(button);
}
for (const button of modes) {
  button.addEventListener("click", () => {
    const choice = button.dataset.mode;
    if (choice === mode) return;
    mode = choice;
    for (const item of modes) item.setAttribute("aria-pressed", String(item === button));
    begin(true);
    if (mode === "listen") playWord(current());
  });
}
ui.hear.addEventListener("click", () => playWord(current()));
ui.slow.addEventListener("click", () => playWord(current(), 0.77));
ui.ready.addEventListener("click", () => markComplete());
ui.again.addEventListener("click", () => {
  begin(true);
  if (mode === "listen") playWord(current());
});
begin();
