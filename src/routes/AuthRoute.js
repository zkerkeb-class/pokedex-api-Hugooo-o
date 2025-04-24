import express from 'express';
import User from '../models/user.js';
import Pokemon from '../models/Pokemon.js';
import { generateToken, verifyToken, verifyAdmin } from '../auth/auth.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        
        // Seul un administrateur peut créer un autre administrateur
        let adminStatus = false;
        if (isAdmin) {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const adminUser = await User.findById(decoded.userId);
                    if (adminUser && adminUser.isAdmin) {
                        adminStatus = true;
                    }
                } catch (error) {
                    // Token invalide, on ne fait rien et adminStatus reste false
                }
            }
        }
        
        const user = new User({ 
            username, 
            password,
            isAdmin: adminStatus
        });
        
        await user.save();
        
        const token = generateToken(user._id);
        res.status(201).json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: "Identifiant et/ou mot de passe incorrect" });
        }
        
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Identifiant et/ou mot de passe incorrect" });
        }
        
        const token = generateToken(user._id);
        res.json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route pour récupérer les pokémons de l'utilisateur
router.get('/my-pokemons', verifyToken, async (req, res) => {
    try {
        // Récupérer l'utilisateur avec ses cartes Pokémon
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'pokemonCards.pokemonId',
                model: 'Pokemon'
            })
            .populate('pokemons'); // Pour la compatibilité
        
        // Utiliser d'abord pokemonCards (nouvelle méthode) si disponible
        if (user.pokemonCards && user.pokemonCards.length > 0) {
            // Transformer les données pour inclure toutes les infos
            const cards = user.pokemonCards.map(card => {
                const pokemon = card.pokemonId;
                if (!pokemon) return null;
                
                return {
                    id: pokemon.id,
                    name: pokemon.name,
                    type: pokemon.type,
                    base: pokemon.base,
                    image: pokemon.image,
                    collectionId: card.collectionId,
                    addedAt: card.obtainedAt
                };
            }).filter(Boolean); // Éliminer les nulls
            
            // Calculer les compteurs
            const counts = {};
            cards.forEach(card => {
                counts[card.id] = (counts[card.id] || 0) + 1;
            });
            
            // Ajouter la propriété count à chaque carte
            const cardsWithCount = cards.map(card => ({
                ...card,
                count: counts[card.id]
            }));
            
            return res.status(200).json(cardsWithCount);
        } 
        // Si pas de pokemonCards, utiliser l'ancienne méthode
        else if (user.pokemons && user.pokemons.length > 0) {
            return res.status(200).json(user.pokemons);
        }
        
        // Aucun Pokémon trouvé
        return res.status(200).json([]);
    } catch (error) {
        console.error('Erreur lors de la récupération des pokémons:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route pour ajouter des pokémons à la collection d'un utilisateur
router.post('/add-pokemons', verifyToken, async (req, res) => {
    try {
        const { pokemons } = req.body;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        // Pour chaque pokémon reçu
        const savedPokemonIds = [];
        const savedCards = [];

        for (const pokemonData of pokemons) {
            // Vérifier si le pokémon existe déjà dans la base de données
            let pokemon = await Pokemon.findOne({ id: pokemonData.id });
            
            // Si le pokémon n'existe pas, le créer
            if (!pokemon) {
                pokemon = new Pokemon({
                    id: pokemonData.id,
                    name: pokemonData.name,
                    type: pokemonData.type,
                    base: pokemonData.base,
                    image: pokemonData.image
                });
                await pokemon.save();
            }
            
            // Toujours ajouter à pokemons[] pour compatibilité avec l'ancien système
            if (!user.pokemons.includes(pokemon._id)) {
                user.pokemons.push(pokemon._id);
            }
            
            // Ajouter une nouvelle carte avec ID unique à pokemonCards[]
            const collectionId = pokemonData.collectionId || 
                        `${pokemon.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Créer une nouvelle carte dans la collection
            const newCard = {
                pokemonId: pokemon._id,
                obtainedAt: pokemonData.addedAt || new Date(),
                collectionId: collectionId
            };
            
            user.pokemonCards.push(newCard);
            savedPokemonIds.push(pokemon._id);
            savedCards.push({
                ...newCard,
                pokemon: pokemon
            });
        }
        
        await user.save();
        
        res.status(200).json({
            message: "Pokémons ajoutés avec succès",
            cardsAdded: savedCards.length,
            cards: savedCards
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des pokémons:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route pour vérifier si l'utilisateur est administrateur
router.get('/check-admin', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.status(200).json({
            isAdmin: user.isAdmin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour promouvoir un utilisateur en administrateur (réservée aux administrateurs)
router.post('/promote/:userId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        user.isAdmin = true;
        await user.save();
        
        res.status(200).json({
            message: "L'utilisateur a été promu administrateur",
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Nouvelle route pour permettre à un utilisateur de se promouvoir lui-même administrateur (pour la démo)
router.post('/self-promote', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        // Vérifier si l'utilisateur est déjà admin
        if (user.isAdmin) {
            return res.status(200).json({
                message: "Vous êtes déjà administrateur",
                user: {
                    id: user._id,
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            });
        }
        
        // Promouvoir l'utilisateur en administrateur
        user.isAdmin = true;
        await user.save();
        
        res.status(200).json({
            message: "Vous êtes maintenant administrateur",
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Erreur lors de la promotion:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;