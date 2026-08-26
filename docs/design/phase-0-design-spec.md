# EmojiDeck - Phase 0 Design Spec

Source: `DESIGN.png`

Objectif: restituer la maquette aussi fidelement que possible sur desktop et mobile, avec les themes sombre, clair et systeme.

## Direction

EmojiDeck doit ressembler a un outil natif compact, pas a une landing page. L'ecran principal est l'application elle-meme: recherche, categories, grille emoji, recents, favoris et controles. Les sections ne sont pas placees dans des cartes. Les ombres et bordures servent uniquement a separer les grandes zones.

Principes a conserver:

- recherche dominante et visible en haut;
- navigation tres compacte;
- sidebar desktop fine et lisible;
- navigation mobile par icones;
- recents et favoris toujours proches;
- theme sombre en reference principale;
- theme clair coherent avec les memes proportions;
- mode systeme base sur `prefers-color-scheme`;
- Composer optionnel, escamotable, jamais affiche par defaut;
- aucune carte autour de chaque bloc;
- aucun effet decoratif gratuit.

## Desktop

Breakpoint desktop: `min-width: 900px`.

Structure:

- page avec fond externe neutre;
- application centree horizontalement;
- shell principal avec largeur fluide, max `1040px` a `1120px`;
- hauteur cible `min(760px, calc(100vh - 96px))`;
- rayon du shell: `14px` a `18px`;
- ombre unique, douce, appliquee au shell seulement;
- grille interne en deux colonnes: sidebar fixe + contenu flexible.

Sidebar:

- largeur cible: `220px` a `248px`;
- padding: `24px 18px`;
- separateur vertical fin `1px`;
- titre `EmojiDeck` en haut, poids fort;
- liste de categories avec icone + libelle;
- hauteur d'item: `48px` a `56px`;
- item actif avec fond translucide, icone accentuee et texte clair;
- separateur horizontal avant `Recents` et `Favoris`;
- `Recents` et `Favoris` gardent le meme style que les categories.

Barre superieure desktop:

- hauteur approximative: `78px` a `88px`;
- recherche visible des le haut de la zone principale;
- champ recherche largeur cible `420px` a `480px`;
- hauteur champ: `48px` a `54px`;
- icone de recherche a gauche;
- raccourci clavier optionnel a droite, par exemple `Cmd K` ou `Ctrl K`;
- controles theme et langue alignes a droite;
- theme affiche comme libelle court + icone;
- langue affichee comme selecteur compact, exemple `FR`.

Contenu desktop:

- padding principal: `34px` a `42px`;
- titre de section compact, exemple `Visages`;
- grille emoji sans cartes individuelles;
- taille bouton emoji: `56px` a `64px`;
- taille visuelle emoji: `34px` a `42px`;
- colonnes adaptees a la largeur disponible;
- gap horizontal et vertical genereux mais regulier;
- scroll interne dans la zone de contenu;
- scrollbar fine et discrete.

## Mobile

Breakpoint mobile: sous `900px`.

Structure:

- pas de sidebar permanente;
- shell pleine largeur avec largeur max proche d'un telephone;
- rayon externe uniquement si l'app est affichee comme preview, sinon plein ecran;
- contenu en colonne;
- padding lateral cible: `16px`;
- aucune section encadree par une carte.

Header mobile:

- hauteur cible: `56px` a `64px`;
- titre `EmojiDeck` a gauche;
- bouton menu a droite;
- recherche pleine largeur juste sous le header;
- champ recherche hauteur `44px` a `48px`;
- controles theme, langue et Composer accessibles depuis le menu mobile.

Categories mobile:

- barre horizontale d'icones sous la recherche;
- hauteur cible: `56px` a `64px`;
- icones seules, sans libelles permanents;
- icone active en accent bleu;
- soulignement fin sous l'icone active;
- scroll horizontal si toutes les categories ne tiennent pas;
- labels accessibles invisibles pour lecteur d'ecran.

Sections mobiles:

- ordre par defaut: `Recents`, `Favoris`, categorie active;
- `Recents` et `Favoris` masques s'ils sont vides;
- titres compacts;
- separation par lignes fines, pas par cartes;
- grille emoji plus dense que desktop;
- taille bouton emoji: `42px` a `48px`;
- taille visuelle emoji: `28px` a `34px`.

## Themes

Le theme sombre sert de reference. Le theme clair doit garder la meme hierarchie et les memes espacements, en inversant les surfaces et textes sans changer l'identite.

Tokens sombres:

```css
:root[data-theme="dark"] {
  --color-page: #f3f4f6;
  --color-shell: #0b1115;
  --color-sidebar: #0a0f13;
  --color-surface: #141a20;
  --color-surface-hover: #20272e;
  --color-text: #f4f7f8;
  --color-text-muted: #a6adb5;
  --color-border: rgba(255, 255, 255, 0.10);
  --color-accent: #3b9cff;
  --color-success: #35b95a;
  --shadow-shell: 0 20px 48px rgba(0, 0, 0, 0.28);
}
```

Tokens clairs:

```css
:root[data-theme="light"] {
  --color-page: #f5f6f8;
  --color-shell: #ffffff;
  --color-sidebar: #f8f9fb;
  --color-surface: #eef1f4;
  --color-surface-hover: #e4e8ed;
  --color-text: #101418;
  --color-text-muted: #66707a;
  --color-border: rgba(16, 20, 24, 0.10);
  --color-accent: #1f7eea;
  --color-success: #239b4a;
  --shadow-shell: 0 20px 44px rgba(16, 20, 24, 0.14);
}
```

Mode systeme:

- valeur utilisateur possible: `light`, `dark`, `system`;
- `system` applique `prefers-color-scheme`;
- le choix utilisateur prime toujours sur la detection navigateur;
- les changements systeme sont suivis seulement quand le mode actif est `system`.

## Interactions

Etats requis:

- actif: accent bleu + surface legerement visible;
- hover: surface plus claire ou plus sombre selon theme;
- focus clavier: contour visible, net, non agressif;
- pressed: leger changement de surface;
- disabled: opacite reduite sans modifier le layout;
- menu ouvert: item parent marque comme actif temporaire;
- toast visible: bas-centre desktop, bas mobile au-dessus de la zone sure;
- recherche vide: afficher la categorie active;
- recherche sans resultat: message court, sans illustration.

Copie:

- clic emoji copie immediatement en mode normal;
- toast `Copie !` avec icone de succes;
- duree cible: `1200ms` a `1800ms`;
- le toast ne doit jamais cacher la recherche ni les controles principaux.

Composer:

- desactive par defaut;
- active via bouton/toggle;
- barre escamotable en bas;
- desktop: barre centree, compacte;
- mobile: barre pleine largeur, au-dessus de la zone safe-area;
- aucune place reservee quand le Composer est ferme.

## Typographie

- police systeme: `Inter`, `Segoe UI`, `Roboto`, `Arial`, sans-serif;
- titre app: `20px` a `24px`, poids `700`;
- titres de section: `18px` a `22px`, poids `700`;
- labels sidebar: `15px` a `17px`;
- texte indicatif de recherche: `14px` a `16px`;
- aucune taille basee sur `vw`;
- letter-spacing: `0`;
- texte toujours contenu dans son controle.

## Iconographie

Categories visibles dans la maquette:

- Visages;
- Animaux;
- Nourriture;
- Objets;
- Symboles;
- Drapeaux;
- Recents;
- Favoris.

Regles:

- utiliser des icones lineaires simples pour la navigation;
- icones blanches/grises en inactif;
- icone active en bleu;
- ne pas remplacer les icones de categories par des boutons texte sur mobile;
- fournir un `aria-label` pour chaque bouton icone.

## Validation Visuelle

Captures a comparer a la maquette:

- desktop sombre a `1440x1024`;
- desktop clair a `1440x1024`;
- mobile sombre a `390x844`;
- mobile clair a `390x844`;
- mobile sombre avec menu ouvert;
- mobile sombre avec Composer ouvert;
- desktop sombre avec toast de copie visible.

Checklist d'acceptation:

- la recherche est le premier controle percu apres le logo;
- la sidebar desktop reste compacte;
- la navigation mobile utilise des icones;
- `Recents` et `Favoris` sont visibles dans les zones prevues;
- le theme clair garde la meme structure que le theme sombre;
- le mode systeme respecte `prefers-color-scheme`;
- le selecteur de langue reste compact;
- Composer ne prend aucun espace quand il est ferme;
- les blocs ne sont pas transformes en cartes;
- les bordures restent rares et fines;
- une seule ombre importante existe: celle du shell ou du toast;
- aucun texte ne deborde;
- aucun element interactif ne se superpose a un autre.
