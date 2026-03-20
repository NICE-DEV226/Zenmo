const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Script pour créer un compte SUPER_ADMIN
 * SÉCURITÉ : À exécuter UNE SEULE FOIS pour créer votre compte admin un fois 
 */

async function createSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // CONFIGURATION : Modifiez ces valeurs
        const username = 'admin'; // CHANGEZ ICI
        const phoneNumber = '+22670000000'; // CHANGEZ ICI

        // Vérifier si le user existe
        const user = await mongoose.connection.db.collection('users').findOne({ username });

        if (!user) {
            console.error(`❌ User "${username}" not found`);
            console.log('\n💡 Créez d\'abord un compte normal via l\'app, puis relancez ce script');
            process.exit(1);
        }

        // Mettre à jour le role en SUPER_ADMIN
        const result = await mongoose.connection.db.collection('users').updateOne(
            { username },
            {
                $set: {
                    role: 'SUPER_ADMIN',
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ User "${username}" promoted to SUPER_ADMIN`);
            console.log(`\n🔐 Vous pouvez maintenant vous connecter au dashboard admin avec :`);
            console.log(`   - Phone: ${phoneNumber}`);
            console.log(`   - Password: votre_password`);
            console.log(`   - Header X-Admin-Secret: ${process.env.ADMIN_SECRET_KEY || 'CONFIGUREZ_DANS_.ENV'}`);
        } else {
            console.log(`ℹ️  User "${username}" is already SUPER_ADMIN`);
        }

        // Afficher le user
        const updatedUser = await mongoose.connection.db.collection('users').findOne(
            { username },
            { projection: { username, role: 1, phoneNumber: 1, createdAt: 1 } }
        );
        console.log('\n📋 User details:');
        console.log(updatedUser);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createSuperAdmin();
