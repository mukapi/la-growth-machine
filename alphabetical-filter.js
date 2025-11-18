/**
 * Alphabetical Filtering System for CMS Collection Lists
 * Version: 2.0 (Attribute-based)
 *
 * Usage:
 * Add these attributes to your Webflow elements:
 * - [data-glossary-item] - On each collection item wrapper
 * - [data-glossary-title] - On the element containing the title text
 * - [data-letter-anchor] - On the anchor element for scroll-to functionality
 * - [data-hidden-letter] - On the hidden letter element
 * - [data-links-container] - On the alphabet navigation container
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
      firstItemClass: config.firstItemClass || "glossary-first-item",
      ...config,
    };

    this.items = [];
    this.availableLetters = new Set();
    this.usedLetters = new Set();
    this.currentSearchTerm = "";
    this.letterHeaders = new Map(); // Store letter header elements for easy access
    this.letterSpacers = new Map(); // Store spacer elements for each letter

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
      console.log("✅ Alphabetical filter initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing alphabetical filter:", error);
    }
  }

  /**
   * Collect all glossary items from the DOM
   */
  collectItems() {
    const itemElements = document.querySelectorAll(this.config.itemSelector);

    itemElements.forEach((itemElement, index) => {
      const titleElement = itemElement.querySelector(this.config.titleSelector);

      if (!titleElement) {
        console.warn(`⚠️ No title element found for item at index ${index}`);
        return;
      }

      const title = titleElement.textContent.trim();
      const firstLetter = this.getFirstLetter(title);

      if (!firstLetter) {
        console.warn(`⚠️ Could not extract first letter from: "${title}"`);
        return;
      }

      this.items.push({
        element: itemElement,
        title: title,
        letter: firstLetter,
        titleElement: titleElement,
      });

      this.availableLetters.add(firstLetter);
    });

    console.log(
      `📋 Found ${this.items.length} items with ${this.availableLetters.size} unique letters`
    );
  }

  /**
   * Extract and normalize the first letter from a string
   */
  getFirstLetter(text) {
    if (!text || text.length === 0) return null;

    // Remove leading special characters and get first alphanumeric character
    const match = text.match(/[A-Za-z]/);
    return match ? match[0].toUpperCase() : null;
  }

  /**
   * Process each item: set anchors and data attributes
   */
  processItems() {
    // Track letter counts for unique IDs
    const letterCounts = {};

    this.items.forEach((item) => {
      // Check if the element itself has the attribute, otherwise search in descendants
      const anchorAttrName = "data-letter-anchor";
      const anchorElement = item.element.hasAttribute(anchorAttrName)
        ? item.element
        : item.element.querySelector(this.config.anchorSelector);

      const hiddenLetterAttrName = "data-hidden-letter";
      const hiddenLetterElement = item.element.hasAttribute(
        hiddenLetterAttrName
      )
        ? item.element
        : item.element.querySelector(this.config.hiddenLetterSelector);

      if (anchorElement) {
        // Create unique ID: letter + index (e.g., "S-0", "S-1", "T-0")
        letterCounts[item.letter] = (letterCounts[item.letter] || 0) + 1;
        const uniqueId = `${item.letter}-${letterCounts[item.letter] - 1}`;
        anchorElement.setAttribute("id", uniqueId);
        // Also add data-letter attribute for easy filtering
        anchorElement.setAttribute("data-letter", item.letter);
        // Store ID in item object for later use
        item.id = uniqueId;
        item.anchorElement = anchorElement;
      } else {
        console.warn(`⚠️ No anchor element found for: ${item.title}`);
      }

      if (hiddenLetterElement) {
        hiddenLetterElement.setAttribute("data-letter", item.letter);
        hiddenLetterElement.textContent = item.letter;
      } else {
        console.warn(`⚠️ No hidden letter element found for: ${item.title}`);
      }
    });
  }

  /**
   * Generate the alphabet (A-Z)
   */
  generateAlphabet() {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }

  /**
   * Create the alphabet navigation links
   * Uses template if available, otherwise creates links dynamically
   */
  createAlphabetNavigation() {
    const container = document.querySelector(
      this.config.linksContainerSelector
    );

    if (!container) {
      console.error("❌ Alphabet links container not found");
      return;
    }

    // Check if template exists
    const template = container.querySelector(this.config.linkTemplateSelector);

    if (template) {
      // Use template approach: clone template for each letter
      this.createLinksFromTemplate(container, template);
    } else {
      // Fallback: create links dynamically
      this.createLinksDynamically(container);
    }
  }

  /**
   * Create links by cloning a Webflow template
   */
  createLinksFromTemplate(container, template) {
    // Hide the template
    template.style.display = "none";

    // Clear existing links (but keep template)
    const existingLinks = container.querySelectorAll(
      "[data-letter-link]:not([data-letter-link-template])"
    );
    existingLinks.forEach((link) => link.remove());

    const alphabet = this.generateAlphabet();
    const fragment = document.createDocumentFragment();

    alphabet.forEach((letter) => {
      // Clone the template
      const linkClone = template.cloneNode(true);
      linkClone.removeAttribute("data-letter-link-template");
      linkClone.setAttribute("data-letter-link", letter);
      linkClone.style.display = ""; // Make visible

      // Find the text element inside (could be the link itself or a child)
      const textElement =
        linkClone.querySelector("[data-letter-text]") || linkClone;
      if (textElement) {
        textElement.textContent = letter;
      }

      // ALWAYS add is-inactive as base class first (combo class)
      linkClone.classList.add(this.config.inactiveLinkClass);

      // Set href and classes based on availability
      const linkElement =
        linkClone.tagName === "A" ? linkClone : linkClone.querySelector("a");
      if (linkElement) {
        if (this.availableLetters.has(letter)) {
          // Use first item's ID for this letter (e.g., "S-0")
          const firstItemForLetter = this.items.find(
            (item) => item.letter === letter
          );
          const hrefId = firstItemForLetter?.id || letter;
          linkElement.setAttribute("href", `#${hrefId}`);
          linkClone.classList.remove(this.config.inactiveLinkClass);
          if (this.config.activeLinkClass) {
            linkClone.classList.add(this.config.activeLinkClass);
          }
        } else {
          // Keep is-inactive, remove href, prevent click
          linkClone.classList.remove(this.config.activeLinkClass);
          linkElement.removeAttribute("href");
          linkElement.addEventListener("click", (e) => e.preventDefault());
        }
      }

      fragment.appendChild(linkClone);
    });

    container.appendChild(fragment);
    console.log("🔤 Alphabet navigation created from template");
  }

  /**
   * Create links dynamically (fallback)
   */
  createLinksDynamically(container) {
    // Try to find template to copy its classes - search in container and document
    let template = container.querySelector(this.config.linkTemplateSelector);
    if (!template) {
      // Also search in the whole document in case template is outside container
      template = document.querySelector(this.config.linkTemplateSelector);
    }

    const templateClasses = template ? Array.from(template.classList) : [];
    console.log("📋 Template found:", !!template, "Classes:", templateClasses);

    // Clear existing content (but keep template if it exists)
    if (template && template.parentElement === container) {
      template.style.display = "none";
      const existingLinks = container.querySelectorAll(
        "[data-letter-link]:not([data-letter-link-template])"
      );
      existingLinks.forEach((link) => link.remove());
    } else {
      // Only clear links, not the whole container (template might be there)
      const existingLinks = container.querySelectorAll("[data-letter-link]");
      existingLinks.forEach((link) => link.remove());
    }

    const alphabet = this.generateAlphabet();
    const fragment = document.createDocumentFragment();

    alphabet.forEach((letter) => {
      const link = document.createElement("a");
      link.textContent = letter;
      link.setAttribute("data-letter-link", letter);

      // ALWAYS copy ALL classes from template (except active/inactive states)
      if (templateClasses.length > 0) {
        templateClasses.forEach((cls) => {
          // Copy all classes except the state classes
          if (
            cls !== this.config.inactiveLinkClass &&
            cls !== this.config.activeLinkClass
          ) {
            link.classList.add(cls);
          }
        });
      }

      // ALWAYS add is-inactive as base class first (combo class)
      link.classList.add(this.config.inactiveLinkClass);

      // Then remove is-inactive and add active state if letter has results
      if (this.availableLetters.has(letter)) {
        // Use first item's ID for this letter (e.g., "S-0")
        const firstItemForLetter = this.items.find(
          (item) => item.letter === letter
        );
        const hrefId = firstItemForLetter?.id || letter;
        link.setAttribute("href", `#${hrefId}`);
        link.classList.remove(this.config.inactiveLinkClass);
        if (this.config.activeLinkClass) {
          link.classList.add(this.config.activeLinkClass);
        }
      } else {
        // Keep is-inactive, remove href, prevent click
        link.removeAttribute("href");
        link.addEventListener("click", (e) => e.preventDefault());
      }

      fragment.appendChild(link);
    });

    container.appendChild(fragment);
    console.log(
      "🔤 Alphabet navigation created dynamically",
      templateClasses.length > 0 ? "with template classes" : "without template"
    );
  }

  /**
   * Reorganize items by letter in alphabetical order
   */
  reorganizeItemsByLetter() {
    if (this.items.length === 0) return;

    // Get the container (parent of all items)
    const firstItem = this.items[0].element;
    const container = firstItem.parentElement;

    if (!container) {
      console.warn("⚠️ Could not find container to reorganize items");
      return;
    }

    // Sort items by letter, then by title
    const sortedItems = [...this.items].sort((a, b) => {
      if (a.letter !== b.letter) {
        return a.letter.localeCompare(b.letter);
      }
      return a.title.localeCompare(b.title);
    });

    // Remove all items from DOM
    sortedItems.forEach((item) => {
      container.removeChild(item.element);
    });

    // Re-insert items in sorted order
    sortedItems.forEach((item) => {
      container.appendChild(item.element);
    });

    // Update items array to match new order
    this.items = sortedItems;

    console.log("🔄 Items reorganized by letter");
  }

  /**
   * Display letter headlines for each group
   */
  displayLetterHeadlines() {
    const hiddenLetterElements = document.querySelectorAll(
      this.config.hiddenLetterSelector
    );

    // Get container and cache grid column count (performance optimization)
    const firstElement = hiddenLetterElements[0];
    const container = firstElement
      ? firstElement.closest(this.config.itemSelector)?.parentElement
      : null;
    const gridColumnCount = container
      ? window.getComputedStyle(container).gridTemplateColumns.split(" ")
          .length || 2
      : 2;

    // Single pass: hide all letters and create headers for first occurrence
    let isFirstLetter = true;
    hiddenLetterElements.forEach((element) => {
      const letter = element.getAttribute("data-letter");

      if (!letter) {
        element.style.display = "none";
        return;
      }

      // Hide all letters first
      element.style.display = "none";

      // Only create header for the first occurrence of each letter
      if (!this.usedLetters.has(letter)) {
        this.usedLetters.add(letter);

        // Create spacer before each letter group (except the first one)
        if (!isFirstLetter) {
          this.createSpacer(element);
        }

        this.createLetterSeparator(element, gridColumnCount);
        isFirstLetter = false;
      }
    });

    console.log(`🎯 Created ${this.usedLetters.size} letter separators`);
  }

  /**
   * Create a spacer div before a letter group
   */
  createSpacer(element) {
    // Find the parent container (where all items are)
    const parentItem = element.closest(this.config.itemSelector);
    if (!parentItem) return;

    const container = parentItem.parentElement;
    if (!container) return;

    // Get the letter for this spacer
    const letter = element.getAttribute("data-letter");
    if (!letter) return;

    // Create spacer div
    const spacer = document.createElement("div");
    spacer.classList.add(this.config.spacerClass);
    spacer.setAttribute("data-letter-spacer", letter); // For easy identification
    // Hide by default - user can style it in Webflow if needed
    spacer.style.display = "none";

    // Store spacer for easy access during filtering
    this.letterSpacers.set(letter, spacer);

    // Insert spacer before the first item of this letter group
    container.insertBefore(spacer, parentItem);
  }

  /**
   * Create a visual separator for letter groups WITHOUT absolute positioning
   * Creates a separate element that spans the full width of the grid
   */
  createLetterSeparator(element, gridColumnCount = 2) {
    const parentItem = element.closest(this.config.itemSelector);
    if (!parentItem) return;

    const container = parentItem.parentElement;
    if (!container) return;

    // Get the letter text
    const letter = element.getAttribute("data-letter");
    if (!letter) return;

    // Hide the original letter element (we'll create a new one)
    element.style.display = "none";

    // Create a new letter header element that will span full width
    const letterHeader = document.createElement("div");
    letterHeader.classList.add(this.config.letterSeparatorClass);
    letterHeader.textContent = letter;
    letterHeader.setAttribute("data-letter-header", letter); // For easy identification

    // Make it span all columns (use cached value for performance)
    letterHeader.style.gridColumn = `span ${gridColumnCount}`;
    letterHeader.style.display = "flex";

    // Store header for easy access during filtering
    this.letterHeaders.set(letter, letterHeader);

    // Insert the letter header before the first item of this group
    container.insertBefore(letterHeader, parentItem);
  }

  /**
   * Initialize the search functionality
   */
  initSearch() {
    const searchField = document.querySelector(this.config.searchFieldSelector);

    if (!searchField) {
      console.warn("⚠️ Search field not found, search functionality disabled");
      return;
    }

    // Listen for input events (live search)
    searchField.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();
      this.currentSearchTerm = searchTerm;
      this.filterBySearch(searchTerm);
    });

    // Also listen for Enter key to prevent form submission if needed
    searchField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });

    console.log("🔍 Search functionality initialized");
  }

  /**
   * Initialize responsive behavior (handle window resize)
   */
  initResponsive() {
    // Debounce function to limit resize event frequency
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateLetterHeadersGridSpan();
      }, 150); // Wait 150ms after resize stops
    };

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Also listen for orientation change (mobile)
    window.addEventListener("orientationchange", () => {
      // Small delay to ensure layout has recalculated
      setTimeout(() => {
        this.updateLetterHeadersGridSpan();
      }, 300);
    });

    console.log("📱 Responsive behavior initialized");
  }

  /**
   * Update grid-column span for all letter headers based on current grid layout
   */
  updateLetterHeadersGridSpan() {
    if (this.letterHeaders.size === 0) return;

    // Get container from first header or first item
    const firstHeader = this.letterHeaders.values().next().value;
    const container =
      firstHeader?.parentElement || this.items[0]?.element?.parentElement;

    if (!container) return;

    // Get current grid column count
    const gridColumns = window.getComputedStyle(container).gridTemplateColumns;
    const columnCount = gridColumns ? gridColumns.split(" ").length : 2;

    // Update all letter headers
    this.letterHeaders.forEach((header) => {
      // Only update if header is currently visible (respects search filter)
      if (header.style.display !== "none") {
        header.style.gridColumn = `span ${columnCount}`;
      }
    });

    console.log(
      `📱 Updated letter headers for ${columnCount} column(s) layout`
    );
  }

  /**
   * Normalize search term for comparison (case-insensitive, trim)
   */
  normalizeSearchTerm(term) {
    return term.toLowerCase().trim();
  }

  /**
   * Check if an item matches the search term
   */
  itemMatchesSearch(item, searchTerm) {
    if (!searchTerm) return true;

    const normalizedSearch = this.normalizeSearchTerm(searchTerm);
    const normalizedTitle = this.normalizeSearchTerm(item.title);

    // Check if title contains the search term
    return normalizedTitle.includes(normalizedSearch);
  }

  /**
   * Filter items by search term and update display
   */
  filterBySearch(searchTerm) {
    const normalizedSearch = this.normalizeSearchTerm(searchTerm);
    const visibleLetters = new Set();
    let visibleItemsCount = 0;

    // Filter items and track visible letters
    this.items.forEach((item) => {
      const matches = this.itemMatchesSearch(item, searchTerm);
      const itemElement = item.element;

      if (matches) {
        // Show item
        itemElement.style.display = "";
        visibleLetters.add(item.letter);
        visibleItemsCount++;
      } else {
        // Hide item
        itemElement.style.display = "none";
      }
    });

    // Update letter headers visibility and grid span
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

    // Update navigation links based on visible letters
    this.updateNavigationAfterSearch(visibleLetters);

    // Log search results
    if (normalizedSearch) {
      console.log(
        `🔍 Search "${searchTerm}": ${visibleItemsCount} results, ${visibleLetters.size} letters`
      );
    } else {
      console.log("🔍 Search cleared, showing all items");
    }
  }

  /**
   * Update alphabet navigation links based on search results
   */
  updateNavigationAfterSearch(visibleLetters) {
    const navLinks = document.querySelectorAll("[data-letter-link]");

    navLinks.forEach((link) => {
      const letter = link.getAttribute("data-letter-link");
      const linkElement = link.tagName === "A" ? link : link.querySelector("a");

      if (!linkElement) return;

      if (visibleLetters.has(letter)) {
        // Letter has visible items - make link active
        link.classList.remove(this.config.inactiveLinkClass);
        link.classList.add(this.config.activeLinkClass);

        // Find first visible item for this letter
        const firstVisibleItem = this.items.find(
          (item) =>
            item.letter === letter && item.element.style.display !== "none"
        );

        if (firstVisibleItem && firstVisibleItem.id) {
          linkElement.setAttribute("href", `#${firstVisibleItem.id}`);
        } else {
          linkElement.removeAttribute("href");
        }
      } else {
        // Letter has no visible items - make link inactive
        link.classList.remove(this.config.activeLinkClass);
        link.classList.add(this.config.inactiveLinkClass);
        linkElement.removeAttribute("href");
      }
    });
  }

  /**
   * Refresh the filter (useful for dynamic content)
   */
  refresh() {
    console.log("🔄 Refreshing alphabetical filter...");
    this.items = [];
    this.availableLetters = new Set();
    this.usedLetters = new Set();
    this.currentSearchTerm = "";
    this.letterHeaders.clear();
    this.letterSpacers.clear();

    // Clear search field if it exists
    const searchField = document.querySelector(this.config.searchFieldSelector);
    if (searchField) {
      searchField.value = "";
    }

    this.init();
  }

  /**
   * Get statistics about the current filter state
   */
  getStats() {
    return {
      totalItems: this.items.length,
      uniqueLetters: this.availableLetters.size,
      letterDistribution: this.getLetterDistribution(),
    };
  }

  /**
   * Get the distribution of items per letter
   */
  getLetterDistribution() {
    const distribution = {};
    this.items.forEach((item) => {
      distribution[item.letter] = (distribution[item.letter] || 0) + 1;
    });
    return distribution;
  }
}

// Auto-initialize when Finsweet CMS Load completes (or DOM ready as fallback)
function initGlossaryFilter() {
  // Check if Finsweet Attributes is being used
  const hasFinsweetList = document.querySelector('[fs-list-element="list"]');

  if (hasFinsweetList) {
    // Wait for Finsweet to load all items
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      'cmsload',
      (listInstances) => {
        console.log('📦 Finsweet CMS Load detected, waiting for all items...');

        // Get the first list instance (or handle multiple if needed)
        const [listInstance] = listInstances;

        if (listInstance) {
          // Wait for all items to be loaded
          listInstance.on('renderitems', (renderedItems) => {
            // Small delay to ensure DOM is fully updated
            setTimeout(() => {
              console.log(`📦 Finsweet loaded ${renderedItems.length} items`);
              window.glossaryFilter = new AlphabeticalFilter();
            }, 100);
          });
        } else {
          // Fallback if no list instance
          console.log('📦 No Finsweet list instance found, initializing anyway...');
          window.glossaryFilter = new AlphabeticalFilter();
        }
      },
    ]);
  } else {
    // No Finsweet, initialize immediately
    console.log('📦 No Finsweet detected, initializing immediately...');
    window.glossaryFilter = new AlphabeticalFilter();
  }
}

// Start initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlossaryFilter);
} else {
  initGlossaryFilter();
}

// Export for manual initialization if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = AlphabeticalFilter;
}
