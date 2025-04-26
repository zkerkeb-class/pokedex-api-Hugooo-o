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
        required: true
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    registrationTimestamp: {
        type: String,
        default: () => new Date().toISOString()
    },
    // Ancienne méthode (pour compatibilité) - à ne plus utiliser
    pokemons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon'
    }],
    // Nouvelle méthode avec des cartes individuelles
    pokemonCards: {
        type: [userPokemonCardSchema],
        default: []
    }
}, {
    // Optimisation pour assurer que l'ID est généré automatiquement
    // et pour ajouter les timestamps automatiques
    timestamps: true
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Force la création d'un nouvel ID pour chaque nouvel utilisateur
userSchema.pre('validate', function(next) {
    if (this.isNew && !this._id) {
        this._id = new mongoose.Types.ObjectId();
    }
    next();
});

// Créer le modèle 
const User = mongoose.model('User', userSchema);

export default User;