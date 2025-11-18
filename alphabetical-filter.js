/**
 * Alphabetical Filtering System for CMS Collection Lists
 * Version: 2.1 - Finsweet Compatible
 */

class AlphabeticalFilter {
  constructor(config = {}) {
    this.config = {
      itemSelector: "[data-glossary-item]",
      titleSelector: "[data-glossary-title]",
      anchorSelector: "[data-letter-anchor]",
      hiddenLetterSelector: "[data-hidden-letter]",
      linksContainerSelector: "[data-links-container]",
      linkTemplateSelector:
        config.linkTemplateSelector || "[data-letter-link-template]",
      searchFieldSelector:
        config.searchFieldSelector || '[fs-list-field="search_term"]',
      activeLinkClass: config.activeLinkClass || "is-active",
      inactiveLinkClass: config.inactiveLinkClass || "is-inactive",
      letterSeparatorClass: config.letterSeparatorClass || "glossary-letter",
      spacerClass: config.spacerClass || "spacer",
      anchorOffset: config.anchorOffset ?? 5000,
      ...config,
    };

    this.items = [];
    this.availableLetters = new Set();
    this.usedLetters = new Set();
    this.letterHeaders = new Map();
    this.letterSpacers = new Map();
    this.container = null;

    this.init();
  }

  init() {
    try {
      this.collectItems();
      this.processItems();
      this.reorganizeItemsByLetter();
      this.createAlphabetNavigation();
      this.displayLetterHeadlines();
      this.initSearch();
      this.initResponsive();
    } catch (error) {
      console.error("Error initializing alphabetical filter:", error);
    }
  }

  collectItems() {
    document
      .querySelectorAll(this.config.itemSelector)
      .forEach((itemElement) => {
        const titleElement = itemElement.querySelector(
          this.config.titleSelector
        );
        if (!titleElement) return;

        const title = titleElement.textContent.trim();
        const match = title.match(/[A-Za-z]/);
        const firstLetter = match ? match[0].toUpperCase() : null;
        if (!firstLetter) return;

        this.items.push({
          element: itemElement,
          title,
          letter: firstLetter,
          titleElement,
        });
        this.availableLetters.add(firstLetter);
      });
  }

  processItems() {
    const letterCounts = {};

    this.items.forEach((item) => {
      const anchorElement = item.element.hasAttribute("data-letter-anchor")
        ? item.element
        : item.element.querySelector(this.config.anchorSelector);

      const hiddenLetterElement = item.element.hasAttribute(
        "data-hidden-letter"
      )
        ? item.element
        : item.element.querySelector(this.config.hiddenLetterSelector);

      if (anchorElement) {
        letterCounts[item.letter] = (letterCounts[item.letter] || 0) + 1;
        const uniqueId = `${item.letter}-${letterCounts[item.letter] - 1}`;
        anchorElement.setAttribute("id", uniqueId);
        anchorElement.setAttribute("data-letter", item.letter);
        item.id = uniqueId;
        item.anchorElement = anchorElement;
        this.applyAnchorOffset(anchorElement);
      }

      if (hiddenLetterElement) {
        hiddenLetterElement.setAttribute("data-letter", item.letter);
        hiddenLetterElement.textContent = item.letter;
      }
    });
  }

  applyAnchorOffset(anchorElement) {
    if (!anchorElement) return;
    const offset = Number(this.config.anchorOffset);
    if (Number.isNaN(offset)) return;
    anchorElement.style.scrollMarginTop = `${offset}px`;
  }

  generateAlphabet() {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }

  createAlphabetNavigation() {
    const container = document.querySelector(
      this.config.linksContainerSelector
    );
    if (!container) return;

    const template = container.querySelector(this.config.linkTemplateSelector);
    if (template) {
      this.createLinksFromTemplate(container, template);
    } else {
      this.createLinksDynamically(container);
    }

    this.bindAnchorLinks(container);
  }

  createLinksFromTemplate(container, template) {
    template.style.display = "none";
    container
      .querySelectorAll("[data-letter-link]:not([data-letter-link-template])")
      .forEach((link) => link.remove());

    const fragment = document.createDocumentFragment();

    this.generateAlphabet().forEach((letter) => {
      const linkClone = template.cloneNode(true);
      linkClone.removeAttribute("data-letter-link-template");
      linkClone.setAttribute("data-letter-link", letter);
      linkClone.style.display = "";

      const textElement =
        linkClone.querySelector("[data-letter-text]") || linkClone;
      if (textElement) textElement.textContent = letter;

      linkClone.classList.add(this.config.inactiveLinkClass);

      const linkElement =
        linkClone.tagName === "A" ? linkClone : linkClone.querySelector("a");
      if (linkElement) {
        if (this.availableLetters.has(letter)) {
          const firstItem = this.items.find((item) => item.letter === letter);
          linkElement.setAttribute("href", `#${firstItem?.id || letter}`);
          linkClone.classList.remove(this.config.inactiveLinkClass);
          linkClone.classList.add(this.config.activeLinkClass);
        } else {
          linkClone.classList.remove(this.config.activeLinkClass);
          linkElement.removeAttribute("href");
          linkElement.addEventListener("click", (e) => e.preventDefault());
        }
      }

      fragment.appendChild(linkClone);
    });

    container.appendChild(fragment);
  }

  bindAnchorLinks(container) {
    if (!container) return;

    container.querySelectorAll("[data-letter-link]").forEach((link) => {
      const anchor =
        link.tagName === "A" ? link : link.querySelector("a") || link;
      if (!anchor || anchor.getAttribute("data-offset-bound") === "true")
        return;

      anchor.setAttribute("data-offset-bound", "true");
      anchor.addEventListener("click", (event) => {
        const href =
          anchor.getAttribute("href") || link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;

        event.preventDefault();
        this.scrollToAnchor(href.slice(1));
      });
    });
  }

  scrollToAnchor(targetId) {
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const offset = Number(this.config.anchorOffset) || 0;
    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset;
    const scrollTop = Math.max(targetPosition - offset, 0);

    window.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }

  createLinksDynamically(container) {
    let template =
      container.querySelector(this.config.linkTemplateSelector) ||
      document.querySelector(this.config.linkTemplateSelector);
    const templateClasses = template ? Array.from(template.classList) : [];

    if (template && template.parentElement === container) {
      template.style.display = "none";
      container
        .querySelectorAll("[data-letter-link]:not([data-letter-link-template])")
        .forEach((link) => link.remove());
    } else {
      container
        .querySelectorAll("[data-letter-link]")
        .forEach((link) => link.remove());
    }

    const fragment = document.createDocumentFragment();

    this.generateAlphabet().forEach((letter) => {
      const link = document.createElement("a");
      link.textContent = letter;
      link.setAttribute("data-letter-link", letter);

      templateClasses.forEach((cls) => {
        if (
          cls !== this.config.inactiveLinkClass &&
          cls !== this.config.activeLinkClass
        ) {
          link.classList.add(cls);
        }
      });

      link.classList.add(this.config.inactiveLinkClass);

      if (this.availableLetters.has(letter)) {
        const firstItem = this.items.find((item) => item.letter === letter);
        link.setAttribute("href", `#${firstItem?.id || letter}`);
        link.classList.remove(this.config.inactiveLinkClass);
        link.classList.add(this.config.activeLinkClass);
      } else {
        link.removeAttribute("href");
        link.addEventListener("click", (e) => e.preventDefault());
      }

      fragment.appendChild(link);
    });

    container.appendChild(fragment);
  }

  reorganizeItemsByLetter() {
    if (this.items.length === 0) return;

    const container = this.items[0].element.parentElement;
    if (!container) return;

    // Store container reference for later use
    this.container = container;

    // Sort items alphabetically
    const sortedItems = [...this.items].sort((a, b) => {
      if (a.letter !== b.letter) return a.letter.localeCompare(b.letter);
      return a.title.localeCompare(b.title);
    });

    // Physically reorder items in the DOM (initial setup only)
    sortedItems.forEach((item) => container.removeChild(item.element));
    sortedItems.forEach((item) => container.appendChild(item.element));
    this.items = sortedItems;

    // Assign CSS order values for visual ordering
    // Each letter group gets: header (order N*1000), items (order N*1000 + 1, N*1000 + 2, etc.)
    const letterCounts = {};

    sortedItems.forEach((item) => {
      const letterIndex = item.letter.charCodeAt(0) - 64; // A=1, B=2, etc.
      letterCounts[item.letter] = (letterCounts[item.letter] || 0) + 1;
      item.element.style.order = letterIndex * 1000 + letterCounts[item.letter];
    });
  }

  displayLetterHeadlines() {
    const hiddenLetterElements = document.querySelectorAll(
      this.config.hiddenLetterSelector
    );
    const firstElement = hiddenLetterElements[0];
    const container = firstElement?.closest(
      this.config.itemSelector
    )?.parentElement;
    const gridColumnCount = container
      ? window.getComputedStyle(container).gridTemplateColumns.split(" ")
          .length || 2
      : 2;

    let isFirstLetter = true;
    hiddenLetterElements.forEach((element) => {
      const letter = element.getAttribute("data-letter");
      element.style.display = "none";
      if (!letter) return;

      if (!this.usedLetters.has(letter)) {
        this.usedLetters.add(letter);
        if (!isFirstLetter) this.createSpacer(element);
        this.createLetterSeparator(element, gridColumnCount);
        isFirstLetter = false;
      }
    });
  }

  createSpacer(element) {
    const parentItem = element.closest(this.config.itemSelector);
    if (!parentItem) return;

    const container = parentItem.parentElement;
    const letter = element.getAttribute("data-letter");
    if (!container || !letter) return;

    const spacer = document.createElement("div");
    spacer.classList.add(this.config.spacerClass);
    spacer.setAttribute("data-letter-spacer", letter);
    spacer.style.display = "none";

    this.letterSpacers.set(letter, spacer);
    container.insertBefore(spacer, parentItem);
  }

  createLetterSeparator(element, gridColumnCount = 2) {
    const parentItem = element.closest(this.config.itemSelector);
    if (!parentItem) return;

    const container = parentItem.parentElement;
    const letter = element.getAttribute("data-letter");
    if (!container || !letter) return;

    element.style.display = "none";

    const letterHeader = document.createElement("div");
    letterHeader.classList.add(this.config.letterSeparatorClass);
    letterHeader.textContent = letter;
    letterHeader.setAttribute("data-letter-header", letter);
    letterHeader.style.gridColumn = `span ${gridColumnCount}`;
    letterHeader.style.display = "flex";

    // Assign order value: letter index * 1000 (items get 1001, 1002, etc.)
    const letterIndex = letter.charCodeAt(0) - 64; // A=1, B=2, etc.
    letterHeader.style.order = letterIndex * 1000;

    this.letterHeaders.set(letter, letterHeader);
    container.insertBefore(letterHeader, parentItem);
  }

  initSearch() {
    const searchField = document.querySelector(this.config.searchFieldSelector);
    if (!searchField) return;

    // Listen to input events to reorganize after Finsweet filters
    searchField.addEventListener("input", () => {
      // Wait for Finsweet to apply its filtering, then reorganize
      setTimeout(() => {
        this.updateHeadersAfterFinsweetFilter();
      }, 100);
    });

    searchField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });

    // Observe Finsweet filtering changes with MutationObserver
    this.initFinsweetObserver();
  }

  initFinsweetObserver() {
    const container = this.items[0]?.element?.parentElement;
    if (!container) return;

    let debounceTimeout;
    const observer = new MutationObserver((mutations) => {
      // Check if any item visibility changed
      const hasVisibilityChange = mutations.some((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          return mutation.target.hasAttribute("data-glossary-item");
        }
        return false;
      });

      if (hasVisibilityChange) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          this.updateHeadersAfterFinsweetFilter();
        }, 50);
      }
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  }

  updateHeadersAfterFinsweetFilter() {
    const visibleLetters = new Set();
    const visibleItemsByLetter = new Map();

    // Detect which letters have visible items and collect them
    this.items.forEach((item) => {
      if (!this.isItemVisible(item)) return;

      visibleLetters.add(item.letter);
      if (!visibleItemsByLetter.has(item.letter)) {
        visibleItemsByLetter.set(item.letter, []);
      }
      visibleItemsByLetter.get(item.letter).push(item);
    });

    const container = this.container;
    if (!container) return;

    const gridColumnCount =
      window.getComputedStyle(container).gridTemplateColumns.split(" ")
        .length || 2;

    // Recalculate orders for visible items only
    // This ensures items fill the grid correctly when filtered
    const sortedVisibleLetters = Array.from(visibleLetters).sort();

    sortedVisibleLetters.forEach((letter, letterIdx) => {
      // Header gets order = (letterIdx + 1) * 1000
      const header = this.letterHeaders.get(letter);
      if (header) {
        header.style.display = "flex";
        header.style.gridColumn = `span ${gridColumnCount}`;
        header.style.order = (letterIdx + 1) * 1000;
      }

      // Items get order = (letterIdx + 1) * 1000 + position
      const items = visibleItemsByLetter.get(letter) || [];
      items.forEach((item, itemIdx) => {
        item.element.style.order = (letterIdx + 1) * 1000 + itemIdx + 1;
      });
    });

    // Hide headers for letters with no visible items
    const hiddenHeaders = [];
    const shownHeaders = [];
    this.letterHeaders.forEach((header, letter) => {
      if (!visibleLetters.has(letter)) {
        header.style.display = "none";
        hiddenHeaders.push(letter);
      } else {
        shownHeaders.push(letter);
      }
    });

    this.updateNavigationAfterSearch(visibleLetters);
  }

  isItemVisible(item) {
    if (!item?.element) return false;

    const computedStyle = window.getComputedStyle(item.element);
    const styleDisplay = item.element.style.display;
    const computedDisplay = computedStyle.display;
    const hasHiddenAttr = item.element.hasAttribute("fs-list-hidden");
    const rect = item.element.getBoundingClientRect();
    const hasSize = rect.width > 0 && rect.height > 0;

    return (
      styleDisplay !== "none" &&
      computedDisplay !== "none" &&
      !hasHiddenAttr &&
      hasSize
    );
  }

  initResponsive() {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.updateLetterHeadersGridSpan(), 150);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.updateLetterHeadersGridSpan(), 300);
    });
  }

  updateLetterHeadersGridSpan() {
    if (this.letterHeaders.size === 0) return;

    const firstHeader = this.letterHeaders.values().next().value;
    const container =
      firstHeader?.parentElement || this.items[0]?.element?.parentElement;
    if (!container) return;

    const columnCount =
      window.getComputedStyle(container).gridTemplateColumns?.split(" ")
        .length || 2;

    this.letterHeaders.forEach((header) => {
      if (header.style.display !== "none") {
        header.style.gridColumn = `span ${columnCount}`;
      }
    });
  }

  filterBySearch(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const visibleLetters = new Set();

    this.items.forEach((item) => {
      const matches =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch);
      item.element.style.display = matches ? "" : "none";
      if (matches) visibleLetters.add(item.letter);
    });

    const container = this.items[0]?.element?.parentElement;
    const gridColumnCount = container
      ? window.getComputedStyle(container).gridTemplateColumns.split(" ")
          .length || 2
      : 2;

    this.letterHeaders.forEach((header, letter) => {
      if (visibleLetters.has(letter)) {
        header.style.display = "flex";
        header.style.gridColumn = `span ${gridColumnCount}`;
      } else {
        header.style.display = "none";
      }
    });

    this.updateNavigationAfterSearch(visibleLetters);
  }

  updateNavigationAfterSearch(visibleLetters) {
    document.querySelectorAll("[data-letter-link]").forEach((link) => {
      const letter = link.getAttribute("data-letter-link");
      const linkElement = link.tagName === "A" ? link : link.querySelector("a");
      if (!linkElement) return;

      if (visibleLetters.has(letter)) {
        link.classList.remove(this.config.inactiveLinkClass);
        link.classList.add(this.config.activeLinkClass);

        const firstVisibleItem = this.items.find(
          (item) => item.letter === letter && this.isItemVisible(item)
        );

        if (firstVisibleItem?.id) {
          linkElement.setAttribute("href", `#${firstVisibleItem.id}`);
        } else {
          linkElement.removeAttribute("href");
        }
      } else {
        link.classList.remove(this.config.activeLinkClass);
        link.classList.add(this.config.inactiveLinkClass);
        linkElement.removeAttribute("href");
      }
    });
  }

  refresh() {
    this.items = [];
    this.availableLetters = new Set();
    this.usedLetters = new Set();
    this.letterHeaders.clear();
    this.letterSpacers.clear();

    const searchField = document.querySelector(this.config.searchFieldSelector);
    if (searchField) searchField.value = "";

    this.init();
  }

  getStats() {
    const distribution = {};
    this.items.forEach((item) => {
      distribution[item.letter] = (distribution[item.letter] || 0) + 1;
    });
    return {
      totalItems: this.items.length,
      uniqueLetters: this.availableLetters.size,
      letterDistribution: distribution,
    };
  }
}

// Initialize with Finsweet support
function initGlossaryFilter() {
  const hasFinsweetList = document.querySelector('[fs-list-element="list"]');

  if (hasFinsweetList) {
    let lastCount = 0;
    let attempts = 0;

    const checkItems = () => {
      attempts++;
      const currentCount = document.querySelectorAll(
        "[data-glossary-item]"
      ).length;

      if (currentCount > 100 && currentCount === lastCount) {
        window.glossaryFilter = new AlphabeticalFilter();
        return;
      }

      lastCount = currentCount;

      if (attempts < 60) {
        setTimeout(checkItems, 50);
      } else {
        window.glossaryFilter = new AlphabeticalFilter();
      }
    };

    setTimeout(checkItems, 50);
  } else {
    window.glossaryFilter = new AlphabeticalFilter();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlossaryFilter);
} else {
  initGlossaryFilter();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = AlphabeticalFilter;
}
