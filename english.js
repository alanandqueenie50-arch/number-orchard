"use strict";

const words = [
  ["cat", "貓", "🐱", "The ~ is on the mat."],
  ["dog", "狗", "🐶", "The ~ wags its tail."],
  ["duck", "鴨子", "🦆", "A ~ swims in the pond."],
  ["fish", "魚", "🐟", "The ~ swims in the tank."],
  ["bird", "鳥", "🐦", "A ~ can fly."],
  ["frog", "青蛙", "🐸", "The ~ jumps into the pond."],
  ["apple", "蘋果", "🍎", "I eat an ~ at lunch."],
  ["banana", "香蕉", "🍌", "Peel the ~ before you eat it."],
  ["orange", "柳橙", "🍊", "I peel an ~ for a snack."],
  ["grapes", "葡萄", "🍇", "These ~ are purple."],
  ["lemon", "檸檬", "🍋", "The ~ tastes sour."],
  ["watermelon", "西瓜", "🍉", "We cut a ~ for the picnic."],
  ["book", "書", "📕", "I read a ~ before bed."],
  ["pencil", "鉛筆", "✏️", "I write with a ~."],
  ["chair", "椅子", "🪑", "Please sit on the ~."],
  ["ball", "球", "⚽", "Kick the ~ to me."],
  ["kite", "風箏", "🪁", "My ~ flies in the wind."],
  ["clock", "時鐘", "🕒", "The ~ tells us the time."],
  ["sun", "太陽", "☀️", "The ~ is bright today."],
  ["moon", "月亮", "🌙", "I see the ~ at night."],
  ["star", "星星", "⭐", "I see a ~ in the night sky."],
  ["car", "汽車", "🚗", "Dad drives a ~ to work."],
  ["bus", "公車", "🚌", "We ride the ~ to school."],
  ["train", "火車", "🚂", "The ~ stops at the station."],
  ["pig", "豬", "🐷", "A ~ likes to roll in mud."],
  ["fox", "狐狸", "🦊", "The ~ has a bushy tail."],
  ["hen", "母雞", "🐔", "The ~ lays an egg."],
  ["pet", "寵物", "🐾", "My dog is my ~."],
  ["sheep", "綿羊", "🐑", "The ~ has a wool coat."],
  ["cow", "乳牛", "🐄", "A ~ gives us milk."],
  ["hat", "帽子", "🧢", "Put on your ~."],
  ["map", "地圖", "🗺️", "We use a ~ to find the park."],
  ["bag", "袋子", "🛍️", "Put the apples in the ~."],
  ["bed", "床", "🛏️", "I sleep in my ~."],
  ["pen", "筆", "🖊️", "I write my name with a ~."],
  ["pin", "圖釘", "📌", "Put a ~ in the board."],
  ["box", "盒子", "📦", "The toy is in the ~."],
  ["cup", "杯子", "🥤", "I drink from a ~."],
  ["ship", "大船", "🚢", "A ~ sails on the sea."],
  ["shop", "商店", "🏪", "We buy milk at the ~."],
  ["chin", "下巴", "", "Touch your ~."],
  ["chip", "洋芋片", "", "I eat one potato ~."],
  ["cake", "蛋糕", "🍰", "We share a birthday ~."],
  ["bike", "腳踏車", "🚲", "I ride my ~ to the park."],
  ["home", "家", "🏠", "I go ~ after school."],
  ["rope", "繩子", "🪢", "Hold on to the ~."],
  ["tree", "樹", "🌳", "The bird is in the ~."],
  ["rain", "雨", "🌧️", "The ~ makes the grass wet."],
  ["snow", "雪", "❄️", "The ~ is white and cold."],
  ["hand", "手", "✋", "Raise your ~."],
  ["leg", "腿", "🦵", "I can stand on one ~."],
  ["milk", "牛奶", "🥛", "I drink ~ with breakfast."],
  ["water", "水", "💧", "We drink ~ when we are thirsty."],
  ["egg", "蛋", "🥚", "I crack an ~ into the bowl."],
  ["cheese", "起司", "🧀", "I put ~ on my toast."],
  ["run", "跑", "", "I can ~ fast."],
  ["sit", "坐", "", "Please ~ down beside me."],
  ["jump", "跳", "", "We ~ over the puddle."],
  ["walk", "走", "", "I ~ to school."],
  ["swim", "游泳", "", "We ~ in the pool."],
  ["look", "看向", "", "~ at the picture."],
  ["see", "看見", "", "I can ~ the moon."],
  ["read", "閱讀", "", "I ~ a book with Dad."],
  ["write", "寫", "", "~ your name on the page."],
  ["eat", "吃", "", "I ~ lunch at school."],
  ["drink", "喝", "", "Please ~ some water."],
  ["play", "玩", "", "We ~ in the park."],
  ["go", "去", "", "Let us ~ to the zoo."],
  ["come", "過來", "", "~ here, please."],
  ["help", "幫忙", "", "Can you ~ me open the box?"],
  ["big", "大的", "", "An elephant is ~."],
  ["small", "小的", "", "This ant is very ~."],
  ["red", "紅色的", "🟥", "The fire truck is ~."],
  ["blue", "藍色的", "🟦", "The sky is ~ today."],
  ["green", "綠色的", "🟩", "The grass is ~."],
  ["hot", "熱的", "", "The soup is too ~."],
  ["cold", "冷的", "", "Ice is ~."],
  ["happy", "開心的", "", "I am ~ when we play."],
  ["sad", "難過的", "", "She is ~ because her toy broke."],
  ["cute", "可愛的", "", "That kitten is ~."],
  ["I", "我", "", "~ like cats."],
  ["you", "你", "", "Can ~ help me?"],
  ["we", "我們", "", "~ are in the same class."],
  ["he", "他", "", "Ben is my brother. ~ is six."],
  ["she", "她", "", "Mia is my sister. ~ is seven."],
  ["they", "他們", "", "Tom and Mia are friends. ~ play together."],
  ["my", "我的", "", "This is ~ bag."],
  ["the", "這個或那個（特定的）", "", "Close ~ door, please."],
  ["a", "一個", "", "I have ~ red ball."],
  ["is", "是（搭配單數）", "", "The dog ~ in the yard."],
  ["are", "是（搭配 you 或複數）", "", "The books ~ on the desk."],
  ["was", "過去是／在（搭配單數）", "", "I ~ at home yesterday."],
  ["said", "說過（過去式）", "", "Dad ~, “Good job!”"],
  ["have", "有", "", "We ~ two cats."],
  ["to", "往、到", "", "I walk ~ school."],
  ["and", "和", "", "I like cats ~ dogs."],
  ["in", "在裡面", "", "The pencil is ~ the box."],
  ["on", "在上面", "", "The cup is ~ the table."],
  ["of", "……的（表示所屬或內容）", "", "This is a cup ~ milk."],
  ["can", "可以、會", "", "A frog ~ jump."]
].map(([english, chinese, picture, sentence]) => ({english, chinese, picture, sentence}));
const pictureWords = words.filter(entry => entry.picture);

const ui = Object.fromEntries([
  "round", "stars", "progress", "play", "prompt", "clue", "picture", "word", "meaning",
  "sound-tools", "hear", "slow", "answers", "feedback", "ready", "finished", "finish-title",
  "again", "audio", "audio-status", "wordbank-area", "wordbank", "sentence", "word-search", "no-matches"
].map(id => [id, document.getElementById(id)]));
const modes = [...document.querySelectorAll("[data-mode]")];
const recordings = window.englishRecordings || {};
const roundSize = 5;
const modesTitle = {
  repeat: "看圖，聽一聽，跟著念",
  listen: "聽英文，找出對的圖片",
  read: "看圖片，選出對的英文",
  sentence: "看短句，選缺少的英文"
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

function wordInSentence(entry, answer) {
  const startsSentence = /^~|[.!?]\s+~/.test(entry.sentence);
  return startsSentence ? answer[0].toUpperCase() + answer.slice(1) : answer;
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
  ui.meaning.hidden = mode !== "repeat" && mode !== "sentence";
  ui.sentence.hidden = mode !== "sentence";
  ui.picture.hidden = mode === "sentence" || !current().picture;
  ui["sound-tools"].hidden = mode === "read" || mode === "sentence";
  ui["wordbank-area"].hidden = mode !== "repeat";
  ui.answers.replaceChildren();

  const entry = current();
  ui.picture.textContent = entry.picture;
  ui.picture.setAttribute("aria-label", entry.chinese);
  ui.word.textContent = entry.english;
  ui.meaning.textContent = mode === "sentence" ? "提示：" + entry.chinese : entry.chinese;
  ui.sentence.textContent = entry.sentence.replace("~", "____");

  if (mode !== "repeat") {
    const pool = mode === "sentence" ? words : pictureWords;
    const distractors = shuffle(pool.filter(word => word !== entry)).slice(0, 2);
    for (const option of shuffle([entry, ...distractors])) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = mode === "listen" ? "answer picture" : "answer";
      if (mode === "listen") {
        button.textContent = option.picture;
        button.setAttribute("aria-label", option.chinese);
      } else {
        button.textContent = mode === "sentence" ? wordInSentence(entry, option.english) : option.english;
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
  const pool = mode === "listen" || mode === "read" ? pictureWords : words;
  questions = shuffle(pool).slice(0, roundSize);
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
  if (mode === "sentence") {
    const entry = current();
    ui.sentence.textContent = entry.sentence.replace("~", wordInSentence(entry, entry.english));
  }
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
  const retry = {listen: "再聽一次", read: "再看看圖片", sentence: "再看看短句和提示"};
  ui.feedback.textContent = retry[mode] + "，試試看！";
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

const wordButtons = words.map(entry => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = (entry.picture ? entry.picture + " " : "") + entry.english;
  button.setAttribute("aria-label", "聽 " + entry.english + "，" + entry.chinese);
  button.addEventListener("click", () => playWord(entry));
  ui.wordbank.append(button);
  return button;
});
ui["word-search"].addEventListener("input", () => {
  const term = ui["word-search"].value.trim().toLowerCase();
  let matches = 0;
  words.forEach(({english, chinese}, index) => {
    const visible = english.toLowerCase().includes(term) || chinese.includes(term);
    wordButtons[index].hidden = !visible;
    if (visible) matches++;
  });
  ui["no-matches"].hidden = matches > 0;
});
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
