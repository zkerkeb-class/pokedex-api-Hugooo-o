import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndexes = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connecté à MongoDB');

    // Obtenir la collection utilisateurs
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Lister tous les index
    const indexes = await usersCollection.indexes();
    console.log('Index existants:', indexes);

    // Supprimer l'index problématique s'il existe
    try {
      await usersCollection.dropIndex('pokemonCards.collectionId_1');
      console.log('Index pokemonCards.collectionId_1 supprimé avec succès');
    } catch (error) {
      console.log('Impossible de supprimer l\'index pokemonCards.collectionId_1:', error.message);
    }

    // Vérifier les index restants
    const remainingIndexes = await usersCollection.indexes();
    console.log('Index restants:', remainingIndexes);

    console.log('Opération terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la suppression des index:', error);
    process.exit(1);
  }
};

dropIndexes(); 