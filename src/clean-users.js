import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanUsers = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connecté à MongoDB');

    // Option 1: Supprimer tous les utilisateurs (solution radicale)
    // const deleteResult = await mongoose.connection.db.collection('users').deleteMany({});
    // console.log(`${deleteResult.deletedCount} utilisateurs supprimés`);

    // Option 2: Plus douce - supprimer uniquement les index problématiques
    const indexesResult = await mongoose.connection.db.collection('users').listIndexes().toArray();
    console.log('Index actuels:', indexesResult.map(idx => `${idx.name} (${JSON.stringify(idx.key)})`).join('\n'));

    // Supprimer tous les index sauf _id
    for (const index of indexesResult) {
      if (index.name !== '_id_') {
        try {
          await mongoose.connection.db.collection('users').dropIndex(index.name);
          console.log(`Index ${index.name} supprimé`);
        } catch (dropError) {
          console.error(`Erreur lors de la suppression de l'index ${index.name}:`, dropError);
        }
      }
    }

    // Vérifier les index restants
    const remainingIndexes = await mongoose.connection.db.collection('users').listIndexes().toArray();
    console.log('Index restants:', remainingIndexes.map(idx => idx.name).join(', '));

    // Vérifier si des utilisateurs ont des champs pokemonCards vides ou null
    const usersWithEmptyCards = await mongoose.connection.db.collection('users').find({
      $or: [
        { pokemonCards: { $exists: false } },
        { pokemonCards: null },
        { pokemonCards: [] }
      ]
    }).toArray();

    console.log(`${usersWithEmptyCards.length} utilisateurs trouvés avec des cartes vides ou nulles`);

    // Mettre à jour ces utilisateurs pour avoir au moins une carte factice
    if (usersWithEmptyCards.length > 0) {
      for (const user of usersWithEmptyCards) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              pokemonCards: [{
                pokemonId: new mongoose.Types.ObjectId(),
                obtainedAt: new Date(),
                collectionId: `fixed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
              }] 
            } 
          }
        );
        console.log(`Utilisateur ${user.username || user._id} mis à jour avec une carte factice`);
      }
    }

    console.log('Nettoyage terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du nettoyage des utilisateurs:', error);
    process.exit(1);
  }
};

cleanUsers(); 