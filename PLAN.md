# EmojiDeck - Plan de realisation

Ce plan transforme l'idee de `CHATGPT.md` en phases livrables. Chaque phase doit produire un resultat utilisable ou une decision claire avant de passer a la suivante.

## Phase 0 - Design vierge

Objectif : restituer la maquette `DESIGN.png` de maniere la plus fidele possible, en version desktop, mobile, theme sombre, theme clair et mode systeme.

- [x] Analyser la maquette source `DESIGN.png` et noter les invariants visuels a conserver : interface minimaliste, compacte, sombre par defaut, peu de bordures, tres peu d'ombres, aucun encadrement inutile autour des blocs.
- [x] Definir la structure desktop : application centree dans la page, panneau principal sombre, sidebar compacte a gauche, separation verticale fine, zone de contenu a droite.
- [x] Definir la sidebar desktop compacte : logo `EmojiDeck` en haut, categories avec icone + libelle, item actif legerement surligne, separateur fin, entrees `Recents` et `Favoris` en bas de groupe.
- [x] Definir la barre superieure desktop : recherche tres visible en haut de la zone principale, controle de theme `Theme` + icone, selecteur de langue compact, alignement horizontal sobre.
- [x] Definir la zone de contenu desktop : titre de categorie, grille emoji large et aeree, scroll interne discret, emojis sans cartes individuelles, boutons invisibles sauf etat hover/focus.
- [x] Definir le feedback de copie : toast flottant bas-centre, compact, avec icone de confirmation et texte court `Copie !`.
- [x] Definir la version mobile : header compact avec titre `EmojiDeck` et bouton menu, recherche pleine largeur sous le header, barre de categories sous forme d'icones, contenu en colonne.
- [x] Definir la navigation mobile par icones : categories principales visibles horizontalement, icone active marquee par couleur et soulignement fin, pas de libelles permanents pour garder la compacite.
- [x] Definir les sections mobiles : `Recents`, `Favoris`, puis categorie active, separees par de simples lignes fines, sans cartes autour des sections.
- [x] Definir le comportement responsive : desktop avec sidebar a partir du breakpoint choisi, mobile sans sidebar sous ce breakpoint, aucune superposition entre recherche, categories, grille et toast.
- [x] Definir le mode sombre : fond principal quasi noir, panneaux noir bleute, texte blanc casse, texte secondaire gris, bordures fines translucides, accent bleu uniquement pour l'etat actif.
- [x] Definir le mode clair : fond clair neutre, panneau blanc ou gris tres leger, texte presque noir, texte secondaire gris, bordures fines claires, meme accent bleu que le mode sombre.
- [x] Definir le mode systeme : appliquer automatiquement le theme clair ou sombre selon `prefers-color-scheme`, sauf si l'utilisateur a choisi explicitement un theme.
- [x] Definir les controles de theme : choix `Clair`, `Sombre`, `Systeme`, accessibles depuis la barre superieure desktop et depuis le menu mobile.
- [x] Definir le controle de langue : selecteur compact sur desktop, entree dans le menu mobile, libelle court du type `FR`, `EN`, `DE`, `IT`, `ES`, `PT`.
- [x] Definir le mode Composer comme optionnel : jamais affiche par defaut, active par un bouton ou toggle, barre de composition escamotable en bas sans prendre l'espace principal inutilement.
- [x] Definir les etats interactifs : actif, hover, focus clavier, pressed, disabled, menu ouvert, toast visible, recherche vide, recherche sans resultat.
- [x] Definir les dimensions cibles : largeur sidebar desktop compacte, hauteur de recherche, taille des icones de categories, taille des emojis desktop, taille des emojis mobile, espacements de grille.
- [x] Definir les contraintes typographiques : police systeme, titres compacts, labels lisibles, aucune taille de texte basee sur la largeur viewport, aucun texte qui deborde des controles.
- [x] Produire une checklist de validation visuelle : comparer implementation vs maquette sur desktop sombre, mobile sombre, desktop clair et mobile clair.

## Phase 1 - Cadrage technique et donnees

Objectif : poser les fondations du projet statique, leger, sans backend, sans compte et sans cookies.

- [ ] Choisir la stack initiale : Vite + TypeScript seul, ou Vite + Preact si les composants deviennent necessaires.
- [ ] Creer la structure du projet frontend.
- [ ] Identifier la source de donnees emoji de depart.
- [ ] Definir le format JSON interne d'un emoji : caractere, nom, categorie, mots-cles, variantes, codepoints.
- [ ] Creer un petit jeu de donnees local pour demarrer sans attendre l'import complet Unicode/CLDR.
- [ ] Definir les categories principales affichees dans la barre de navigation.
- [ ] Documenter les objectifs techniques : statique, zero backend, zero cookie, zero pub, rapide au chargement.

## Phase 2 - MVP clavier emoji

Objectif : livrer une premiere version utilisable pour chercher et copier rapidement un emoji.

- [ ] Construire la mise en page principale : header, recherche, categories, grille.
- [ ] Afficher uniquement la categorie active.
- [ ] Ajouter la navigation entre categories.
- [ ] Afficher une grille dense et responsive d'emojis.
- [ ] Copier l'emoji au clic via le presse-papiers.
- [ ] Afficher un feedback discret apres copie.
- [ ] Ajouter une tooltip simple avec le nom de l'emoji au survol ou au focus.
- [ ] Gerer les erreurs de copie avec un message discret.
- [ ] Verifier l'ergonomie desktop.
- [ ] Verifier l'ergonomie mobile.

## Phase 3 - Recherche initiale

Objectif : permettre de trouver un emoji en francais, avec un fallback simple en anglais si disponible.

- [ ] Indexer les noms et mots-cles du jeu de donnees initial.
- [ ] Ajouter une recherche instantanee.
- [ ] Chercher sans tenir compte de la casse.
- [ ] Chercher sans bloquer sur les accents courants, par exemple `coeur` et `cœur`.
- [ ] Afficher les resultats dans une grille unique quand une recherche est active.
- [ ] Afficher un etat vide sobre quand aucun emoji ne correspond.
- [ ] Conserver le clic pour copier dans les resultats de recherche.
- [ ] Tester les requetes prioritaires : `rire`, `coeur`, `voiture`, `feu`.

## Phase 4 - Recents

Objectif : accelerer l'usage quotidien avec les emojis utilises le plus recemment.

- [ ] Enregistrer chaque emoji copie dans `localStorage`.
- [ ] Limiter la liste des recents a un nombre raisonnable, par exemple 24.
- [ ] Eviter les doublons en remontant l'emoji deja present en tete.
- [ ] Ajouter une categorie ou section `Recents`.
- [ ] Masquer la section `Recents` tant qu'elle est vide.
- [ ] Permettre la copie depuis les recents.
- [ ] Verifier que les recents persistent apres rechargement.

## Phase 5 - Teintes de peau

Objectif : eviter les grandes listes de variantes tout en gardant les options accessibles.

- [ ] Identifier les emojis qui acceptent des variantes de peau.
- [ ] Stocker les variantes disponibles dans le format de donnees interne.
- [ ] Ajouter un menu de variantes sur appui long, clic secondaire ou bouton discret.
- [ ] Copier directement la variante choisie.
- [ ] Ajouter un choix de teinte de peau par defaut.
- [ ] Enregistrer la teinte par defaut dans `localStorage`.
- [ ] Appliquer la teinte par defaut aux emojis compatibles dans la grille.
- [ ] Verifier que les variantes mixtes ne deviennent pas des categories dediees.

## Phase 6 - Favoris

Objectif : permettre a l'utilisateur de construire une petite collection personnelle.

- [ ] Ajouter une action pour marquer ou retirer un emoji des favoris.
- [ ] Enregistrer les favoris dans `localStorage`.
- [ ] Ajouter une categorie ou section `Favoris`.
- [ ] Masquer la section `Favoris` tant qu'elle est vide.
- [ ] Permettre la copie depuis les favoris.
- [ ] Preserver l'ordre choisi ou l'ordre d'ajout.
- [ ] Prevoir une interaction mobile confortable pour ajouter un favori.
- [ ] Verifier que les favoris persistent apres rechargement.

## Phase 7 - Theme clair, sombre et systeme

Objectif : proposer un theme confortable sans complexifier l'application.

- [ ] Definir les variables CSS des themes clair et sombre.
- [ ] Detecter la preference systeme avec `prefers-color-scheme`.
- [ ] Ajouter un controle `Light / Dark / System`.
- [ ] Enregistrer le choix utilisateur dans `localStorage`.
- [ ] Donner la priorite au choix utilisateur sur la preference systeme.
- [ ] Verifier les contrastes des textes, boutons, grilles et tooltips.

## Phase 8 - Navigation clavier et accessibilite

Objectif : rendre l'outil rapide et utilisable sans souris.

- [ ] Structurer les boutons emoji avec des labels accessibles.
- [ ] Permettre la navigation clavier dans la grille.
- [ ] Permettre la copie avec `Enter` ou `Space`.
- [ ] Garder un focus visible et propre.
- [ ] Verifier le comportement de la recherche au clavier.
- [ ] Verifier que les menus de variantes sont utilisables au clavier.
- [ ] Tester avec un lecteur d'ecran au moins sur les parcours principaux.

## Phase 9 - Import Unicode / CLDR

Objectif : remplacer le jeu de donnees initial par des donnees maintenables et localisables.

- [ ] Identifier les fichiers Unicode et CLDR necessaires.
- [ ] Creer un script de transformation au build.
- [ ] Generer un fichier de donnees par langue.
- [ ] Generer les noms, mots-cles, categories et variantes.
- [ ] Verifier le nombre total d'emojis importes.
- [ ] Ajouter un controle de coherence sur les emojis sans nom ou sans categorie.
- [ ] Documenter la commande de regeneration des donnees.

## Phase 10 - Multilingue complet

Objectif : proposer une interface et une recherche localisees sans telecharger toutes les langues inutilement.

- [ ] Definir les langues ciblees du lancement complet : francais, anglais, allemand, italien, espagnol, portugais.
- [ ] Localiser les textes de l'interface.
- [ ] Detecter la langue avec `navigator.languages`.
- [ ] Ajouter un selecteur manuel de langue.
- [ ] Enregistrer la langue choisie dans `localStorage`.
- [ ] Donner la priorite a la langue choisie sur la detection navigateur.
- [ ] Charger les donnees emoji de la langue active a la demande.
- [ ] Prevoir un fallback anglais si une langue ou une traduction manque.
- [ ] Verifier la recherche dans chaque langue cible.
- [ ] Verifier que le changement de langue ne supprime pas recents, favoris ou theme.

## Phase 11 - PWA et offline

Objectif : rendre EmojiDeck installable et utilisable hors ligne.

- [ ] Ajouter un manifest PWA.
- [ ] Definir nom, icones, couleur de theme et mode d'affichage.
- [ ] Ajouter un service worker.
- [ ] Mettre en cache l'application shell.
- [ ] Mettre en cache les donnees de la langue active.
- [ ] Prevoir une strategie de mise a jour simple.
- [ ] Verifier l'installation sur desktop.
- [ ] Verifier l'installation sur mobile.
- [ ] Verifier le fonctionnement hors ligne apres un premier chargement.

## Phase 12 - Composer

Objectif : ajouter un mode optionnel pour composer plusieurs emojis avant copie.

- [ ] Ajouter un bouton ou toggle `Composer`.
- [ ] Garder le mode copie directe par defaut.
- [ ] En mode composer, ajouter les emojis cliques dans une barre de composition.
- [ ] Permettre de retirer un emoji de la composition.
- [ ] Permettre de vider toute la composition.
- [ ] Copier toute la composition avec un bouton dedie.
- [ ] Afficher un feedback apres copie de la composition.
- [ ] Verifier que recents et favoris restent coherents avec le mode composer.
- [ ] Verifier l'ergonomie mobile de la barre de composition.

## Phase 13 - Performance et finition

Objectif : rendre l'application fluide, legere et agreable avant publication.

- [ ] Mesurer le poids du JavaScript applicatif hors donnees.
- [ ] Optimiser le chargement initial.
- [ ] Verifier que seules les donnees necessaires sont chargees.
- [ ] Ajouter une virtualisation si la grille complete devient trop lourde.
- [ ] Stabiliser les dimensions des boutons emoji pour eviter les sauts de layout.
- [ ] Polir les etats vides, chargements, erreurs et feedbacks.
- [ ] Tester sur plusieurs tailles d'ecran.
- [ ] Tester sur plusieurs navigateurs modernes.
- [ ] Verifier qu'aucun tracking, cookie ou appel backend inutile n'est present.

## Phase 14 - Publication

Objectif : publier une premiere version claire, rapide et maintenable.

- [ ] Choisir le nom public final.
- [ ] Ajouter les metadonnees HTML essentielles.
- [ ] Ajouter une description courte orientee utilisateur.
- [ ] Ajouter les icones et assets publics.
- [ ] Configurer le build de production.
- [ ] Verifier le build local.
- [ ] Configurer le projet pour GitHub Pages.
- [ ] Ajouter un workflow GitHub Actions de build et deploiement vers GitHub Pages.
- [ ] Activer GitHub Pages sur la branche ou l'environnement de deploiement choisi.
- [ ] Deployer la version statique sur GitHub Pages.
- [ ] Tester le site deploye.
- [ ] Verifier l'URL publique GitHub Pages.
- [ ] Noter les ameliorations post-lancement dans un backlog separe.
