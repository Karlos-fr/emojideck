Oui, il y a un bon petit projet à faire ici. J’ai regardé le site actuel et je pense qu’il faut **reprendre son idée, pas son architecture ni son interface**.

Le site annonce actuellement **3 953 emojis**, avec recherche, catégories et support de l’Unicode 17.0. Il propose déjà six langues — anglais, allemand, français, italien, espagnol et portugais. ([EmojiKeyboard.top][1]) Le problème est qu’il pousse quasiment tout dans une immense page : les catégories classiques, les drapeaux, puis des centaines de variantes pour **chacune des cinq teintes de peau**, suivies des variantes mixtes. ([EmojiKeyboard.top][1])

Donc je ne mettrais pas toute la responsabilité sur les pubs : **la conception elle-même est lourde**.

### Ce que je ferais

Je partirais d'un principe beaucoup plus proche d'un vrai **emoji picker** que d'un annuaire Web.

L'écran principal pourrait ressembler à ça :

```text
┌──────────────────────────────────────────────────────┐
│  😀 Emoji Keyboard          🔍 Rechercher...  ☀️  FR │
├──────────────────────────────────────────────────────┤
│  🕘  😀  👋  🐶  🍕  ⚽  🚗  💡  ❤️  🚩             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Récents                                             │
│  😂 ❤️ 👍 🔥 😅 🎉 👌 🚀                             │
│                                                      │
│  Visages                                             │
│  😀 😃 😄 😁 😆 😅 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 ... │
│                                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
       Cliquer → copie                 ✓ Copié 😂
```

Et surtout, je ne rendrais **que la catégorie affichée**. Les variantes de peau ne seraient jamais des catégories de 300 emojis comme sur EmojiKeyboard.top : un appui long, un clic secondaire ou une petite flèche sur `👍` ferait apparaître :

`👍 👍🏻 👍🏼 👍🏽 👍🏾 👍🏿`

Ça supprime énormément de bruit.

### Les fonctions que je garderais/ajouterais

| Fonction                     | Mon choix                                               |
| ---------------------------- | ------------------------------------------------------- |
| 🌗 Dark / Light              | Oui + mode **System**                                   |
| 🌍 Multilingue               | Oui                                                     |
| Détection langue             | `navigator.languages`                                   |
| Langue choisie manuellement  | `localStorage` et prioritaire sur la détection          |
| 🕘 Emojis récents            | Oui, indispensable                                      |
| ⭐ Favoris                    | Oui                                                     |
| 🔍 Recherche                 | Oui, mais recherche **dans la langue de l'utilisateur** |
| 🎨 Teinte de peau par défaut | Oui, enregistrée localement                             |
| Catégories                   | Oui, avec barre sticky                                  |
| Copier au clic               | Oui                                                     |
| Feedback                     | petit `✓ Copié` discret                                 |
| Navigation clavier           | Oui                                                     |
| Offline                      | Oui, PWA                                                |
| Backend / compte             | **Non**                                                 |
| Cookies                      | **Non**                                                 |
| Tracking                     | idéalement aucun                                        |
| Publicités                   | évidemment aucune                                       |

Il y a surtout **trois fonctions que je considère plus importantes que le dark mode**.

La première, ce sont les **récents**. Sur un clavier emoji, une grande partie des gens utilisent toujours les mêmes 15 ou 20 emojis. Après quelques utilisations, on ne devrait pratiquement plus avoir besoin de parcourir les catégories.

La deuxième, ce sont les **favoris**. Un clic droit/appui long → ⭐ permettrait de constituer une petite collection personnelle.

La troisième est une bonne **recherche multilingue**. Si le site est en français :

`rire` → 😂 🤣 😆
`coeur` ou `cœur` → ❤️ 🩷 💕 💖
`voiture` → 🚗 🚙 🏎️
`feu` → 🔥 🚒 🧯

C'est beaucoup plus intéressant que simplement traduire « Faces and Emotions » en « Visages et émotions ».

### Pour le multilingue, je ferais autrement qu'EmojiKeyboard.top

Le contenu Unicode est universel ; ce sont surtout les **noms, mots-clés et textes de l'interface** qui doivent être localisés.

Je m'appuierais directement sur les données **Unicode CLDR**, qui fournissent justement les noms et mots-clés localisés des emojis. Ça évite de maintenir toi-même une énorme table `😂 = rire, larmes, drôle...`.

Et j'appliquerais cette priorité :

```text
langue choisie par l'utilisateur
        ↓
localStorage
        ↓
navigator.languages
        ↓
anglais
```

Même principe pour le thème :

```text
choix utilisateur
        ↓
localStorage
        ↓
prefers-color-scheme
```

C'est simple et sans compte utilisateur.

### Une idée que j'ajouterais : « Composer »

Ce serait facultatif.

Normalement :

`clic 😂` → copie immédiatement `😂`

Mais avec un bouton **Composer**, les clics alimenteraient une petite barre :

```text
┌──────────────────────────────────────────┐
│ 😂 👍🏻 🔥 🚀                       Copier │
└──────────────────────────────────────────┘
```

Pratique pour préparer `😂😂😂❤️🔥` sans jongler avec le presse-papiers.

Je ne l'activerais **pas par défaut**, car sinon on perd le côté ultrarapide.

### Et je simplifierais fortement la page

EmojiKeyboard.top ressemble aussi beaucoup à une page faite pour capter du trafic SEO : après plusieurs milliers d'emojis, il remet encore un gros bloc promotionnel expliquant qu'il contient des milliers d'emojis et les nouveautés Unicode. ([EmojiKeyboard.top][1])

Pour ton clone, je ferais quasiment une **web-app plein écran** :

**Header → recherche → catégories → grille.**

Rien d'autre.

Sur desktop : grille dense avec emojis assez gros.

Sur mobile : barre de catégories horizontalement scrollable, recherche sticky, grille occupant pratiquement tout l'écran.

### Techniquement, ça pourrait être ridiculement léger

Je ne mettrais même pas forcément React.

**TypeScript + Vite** suffirait largement. Éventuellement Preact si tu veux structurer les composants.

Les données Unicode/CLDR seraient transformées au build :

```text
Unicode / CLDR
      ↓
script build
      ↓
emoji-fr.json
emoji-en.json
emoji-de.json
...
```

Et les langues seraient chargées à la demande.

Donc quelqu'un en français ne télécharge pas les index de recherche espagnol, allemand, italien, etc.

Avec virtualisation ou rendu uniquement de la catégorie active, **3 953 emojis ne représentent absolument pas un problème de performances**.

### Il y a aussi un petit détail UX que j'aimerais beaucoup

Quand tu survoles :

```text
        😂
Larmes de joie
```

et éventuellement :

```text
😂
Visage avec des larmes de joie
:larmes-de-joie:
U+1F602
```

Mais **pas une popup énorme** : une tooltip discrète.

Ça rend le site utile également pour comprendre ce qu'est un emoji.

---

Je verrais donc le projet comme :

> **« le clavier emoji que j'aimerais avoir quand je cherche juste un emoji et que je veux le copier en deux secondes. »**

Et pas comme un clone strict d'EmojiKeyboard.top.

Je mettrais même comme objectifs techniques : **100 % statique, zéro backend, zéro cookie, zéro pub, utilisable hors ligne, < 100 Ko de JS applicatif hors données Unicode**. Ça lui donnerait une vraie identité et expliquerait immédiatement pourquoi il existe.

Et je trouve particulièrement important de **ne pas reproduire leurs énormes catégories de variantes de peau** : c'est probablement le changement d'UX qui ferait le plus de différence. ([EmojiKeyboard.top][1])

Pour le développement, le plugin Superpowers que tu viens de connecter peut aussi servir à transformer ça en architecture/MVP puis à attaquer l'implémentation.

[1]: https://emojikeyboard.top/ "😍 Online Emoji Keyboard: Copy & Paste 3,953 Emojis Easily 👍🔥"
