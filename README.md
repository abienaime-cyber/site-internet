# Remontoir

Marketplace de montres de luxe d'occasion entre particuliers. Next.js 16 (App Router), base SQLite intégrée à Node, paiement Stripe Checkout.

## Démarrer

Prérequis : Node.js 22.13 ou plus récent (pour le module `node:sqlite`) et pnpm.

```bash
pnpm install
cp .env.example .env.local   # puis ajoutez votre clé Stripe
pnpm dev
```

Le site tourne sur http://localhost:3000.

Pour servir le site en HTTPS en local, Next.js génère un certificat auto-signé :

```bash
pnpm dev --experimental-https
```

Il est alors disponible sur https://localhost:3000.

## Base de données

Au premier lancement, le fichier `data/remontoir.db` est créé avec six vendeurs, dix-huit annonces et quelques avis. Pour repartir de zéro, arrêtez le serveur et supprimez le dossier `data/`.

Comptes vendeurs créés au démarrage (mot de passe commun `remontoir2026`) :

| Vendeur          | E-mail               |
| ---------------- | -------------------- |
| Julien Marchand  | julien@remontoir.fr  |
| Claire Dumas     | claire@remontoir.fr  |
| Antoine Rey      | antoine@remontoir.fr |
| Sofia Benali     | sofia@remontoir.fr   |
| Marc Lefèvre     | marc@remontoir.fr    |
| Hélène Vidal     | helene@remontoir.fr  |

Pour tester la messagerie, ouvrez deux navigateurs : un compte acheteur créé via « Inscription », un compte vendeur ci-dessus.

## Paiement Stripe

1. Créez un compte sur https://dashboard.stripe.com et restez en mode test.
2. Copiez la clé secrète `sk_test_…` dans `STRIPE_SECRET_KEY` (fichier `.env.local`), puis relancez `pnpm dev`.
3. Sur une annonce, cliquez « Acheter » puis « Payer ». Sur la page Stripe, utilisez la carte `4242 4242 4242 4242`, une date d'expiration future et n'importe quel CVC.

Au retour, la page de confirmation interroge Stripe : si le paiement est validé, la commande passe à « payée » et l'annonce à « Vendue ».

Webhook (facultatif en local) :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le secret `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`.

## Pages

| Route                      | Rôle                                            |
| -------------------------- | ----------------------------------------------- |
| `/`                        | Accueil, marques, sélection « Pour vous »       |
| `/annonces`                | Recherche et filtres (marque, modèle, prix, état, année) |
| `/annonces/[id]`           | Fiche annonce                                   |
| `/favoris`                 | Montres gardées de côté                         |
| `/vendre`                  | Dépôt d'annonce avec photos                     |
| `/vendeurs/[id]`           | Profil public du vendeur et avis                |
| `/messages`                | Conversations acheteur / vendeur                |
| `/paiement/[id]`           | Récapitulatif et paiement                       |
| `/compte`                  | Annonces, achats, avis, profil                  |
| `/connexion`, `/inscription` | Authentification                              |

## Scripts

- `pnpm dev` : serveur de développement
- `pnpm build` puis `pnpm start` : version de production
- `pnpm lint` : ESLint
