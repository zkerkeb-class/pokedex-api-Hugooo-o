import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Pokemon from '../models/Pokemon.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Lecture du fichier JSON
        const pokemons = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/pokemons.json'),
                'utf-8'
            )
        );

        // Suppression des données existantes
        await Pokemon.deleteMany({});
        console.log('Data deleted');

        // Insertion des nouvelles données
        await Pokemon.insertMany(pokemons);
        console.log('Data imported successfully');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

importData();