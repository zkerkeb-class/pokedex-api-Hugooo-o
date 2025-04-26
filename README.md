# Pokédex - Application Web

## Description du projet

Ce projet est une application web Pokédex complète permettant de consulter, rechercher, modifier et collectionner des Pokémon. L'application est divisée en deux parties :

- **Frontend** : Une interface utilisateur React moderne et responsive qui permet de visualiser les Pokémon, filtrer par type, rechercher par nom, et gérer sa collection personnelle.
- **Backend** : Une API RESTful qui gère les données des Pokémon, l'authentification des utilisateurs et les collections personnelles.

L'application offre des fonctionnalités avancées comme la gestion des utilisateurs (inscription, connexion), un système d'administration pour gérer les Pokémon (ajout, modification, suppression), et un système de collection permettant aux utilisateurs d'obtenir des Pokémon via des boosters.

## Instructions d'installation

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- MongoDB (pour le backend)

### Installation du frontend

1. Clonez le dépôt :
   ```bash
   git clone <url-du-depot>
   cd pokedex-starter-Hugooo-o
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine du projet frontend avec les variables suivantes :
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```

L'application sera accessible à l'adresse `http://localhost:5173`.

### Installation du backend

1. Naviguez vers le dossier du backend :
   ```bash
   cd ../pokedex-api-Hugooo-o
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine du projet backend avec les variables suivantes :
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pokedex
   JWT_SECRET=votre_secret_jwt
   API_URL=http://localhost:3000
   ```

4. Lancez le serveur :
   ```bash
   npm start
   ```

Le serveur sera accessible à l'adresse `http://localhost:3000`.

## Documentation de l'API

### Authentification

#### Inscription
- **URL** : `/api/auth/register`
- **Méthode** : `POST`
- **Corps de la requête** :
  ```json
  {
    "username": "votreUsername",
    "password": "votreMotDePasse"
  }
  ```
- **Réponse** : Retourne les informations de l'utilisateur créé et un token JWT

#### Connexion
- **URL** : `/api/auth/login`
- **Méthode** : `POST`
- **Corps de la requête** :
  ```json
  {
    "username": "votreUsername",
    "password": "votreMotDePasse"
  }
  ```
- **Réponse** : Retourne les informations de l'utilisateur et un token JWT

#### Vérification du statut admin
- **URL** : `/api/auth/check-admin`
- **Méthode** : `GET`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Réponse** : Retourne le statut admin de l'utilisateur

### Pokémon

#### Récupérer tous les Pokémon
- **URL** : `/api/pokemons`
- **Méthode** : `GET`
- **Réponse** : Liste de tous les Pokémon

#### Récupérer un Pokémon spécifique
- **URL** : `/api/pokemons/:id`
- **Méthode** : `GET`
- **Réponse** : Détails du Pokémon correspondant à l'ID

#### Créer un Pokémon (Admin uniquement)
- **URL** : `/api/pokemons`
- **Méthode** : `POST`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Corps de la requête** : Informations du Pokémon à créer
- **Réponse** : Détails du Pokémon créé

#### Modifier un Pokémon (Admin uniquement)
- **URL** : `/api/pokemons/:id`
- **Méthode** : `PUT`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Corps de la requête** : Informations du Pokémon à modifier
- **Réponse** : Détails du Pokémon modifié

#### Supprimer un Pokémon (Admin uniquement)
- **URL** : `/api/pokemons/:id`
- **Méthode** : `DELETE`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Réponse** : Confirmation de suppression

### Gestion des collections

#### Récupérer les Pokémon de l'utilisateur
- **URL** : `/api/auth/mypokemon`
- **Méthode** : `GET`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Réponse** : Liste des Pokémon dans la collection de l'utilisateur

#### Ouvrir un booster
- **URL** : `/api/auth/open-booster`
- **Méthode** : `POST`
- **Headers** : `Authorization: Bearer votre_token_jwt`
- **Réponse** : Liste des Pokémon obtenus dans le booster

## Ressources additionnelles

Les images des Pokémon sont accessibles via l'URL :
```
http://localhost:3000/assets/pokemons/{id}.png
```

Par exemple, pour accéder à l'image de Pikachu (ID: 25) :
```
http://localhost:3000/assets/pokemons/25.png
```

## Technologies utilisées

- **Frontend** : React, Vite, React Router, Axios
- **Backend** : Node.js, Express, MongoDB, Mongoose, JWT

## Lien vers la vidéo Youtube

https://youtu.be/d5DELlamZFI
