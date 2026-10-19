# 🎯 START HERE - Commence ici!

## Bienvenue! 👋

Tu viens de recevoir une **app complète de suivi de dépenses bancaires**.

Voici comment l'utiliser rapidement.

---

## 📚 Lis dans cet ordre

1. **Ce fichier** (tu le lis! 👈) → Vue d'ensemble
2. **`QUICKSTART.md`** (5 min) → Installation super rapide
3. **`INSTALLATION.md`** (détaillé) → Si tu as des problèmes
4. **`README.md`** (complet) → Pour tout comprendre
5. **`FAQ.md`** → Si tu as des questions

---

## 🚀 TL;DR (Version ultra rapide)

```bash
# 1. Prérequis: Node.js installé? 
# (sinon: https://nodejs.org)

# 2. Configuration
cp .env.example .env
# Édite .env avec tes credentials Wanadoo

# 3. Lancer
npm install
npm start

# 4. Ouvre dans le navigateur
# http://localhost:5000
```

**Puis:** Crée une alerte dans l'app Caisse d'Épargne. C'est tout! 🎉

---

## ✨ Ce que tu obtiens

Une app qui:

| Fonctionnalité | ✅ |
|---|---|
| Reçoit les transactions auto (via IMAP) | ✅ |
| Te demande de les catégoriser | ✅ |
| Track les budgets par catégorie | ✅ |
| T'alerte si tu dépasses un budget | ✅ |
| Fonctionne depuis partout (si déployé) | ✅ |
| Tes données restent chez toi (100% privé) | ✅ |
| Entièrement gratuit (0€ en local) | ✅ |

---

## 📂 Structure (super simple)

```
expense-tracker/
├── server/           ← Backend (Node.js + IMAP)
├── public/           ← Frontend (React)
├── data/             ← Base de données (créée auto)
├── .env              ← Tes credentials (à créer)
└── package.json      ← Les dépendances
```

---

## 🔄 Comment ça marche? (Vue rapide)

```
1️⃣ Tu fais une transaction (CB, virement, etc.)
    ↓
2️⃣ Caisse d'Épargne t'envoie un email d'alerte
    ↓
3️⃣ Le bot IMAP le reçoit (max 5 min d'attente)
    ↓
4️⃣ L'app crée une transaction "en attente"
    ↓
5️⃣ Tu vois dans l'app: "50€ chez Amazon - À catégoriser"
    ↓
6️⃣ Tu cliques "Catégoriser" → Choisis une catégorie
    ↓
7️⃣ L'app met à jour le budget
    ↓
8️⃣ Dashboard reflète la nouvelle dépense ✅
```

---

## 🎯 Prochaines étapes

### Étape 1: Setup en local (15 min)
Suis `QUICKSTART.md`. Rien de compliqué, promis.

### Étape 2: Teste
Fais une petite transaction (1€) pour voir si ça marche.

### Étape 3: Utilise!
Catégorise tes dépenses, setup tes budgets.

### Étape 4 (Optionnel): Déploie sur Railway
Veux accéder depuis n'importe où? (~2€/mois)
Voir `README.md` section "Déployer".

---

## ⚠️ Attention: Important

1. **Crée un `.env` avec tes credentials**
   ```
   cp .env.example .env
   ```

2. **Génère un App Password Wanadoo** (pas ton password direct!)
   - Wanadoo.fr → Paramètres → Sécurité → App Passwords

3. **Active les alertes dans Caisse d'Épargne**
   - App Caisse d'Épargne → Paramètres → Alertes

**Sans ces 3 trucs, l'app ne fonctionnera pas.**

---

## ❓ Problèmes?

- **Installation**: Voir `INSTALLATION.md`
- **Questions**: Voir `FAQ.md`
- **Bugs**: Regarde les logs du terminal (`npm start`)

---

## 🎨 Les pages principales

### Dashboard
```
- Total dépensé ce mois
- Budgets disponibles
- Alerte si dépassement
- Graphique des dépenses par catégorie
```

### Transactions
```
- Liste des transactions en attente
- Bouton pour catégoriser
- Historique des transactions passées
```

### Paramètres
```
- Créer/modifier des catégories
- Définir les limites budgétaires
```

---

## 🔐 Sécurité: Pas de panique!

✅ **Tes données restent chez toi**
- Aucun serveur tiers ne voit tes transactions
- Aucun cloud, aucun tracking

✅ **Tes credentials sont sécurisés**
- Stockés localement dans `.env`
- Jamais envoyés nulle part

✅ **Tu contrôles tout**
- C'est ton code, ton serveur
- Tu peux tout vérifier/modifier

---

## 💡 Tips d'utilisation

1. **Catégorise rapidement** → Dès qu'une transaction arrive
2. **Créé des vraies catégories** → Pas "Misc" partout
3. **Définis des budgets réalistes** → Basés sur ton habitude
4. **Split si besoin** → 70€ → 50€ Loisir + 20€ Équipement
5. **Check le dashboard 1x/mois** → Voir les tendances

---

## 🚀 Prêt?

**Voici la checklist:**

- [ ] Node.js installé? (https://nodejs.org)
- [ ] Fichiers téléchargés dans un dossier?
- [ ] `.env` créé avec tes credentials?
- [ ] App Password Wanadoo généré?
- [ ] Alertes Caisse d'Épargne activées?

✅ Tout bon? **Ouvre `QUICKSTART.md`!**

---

## 📞 Besoin d'aide immédiate?

1. Relire cette page (oui, vraiment!)
2. Voir `QUICKSTART.md`
3. Voir `INSTALLATION.md` (section Troubleshooting)
4. Voir `FAQ.md`
5. Regarde les logs du terminal

**99% des questions sont dans la FAQ.** 🎯

---

## 🎉 Allez go!

```bash
npm install
npm start
```

**Puis va sur `http://localhost:5000` dans ton navigateur.**

**À toi de jouer!** 🚀
