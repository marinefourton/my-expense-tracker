# ⚡ Démarrage rapide (5 min)

## Pour les impatients 😄

### 1. Prérequis
- Node.js 18+ installé
- Un email Wanadoo
- Accès à l'app Caisse d'Épargne

### 2. Setup en 4 commandes

```bash
# 1. Aller dans le dossier
cd expense-tracker

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cp .env.example .env

# 4. Éditer .env avec tes credentials
# IMAP_USER=ton-email@wanadoo.fr
# IMAP_PASSWORD=ton-app-password-wanadoo
```

### 3. Lancer
```bash
npm start
```

Ouvre **http://localhost:5000** 🎉

### 4. Config Caisse d'Épargne
1. App Caisse d'Épargne → Paramètres → Alertes
2. Crée une alerte "Sorties d'argent" avec tous les types de transactions
3. C'est bon!

### 5. Test
- Fais une petite transaction
- Attends 5 min
- Elle apparaît automatiquement dans l'app
- Catégorise-la

## Fin! 🚀

Tu as maintenant une app qui:
- ✅ Reçoit les transactions automatiquement
- ✅ Demande de les catégoriser
- ✅ Track tes budgets
- ✅ T'alerte si dépassement

**Plus de détails:** voir `README.md` et `INSTALLATION.md`
