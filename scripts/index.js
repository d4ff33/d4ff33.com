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

// Cache Management with Version Control
const CACHE_PREFIX = "daffy_page_";
const CACHE_VERSION = "0.6"; // Increment this when deploying new content
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour
const GALLERY_CACHE_KEY = "daffy_gallery_data";
const BOUNTIES_CACHE_KEY = "daffy_bounties_data";

// Add version to cache keys
function getCacheKey(pageName) {
  return `${CACHE_PREFIX}${pageName}_v${CACHE_VERSION}`;
}

// Modified cache setter with version
function setCachedContent(pageName, content) {
  const cacheItem = {
    content: content,
    timestamp: Date.now(),
    version: CACHE_VERSION,
  };
  localStorage.setItem(getCacheKey(pageName), JSON.stringify(cacheItem));
}

// Modified cache getter with version check
function getCachedContent(pageName) {
  const cached = localStorage.getItem(getCacheKey(pageName));
  if (!cached) return null;

  const cacheItem = JSON.parse(cached);
  const age = Date.now() - cacheItem.timestamp;

  // Return null if cache is expired or version mismatch
  if (age > CACHE_DURATION || cacheItem.version !== CACHE_VERSION) {
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

      // Wait for DOM to be updated
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (pageName === "gallery") {
        await initGallery();
      } else if (pageName === "bounties") {
        await initBounties();
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

    // Wait for DOM to be updated
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (pageName === "gallery") {
      await initGallery();
    } else if (pageName === "bounties") {
      await initBounties();
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
  navigateToPage("bounties", bountiesLink, "Bounties");
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
  const IMAGES_PER_PAGE = 18;
  let imageData;
  let currentPage = 1; // Moved to top level of initGallery
  let currentImageIndex = 0;
  let sortDirection = "desc";
  let currentFilter = "all";
  let filteredImages = [];

  try {
    const cachedGalleryData = localStorage.getItem(GALLERY_CACHE_KEY);
    if (cachedGalleryData) {
      const parsed = JSON.parse(cachedGalleryData);
      if (parsed.version === CACHE_VERSION) {
        imageData = parsed.images;
      } else {
        localStorage.removeItem(GALLERY_CACHE_KEY);
      }
    }

    if (!imageData) {
      const response = await fetch("scripts/data/imageData.json");
      if (!response.ok) throw new Error("Failed to load image data");
      const data = await response.json();
      imageData = data.images;
      localStorage.setItem(
        GALLERY_CACHE_KEY,
        JSON.stringify({
          images: data.images,
          version: CACHE_VERSION,
        })
      );
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

    sortBtn.textContent = `${
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
  filteredImages = [...imageData]; // Initialize filteredImages
  filterImages("all");
}

// Initialize bounties after the content is loaded

// Modified bounties cache handling
// Modified bounties initialization
async function initBounties() {
  let bountyData;
  try {
    const cachedBountyData = localStorage.getItem(BOUNTIES_CACHE_KEY);
    if (cachedBountyData) {
      const parsed = JSON.parse(cachedBountyData);
      if (parsed.version === CACHE_VERSION) {
        bountyData = parsed.bounties;
      } else {
        localStorage.removeItem(BOUNTIES_CACHE_KEY);
      }
    }

    if (!bountyData) {
      const response = await fetch("scripts/data/bountyData.json");
      if (!response.ok) throw new Error("Failed to load bounty data");
      const data = await response.json();
      bountyData = data.bounties;
      localStorage.setItem(
        BOUNTIES_CACHE_KEY,
        JSON.stringify({
          bounties: data.bounties,
          version: CACHE_VERSION,
        })
      );
    }
  } catch (error) {
    console.error("Error loading bounty data:", error);
    document.getElementById("bounties-grid").innerHTML =
      "<p>Failed to load bounties.</p>";
    return;
  }

  const bountiesGrid = document.getElementById("bounties-grid");
  const bountyDetails = document.getElementById("bounty-details");
  const bountiesHeader = document.getElementById("bounties-header");

  // Render bounty cards
  function renderBounties() {
    // Update header with scramble classes
    bountiesHeader.innerHTML = ``;

    // Clear the grid
    bountiesGrid.innerHTML = "";

    // Render bounty cards
    bountyData.forEach((bounty) => {
      const bountyCard = document.createElement("div");
      bountyCard.className = "bounty-card";

      const thumbnailContent =
        bounty.thumbnail === "blue-square"
          ? '<div class="thumbnail-square"></div>'
          : `<img src="${bounty.thumbnail}" alt="${bounty.name}">`;

      bountyCard.innerHTML = `
        ${thumbnailContent}
        <div class="bounty-card-info">
          <h3 class="scramble">${bounty.name}</h3>
          <div class="crosshair"><img src="../assets/Crosshair.svg" alt="Crosshair"></div>
        </div>
      `;

      bountyCard.addEventListener("click", () => showBountyDetails(bounty));
      bountiesGrid.appendChild(bountyCard);
    });

    // Initialize scramble effects after content is rendered
    requestAnimationFrame(() => {
      initScrambleEffectsForContainer(bountiesHeader);
      initScrambleEffectsForContainer(bountiesGrid);
    });
  }

  // Show bounty details with animation
  function showBountyDetails(bounty) {
    bountiesGrid.style.display = "none";
    bountiesHeader.style.display = "none";

    const socialLinksHTML = bounty.socialLinks
      ? `<div class="social-links">
          ${
            bounty.socialLinks.x
              ? `<a href="${bounty.socialLinks.x}" target="_blank" rel="noopener noreferrer" class="social-button">
            <img src="../assets/x.svg" alt="X" /><span>X</span></a>`
              : ""
          }
          ${
            bounty.socialLinks.bluesky
              ? `<a href="${bounty.socialLinks.bluesky}" target="_blank" rel="noopener noreferrer" class="social-button">
            <img src="../assets/bluesky.svg" alt="Bluesky" /><span>Bluesky</span></a>`
              : ""
          }
          ${
            bounty.socialLinks.instagram
              ? `<a href="${bounty.socialLinks.instagram}" target="_blank" rel="noopener noreferrer" class="social-button">
            <img src="../assets/instagram.svg" alt="Instagram" /><span>Instagram</span></a>`
              : ""
          }
          ${
            bounty.socialLinks.tiktok
              ? `<a href="${bounty.socialLinks.tiktok}" target="_blank" rel="noopener noreferrer" class="social-button">
            <img src="../assets/tiktok.svg" alt="TikTok" /><span>TikTok</span></a>`
              : ""
          }
          ${
            bounty.socialLinks.artstation
              ? `<a href="${bounty.socialLinks.artstation}" target="_blank" rel="noopener noreferrer" class="social-button">
            <img src="../assets/artstation.svg" alt="ArtStation" /><span>ArtStation</span></a>`
              : ""
          }
        </div>`
      : "";

    bountyDetails.innerHTML = `
      <div class="bounty-content">
        <button id="close-bounty" class="close-button">×</button>
        <div class="bounty-details">
          <div class="bounty-image-container">
            <img class="bounty-image" src="${bounty.fullImage}" alt="${bounty.name}" />
          </div>
          <div class="bounty-info">
            <h2 class="bounty-name scramble">${bounty.name}</h2>
            <h3 id="wanted" class="scramble">WANTED</h3>
            <div class="bounty-stats">
              <p><span class="scramble">Aliases:</span> <span class="bounty-aliases scramble">${bounty.aliases}</span></p>
              <p><span class="scramble">Date of Birth:</span> <span class="bounty-dateOfBirth scramble">${bounty.dateOfBirth}</span></p>
              <p><span class="scramble">Hair:</span> <span class="bounty-hair scramble">${bounty.hair}</span></p>
              <p><span class="scramble">Eyes:</span> <span class="bounty-eyes scramble">${bounty.eyes}</span></p>
              <p><span class="scramble">Height:</span> <span class="bounty-height scramble">${bounty.height}</span></p>
              <p><span class="scramble">Weight:</span> <span class="bounty-weight scramble">${bounty.weight}</span></p>
              <p><span class="scramble">Species:</span> <span class="bounty-species scramble">${bounty.species}</span></p>
              <p><span class="scramble">Nationality:</span> <span class="bounty-nationality scramble">${bounty.nationality}</span></p>
              <p><span class="scramble">Languages:</span> <span class="bounty-languages scramble">${bounty.languages}</span></p>
              <p><span class="scramble">Last Seen:</span> <span class="bounty-last-seen scramble">${bounty.lastSeen}</span></p>
              <p id="bounty-description" class="scramblefast">${bounty.description}</p>
              <h2 id="bounty-caution" class="scramblefast">${bounty.caution}</h2>
              <h2 id="bounty-more-info">Find more information below:</h2>
              ${socialLinksHTML}
            </div>
          </div>
        </div>
      </div>
    `;

    bountyDetails.style.display = "block";

    // Initialize scramble effects for the details
    requestAnimationFrame(() => {
      initScrambleEffectsForContainer(bountyDetails);
    });

    // Add event listener to close button
    document
      .getElementById("close-bounty")
      .addEventListener("click", closeBountyDetails);
  }

  function closeBountyDetails() {
    bountyDetails.style.display = "none";
    bountiesHeader.style.display = "flex";
    bountiesGrid.style.display = "grid";

    // Reinitialize scramble effects for the grid and header
    requestAnimationFrame(() => {
      initScrambleEffectsForContainer(bountiesHeader);
      initScrambleEffectsForContainer(bountiesGrid);
    });
  }

  // Close details with escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bountyDetails.style.display === "block") {
      closeBountyDetails();
    }
  });

  // Initial render
  renderBounties();
}

// Function to clear outdated caches (can be called on page load)
function clearOutdatedCaches() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.startsWith(CACHE_PREFIX) ||
      key === GALLERY_CACHE_KEY ||
      key === BOUNTIES_CACHE_KEY
    ) {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        if (!cached.version || cached.version !== CACHE_VERSION) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // If there's any error parsing the cache, remove it
        localStorage.removeItem(key);
      }
    }
  }
}

// Cache clearing function for development
function clearPageCache() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.startsWith(CACHE_PREFIX) ||
      key === GALLERY_CACHE_KEY ||
      key === BOUNTIES_CACHE_KEY
    ) {
      localStorage.removeItem(key);
    }
  }
  console.log("Page cache cleared");
}

document.addEventListener("DOMContentLoaded", clearOutdatedCaches);
