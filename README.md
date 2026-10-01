# 🚀 EverNote — Votre partenaire de recherche optimisé par l'IA

**EverNote** est une application web moderne inspirée de Google NotebookLM, conçue pour centraliser vos documents (PDF, sites web, vidéos YouTube) et interagir intelligemment avec eux grâce aux derniers modèles Gemini. 

Ce projet a été développé dans le cadre d'un hackathon par l'équipe **ChangeMakers**.

---

##✨ Fonctionnalités Clés

* **🧠 Reressource & Q&A Contextuel :** Posez des questions sur n'importe quel sujet ; les réponses sont toujours ancrées et tracées dans les sources que vous fournissez.
  **🎙️ Résumés Audio Interactifs :** Écoutez un résumé audio de vos sources lu à voix haute, idéal pour assimiler vos cours ou rapports en déplacement.
* **🗂️ Gestion Avancée des Notebooks & Collections :** 
  * Créez, renommez et organisez vos carnets de notes par collections thématiques.
  * Épinglez vos notebooks importants pour un accès rapide en haut du tableau de bord.
  * Recherche instantanée et filtres dynamiques.
* **🔐 Authentification Complète :
* ** Pages dédiées pour la connexion (`login.html`), l'inscription (`signup.html`), et la récupération de mot de passe sécurisée (`forgot.html`).
* **🌐 Exploration Publique :** Découvrez une sélection de notebooks publics et d'exemples pré-remplis pour trouver l'inspiration.



## 🛠️ Stack Technique

Le projet repose sur des technologies légères et performantes, sans nécessiter de configuration de build complexe (parfait pour le prototypage rapide en hackathon) :
* **HTML5 & Tailwind CSS (CDN)** pour le design moderne, sombre et responsive.
* **React 18 & JSX (Babel Standalone)** pour la logique interactive des composants et du tableau de bord directement dans le navigateur.
* **LocalStorage** pour la persistance locale des données (notebooks, collections et session utilisateur).
* **Supabase / PostgreSQL (Optionnel / Base SQL fournie)** pour la gestion des notebooks partagés (`db.sql`).

---

## 📂 Structure du Projet

```text
├── app.html              # Page d'accueil / Landing page (Présentation, démo, hackathon ideas)
├── dashboard.html        # Tableau de bord utilisateur (Gestion des notebooks, collections, épinglés)
├── login.html            # Page de connexion
├── signup.html           # Page d'inscription
├── forgot.html           # Récupération de mot de passe par étapes (Email -> OTP -> Nouveau mdp)
├── page_principale.html  # Interface de discussion et d'analyse des sources du notebook
├── db.sql                # Schéma de base de données SQL (tables, politiques RLS pour les notebooks partagés)
└── assets/
    └── app_logo.png      # Logo de l'application
