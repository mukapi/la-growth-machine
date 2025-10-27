// Swiper Testimonial Slider Configuration
// This script initializes a Swiper slider for testimonials with custom opacity effects

console.log('🚀 Swiper Testimonial Script: Starting to load...');

document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 Swiper Testimonial Script: DOM Content Loaded');
  
  // Check if Swiper is available
  if (typeof Swiper === 'undefined') {
    console.error('❌ Swiper Testimonial Script: Swiper library not found! Make sure to include Swiper CDN before this script.');
    return;
  }
  
  console.log('✅ Swiper Testimonial Script: Swiper library found');
  
  // Check if testimonial slider element exists
  const sliderElement = document.querySelector('.testimonial_slider');
  if (!sliderElement) {
    console.warn('⚠️ Swiper Testimonial Script: No element with class "testimonial_slider" found');
    return;
  }
  
  console.log('✅ Swiper Testimonial Script: Testimonial slider element found');
  
  // Initialisation de Swiper
  console.log('🎯 Swiper Testimonial Script: Initializing Swiper...');
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
        console.log('🎉 Swiper Testimonial Script: Swiper initialized successfully!');
        console.log('📊 Swiper Testimonial Script: Total slides:', this.slides.length);
        updateSlidesOpacity(this);
      },
      
      slideChange: function() {
        console.log('🔄 Swiper Testimonial Script: Slide changed to index:', this.activeIndex);
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
        console.log('✨ Swiper Testimonial Script: Slide', index, 'is now active (opacity: 1)');
      } else {
        slide.style.opacity = '0.5';
      }
    });
  }
  
  console.log('🎯 Swiper Testimonial Script: Setup complete!');
  
});
