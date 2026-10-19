# 🧪 Guide de test

## Test du setup local

### 1. Vérifier l'installation

```bash
# Vérifier Node.js
node --version
# Doit afficher: v18.X.X ou plus

npm --version
# Doit afficher: 9.X.X ou plus
```

### 2. Vérifier les dépendances

```bash
# Vérifier que les dépendances sont installées
npm ls
# Ne doit pas avoir d'erreur "missing"
```

### 3. Tester le démarrage

```bash
npm start
```

**Tu devrais voir:**
```
✅ Database initialized
✅ IMAP bot started
✅ IMAP connection ready
📧 INBOX opened, watching for new emails...
🚀 Server running on http://localhost:5000
📊 API available at http://localhost:5000/api
```

### 4. Tester l'interface

1. Ouvre `http://localhost:5000` dans le navigateur
2. Tu devrais voir:
   - **Navigation bar** avec "Dashboard", "Transactions", "Paramètres"
   - **Dashboard** avec statistiques (probablement vides si pas de données)
   - **Onglet Transactions** vide (pas de transactions encore)

### 5. Tester les API

```bash
# Dans un autre terminal:

# Get health status
curl http://localhost:5000/api/health

# Doit retourner:
# {"status":"ok","imapConnected":false}

# Get all transactions
curl http://localhost:5000/api/transactions

# Doit retourner un array (vide ou avec données)

# Get all categories
curl http://localhost:5000/api/categories

# Doit retourner un array
```

---

## Test avec données

### Option 1: Données de test

```bash
# Dans un nouveau terminal (le serveur tourne toujours):
npm run seed

# Cela peuplera la base avec:
# - 6 catégories (Alimentation, Transports, etc.)
# - 6 budgets configurés
# - 9 transactions de test
```

**Après, reload la page `http://localhost:5000`**

Tu devrais voir:
- Dashboard avec des stats
- Transactions à catégoriser
- Les catégories dans les paramètres

### Option 2: Données réelles

Une fois que tu as activé les alertes Caisse d'Épargne:
1. Fais une petite transaction
2. Attends 5-10 min
3. Une nouvelle transaction devrait apparaître

---

## Tests spécifiques

### Test 1: Catégorisation

1. Va sur l'onglet "Transactions"
2. Clique "Catégoriser" sur une transaction
3. Sélectionne une catégorie
4. Clique "Valider"
5. La transaction devrait passer en "Catégorisée"

### Test 2: Split budgétaire

1. Va sur l'onglet "Transactions"
2. Clique "Catégoriser"
3. Clique "+ Ajouter une catégorie"
4. Sélectionne 2 catégories et split le montant
5. Ex: 100€ → 60€ Catégorie A + 40€ Catégorie B
6. Le total doit égaler le montant original
7. Clique "Valider"

### Test 3: Budget et alertes

1. Va sur "Paramètres"
2. Définis un budget bas (ex: 10€) pour "Alimentation"
3. Catégorise une transaction > 10€ en "Alimentation"
4. Retourne au Dashboard
5. Tu devrais voir une alerte "Dépassements de budget"

### Test 4: Créer une catégorie

1. Va sur "Paramètres"
2. Rentre un nom (ex: "Nouveau") et choisis une couleur
3. Clique "Ajouter"
4. La catégorie devrait apparaître dans la liste

### Test 5: Éditer un budget

1. Va sur "Paramètres"
2. Rentre un montant pour une catégorie
3. C'est sauvegardé immédiatement
4. Va au Dashboard
5. Le budget devrait être mis à jour

---

## Tests d'API

### Créer une catégorie

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","color":"#FF0000"}'
```

### Assigner un budget

```bash
# D'abord, get la catégorie ID (dans la réponse précédente)
curl -X POST http://localhost:5000/api/categories/{CATEGORY_ID}/budget \
  -H "Content-Type: application/json" \
  -d '{"limitAmount":500}'
```

### Catégoriser une transaction

```bash
# D'abord, get la transaction ID (http://localhost:5000/api/transactions)
# Et la catégorie ID

curl -X POST http://localhost:5000/api/transactions/{TRANSACTION_ID}/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "splits": [
      {"categoryId":"CAT_ID_1","amount":50},
      {"categoryId":"CAT_ID_2","amount":20}
    ]
  }'
```

---

## Checklist de validation

- [ ] Le serveur démarre sans erreur
- [ ] Le site charge sur `http://localhost:5000`
- [ ] Les 3 onglets sont visibles (Dashboard, Transactions, Paramètres)
- [ ] Pas d'erreurs JavaScript dans la console (F12)
- [ ] Les API répondent correctement
- [ ] Peut créer une catégorie
- [ ] Peut définir un budget
- [ ] Peut catégoriser une transaction
- [ ] Peut splitter une transaction
- [ ] Les alertes s'affichent si budget dépassé
- [ ] Le refresh du dashboard met à jour les stats

---

## Logs à vérifier

### Bon logs (démarrage)

```
✅ Database initialized
✅ IMAP bot started
✅ IMAP connection ready
📧 INBOX opened, watching for new emails...
📬 X new email(s) detected
📧 Processing email: ...
✅ Transaction saved: MERCHANT - Amount€
```

### Mauvais logs (à investiguer)

```
❌ IMAP error: auth failed     → Problem credentials
❌ Error: connect ECONNREFUSED → Port en utilisation
Error: ENOENT: no such file    → Fichier manquant
```

---

## Performance

- **Démarrage:** ~2-3 secondes
- **Dashboard charge:** < 1 seconde
- **IMAP check:** Toutes les 5 minutes
- **API response:** < 100ms

---

## Checklist de déploiement (avant Railway)

- [ ] Fonctionne en local sans erreur
- [ ] Toutes les features testées
- [ ] `.env` a les bons credentials Wanadoo
- [ ] Alertes Caisse d'Épargne activées
- [ ] Au moins 1 transaction testée avec le vrai email
- [ ] Pas de logs d'erreur au démarrage

---

## Dépannage

### Erreur: "Port 5000 in use"
```bash
PORT=3000 npm start
# Utilise le port 3000 à la place
```

### Erreur: "IMAP auth failed"
- Vérifier `.env`
- Vérifier que c'est un App Password (pas le password direct)

### Pas de transactions
- Vérifier les logs du terminal
- Vérifier que les alertes Caisse d'Épargne sont activées
- Faire une vraie transaction et attendre 5-10 min

### Erreur database
```bash
# Reset la base (données perdues!)
rm -rf data/
npm start
```

---

## C'est bon! 🎉

Si tous les tests passent, l'app est prête pour:
- Utilisation quotidienne
- Déploiement sur Railway
- Partage avec d'autres utilisateurs (après adaptation multi-user)
