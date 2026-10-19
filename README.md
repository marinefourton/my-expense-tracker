# 💰 Suivi des Dépenses Bancaires

Application complète de suivi des dépenses bancaires avec intégration IMAP pour Caisse d'Épargne/Wanadoo.

## 🎯 Fonctionnalités

- ✅ **Détection automatique des transactions** via emails Caisse d'Épargne
- ✅ **Catégorisation flexible** avec support du split (une transaction = plusieurs catégories)
- ✅ **Gestion des budgets** avec alertes de dépassement
- ✅ **Dashboard en temps réel** avec statistiques par catégorie
- ✅ **Interface responsive** (mobile-friendly)
- ✅ **Self-hosted gratuit** sur un serveur 2€/mois ou en local

## 🚀 Setup rapide (Local)

### 1. Prérequis

- Node.js 18+
- npm

### 2. Installation

```bash
# Cloner/télécharger les fichiers
cd expense-tracker

# Installer les dépendances
npm install

# Copier le fichier d'env
cp .env.example .env
```

### 3. Configuration Wanadoo

Éditer `.env` avec tes credentials Wanadoo :

```env
IMAP_USER=ton-email@wanadoo.fr
IMAP_PASSWORD=ton-app-password
IMAP_HOST=imap.wanadoo.fr
IMAP_PORT=993
```

**⚠️ Important:** Pour Wanadoo, tu dois générer un **App Password** (pas ton mot de passe direct) :
1. Va sur https://www.wanadoo.fr/
2. Paramètres → Sécurité → Mots de passe d'application
3. Crée un nouveau mot de passe pour IMAP
4. Utilise ce mot de passe dans `.env`

### 4. Activer les alertes Caisse d'Épargne

1. Ouvre l'app Caisse d'Épargne
2. Accueil → Paramètres → Alertes
3. Crée une nouvelle alerte "Suivi transactions" :
   - **Type:** Sorties d'argent
   - **Transactions à suivre:**
     - ✅ Paiement par carte bancaire
     - ✅ Virement
     - ✅ Prélèvement
4. Envoyer les alertes par **email**

### 5. Lancer l'app

```bash
npm start
```

L'app est disponible sur **http://localhost:5000**

## 📱 Utilisation

### Dashboard
- Vue d'ensemble des dépenses du mois
- Total par catégorie
- Alertes de dépassement de budget

### Catégorisation
- Les transactions en attente apparaissent automatiquement
- Clique "Catégoriser" et assigne une catégorie
- Tu peux splitter une transaction en plusieurs catégories

### Paramètres
- Crée tes propres catégories
- Définis un budget limite par catégorie
- L'app t'alerte si tu dépasses

## 🌐 Déployer sur un serveur (Railway/Render)

### Avec Railway.app (recommandé - 2€/mois)

1. Crée un compte sur https://railway.app
2. Crée un nouveau projet
3. Connecte ce repo GitHub ou upload les fichiers
4. Configure les variables d'env dans Railway :
   ```
   IMAP_USER=ton-email@wanadoo.fr
   IMAP_PASSWORD=ton-app-password
   PORT=5000
   ```
5. Deploy

L'app sera accessible sur ton domaine Railway (ex: `expense-tracker-xyz.railway.app`)

### Avec Render.com (2-7€/mois)

1. Crée un compte sur https://render.com
2. Crée une nouvelle "Web Service"
3. Connecte ce repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Configure les env vars
7. Deploy

## 🔒 Sécurité & Confidentialité

- ✅ Tes identifiants Wanadoo restent **dans le fichier .env local** (jamais partagés)
- ✅ Tes données bancaires restent **sur ton serveur** (pas de tiers)
- ✅ Pas de tracking, pas de publicités
- ✅ Open source, tu peux vérifier le code

## 📊 Architecture

### Backend (Node.js + Express)
- Bot IMAP qui surveille ta boîte Wanadoo toutes les 5 min
- Parser d'emails Caisse d'Épargne
- API REST pour gérer les transactions
- Système d'alertes budgétaires

### Frontend (React)
- Interface responsive (mobile-friendly)
- Dashboard avec graphiques
- Gestion des catégories et budgets

### Base de données (SQLite)
- Stockage local, aucune dépendance externe
- Automatiquement créée au premier démarrage

## 🐛 Troubleshooting

### "IMAP auth failed"
- Vérifie ton `IMAP_PASSWORD` (c'est un app password, pas ton mot de passe Wanadoo)
- Vérifie que tu as bien activé IMAP dans ta boîte Wanadoo

### "Pas de transactions détectées"
- Vérifie que tu as activé les alertes email dans Caisse d'Épargne
- Attends ~5 minutes (le bot check toutes les 5 min)
- Fais une transaction test pour vérifier

### "Erreur de connexion au serveur"
- Vérifie que le serveur est lancé (`npm start`)
- Assure-toi que le port 5000 est disponible

## 📝 Logs & Débogage

Le bot affiche des logs :
```
✅ Database initialized
✅ IMAP bot started
✅ IMAP connection ready
📧 INBOX opened, watching for new emails...
📬 1 new email(s) detected
📧 Processing email: Alerte paiement
✅ Transaction saved: AMAZON - 47.50€
```

## 📄 License

MIT - Libre d'utilisation

## 💬 Support

Des questions? Le code est commenté et facile à modifier. N'hésite pas à explorer!
