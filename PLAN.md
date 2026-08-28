# EmojiDeck - Plan de realisation

Ce plan transforme l'idee de `CHATGPT.md` en phases livrables. Chaque phase doit produire un resultat utilisable ou une decision claire avant de passer a la suivante.

## Definition de termine

Une phase est terminee uniquement lorsque tous les points suivants sont satisfaits :

- les nouveaux comportements sont couverts par des tests automatises pertinents ;
- la suite de tests complete passe sans erreur ;
- le controle TypeScript et le build de production reussissent ;
- les parcours concernes sont verifies sur desktop et mobile ;
- les changements visuels sont compares a la specification de design dans les themes disponibles ;
- les fonctions deja livrees ne subissent pas de regression ;
- le plan et la documentation technique sont mis a jour si le comportement ou l'architecture evolue.

## Phase 0 - Design vierge

Objectif : restituer la maquette `DESIGN.png` de maniere la plus fidele possible, en version desktop, mobile, theme sombre, theme clair et mode systeme.

- [x] Analyser la maquette source `DESIGN.png` et noter les invariants visuels a conserver : interface minimaliste, compacte, sombre par defaut, peu de bordures, tres peu d'ombres, aucun encadrement inutile autour des blocs.
- [x] Definir la structure desktop : application centree dans la page, panneau principal sombre, sidebar compacte a gauche, separation verticale fine, zone de contenu a droite.
- [x] Definir la sidebar desktop compacte : logo `EmojiDeck` en haut, categories avec icone + libelle, item actif legerement surligne, separateur fin, entrees `Recents` et `Favoris` en bas de groupe.
- [x] Definir la barre superieure desktop : recherche tres visible en haut de la zone principale, controle de theme `Theme` + icone, selecteur de langue compact, alignement horizontal sobre.
- [x] Definir la zone de contenu desktop : titre de categorie, grille emoji large et aeree, scroll interne discret, emojis sans cartes individuelles, boutons invisibles sauf etat hover/focus.
- [x] Definir le feedback de copie : toast flottant bas-centre, compact, avec icone de confirmation et texte court `Copié !`.
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

- [x] Choisir la stack initiale : Vite + TypeScript seul, ou Vite + Preact si les composants deviennent necessaires.
- [x] Creer la structure du projet frontend.
- [x] Identifier la source de donnees emoji de depart.
- [x] Definir le format JSON interne d'un emoji : caractere, nom, categorie, mots-cles, variantes, codepoints.
- [x] Creer un petit jeu de donnees local pour demarrer sans attendre l'import complet Unicode/CLDR.
- [x] Definir les categories principales affichees dans la barre de navigation.
- [x] Documenter les objectifs techniques : statique, zero backend, zero cookie, zero pub, rapide au chargement.

## Phase 2 - MVP clavier emoji

Objectif : livrer une premiere version utilisable pour parcourir et copier rapidement un emoji.

- [x] Construire la mise en page principale : header, recherche, categories, grille.
- [x] Afficher uniquement la categorie active.
- [x] Ajouter la navigation entre categories.
- [x] Afficher une grille dense et responsive d'emojis.
- [x] Copier l'emoji au clic via le presse-papiers.
- [x] Afficher un feedback discret apres copie.
- [x] Ajouter une tooltip simple avec le nom de l'emoji au survol ou au focus.
- [x] Gerer les erreurs de copie avec un message discret.
- [x] Verifier l'ergonomie desktop.
- [x] Verifier l'ergonomie mobile.

## Phase 3 - Recherche initiale

Objectif : permettre de trouver un emoji en francais, avec un fallback simple en anglais si disponible.

- [x] Indexer les noms et mots-cles du jeu de donnees initial.
- [x] Ajouter une recherche instantanee.
- [x] Chercher sans tenir compte de la casse.
- [x] Chercher sans bloquer sur les accents courants, par exemple `coeur` et `cœur`.
- [x] Afficher les resultats dans une grille unique quand une recherche est active.
- [x] Afficher un etat vide sobre quand aucun emoji ne correspond.
- [x] Conserver le clic pour copier dans les resultats de recherche.
- [x] Conserver le meme champ, le focus et la position du curseur pendant la saisie.
- [x] Mettre a jour uniquement la zone de resultats pendant la recherche.
- [x] Afficher la requete comme du texte sans interpreter de HTML utilisateur.
- [x] Tester les requetes prioritaires : `rire`, `coeur`, `voiture`, `feu`.

## Phase 4 - Recents

Objectif : accelerer l'usage quotidien avec les emojis utilises le plus recemment.

- [x] Enregistrer chaque emoji copie dans `localStorage`.
- [x] Limiter la liste des recents a un nombre raisonnable, par exemple 24.
- [x] Eviter les doublons en remontant l'emoji deja present en tete.
- [x] Ajouter une categorie ou section `Recents`.
- [x] Masquer la section `Recents` tant qu'elle est vide.
- [x] Permettre la copie depuis les recents.
- [x] Verifier que les recents persistent apres rechargement.

## Phase 5 - Favoris

Objectif : permettre a l'utilisateur de construire une petite collection personnelle.

- [x] Ajouter une action pour marquer ou retirer un emoji des favoris.
- [x] Enregistrer les favoris dans `localStorage`.
- [x] Ajouter une categorie ou section `Favoris`.
- [x] Masquer la section `Favoris` tant qu'elle est vide.
- [x] Permettre la copie depuis les favoris.
- [x] Preserver l'ordre choisi ou l'ordre d'ajout.
- [x] Prevoir une interaction mobile confortable pour ajouter un favori.
- [x] Verifier que les favoris persistent apres rechargement.

## Phase 6 - Theme clair, sombre et systeme

Objectif : proposer un theme confortable sans complexifier l'application.

- [x] Definir les variables CSS des themes clair et sombre.
- [x] Detecter la preference systeme avec `prefers-color-scheme`.
- [x] Ajouter un controle `Light / Dark / System`.
- [x] Enregistrer le choix utilisateur dans `localStorage`.
- [x] Donner la priorite au choix utilisateur sur la preference systeme.
- [x] Verifier les contrastes des textes, boutons, grilles et tooltips.

## Phase 7 - Navigation clavier et accessibilite

Objectif : rendre l'outil rapide et utilisable sans souris.

- [x] Structurer les boutons emoji avec des labels accessibles.
- [x] Permettre la navigation clavier dans la grille.
- [x] Permettre la copie avec `Enter` ou `Space`.
- [x] Garder un focus visible et propre.
- [x] Verifier le comportement de la recherche au clavier.
- [ ] Tester avec un lecteur d'ecran au moins sur les parcours principaux.

## Phase 8 - Import Unicode / CLDR

Objectif : remplacer le jeu de donnees initial par des donnees maintenables et localisables.

- [x] Identifier les fichiers Unicode et CLDR necessaires.
- [x] Creer un script de transformation au build.
- [x] Generer un fichier de donnees par langue.
- [x] Generer les noms, mots-cles, categories et variantes.
- [x] Verifier le nombre total d'emojis importes.
- [x] Ajouter un controle de coherence sur les emojis sans nom ou sans categorie.
- [x] Documenter la commande de regeneration des donnees.

## Phase 9 - Multilingue complet

Objectif : proposer une interface et une recherche localisees sans telecharger toutes les langues inutilement.

- [x] Definir les langues ciblees du lancement complet : francais, anglais, allemand, italien, espagnol, portugais.
- [x] Localiser les textes de l'interface.
- [x] Detecter la langue avec `navigator.languages`.
- [x] Ajouter un selecteur manuel de langue.
- [x] Enregistrer la langue choisie dans `localStorage`.
- [x] Donner la priorite a la langue choisie sur la detection navigateur.
- [x] Charger les donnees emoji de la langue active a la demande.
- [x] Prevoir un fallback anglais si une langue ou une traduction manque.
- [x] Verifier la recherche dans chaque langue cible.
- [x] Verifier que le changement de langue ne supprime pas recents, favoris ou theme.

## Phase 10 - Teintes de peau

Objectif : exploiter les variantes Unicode / CLDR sans creer de grandes listes redondantes.

- [x] Identifier les emojis qui acceptent des variantes de peau dans les donnees generees.
- [x] Stocker les variantes disponibles dans le format de donnees interne.
- [x] Ajouter un menu de variantes sur appui long, clic secondaire ou bouton discret.
- [x] Rendre le menu de variantes utilisable au clavier et avec un lecteur d'ecran.
- [x] Copier directement la variante choisie.
- [x] Ajouter un choix de teinte de peau par defaut.
- [x] Enregistrer la teinte par defaut dans `localStorage`.
- [x] Appliquer la teinte par defaut aux emojis compatibles dans la grille.
- [x] Verifier que les variantes mixtes ne deviennent pas des categories dediees.

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

- [x] Mesurer le poids du JavaScript applicatif hors donnees.
- [x] Optimiser le chargement initial.
- [x] Verifier que seules les donnees necessaires sont chargees.
- [x] Ajouter une virtualisation si la grille complete devient trop lourde.
- [x] Stabiliser les dimensions des boutons emoji pour eviter les sauts de layout.
- [x] Polir les etats vides, chargements, erreurs et feedbacks.
- [x] Tester sur plusieurs tailles d'ecran.
- [x] Tester sur plusieurs navigateurs modernes.
- [x] Verifier qu'aucun tracking, cookie ou appel backend inutile n'est present.

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
