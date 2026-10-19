# 📁 Structure du projet

```
expense-tracker/
├── 📄 package.json              # Dépendances Node.js
├── 📄 .env.example              # Template des variables d'env
├── 📄 .env                       # CONF LOCALE (à créer, dans .gitignore)
├── 📄 Dockerfile                # Pour déployer sur Railway/Render
├── 📄 docker-compose.yml        # Pour déployer localement avec Docker
├── 📄 .gitignore                # Fichiers à ignorer
├── 📄 README.md                 # Documentation principale
├── 📄 INSTALLATION.md           # Guide d'installation détaillé
├── 📄 QUICKSTART.md             # Démarrage rapide
├── 📄 PROJECT_STRUCTURE.md      # Ce fichier
│
├── 📂 server/                   # Backend (Node.js)
│   ├── 📄 index.js              # Point d'entrée principal
│   ├── 📄 db.js                 # Gestion SQLite
│   ├── 📄 imap-bot.js           # Bot de surveillance d'emails
│   ├── 📄 email-parser.js       # Parsing des emails Caisse d'Épargne
│   ├── 📄 alerts.js             # Système d'alertes budgétaires
│   ├── 📄 middleware.js         # Middleware Express
│   ├── 📄 seed.js               # Données de test
│   │
│   └── 📂 routes/               # API endpoints
│       ├── 📄 transactions.js   # GET/POST/DELETE transactions
│       ├── 📄 categories.js     # CRUD catégories + budgets
│       └── 📄 dashboard.js      # Stats et résumés
│
├── 📂 public/                   # Frontend (React)
│   └── 📄 index.html            # Tout en 1 fichier HTML (React + Tailwind)
│
└── 📂 data/                     # Base de données (créée auto)
    └── 📄 expenses.db           # Fichier SQLite (ne pas commit)
```

## 🔄 Flux des données

```
Caisse d'Épargne
    ↓ (email alert)
Wanadoo (imap.wanadoo.fr)
    ↓
Bot IMAP (server/imap-bot.js)
    ↓ (parse)
Email Parser (server/email-parser.js)
    ↓
SQLite Database (data/expenses.db)
    ↓
Express API (server/routes/*.js)
    ↓
Frontend React (public/index.html)
    ↓
Navigateur (localhost:5000)
```

## 📝 Que fait chaque fichier

### Backend

| Fichier | Rôle |
|---------|------|
| `server/index.js` | Lance le serveur Express, active le bot IMAP |
| `server/db.js` | Crée/gère la base SQLite |
| `server/imap-bot.js` | Écoute ta boîte Wanadoo, vérifie toutes les 5 min |
| `server/email-parser.js` | Extrait montant/lieu/date des emails |
| `server/alerts.js` | Vérifie les budgets, crée des alertes |
| `server/routes/*.js` | Endpoints API (`/api/transactions`, etc.) |

### Frontend

| Fichier | Rôle |
|---------|------|
| `public/index.html` | **Toute l'app frontend** (React + Tailwind inline) |

C'est du "all-in-one" pour la simplicité. Pas de build step, pas de webpack, ça marche juste.

### Configuration

| Fichier | Rôle |
|---------|------|
| `.env` | Tes credentials (localement seulement) |
| `package.json` | Les dépendances Node |
| `Dockerfile` | Comment containeriser pour Railway/Render |
| `docker-compose.yml` | Pour tester Docker localement |

## 🚀 Cycle de vie au démarrage

```bash
npm start
    ↓
server/index.js s'exécute
    ↓
Initialise SQLite (crée les tables)
    ↓
Connecte IMAP à Wanadoo
    ↓
Vérifie les emails existants
    ↓
Lance un timer pour vérifier tous les 5 min
    ↓
Démarre Express sur le port 5000
    ↓
Frontend React se charge dans le navigateur
    ↓
Prêt! 🎉
```

## 📊 Schéma de la base de données

```
users
├── id (PK)
├── email
└── created_at

categories
├── id (PK)
├── user_id (FK)
├── name
├── color
└── created_at

budgets
├── id (PK)
├── category_id (FK)
├── limit_amount
├── current_month_spent
└── reset_date

transactions
├── id (PK)
├── user_id (FK)
├── amount
├── merchant
├── transaction_date
├── email_id (unique)
├── status (pending/categorized)
└── created_at

budget_splits (split budgétaire)
├── id (PK)
├── transaction_id (FK)
├── category_id (FK)
├── amount
└── created_at
```

## 🔐 Fichiers sensibles

**Ne jamais committer:**
- `.env` (tes credentials Wanadoo)
- `data/expenses.db` (tes données bancaires)

Ils sont dans `.gitignore` automatiquement.

## 🛠️ Pour modifier l'app

- **Ajouter une nouvelle route API?** → Crée un fichier dans `server/routes/` et importe-le dans `server/index.js`
- **Modifier l'interface?** → Édite `public/index.html` (la partie React)
- **Changer la logique du parsing?** → Modifie `server/email-parser.js`
- **Ajouter une nouvelle table?** → Modifie `server/db.js`

Chaque changement prend effet en relançant `npm start`.

## 📈 Cas d'usage simple

1. Tu fais une transaction (ex: 50€ chez Amazon)
2. Caisse d'Épargne t'envoie un email
3. Le bot IMAP le capte dans 5 min
4. L'email est parsé → amount: 50, merchant: "Amazon"
5. Une transaction est créée en base (status: pending)
6. L'app affiche "50€ Amazon - À catégoriser"
7. Tu cliques "Catégoriser" → "Loisir"
8. La transaction est splittée (50€ → catégorie Loisir)
9. Le budget Loisir se met à jour
10. Le dashboard reflète la nouvelle dépense
11. Si tu dépasses le budget → une alerte s'affiche

Simple! 🎯
