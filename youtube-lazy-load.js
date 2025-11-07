/**
 * YouTube Lazy Load for Webflow Modal with Thumbnail Placeholder
 * Affiche une image thumbnail, charge la vidéo YouTube uniquement au clic
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    videoId: 'lRE9TmJTXqI',
    triggerSelector: '[data-youtube-trigger]', // Attribut sur le bouton qui ouvre la modal
    containerSelector: '[data-youtube-container]', // Attribut sur le container de la vidéo
    closeSelector: '[data-youtube-close]', // Attribut sur les éléments qui ferment la modal
    autoplay: true, // Lancer automatiquement la vidéo
    thumbnailQuality: 'maxresdefault', // maxresdefault, hqdefault, mqdefault
    showPlayButton: true // Afficher un bouton play sur la thumbnail
  };

  // État pour éviter de charger plusieurs fois
  let isVideoLoaded = false;

  /**
   * Crée et retourne un iframe YouTube configuré
   */
  function createYouTubeIframe() {
    const iframe = document.createElement('iframe');

    // Construction de l'URL avec les paramètres
    const params = new URLSearchParams({
      autoplay: CONFIG.autoplay ? '1' : '0',
      si: 'UewAidRvr3V05cp8',
      rel: '0', // Ne pas montrer de vidéos suggérées d'autres chaînes
      modestbranding: '1' // Logo YouTube discret
    });

    // Configuration de l'iframe
    iframe.src = `https://www.youtube.com/embed/${CONFIG.videoId}?${params.toString()}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    // Styles pour une meilleure intégration
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    return iframe;
  }

  /**
   * Crée l'image thumbnail YouTube avec bouton Play optionnel
   */
  function createThumbnail() {
    // Container pour la thumbnail
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.className = 'youtube-thumbnail-wrapper';
    thumbnailWrapper.style.cssText = `
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      cursor: pointer;
      overflow: hidden;
      background: #000;
    `;

    // Image thumbnail
    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${CONFIG.videoId}/${CONFIG.thumbnailQuality}.jpg`;
    img.alt = 'YouTube video thumbnail';
    img.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;

    thumbnailWrapper.appendChild(img);

    // Bouton Play optionnel
    if (CONFIG.showPlayButton) {
      const playButton = document.createElement('div');
      playButton.className = 'youtube-play-button';
      playButton.innerHTML = `
        <svg width="68" height="48" viewBox="0 0 68 48" fill="none">
          <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"/>
          <path d="M 45,24 27,14 27,34" fill="#fff"/>
        </svg>
      `;
      playButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease;
        pointer-events: none;
      `;

      thumbnailWrapper.appendChild(playButton);

      // Animation hover
      thumbnailWrapper.addEventListener('mouseenter', () => {
        playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
      });

      thumbnailWrapper.addEventListener('mouseleave', () => {
        playButton.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    }

    // Clic sur la thumbnail charge la vidéo
    thumbnailWrapper.addEventListener('click', loadYouTubeVideo);

    return thumbnailWrapper;
  }

  /**
   * Charge la vidéo YouTube dans le container
   */
  function loadYouTubeVideo() {
    // Si déjà chargé, on ne fait rien
    if (isVideoLoaded) {
      return;
    }

    const container = document.querySelector(CONFIG.containerSelector);

    if (!container) {
      return;
    }

    // Vérifier si l'iframe n'existe pas déjà
    if (container.querySelector('iframe')) {
      isVideoLoaded = true;
      return;
    }

    // Vider le container (enlever la thumbnail)
    container.innerHTML = '';

    // Créer un wrapper pour l'iframe avec ratio 16:9
    const iframeWrapper = document.createElement('div');
    iframeWrapper.style.cssText = `
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
    `;

    // Créer et ajouter l'iframe
    const iframe = createYouTubeIframe();
    iframeWrapper.appendChild(iframe);
    container.appendChild(iframeWrapper);

    isVideoLoaded = true;
  }

  /**
   * Réinitialise la vidéo (utile si la modal se ferme/rouvre)
   */
  function resetVideo() {
    const container = document.querySelector(CONFIG.containerSelector);
    if (container) {
      container.innerHTML = ''; // Vide le container

      // Remet la thumbnail
      const thumbnail = createThumbnail();
      container.appendChild(thumbnail);

      isVideoLoaded = false;
    }
  }

  /**
   * Initialise la thumbnail au chargement de la page
   */
  function initThumbnail() {
    const container = document.querySelector(CONFIG.containerSelector);

    if (!container) {
      console.warn('YouTube lazy load: Container not found. Add data-youtube-container attribute to your video container.');
      return;
    }

    // Vider l'iframe existante si présente
    container.innerHTML = '';

    // Ajouter la thumbnail
    const thumbnail = createThumbnail();
    container.appendChild(thumbnail);
  }

  /**
   * Initialisation au chargement du DOM
   */
  function init() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialiser la thumbnail
    initThumbnail();

    // Écouter le clic sur le trigger pour charger la vidéo immédiatement
    const trigger = document.querySelector(CONFIG.triggerSelector);
    if (trigger) {
      trigger.addEventListener('click', () => {
        // Charger la vidéo avec un petit délai pour laisser la modal s'ouvrir
        setTimeout(() => {
          loadYouTubeVideo();
        }, 300); // 300ms pour que l'animation Webflow se termine
      });
    }

    // Écouter les clics sur tous les boutons de fermeture
    const closeButtons = document.querySelectorAll(CONFIG.closeSelector);
    if (closeButtons.length > 0) {
      closeButtons.forEach(closeButton => {
        closeButton.addEventListener('click', () => {
          // Réinitialiser la vidéo avec un petit délai pour laisser la modal se fermer
          setTimeout(() => {
            resetVideo();
          }, 300); // 300ms pour que l'animation Webflow se termine
        });
      });
    }
  }

  // Lancer l'initialisation
  init();

  // Exposer des fonctions publiques si nécessaire (pour debug ou contrôle manuel)
  window.YouTubeLazyLoad = {
    load: loadYouTubeVideo,
    reset: resetVideo,
    isLoaded: () => isVideoLoaded
  };

})();
