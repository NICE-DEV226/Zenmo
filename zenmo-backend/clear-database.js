const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clearDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI not found in .env file');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();

        // Liste des collections à nettoyer
        const collections = [
            'users',
            'loginattempts',
            'reversecontactbooks',
            'userdevices',
            'conversations',
            'messages',
            'vibes',
            'stories',
            'comments',
            'securitylogs',
            'notifications'
        ];

        console.log('\n🗑️  Nettoyage de la base de données...\n');

        for (const collectionName of collections) {
            try {
                const collection = db.collection(collectionName);
                const result = await collection.deleteMany({});
                console.log(`✅ ${collectionName}: ${result.deletedCount} documents supprimés`);
            } catch (error) {
                console.log(`⚠️  ${collectionName}: Collection n'existe pas ou erreur`);
            }
        }

        console.log('\n✅ Base de données nettoyée avec succès!\n');

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('🔌 Connexion fermée');
    }
}

// Confirmation avant suppression
console.log('⚠️  ATTENTION: Cette action va supprimer TOUTES les données de la base de données!');
console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 3 secondes...\n');

setTimeout(() => {
    clearDatabase();
}, 3000);
