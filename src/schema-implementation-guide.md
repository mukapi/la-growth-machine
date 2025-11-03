# Schema.org - Guide Simple

**Page** : `https://pprod-lagrowthmachine.webflow.io/glossary`  
**Dernière vérification** : Chrome DevTools - 2025-10-31 17:06

---

## 📊 ÉTAT ACTUEL

| Élément                                | État | Détails                                   |
| -------------------------------------- | ---- | ----------------------------------------- |
| **Page Head** (link + meta)            | ✅   | **Déjà fait !** Via JSON-LD dans le head  |
| **`<main>` wrapper**                   | ✅   | Déjà fait                                 |
| **H1 heading**                         | ✅   | Déjà fait                                 |
| **ItemList** (base schema)             | ✅   | Déjà fait                                 |
| **Infos liste** (name + numberOfItems) | ✅   | **Trouvé !** Dans embed avant listing     |
| **Collection List Items** (schema)     | ✅   | **Trouvé !** 100/116 items avec attributs |
| **Lien** (itemprop url)                | ✅   | **Trouvé !** 100/116 liens avec itemprop  |

---

## 1. Page Head Code ✅ DÉJÀ FAIT

**✅ Pas besoin d'ajouter** : Tu as déjà un schema JSON-LD dans le head avec le WebPage qui contient `name`, `description` et `url`. C'est équivalent aux balises microdata qu'on voulait ajouter.

**Note** : Si tu veux quand même ajouter les balises microdata pour être 100% cohérent avec le reste (optionnel) :

```html
<link itemprop="url" href="https://pprod-lagrowthmachine.webflow.io/glossary" />
<meta
  itemprop="description"
  content="Explore our Business & Sales Glossary to understand key terms used in B2B growth, prospecting, and revenue operations. Clear definitions, examples, and resources to level up your sales game."
/>
```

---

## 2. Infos de la liste (name + numberOfItems)

**Où** : Dans la section avant le Collection List, ajoutez un HTML Embed avec :

```html
<span itemprop="name" style="display:none;">Glossary of Business & Sales Terms</span>
<span itemprop="numberOfItems" style="display:none;">116</span>
```

---

## 3. Collection List Item Template

**Où** : Sélectionnez le template du Collection List Item (le div qui se répète)

### 3.1. Sur le div `w-dyn-item` → Custom Attributes :

- `itemscope` (vide)
- `itemtype` = `https://schema.org/ListItem`
- `itemprop` = `itemListElement`

### 3.2. Position → EN SUSPENS

**Optionnel** : Les positions (`itemprop="position"`) ne sont pas essentielles pour que le schema fonctionne. Si tu veux les ajouter manuellement plus tard, tu peux mettre un span dans chaque item avec le numéro (1, 2, 3...), mais ce n'est pas prioritaire.

### 3.3. Sur le lien `<a>` → Custom Attribute :

- `itemprop` = `url`

---

## ✅ Checklist

- [x] Head Code (déjà fait via JSON-LD) ✅
- [x] 2 spans (name + numberOfItems) ajoutés avant Collection List ✅
- [x] Custom Attributes sur le div template (`itemscope`, `itemtype="ListItem"`, `itemprop="itemListElement"`) ✅
- [x] `itemprop="url"` sur le lien dans le template ✅
- [ ] Positions (optionnel, en suspens)

---

## 🔍 Test

- Google Rich Results : https://search.google.com/test/rich-results
- Schema Validator : https://validator.schema.org/
