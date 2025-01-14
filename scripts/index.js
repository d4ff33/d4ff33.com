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
const bountiesLink = document.getElementById("bounties_link");
const gamesLink = document.getElementById("games_link");

const navLinks = [homeLink, galleryLink, bountiesLink, gamesLink];

function setActiveLink(activeLink) {
  navLinks.forEach((link) => {
    link.classList.remove("activeNav");
    link.classList.add("inactiveNav");
  });
  activeLink.classList.add("activeNav");
  activeLink.classList.remove("inactiveNav");
}

// Cache Management
const CACHE_PREFIX = "daffy_page_";
const CACHE_DURATION = 1 * 60 * 60 * 1000;
const GALLERY_CACHE_KEY = "daffy_gallery_data";

function getCacheKey(pageName) {
  return `${CACHE_PREFIX}${pageName}`;
}

function setCachedContent(pageName, content) {
  const cacheItem = {
    content: content,
    timestamp: Date.now(),
  };
  localStorage.setItem(getCacheKey(pageName), JSON.stringify(cacheItem));
}

function getCachedContent(pageName) {
  const cached = localStorage.getItem(getCacheKey(pageName));
  if (!cached) return null;

  const cacheItem = JSON.parse(cached);
  const age = Date.now() - cacheItem.timestamp;

  if (age > CACHE_DURATION) {
    localStorage.removeItem(getCacheKey(pageName));
    return null;
  }

  return cacheItem.content;
}

// Loading Screen Management
function showLoading() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
  `;
}

function hideLoading() {
  const loadingContainer = document.querySelector(".loading-container");
  if (loadingContainer) {
    loadingContainer.remove();
  }
}

// Content Loading
async function loadContent(pageName) {
  showLoading();

  try {
    // Check cache first
    const cachedContent = getCachedContent(pageName);
    if (cachedContent) {
      document.getElementById("content").innerHTML = cachedContent;
      if (pageName === "gallery") {
        await initGallery();
      }
      hideLoading();
      return;
    }

    // If not in cache, fetch from server
    await new Promise((resolve) => setTimeout(resolve, 300));
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`Failed to load ${pageName}`);
    const content = await response.text();

    // Cache the new content
    setCachedContent(pageName, content);

    document.getElementById("content").innerHTML = content;

    if (pageName === "gallery") {
      await initGallery();
    }
  } catch (error) {
    console.error("Error loading content:", error);
    document.getElementById("content").innerHTML =
      "<p>Sorry, that content couldn't be loaded.</p>";
  } finally {
    hideLoading();
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

bountiesLink.addEventListener("click", (e) => {
  e.preventDefault();
  navigateToPage("bounties", bountiesLink, "bounties");
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
      bounties: bountiesLink,
      games: gamesLink,
    };

    const link = linkMap[page];
    if (link) {
      navigateToPage(page, link, page.charAt(0).toUpperCase() + page.slice(1));
    }
  } else {
    navigateToPage("home", homeLink, "Home");
  }
});

// Handle initial page load
document.addEventListener("DOMContentLoaded", () => {
  const initialPage = window.location.hash.slice(1).toLowerCase() || "home";
  const linkMap = {
    home: homeLink,
    gallery: galleryLink,
    bounties: bountiesLink,
    games: gamesLink,
  };

  const link = linkMap[initialPage] || homeLink;
  const title = initialPage.charAt(0).toUpperCase() + initialPage.slice(1);

  navigateToPage(initialPage, link, title);
});

// Gallery
async function initGallery() {
  let imageData;
  const IMAGES_PER_PAGE = 18;
  let currentPage = 1;

  try {
    const cachedGalleryData = localStorage.getItem(GALLERY_CACHE_KEY);
    if (cachedGalleryData) {
      imageData = JSON.parse(cachedGalleryData).images;
    } else {
      const response = await fetch("scripts/data/imageData.json");
      if (!response.ok) throw new Error("Failed to load image data");
      const data = await response.json();
      imageData = data.images;
      localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error loading image data:", error);
    document.getElementById("images").innerHTML =
      "<p>Failed to load gallery images.</p>";
    return;
  }

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

  if (!imagesContainer || !lightbox) return;

  let currentImageIndex = 0;
  let sortDirection = "desc";
  let currentFilter = "all";
  let filteredImages = [...imageData];

  function createPaginationControls(totalPages) {
    const paginationContainer =
      document.getElementById("pagination-controls") ||
      document.createElement("div");
    paginationContainer.id = "pagination-controls";
    paginationContainer.className = "pagination-controls";
    paginationContainer.innerHTML = "";

    // Previous page button
    const prevButton = document.createElement("button");
    prevButton.className = `pagination-button ${
      currentPage <= 1 ? "disabled" : ""
    }`;
    prevButton.textContent = "←";
    prevButton.onclick = () => {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    };
    paginationContainer.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = `pagination-button ${
        i === currentPage ? "active" : ""
      }`;
      pageButton.textContent = i;

      // Only add click handler if it's not the current page
      if (i !== currentPage) {
        pageButton.onclick = () => goToPage(i);
      }

      paginationContainer.appendChild(pageButton);
    }

    // Next page button
    const nextButton = document.createElement("button");
    nextButton.className = `pagination-button ${
      currentPage >= totalPages ? "disabled" : ""
    }`;
    nextButton.textContent = "→";
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    };
    paginationContainer.appendChild(nextButton);

    // Append pagination controls after the images container
    if (!document.getElementById("pagination-controls")) {
      imagesContainer.parentNode.insertBefore(
        paginationContainer,
        imagesContainer.nextSibling
      );
    }
  }

  function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderImages(filteredImages);
  }

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

    const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const pageImages = images.slice(startIndex, endIndex);

    pageImages.forEach((image, index) => {
      const imageElement = document.createElement("div");
      imageElement.className = "image";
      imageElement.innerHTML = `
        <img src="${image.src}" alt="${image.caption}" class="${image.category}" />
        <p class="date">${image.displayDate}</p>
      `;

      imageElement.querySelector("img").addEventListener("click", () => {
        currentImageIndex = startIndex + index;
        updateLightboxImage();
        lightbox.classList.add("active");
      });

      imagesContainer.appendChild(imageElement);
    });

    createPaginationControls(totalPages);
  }

  function filterImages(category) {
    currentFilter = category.toLowerCase();
    currentPage = 1; // Reset to first page when filtering

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

// Cache clearing function for development
function clearPageCache() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(CACHE_PREFIX) || key === GALLERY_CACHE_KEY) {
      localStorage.removeItem(key);
    }
  }
  console.log("Page cache cleared");
}
