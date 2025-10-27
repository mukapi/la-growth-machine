// Swiper Testimonial Slider Configuration
// This script initializes a Swiper slider for testimonials with custom opacity effects

document.addEventListener('DOMContentLoaded', function() {
  
  // Initialisation de Swiper
  const swiper = new Swiper('.testimonial_slider', {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 0,
    touchEventsTarget: 'container',
    simulateTouch: true,
    freeMode: false,
    loop: false,
    grabCursor: true,
    speed: 400,
    
    keyboard: {
      enabled: true,
    },
    
    mousewheel: {
      forceToAxis: true,
    },
    
    // Navigation avec flèches personnalisées
    navigation: {
      nextEl: '[data-slider-arrow="next"]',
      prevEl: '[data-slider-arrow="prev"]',
    },
    
    // Gestion de l'opacité des slides
    on: {
      init: function() {
        updateSlidesOpacity(this);
      },
      
      slideChange: function() {
        updateSlidesOpacity(this);
      },
      
      sliderMove: function() {
        updateSlidesOpacity(this);
      },
      
      touchMove: function() {
        updateSlidesOpacity(this);
      }
    }
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
  
});
