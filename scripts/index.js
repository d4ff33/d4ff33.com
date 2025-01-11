"use strict";

/* Logo Meme */

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

/*Page Loading*/

const homeLink = document.getElementById("home_link");
const galleryLink = document.getElementById("gallery_link");
const doodlesLink = document.getElementById("doodles_link");
const gamesLink = document.getElementById("games_link");

const contentFrame = document.getElementById("iframe");

homeLink.addEventListener("click", () => {
  contentFrame.src = "pages/home.html";
  document.title = "Daffy's Space - Home";
});

galleryLink.addEventListener("click", () => {
  contentFrame.src = "pages/gallery.html";
  document.title = "Daffy's Space - Gallery";
});

doodlesLink.addEventListener("click", () => {
  contentFrame.src = "pages/doodles.html";
  document.title = "Daffy's Space - Doodles";
});

gamesLink.addEventListener("click", () => {
  contentFrame.src = "pages/games.html";
  document.title = "Daffy's Space - Games";
});
