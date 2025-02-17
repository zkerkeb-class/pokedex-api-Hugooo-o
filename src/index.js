import express from "express";
import cors from "cors";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Lire le fichier JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokemonsList = JSON.parse(fs.readFileSync(path.join(__dirname, './data/pokemons.json'), 'utf8'));

const app = express();
const PORT = 3000;

// Middleware pour CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour servir des fichiers statiques
// 'app.use' est utilisé pour ajouter un middleware à notre application Express
// '/assets' est le chemin virtuel où les fichiers seront accessibles
// 'express.static' est un middleware qui sert des fichiers statiques
// 'path.join(__dirname, '../assets')' construit le chemin absolu vers le dossier 'assets'
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Route GET de base
app.get("/api/pokemons", (req, res) => {
  res.status(200).send({
    types: [
      "fire",
      "water",
      "grass",
      "electric",
      "ice",
      "fighting",
      "poison",
      "ground",
      "flying",
      "psychic",
      "bug",
      "rock",
      "ghost",
      "dragon",
      "dark",
      "steel",
      "fairy",
    ],
    pokemons: pokemonsList,
  });
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API Pokémon");
});

app.get("/api/pokemons/:id", (req, res) => {
  res.status(200).send({
    pokemon: pokemonsList[parseInt(req.params.id) - 1],
  });
});

app.post("/api/pokemons", (req, res) => {
  try {
    const newPokemon = req.body;
    pokemonsList.push(newPokemon);
    console.log(newPokemon);
    // Sauvegarde dans le fichier JSON
    fs.writeFileSync(
      path.join(__dirname, './data/pokemons.json'),
      JSON.stringify(pokemonsList, null, 2),
      'utf8'
    );
    
    res.status(201).send(newPokemon);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).send({ error: "Erreur lors de la sauvegarde du pokemon" });
  }
});

app.put("/api/pokemons/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedPokemon = req.body;
    pokemonsList[id - 1] = updatedPokemon;
    // Sauvegarde dans le fichier JSON
    fs.writeFileSync(
      path.join(__dirname, './data/pokemons.json'),
      JSON.stringify(pokemonsList, null, 2),
      'utf8'
    );

    res.status(200).send(updatedPokemon);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).send({ error: "Erreur lors de la sauvegarde du pokemon" });
  }
});

app.delete("/api/pokemons/:id", (req, res) => { 
  try {
    const id = parseInt(req.params.id);
    const deletedPokemon = pokemonsList.splice(id - 1, 1);
    // Sauvegarde dans le fichier JSON  
    fs.writeFileSync(
      path.join(__dirname, './data/pokemons.json'),
      JSON.stringify(pokemonsList, null, 2),
      'utf8'
    );

    res.status(200).send(deletedPokemon);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).send({ error: "Erreur lors de la suppression du pokemon" });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
