"use strict";

const logofart1 = `../assets/logofart1.mp3`;
const logofart2 = `../assets/logofart2.mp3`;
const logofart3 = `../assets/logofart3.mp3`;
const logofart4 = `../assets/logofart4.mp3`;

const farts = [logofart1, logofart2, logofart3, logofart4];

const logofart = document.getElementById("logo");

logofart.addEventListener("click", () => {
  const randomFart = farts[Math.floor(Math.random() * farts.length)];

  const fartSound = new Audio(randomFart);
  fartSound.play();

  logofart.classList.add("logo-shake");
  setTimeout(() => {
    logofart.classList.remove("logo-shake");
  }, 700);
});
