# ❓ FAQ - Questions fréquentes

## 🚀 Installation & Setup

### Q: C'est facile à installer?
**A:** Oui! 5 commandes et c'est bon (voir `QUICKSTART.md`)

### Q: Node.js c'est quoi? J'en ai besoin?
**A:** C'est l'environnement pour faire tourner l'app. Il faut l'installer une fois (https://nodejs.org). C'est comme avoir un "moteur" pour la app.

### Q: Pourquoi je dois générer un "app password" Wanadoo?
**A:** Pour sécurité. Wanadoo ne veut pas que tu donnes directement ton mot de passe à des apps externes. L'app password est spécifique et tu peux le révoquer n'importe quand.

### Q: .env c'est quoi?
**A:** Un fichier où tu mets tes credentials sensibles (email, password). Il est dans `.gitignore` donc jamais envoyé sur GitHub.

---

## 🔄 Fonctionnement des emails

### Q: Les emails arrivent-ils vraiment automatiquement?
**A:** Le bot IMAP surveille ta boîte **toutes les 5 minutes**. Donc max ~5 min de délai avant que la transaction apparaisse.

### Q: Que se passe-t-il si je n'ai pas activé les alertes Caisse d'Épargne?
**A:** L'app ne verra jamais les transactions. Faut absolument activer "Alertes" dans l'app Caisse d'Épargne.

### Q: Et si une transaction n'est pas détectée?
**A:** Possibilités:
1. L'alerte Caisse d'Épargne n'a pas été créée
2. L'email n'est pas arrivé
3. Le format de l'email n'est pas reconnu

**Solution:** Attends 5 min, puis regarde les logs du terminal pour voir si le bot a capté un email.

### Q: Peut-on tracker les virements reçus (les rentrées)?
**A:** Actuellement non (design volontaire: suivi des **dépenses**). Mais c'est facile à ajouter si tu veux.

---

## 💾 Données & Sécurité

### Q: Où sont stockées mes données?
**A:** Dans un fichier `data/expenses.db` sur ton ordinateur (ou le serveur si déployé). **Jamais** sur un serveur tiers.

### Q: Quelqu'un peut voir mes transactions?
**A:** Non. Les données restent 100% chez toi. Pas de cloud, pas de tiers.

### Q: Comment je fais une sauvegarde?
**A:** Juste copier le fichier `data/expenses.db` ailleurs. C'est tout.

### Q: Je peux supprimer une transaction?
**A:** Oui, il y a un bouton pour ça. Elle est supprimée de la base.

---

## 💰 Budgets & Alertes

### Q: Que se passe-t-il si je dépasse un budget?
**A:** Une alerte s'affiche sur le dashboard. Rien de plus (pas d'email d'alerte pour le moment).

### Q: Je peux changer un budget en cours de mois?
**A:** Oui, clique sur le budget et change la limite. Ça met à jour immédiatement.

### Q: Les budgets se réinitialisent chaque mois?
**A:** Oui, les dépenses sont calculées par mois civil (1er au dernier jour).

### Q: Je peux faire un split (une transaction = plusieurs catégories)?
**A:** Oui! Quand tu catégorises, tu peux ajouter plusieurs catégories et dispatcher le montant (ex: 70€ → 50€ loisir + 20€ équipement).

---

## 🌐 Déploiement & Serveur

### Q: Local vs Serveur, c'est quoi la différence?
**A:**
- **Local:** L'app tourne sur ton ordi. Accès via `http://localhost:5000`. Que depuis la maison.
- **Serveur (Railway):** L'app tourne sur internet. Accès depuis n'importe où. Coûte ~2€/mois.

### Q: Lequel je recommande?
**A:** Pour débuter → Local. Une fois que tu l'aimes → Railway (~2€/mois pour du 24/7 fiable).

### Q: J'ai déjà déployé en local. Comment je passe à Railway?
**A:** C'est facile (voir `README.md` section "Déployer sur Railway").

### Q: Combien ça coûte Railway?
**A:** ~2€/mois pour l'usage décrit (petit bot + site web).

### Q: Et si j'utilise Render au lieu de Railway?
**A:** Pareil! Instructions similaires (voir `README.md`).

---

## 🔧 Troubleshooting

### Q: "npm: command not found"
**A:** Node.js n'est pas installé. Installe-le depuis https://nodejs.org

### Q: "IMAP auth failed"
**A:** Vérif:
- Ton `IMAP_USER` est correct
- Ton `IMAP_PASSWORD` est un app password (pas ton mot de passe Wanadoo directement)
- IMAP est activé dans Wanadoo

### Q: "Port 5000 already in use"
**A:** Un autre app utilise ce port. Soit:
- Tue l'autre app
- Ou utilise un port différent: `PORT=3000 npm start`

### Q: Pas de transactions qui apparaissent
**A:** Check:
1. Les alertes sont activées dans Caisse d'Épargne? (Paramètres → Alertes)
2. T'as fait une transaction depuis?
3. Attends 5 min minimum
4. Regarde les logs du terminal pour voir si le bot a reçu l'email

### Q: L'app crashe au démarrage
**A:** Regarde le message d'erreur dans le terminal. Souvent:
- `.env` mal configuré
- Dépendances mal installées (`npm install` again)
- Port déjà utilisé

### Q: Comment je vois les logs?
**A:** Dans le terminal où tu as lancé `npm start`. Ils s'affichent en direct.

---

## 🎨 Customisation

### Q: Je peux changer les couleurs?
**A:** Oui. Quando tu crées une catégorie, tu choisis la couleur.

### Q: Je peux ajouter mes propres catégories?
**A:** Bien sûr! Onglet "Paramètres" → Ajouter une catégorie.

### Q: Je peux renommer une catégorie?
**A:** Pas de UI pour ça actuellement, mais c'est facile à ajouter. (Ou éditer la base SQLite directement).

### Q: Pourquoi l'interface est en français?
**A:** Parce que c'était pour toi! 😄 (Tu peux la modifier si tu veux changer la langue.)

---

## 📱 Mobile & Responsive

### Q: Ça marche sur le téléphone?
**A:** Oui, l'interface est responsive (s'adapte à la taille de l'écran).

### Q: Je peux catégoriser depuis le téléphone?
**A:** Oui! Si tu as déployé sur un serveur (Railway), tu peux accéder depuis n'importe quel appareil.

### Q: Y a une app mobile native (iOS/Android)?
**A:** Non, mais tu peux l'utiliser dans le navigateur (ça fait pareil). C'est "Progressive Web App" compatible.

---

## 🐛 Bugs & Limites

### Q: Qu'est-ce qui n'est pas implémenté?
**A:**
- Email d'alerte quand tu dépasses un budget (affichage seulement)
- Multi-utilisateurs (c'est perso pour l'instant)
- Export des données (possible mais pas implémenté)
- Support d'autres banques que Caisse d'Épargne

### Q: Et les virements, prélèvements, c'est tracking?
**A:** Oui, si tu as activé les bons types d'alerte dans Caisse d'Épargne.

### Q: Pourquoi le parsing ne marche pas sur certains emails?
**A:** L'email-parser cherche un format spécifique (montant + "€" + lieu). Si Caisse d'Épargne change le format, ça peut casser.

---

## 💡 Conseils d'utilisation

### Comment bien utiliser l'app?

1. **Catégorise rapidement** → Dès qu'une transaction arrive (max 5 min)
2. **Crée des vraies catégories** → Pas "Divers" partout
3. **Définis des budgets réalistes** → Basés sur tes habitudes
4. **Reviens au dashboard une fois par mois** → Voir les tendances

### Cas d'usage avancé?

- **Split budgétaire:** Une transaction peut être dans plusieurs catégories
- **Budget par catégorie:** Chaque catégorie a sa limite
- **Alertes visuelles:** Dashboard montre qui est rouge (budget dépassé)

---

## 📞 Support / Aide

Si tu as encore des questions:
1. Relire `README.md` et `INSTALLATION.md`
2. Regarder les logs du terminal (`npm start`)
3. Vérifier que la config `.env` est correcte
4. Essayer de relancer l'app (`npm start`)

**Ça devrait couvrir 99% des cas!** 🎉
