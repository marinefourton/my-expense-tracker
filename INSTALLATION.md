# 📖 Guide d'installation détaillé

## Sur ton ordinateur (local)

### Étape 1: Installer Node.js

1. Va sur https://nodejs.org/
2. Télécharge la version LTS (18+)
3. Installe-le (c'est un installeur classique)
4. Vérifie dans ton terminal:
   ```bash
   node --version
   npm --version
   ```

### Étape 2: Télécharger les fichiers

1. Télécharge tous les fichiers de l'app
2. Crée un dossier `expense-tracker` sur ton ordi
3. Mets tous les fichiers dedans

### Étape 3: Installer les dépendances

1. Ouvre un terminal dans le dossier `expense-tracker`
2. Tape:
   ```bash
   npm install
   ```
   (ça prend 1-2 min)

### Étape 4: Configurer Wanadoo

1. Ouvre `Wanadoo.fr` → Paramètres
2. Va dans **Sécurité** → **Mots de passe d'application**
3. Génère un **nouveau mot de passe pour IMAP**
4. Copie ce mot de passe

### Étape 5: Configurer l'app

1. Dans le dossier `expense-tracker`, crée un fichier `.env`
2. Dedans, mets:
   ```
   PORT=5000
   IMAP_USER=ton-email@wanadoo.fr
   IMAP_PASSWORD=le-mot-de-passe-genere-a-letape-4
   IMAP_HOST=imap.wanadoo.fr
   IMAP_PORT=993
   EMAIL_FROM=alertes@caisseepargne.fr
   ```
3. Enregistre le fichier

### Étape 6: Activer les alertes Caisse d'Épargne

1. Ouvre l'app **Caisse d'Épargne** sur ton téléphone
2. Accueil → **Paramètres** → **Alertes**
3. Clique **"Créer une alerte"**
4. Remplis:
   - Nom: "Suivi transactions"
   - Sorties d'argent: ✅ sélectionnée
   - Types de transactions:
     - ✅ Paiement par carte bancaire
     - ✅ Virement
     - ✅ Prélèvement
   - Montant minimum: 0€
5. Sauvegarde

### Étape 7: Lancer l'app

1. Dans le terminal, dans le dossier `expense-tracker`:
   ```bash
   npm start
   ```

2. Attends jusqu'à voir:
   ```
   🚀 Server running on http://localhost:5000
   ```

3. Ouvre dans ton navigateur: **http://localhost:5000**

### Étape 8: Test

1. Fais une petite transaction sur ta carte (ex: 1€ sur un distributeur)
2. Attends ~5 minutes
3. Une transaction devrait apparaître dans l'app (onglet "Transactions")

## ☁️ Déployer sur un serveur (Railway)

### Étape 1: Créer un compte Railway

1. Va sur https://railway.app
2. Clique "Start Project"
3. Crée un compte avec GitHub ou email

### Étape 2: Créer un nouveau projet

1. Clique "New Project" → "Deploy from GitHub"
2. Connecte ton GitHub (ou upload les fichiers)
3. Sélectionne le repo `expense-tracker`

### Étape 3: Configure l'environnement

1. Dans le dashboard Railway, va dans "Variables"
2. Ajoute les variables:
   ```
   IMAP_USER=ton-email@wanadoo.fr
   IMAP_PASSWORD=le-mot-de-passe-wanadoo
   PORT=5000
   NODE_ENV=production
   ```

### Étape 4: Deploy

1. Clique "Deploy"
2. Attends ~3 minutes
3. Une URL publique te sera donnée (ex: `https://expense-tracker-xyz.railway.app`)

### Étape 5: Accéder depuis ton téléphone

Sur ton téléphone, tu peux maintenant aller sur:
```
https://expense-tracker-xyz.railway.app
```

Ça marche même en dehors de chez toi sur 4G! 📱

## 🔧 Commandes utiles

```bash
# Lancer l'app
npm start

# Voir les logs en direct
npm start

# Arrêter l'app
Ctrl+C

# Relancer après une modification
npm start
```

## ❓ Besoin d'aide?

- **Les dépendances ne s'installent pas?** → Essaye `npm install --no-audit`
- **Le port 5000 est déjà utilisé?** → Utilise `PORT=3000 npm start`
- **Pas de transactions qui apparaissent?** → Vérifier les logs du terminal et la config Wanadoo

## 🎉 C'est bon!

Une fois que ça marche:
- Accède depuis ton navigateur (local) ou depuis le lien Railway (si déployé)
- Les transactions apparaissent automatiquement
- Catégorise-les comme tu veux
- C'est tout! 🚀
