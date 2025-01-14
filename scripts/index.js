"use strict";

// Logo Farts
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

// Page Navigation
const homeLink = document.getElementById("home_link");
const galleryLink = document.getElementById("gallery_link");
const friendsLink = document.getElementById("friends_link");
const gamesLink = document.getElementById("games_link");

const navLinks = [homeLink, galleryLink, friendsLink, gamesLink];

function setActiveLink(activeLink) {
  navLinks.forEach((link) => {
    link.classList.remove("activeNav");
    link.classList.add("inactiveNav");
  });
  activeLink.classList.add("activeNav");
  activeLink.classList.remove("inactiveNav");
}

// Content Loading
async function loadContent(pageName) {
  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`Failed to load ${pageName}`);
    const content = await response.text();
    document.getElementById("content").innerHTML = content;

    // Initialize gallery if we're loading the gallery page
    if (pageName === "gallery") {
      initGallery();
    }
  } catch (error) {
    console.error("Error loading content:", error);
    document.getElementById("content").innerHTML =
      "<p>Sorry, that content couldn't be loaded.</p>";
  }
}

async function navigateToPage(pageName, link, title) {
  if (link.classList.contains("activeNav")) return;

  await loadContent(pageName);
  document.title = `Daffy's Space - ${title}`;
  setActiveLink(link);
  history.pushState({ page: pageName }, "", `#${pageName}`);
}

// Navigation click handlers
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToPage("home", homeLink, "Home");
});

galleryLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToPage("gallery", galleryLink, "Gallery");
});

friendsLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToPage("friends", friendsLink, "Friends");
});

gamesLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToPage("games", gamesLink, "Games");
});

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
  if (event.state) {
    const { page } = event.state;
    const linkMap = {
      home: homeLink,
      gallery: galleryLink,
      friends: friendsLink,
      games: gamesLink,
    };

    const link = linkMap[page];
    if (link) {
      navigateToPage(page, link, page.charAt(0).toUpperCase() + page.slice(1));
    }
  } else {
    // Default to home if no state
    navigateToPage("home", homeLink, "Home");
  }
});

// Handle initial page load
document.addEventListener("DOMContentLoaded", () => {
  // Get the page from the URL hash, or default to 'home'
  const initialPage = window.location.hash.slice(1).toLowerCase() || "home";
  const linkMap = {
    home: homeLink,
    gallery: galleryLink,
    friends: friendsLink,
    games: gamesLink,
  };

  const link = linkMap[initialPage] || homeLink;
  const title = initialPage.charAt(0).toUpperCase() + initialPage.slice(1);

  navigateToPage(initialPage, link, title);
});

// Gallery
const imageData = [
  {
    src: "../assets/art/Screenshot 2025-01-13 184506.png",
    date: "2025-01-13",
    displayDate: "1/13/2025",
    caption: "Some figure drawings for today",
    category: "sketches",
  },
  {
    src: "../assets/art/Screenshot 2025-01-13 112809.png",
    date: "2025-01-12",
    displayDate: "1/12/2025",
    caption: "Messing around with color and drinking Jett-juice",
    category: "sketches",
  },
  {
    src: "../assets/art/Screenshot 2025-01-11 161502.png",
    date: "2025-01-11",
    displayDate: "1/11/2025",
    caption: "Left to right, SrJelly, Yobu, Jett, Vert, Daffy",
    category: "sketches",
  },
  {
    src: "../assets/art/Screenshot 2025-01-08 225159.png",
    date: "2025-01-08",
    displayDate: "1/08/2025",
    caption: "Random doodles of Daffy",
    category: "sketches",
  },
];

function initGallery() {
  const imagesContainer = document.querySelector("#images");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox-image");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const lightboxDate = document.querySelector(".lightbox-date");
  const closeBtn = document.querySelector(".close-button");
  const prevBtn = document.querySelector(".nav-button.prev");
  const nextBtn = document.querySelector(".nav-button.next");
  const sortBtn = document.querySelector("#sort-button");
  const categoryLinks = document.querySelectorAll("#categories a");
  const resultsCounter = document.querySelector("#results-counter");

  // If elements aren't found, return early
  if (!imagesContainer || !lightbox) return;

  let currentImageIndex = 0;
  let sortDirection = "desc";
  let currentFilter = "all";
  let filteredImages = [...imageData];

  // Render images
  function renderImages(images) {
    imagesContainer.innerHTML = "";

    resultsCounter.textContent = `${images.length} Results`;

    if (images.length === 0) {
      const noResultsMessage = document.createElement("div");
      noResultsMessage.className = "no-results-message";
      noResultsMessage.textContent = "Just give it some time...";
      imagesContainer.appendChild(noResultsMessage);
      return;
    }

    images.forEach((image, index) => {
      const imageElement = document.createElement("div");
      imageElement.className = "image";
      imageElement.innerHTML = `
        <img src="${image.src}" alt="${image.caption}" class="${image.category}" />
        <p class="date">${image.displayDate}</p>
      `;

      imageElement.querySelector("img").addEventListener("click", () => {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add("active");
      });

      imagesContainer.appendChild(imageElement);
    });
  }

  function filterImages(category) {
    currentFilter = category.toLowerCase();

    categoryLinks.forEach((link) => {
      if (link.textContent.toLowerCase() === category.toLowerCase()) {
        link.className = "activeFilter";
      } else {
        link.className = "inactiveFilter";
      }
    });

    filteredImages =
      category.toLowerCase() === "all"
        ? [...imageData]
        : imageData.filter(
            (image) => image.category.toLowerCase() === currentFilter
          );

    sortImages(false);
  }

  function sortImages(toggleDirection = true) {
    if (toggleDirection) {
      sortDirection = sortDirection === "desc" ? "asc" : "desc";
    }

    const sortedImages = [...filteredImages].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    sortBtn.textContent = `Sort by ${
      sortDirection === "desc" ? "Newest ↓" : "Oldest ↑"
    }`;
    renderImages(sortedImages);
  }

  function updateLightboxImage() {
    const currentImage = filteredImages[currentImageIndex];
    lightboxImg.src = currentImage.src;
    lightboxCaption.textContent = currentImage.caption;
    lightboxDate.textContent = currentImage.displayDate;
  }

  // Event Listeners
  sortBtn.addEventListener("click", () => sortImages(true));

  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      filterImages(link.textContent);
    });
  });

  closeBtn.addEventListener("click", () => {
    lightbox.classList.remove("active");
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
    }
  });

  prevBtn.addEventListener("click", () => {
    currentImageIndex =
      (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxImage();
  });

  nextBtn.addEventListener("click", () => {
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateLightboxImage();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "ArrowLeft") {
      currentImageIndex =
        (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
      updateLightboxImage();
    } else if (e.key === "ArrowRight") {
      currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
      updateLightboxImage();
    } else if (e.key === "Escape") {
      lightbox.classList.remove("active");
    }
  });

  // Initialize the gallery with all images
  filterImages("all");
}
