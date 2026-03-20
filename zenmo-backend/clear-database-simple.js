/**
 * Script pour nettoyer la base de données MongoDB
 * 
 * Usage:
 * 1. Assurez-vous que le backend est arrêté
 * 2. Exécutez: node clear-database-simple.js
 */

const mongoose = require('mongoose');

// Remplacez par votre URI MongoDB (depuis .env)
const MONGODB_URI = 'mongodb+srv://nicedtv:Niced2906@cluster0.nnvmn.mongodb.net/zenmo?retryWrites=true&w=majority';

async function clearDatabase() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');

        const db = mongoose.connection.db;

        // Récupérer toutes les collections
        const collections = await db.listCollections().toArray();

        console.log(`📊 ${collections.length} collections trouvées\n`);
        console.log('🗑️  Suppression des données...\n');

        let totalDeleted = 0;

        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const result = await coll.deleteMany({});
            console.log(`✅ ${collection.name}: ${result.deletedCount} documents supprimés`);
            totalDeleted += result.deletedCount;
        }

        console.log(`\n✅ Total: ${totalDeleted} documents supprimés`);
        console.log('✅ Base de données nettoyée avec succès!\n');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
        process.exit(0);
    }
}

// Confirmation
console.log('\n⚠️  ATTENTION: Cette action va supprimer TOUTES les données!\n');
console.log('Collections qui seront vidées:');
console.log('  - users');
console.log('  - loginattempts');
console.log('  - conversations');
console.log('  - messages');
console.log('  - vibes');
console.log('  - stories');
console.log('  - et toutes les autres...\n');
console.log('Appuyez sur Ctrl+C pour annuler dans les 3 secondes...\n');

setTimeout(() => {
    clearDatabase();
}, 3000);
