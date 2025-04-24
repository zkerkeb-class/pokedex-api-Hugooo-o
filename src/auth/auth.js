import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

// Middleware pour vérifier le token JWT
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Un token est requis pour l'authentification" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

// Middleware pour vérifier les droits d'administration
export const verifyAdmin = async (req, res, next) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        if (!req.user || !req.user.userId) {
            return res.status(403).json({ message: "Authentification requise" });
        }

        // Récupérer les informations de l'utilisateur
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si l'utilisateur est un administrateur
        if (!user.isAdmin) {
            return res.status(403).json({ message: "Accès refusé. Droits d'administrateur requis." });
        }

        // Si tout est bon, continuer
        next();
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la vérification des droits d'administration" });
    }
};

// Générer un token JWT
export const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};