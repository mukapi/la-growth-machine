// Swiper Testimonial Slider Configuration
// This script initializes a Swiper slider for testimonials with custom opacity effects

document.addEventListener('DOMContentLoaded', function () {
  // Check if Swiper is available
  if (typeof Swiper === 'undefined') {
    console.error(
      '❌ Swiper Testimonial Script: Swiper library not found! Make sure to include Swiper CDN before this script.'
    );
    return;
  }

  // Check if testimonial slider element exists
  const sliderElement = document.querySelector('.testimonial_slider');
  if (!sliderElement) {
    console.warn('⚠️ Swiper Testimonial Script: No element with class "testimonial_slider" found');
    return;
  }

  // Calculate slidesOffsetAfter based on viewport width
  // Only apply offset on desktop (992px and above) to ensure last slide is reachable
  // On mobile/tablet, keep it at 0 for natural scrolling behavior
  const isDesktop = window.innerWidth >= 992;
  const offsetAfter = isDesktop ? window.innerWidth * 0.6 : 0;

  // Initialisation de Swiper
  const swiper = new Swiper('.testimonial_slider', {
    direction: 'horizontal',
    slidesPerView: 'auto', // Use auto to maintain original slide widths
    spaceBetween: 0, // No space between slides (handled by CSS margins)
    touchEventsTarget: 'container',
    simulateTouch: true,
    freeMode: false,
    loop: false,
    grabCursor: true,
    speed: 400,

    // Keep slides left-aligned (not centered)
    centeredSlides: false,

    // Add offset after the last slide to ensure it can become active
    // Only on desktop (992px+) - creates space so the last slide can be navigated to
    slidesOffsetAfter: offsetAfter,

    keyboard: {
      enabled: true,
    },

    mousewheel: {
      forceToAxis: true,
    },

    // Force Swiper to treat each slide individually
    slidesPerGroup: 1,

    // Navigation with custom arrows
    navigation: {
      nextEl: '[data-slider-arrow="next"]',
      prevEl: '[data-slider-arrow="prev"]',
    },

    // Event handlers
    on: {
      init: function () {
        updateSlidesOpacity(this);
        fixNavigationButtons(this);
      },
      slideChange: function () {
        updateSlidesOpacity(this);
        fixNavigationButtons(this);
      },
      reachEnd: function () {
        fixNavigationButtons(this);
      },
      reachBeginning: function () {
        fixNavigationButtons(this);
      },
    },
  });

  // Fonction pour gérer l'opacité des slides
  // Slide active = opacité 1, autres slides = opacité 0.5
  function updateSlidesOpacity(swiperInstance) {
    swiperInstance.slides.forEach((slide, index) => {
      if (index === swiperInstance.activeIndex) {
        slide.style.opacity = '1';
      } else {
        slide.style.opacity = '0.5';
      }
    });
  }

  // Fix navigation buttons - enable/disable based on actual slide index, not Swiper's calculation
  function fixNavigationButtons(swiperInstance) {
    const nextButton = document.querySelector('[data-slider-arrow="next"]');
    const prevButton = document.querySelector('[data-slider-arrow="prev"]');

    if (nextButton) {
      // Enable next button if we're not at the ACTUAL last slide
      if (swiperInstance.activeIndex < swiperInstance.slides.length - 1) {
        nextButton.classList.remove('swiper-button-disabled');
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.opacity = '1';
      } else {
        nextButton.classList.add('swiper-button-disabled');
        nextButton.style.pointerEvents = 'none';
        nextButton.style.opacity = '0.35';
      }
    }

    if (prevButton) {
      // Enable prev button if we're not at the first slide
      if (swiperInstance.activeIndex > 0) {
        prevButton.classList.remove('swiper-button-disabled');
        prevButton.style.pointerEvents = 'auto';
        prevButton.style.opacity = '1';
      } else {
        prevButton.classList.add('swiper-button-disabled');
        prevButton.style.pointerEvents = 'none';
        prevButton.style.opacity = '0.35';
      }
    }
  }

  // Handle window resize to update slidesOffsetAfter
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentIsDesktop = window.innerWidth >= 992;
      const currentOffsetAfter = currentIsDesktop ? window.innerWidth * 0.6 : 0;

      // Only update if the desktop state changed or if we're on desktop and width changed significantly
      if (swiper && swiper.params.slidesOffsetAfter !== currentOffsetAfter) {
        swiper.params.slidesOffsetAfter = currentOffsetAfter;
        swiper.update(); // Recalculate Swiper with new offset
        updateSlidesOpacity(swiper);
        fixNavigationButtons(swiper);
      }
    }, 250); // Wait 250ms after resize stops
  });
});
