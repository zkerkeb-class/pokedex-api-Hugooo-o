import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    french: {
      type: String,
      required: true
    },
    english: {
      type: String,
      required: false
    },
    japanese: {
      type: String,
      required: false
    },
    chinese: {
      type: String,
      required: false
    }
  },
  type: [{
    type: String,
    enum: [
      "Fire", "Water", "Grass", "Electric", "Ice", "Fighting",
      "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock",
      "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Normal"
    ]
  }],
  image: {
    type: String
  },
  base: {
    HP: Number,
    Attack: Number,
    Defense: Number,
    SpecialAttack: Number,
    SpecialDefense: Number,
    Speed: Number
  }
}, {
  timestamps: true
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
