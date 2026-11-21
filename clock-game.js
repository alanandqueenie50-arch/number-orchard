"use strict";

const $ = id => document.getElementById(id);
const roundSize = 5;
const modes = [...document.querySelectorAll("[data-mode]")];
const selectors = [...document.querySelectorAll("[data-select]")];
const adjusters = [...document.querySelectorAll("[data-adjust]")];
const dial = $("dial");
const wrap = (value, size) => (value % size + size) % size;
const hourDegrees = (hour, minute) => hour * 30 + minute / 2;
const minuteDegrees = minute => minute * 6;
let mode = "read";
let selected = "hour";
let level = 30;
let questions = [];
let index = 0;
let shown = {hour: 0, minute: 0};
let checked = false;
let nextTimer;
let drag;

for (let i = 0; i < 60; i++) {
  const tick = document.createElement("span");
  tick.className = i % 5 === 0 ? "tick major" : "tick";
  tick.style.setProperty("--angle", i * 6 + "deg");
  tick.setAttribute("aria-hidden", "true");
  dial.prepend(tick);
}
for (let i = 0; i < 12; i++) {
  const number = document.createElement("span");
  number.className = "number";
  number.textContent = i || 12;
  number.setAttribute("aria-hidden", "true");
  number.style.setProperty("--x", (50 + 37.5 * Math.sin(i * Math.PI / 6)) + "%");
  number.style.setProperty("--y", (50 - 37.5 * Math.cos(i * Math.PI / 6)) + "%");
  dial.prepend(number);
}

function shuffle(values) {
  const items = [...values];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function formatted({hour, minute}) {
  return (hour || 12) + ":" + String(minute).padStart(2, "0");
}
function sameTime(a, b) {
  return a.hour === b.hour && a.minute === b.minute;
}
function paint() {
  $("hour").style.setProperty("--turn", hourDegrees(shown.hour, shown.minute) + "deg");
  $("minute").style.setProperty("--turn", minuteDegrees(shown.minute) + "deg");
  dial.setAttribute("aria-label", mode === "set" || checked
    ? "目前鐘面 " + formatted(shown) : "請看鐘面上的時針和分針");
}
function chooseHand(hand) {
  selected = hand;
  for (const button of selectors) button.setAttribute("aria-pressed", String(button.dataset.select === selected));
}
function updateScore(score) {
  $("stars").textContent = "⭐ " + score + " 顆星";
  $("progress").value = score;
}
function makeOptions(time) {
  const {hour, minute} = time;
  const alternatives = [
    {hour: wrap(hour - 1, 12), minute},
    {hour: wrap(hour + 1, 12), minute},
    {hour, minute: wrap(minute + level, 60)},
    {hour, minute: wrap(minute - level, 60)}
  ];
  const unique = [...new Map(alternatives.map(item => [formatted(item), item])).values()];
  return shuffle([time, ...shuffle(unique).slice(0, 2)]);
}
function showQuestion(focus) {
  const set = mode === "set";
  const time = questions[index];
  checked = false;
  drag = undefined;
  $("count").textContent = "第 " + (index + 1) + " / " + roundSize + " 題";
  $("prompt").textContent = set ? "把時鐘撥到這個時間" : "鐘面上是幾點？";
  $("target").textContent = formatted(time);
  $("target").hidden = !set;
  $("adjust").hidden = !set;
  $("check").disabled = false;
  $("choices").hidden = set;
  $("choices").replaceChildren();
  $("feedback").textContent = "";
  dial.classList.toggle("adjustable", set);
  chooseHand("hour");
  shown = set ? {hour: 0, minute: 0} : time;
  if (set && sameTime(shown, time)) shown = {hour: 1, minute: 0};
  paint();
  if (!set) {
    for (const option of makeOptions(time)) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = formatted(option);
      button.addEventListener("click", () => checkTime(option, button));
      $("choices").append(button);
    }
  }
  if (focus) $("prompt").focus();
}
function start(focus = true) {
  clearTimeout(nextTimer);
  level = Number($("level").value);
  const times = [];
  for (let hour = 0; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += level) times.push({hour, minute});
  }
  questions = shuffle(times).slice(0, roundSize);
  index = 0;
  updateScore(0);
  $("finished").hidden = true;
  $("play").hidden = false;
  showQuestion(focus);
}
function checkTime(answer, button) {
  if (checked || button?.disabled) return;
  const expected = questions[index];
  if (!sameTime(answer, expected)) {
    if (button) {
      button.classList.add("wrong");
      button.disabled = true;
      $("choices").querySelector("button:not(:disabled)").focus();
    }
    $("feedback").textContent = answer.minute !== expected.minute
      ? "再看長針，分針指的是幾分？" : "再看短針，時針走過幾點了？";
    return;
  }
  checked = true;
  drag = undefined;
  dial.classList.remove("adjustable");
  $("check").disabled = true;
  if (button) button.classList.add("right");
  for (const choice of $("choices").children) choice.disabled = true;
  $("feedback").textContent = "答對了！現在是 " + formatted(expected) + " ⭐";
  paint();
  updateScore(index + 1);
  nextTimer = setTimeout(() => {
    index++;
    if (index < roundSize) showQuestion(true);
    else {
      $("play").hidden = true;
      $("finished").hidden = false;
      $("finish-title").focus();
    }
  }, 1900);
}
function angleAt(event) {
  const box = dial.getBoundingClientRect();
  const x = event.clientX - box.left - box.width / 2;
  const y = event.clientY - box.top - box.height / 2;
  if (Math.hypot(x, y) < 12) return null;
  return wrap(Math.atan2(x, -y) * 180 / Math.PI, 360);
}
function setFromAngle(angle, grip = 0) {
  if (selected === "hour") shown.hour = wrap(Math.round((angle - grip) / 30), 12);
  else shown.minute = wrap(Math.round(angle / (level * 6)) * level, 60);
  $("feedback").textContent = "";
  paint();
}
dial.addEventListener("pointerdown", event => {
  if (mode !== "set" || checked || drag || event.button !== 0) return;
  const angle = angleAt(event);
  if (angle === null) return;
  const grabbed = event.target.closest("[data-hand]")?.dataset.hand;
  if (grabbed) chooseHand(grabbed);
  const grip = grabbed === "hour" ? shown.minute / 2 : 0;
  drag = {id: event.pointerId, grip};
  dial.setPointerCapture(event.pointerId);
  if (!grabbed) setFromAngle(angle);
});
dial.addEventListener("pointermove", event => {
  if (event.pointerId !== drag?.id) return;
  const angle = angleAt(event);
  if (angle !== null) setFromAngle(angle, drag.grip);
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
  dial.addEventListener(type, event => { if (event.pointerId === drag?.id) drag = undefined; });
}
for (const button of modes) button.addEventListener("click", () => {
  if (mode === button.dataset.mode) return;
  mode = button.dataset.mode;
  for (const item of modes) item.setAttribute("aria-pressed", String(item.dataset.mode === mode));
  start();
});
for (const button of selectors) button.addEventListener("click", () => chooseHand(button.dataset.select));
for (const button of adjusters) button.addEventListener("click", () => {
  if (checked) return;
  chooseHand(button.dataset.adjust);
  const delta = Number(button.dataset.step);
  shown[selected] = selected === "hour" ? wrap(shown.hour + delta, 12) : wrap(shown.minute + delta * level, 60);
  $("feedback").textContent = "";
  paint();
});
$("level").addEventListener("change", () => start());
$("check").addEventListener("click", () => checkTime(shown));
$("restart").addEventListener("click", () => start());
start(false);
