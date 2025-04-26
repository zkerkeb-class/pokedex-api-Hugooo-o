import express from 'express';
import Pokemon from '../models/Pokemon.js';
import { verifyToken, verifyAdmin } from '../auth/auth.js';

const router = express.Router();

// GET - Récupérer tous les pokémons
router.get('/', async (req, res) => {
  try {
    const pokemons = await Pokemon.find({});
    res.status(200).json(pokemons);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des pokémons",
      error: error.message
    });
  }
});

// GET - Récupérer un pokémon par son ID
router.get('/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findOne({ id: req.params.id });
    if (!pokemon) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
    }
    res.status(200).json(pokemon);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du pokémon",
      error: error.message
    });
  }
});

// POST - Créer un nouveau pokémon (authentification + droits admin requis)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Vérifier si l'ID existe déjà
    const existingPokemon = await Pokemon.findOne({ id: req.body.id });
    if (existingPokemon) {
      return res.status(400).json({ message: "Un pokémon avec cet ID existe déjà" });
    }
    const newPokemon = new Pokemon(req.body);
    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création du pokémon",
      error: error.message
    });
  }
});

// PUT - Mettre à jour un pokémon (authentification + droits admin requis)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updatedPokemon = await Pokemon.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPokemon) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
    }
    res.status(200).json(updatedPokemon);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour du pokémon",
      error: error.message
    });
  }
});

// DELETE - Supprimer un pokémon (authentification + droits admin requis)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedPokemon = await Pokemon.findOneAndDelete({ id: req.params.id });
    if (!deletedPokemon) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
    }
    res.status(200).json({
      message: "Pokémon supprimé avec succès",
      pokemon: deletedPokemon
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du pokémon",
      error: error.message
    });
  }
});

export default router;
