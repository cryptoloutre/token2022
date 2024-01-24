import {
    sendAndConfirmTransaction,
    Transaction,
    PublicKey,
} from '@solana/web3.js';

import {
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToCheckedInstruction
} from '@solana/spl-token';
import * as fs from "fs";
import { connection, payerKeypair } from './config';

async function mintToken2022To() {
    const tokenInfo: { mint: string, decimals: number } = JSON.parse(fs.readFileSync("tokenInfo.json", { encoding: "utf-8" }));
    const mint = new PublicKey(tokenInfo.mint);
    const decimals = tokenInfo.decimals;
    const receivers: { address: string, amount: number }[] = JSON.parse(fs.readFileSync("receivers.json", { encoding: "utf-8" }));

    const nbReceiversPerTx = 5;

    // calculate the total number of transactions to do
    let nbTx: number;
    if (receivers.length % nbReceiversPerTx == 0) {
        nbTx = receivers.length / nbReceiversPerTx;
    } else {
        nbTx = Math.floor(receivers.length / nbReceiversPerTx) + 1;
    }

    console.log("Minting started...")

    // for each transaction
    for (let i = 0; i < nbTx; i++) {

        let bornSup: number;
        if (i == nbTx - 1) {
            bornSup = receivers.length;
        } else {
            bornSup = nbReceiversPerTx * (i + 1);
        }
        
        const transaction = new Transaction();
        // we add the instructions for each receiver
        for (let j = nbReceiversPerTx * i; j < bornSup; j++) {
            const receiverPK = new PublicKey(receivers[j].address);
            const amount = receivers[j].amount;
            const receiverTokenAccount = await getAssociatedTokenAddress(mint, receiverPK, undefined, TOKEN_2022_PROGRAM_ID);
            const info = await connection.getAccountInfo(receiverTokenAccount);
            if (info == null) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(payerKeypair.publicKey, receiverTokenAccount, receiverPK, mint, TOKEN_2022_PROGRAM_ID))
            }
            transaction.add(
                createMintToCheckedInstruction(mint, receiverTokenAccount, payerKeypair.publicKey, amount * 10 ** decimals, decimals, [], TOKEN_2022_PROGRAM_ID)
            );
        }

        const signature = await sendAndConfirmTransaction(connection, transaction, [payerKeypair], { skipPreflight: true });
        console.log("Mint transaction signature: ", signature);
    }

    console.log("Minting finished!")
}

mintToken2022To()