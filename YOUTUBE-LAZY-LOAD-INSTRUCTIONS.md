# 🎥 YouTube Lazy Load - Instructions d'implémentation

## 📋 Ce qu'on va faire

Remplacer la vidéo YouTube par un système de lazy loading :
- ✅ **Thumbnail YouTube** au chargement (image légère ~50KB au lieu de ~2MB)
- ✅ **Bouton Play** stylé YouTube par-dessus la thumbnail
- ✅ La vidéo ne se charge QUE quand l'utilisateur clique sur la thumbnail
- ✅ La vidéo démarre automatiquement (autoplay)
- ✅ Performance maximale (meilleur score Lighthouse)

---

## 🔧 Étapes dans Webflow (SUPER SIMPLE !)

### 1️⃣ Sur le bouton qui ouvre la modal

**Sur l'élément `hero-home_lightbox_hidden` (le bouton "Watch a short demo") :**

1. Sélectionne l'élément dans le Designer
2. Panneau Settings (⚙️) → **Custom Attributes**
3. Ajoute un attribut :
   - **Name:** `data-youtube-trigger`
   - **Value:** (laisser vide)

### 2️⃣ Sur le container de la vidéo dans la modal

**Dans ta modal, sur l'élément qui contient actuellement l'iframe YouTube :**

1. Sélectionne l'élément `.hero-modal_iframe` (celui qui contient l'iframe YouTube)
2. **SUPPRIME l'iframe YouTube existante** à l'intérieur (important !)
3. Laisse juste une **div vide**
4. Panneau Settings (⚙️) → **Custom Attributes**
5. Ajoute un attribut :
   - **Name:** `data-youtube-container`
   - **Value:** (laisser vide)

> **💡 Pas besoin de CSS !**
> Le script gère automatiquement le ratio 16:9 et tous les styles nécessaires.

### 3️⃣ Ajouter le script JavaScript

**Dans Webflow :**

1. Va dans **Project Settings** (⚙️ en haut à gauche)
2. Onglet **Custom Code**
3. Dans **Footer Code** (section "Before `</body>` tag"), copie-colle ce code :

```html
<script>
// Copie tout le contenu du fichier youtube-lazy-load.js ici
// Ou utilise le lien direct (si le repo GitHub est public) :
</script>
<script src="https://raw.githubusercontent.com/TON-USERNAME/la-growth-machine/master/youtube-lazy-load.js"></script>
```

> **💡 Conseil :** Il vaut mieux copier-coller tout le contenu du fichier `youtube-lazy-load.js` directement entre les balises `<script></script>` pour éviter les problèmes de cache et de chargement externe.

### 4️⃣ Publier et tester

1. **Publie** ton site Webflow
2. Ouvre la page en navigation privée (pour tester sans cache)
3. Ouvre la console du navigateur (F12)
4. Tu devrais voir : `"YouTube lazy load initialized"`
5. Clique sur le lightbox
6. La vidéo YouTube doit se charger et démarrer automatiquement

---

## 🐛 Debugging

### Le script ne s'initialise pas

**Dans la console, tu vois :**
```
YouTube lazy load: Trigger not found
```

→ Vérifie que l'attribut `data-youtube-trigger` est bien sur l'élément qui déclenche la modal

**Dans la console, tu vois :**
```
YouTube lazy load: Container not found
```

→ Vérifie que l'attribut `data-youtube-container` est bien sur le div qui doit contenir la vidéo

### La vidéo ne se charge pas

1. Ouvre la console (F12)
2. Clique sur le lightbox
3. Regarde s'il y a des erreurs
4. Vérifie que tu vois : `"YouTube video loaded successfully"`

### Debug manuel

Dans la console, tu peux tester manuellement :

```javascript
// Vérifier si le script est chargé
console.log(window.YouTubeLazyLoad);

// Charger manuellement la vidéo
YouTubeLazyLoad.load();

// Vérifier si la vidéo est chargée
YouTubeLazyLoad.isLoaded();

// Réinitialiser la vidéo
YouTubeLazyLoad.reset();
```

---

## ⚙️ Configuration avancée

Tu peux modifier la configuration dans `youtube-lazy-load.js` :

```javascript
const CONFIG = {
  videoId: 'lRE9TmJTXqI',        // ID de la vidéo YouTube
  autoplay: true,                  // Démarrage automatique
  triggerSelector: '[data-youtube-trigger]',
  containerSelector: '[data-youtube-container]',
  quality: 'hd720'                // Qualité par défaut
};
```

### Options supplémentaires YouTube

Tu peux ajouter d'autres paramètres dans l'URL :
- `controls=0` : Masquer les contrôles
- `loop=1` : Lire en boucle
- `mute=1` : Démarrer en mode muet
- `start=30` : Démarrer à 30 secondes

Modifie la section `params` dans la fonction `createYouTubeIframe()`.

---

## 🎯 Avantages de cette solution

✅ **Performance** : La page charge ~2MB de moins au démarrage
✅ **Bande passante** : Économie pour les utilisateurs qui ne regardent pas la vidéo
✅ **Core Web Vitals** : Meilleur score Lighthouse
✅ **User Experience** : Vidéo démarre immédiatement au clic
✅ **Maintenable** : Code propre et commenté
✅ **Sécurisé** : Pas d'injection de contenu non-sanitisé

---

## 🔄 Si tu veux réinitialiser la vidéo à chaque fermeture de modal

Décommente cette section dans le script :

```javascript
const modal = document.querySelector('.hero-modal_wrap');
if (modal) {
  const closeButtons = modal.querySelectorAll('[data-modal-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', resetVideo);
  });
}
```

Et ajoute l'attribut `data-modal-close` sur le bouton de fermeture de ta modal.

---

## 📞 Questions ?

Si quelque chose ne marche pas :
1. Vérifie les attributs `data-youtube-trigger` et `data-youtube-container`
2. Regarde la console pour les erreurs
3. Vérifie que le script est bien chargé (Footer Code dans Webflow)

**Bon code ! 🚀**
