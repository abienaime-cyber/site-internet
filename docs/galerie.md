# Galerie des maisons

Page `/galerie` : 5 montres par marque (Rolex, Audemars Piguet, Richard Mille, Tudor, Patek Philippe).
Crédits : `/galerie/credits`, plus une ligne de crédit sous chaque photo.

## Où déposer les fichiers

```
public/galerie/
├── montres.json
└── images/
    ├── rolex/            rolex-01.jpg … rolex-05.jpg
    ├── audemars-piguet/  audemars-piguet-01.jpg …
    ├── richard-mille/
    ├── tudor/
    └── patek-philippe/
```

`docs/montres.modele.json` donne la structure : 25 entrées, tous les champs à `null`.
Copiez-le dans `public/galerie/montres.json` puis remplissez-le.

Champs : `marque`, `modele` (ou `modèle`), `reference` (ou `référence`), `fichier`, `auteur`, `licence`, `source_url`, `alt`.
`fichier` peut être `rolex/rolex-01.jpg` ou simplement `rolex-01.jpg` (rangé alors dans le dossier de la marque).

## Règles appliquées par le site

- `montres.json` est la seule source : un champ `null` n'est pas affiché, rien n'est complété.
- Photo sans `licence` : non affichée.
- Licence CC BY, CC BY-SA (ou licence non reconnue) sans `auteur` : non affichée, le crédit serait incomplet.
- CC0 et domaine public : affichées sans auteur obligatoire.
- Fichier absent : emplacement vide « Photo à venir ».
- `alt` vide : construit avec la marque, le modèle et la référence quand ils sont renseignés.
- Images servies en WebP, en lazy loading, 1200 px de large au plus, format carré dans la grille.

## Vérifier avant de publier

```bash
pnpm galerie:verifier
```

Le script liste les entrées manquantes, les fichiers introuvables, les licences et crédits absents,
et les images du dossier citées nulle part. Il sort en erreur tant que les 25 photos ne sont pas publiables.
