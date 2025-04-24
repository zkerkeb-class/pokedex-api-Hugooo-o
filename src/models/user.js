import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Schéma pour une carte Pokémon dans la collection d'un utilisateur
const userPokemonCardSchema = new mongoose.Schema({
    pokemonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon',
        required: true
    },
    obtainedAt: {
        type: Date,
        default: Date.now
    },
    collectionId: {
        type: String,
        required: true,
        unique: true
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // Ancienne méthode (pour compatibilité) - à ne plus utiliser
    pokemons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon'
    }],
    // Nouvelle méthode avec des cartes individuelles
    pokemonCards: [userPokemonCardSchema]
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);