class TextScramble {
  constructor(elements, isFast = false) {
    this.elements = elements;
    this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.intervals = new Map();
    this.speed = {
      interval: isFast ? 15 : 30,
      increment: isFast ? 1 : 1 / 3,
    };
  }

  scramble() {
    this.elements.forEach((element) => {
      const originalText = element.innerText;
      let iteration = 0;

      // Clear any existing interval for this element
      if (this.intervals.has(element)) {
        clearInterval(this.intervals.get(element));
      }

      const interval = setInterval(() => {
        element.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return this.letters[Math.floor(Math.random() * 26)];
          })
          .join("");

        if (iteration >= originalText.length) {
          clearInterval(interval);
          this.intervals.delete(element);
        }

        iteration += this.speed.increment;
      }, this.speed.interval);

      this.intervals.set(element, interval);
    });
  }
}

// Function to initialize scramble effects for any container
function initScrambleEffectsForContainer(container) {
  // Normal speed scramble - excluding lightbox elements
  const normalElements = Array.from(
    container.querySelectorAll(".scramble:not(.scramblefast)")
  ).filter((element) => !element.closest(".lightbox"));

  if (normalElements.length > 0) {
    const normalScrambler = new TextScramble(normalElements, false);
    normalScrambler.scramble();
  }

  // Fast scramble - excluding lightbox elements
  const fastElements = Array.from(
    container.querySelectorAll(".scramblefast")
  ).filter((element) => !element.closest(".lightbox"));

  if (fastElements.length > 0) {
    const fastScrambler = new TextScramble(fastElements, true);
    fastScrambler.scramble();
  }
}

// Modified page loading function to include scramble effects
async function loadContent(pageName) {
  showLoading();

  try {
    // Check cache first
    const cachedContent = getCachedContent(pageName);
    if (cachedContent) {
      document.getElementById("content").innerHTML = cachedContent;

      // Wait for DOM to be updated
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Initialize scramble effects for the new content
      initScrambleEffectsForContainer(document.getElementById("content"));

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

    // Initialize scramble effects for the new content
    initScrambleEffectsForContainer(document.getElementById("content"));

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

// Initialize scramble effects for both main page and dynamic content
document.addEventListener("DOMContentLoaded", () => {
  // Initialize for main index.html content
  initScrambleEffectsForContainer(document);

  // Handle initial page load
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

// Export the function for global access if needed
window.initScrambleEffects = initScrambleEffectsForContainer;
