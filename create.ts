import {
    sendAndConfirmTransaction,
    Keypair,
    PublicKey,
} from '@solana/web3.js';
import * as fs from "fs";
import { config } from './tokenConfig';
import { buildMintAndInitializeTransaction } from './utils/buildMintAndInitializeTransaction';
import { buildMetadataTransaction } from './utils/buildMetadataTransaction';
import { connection, payerKeypair } from './config';

async function createToken2022() {
    const mintKeypair = Keypair.generate();
    const mint = new PublicKey(mintKeypair.publicKey);

    console.log("Minting...")
    const mintTransaction = await buildMintAndInitializeTransaction(connection, payerKeypair, mint)

    const mintSignature = await sendAndConfirmTransaction(connection, mintTransaction, [payerKeypair, mintKeypair], { skipPreflight: true, commitment: "finalized" });

    console.log("Mint transaction signature: ", mintSignature);

    console.log("Adding metadata...")
    const metadataTransaction = await buildMetadataTransaction(connection, payerKeypair, mint);
    if (metadataTransaction.instructions.length != 0) {  
        const metadataSignature = await sendAndConfirmTransaction(connection, metadataTransaction, [payerKeypair], { skipPreflight: true, commitment: "finalized" });
        console.log("Metadata transaction signature: ", metadataSignature);
    }

    const tokenInfo = {
        mint: mint.toBase58(),
        decimals: config.decimals
    };

    const data = JSON.stringify(tokenInfo);
    fs.writeFileSync("tokenInfo.json", data);
    console.log("Token infos saved in tokenInfo.json file")

}

createToken2022()
