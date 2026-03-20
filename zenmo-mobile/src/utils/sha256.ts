
import * as Crypto from 'expo-crypto';

export async function sha256(message: string): Promise<string> {
    // Utiliser expo-crypto pour React Native
    const hashHex = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        message
    );

    return hashHex;
}
