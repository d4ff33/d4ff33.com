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
const friendsLink = document.getElementById("friends_link");
const gamesLink = document.getElementById("games_link");

const contentFrame = document.getElementById("iframe");

const navLinks = [homeLink, galleryLink, friendsLink, gamesLink];

function setActiveLink(activeLink) {
  navLinks.forEach((link) => {
    link.classList.remove("activeNav");
    link.classList.add("inactiveNav");
  });
  activeLink.classList.add("activeNav");
  activeLink.classList.remove("inactiveNav");
}

homeLink.addEventListener("click", () => {
  if (homeLink.classList.contains("activeNav")) return;
  contentFrame.src = "pages/home.html";
  document.title = "Daffy's Space - Home";
  setActiveLink(homeLink);
});

galleryLink.addEventListener("click", () => {
  if (galleryLink.classList.contains("activeNav")) return;
  contentFrame.src = "pages/gallery.html";
  document.title = "Daffy's Space - Gallery";
  setActiveLink(galleryLink);
});

friendsLink.addEventListener("click", () => {
  if (friendsLink.classList.contains("activeNav")) return;
  contentFrame.src = "pages/friends.html";
  document.title = "Daffy's Space - Friends";
  setActiveLink(friendsLink);
});

gamesLink.addEventListener("click", () => {
  if (gamesLink.classList.contains("activeNav")) return;
  contentFrame.src = "pages/games.html";
  document.title = "Daffy's Space - Games";
  setActiveLink(gamesLink);
});
