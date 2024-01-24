import {
    sendAndConfirmTransaction,
    Transaction,
    PublicKey,
} from '@solana/web3.js';

import {
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createWithdrawWithheldTokensFromAccountsInstruction
} from '@solana/spl-token';
import { connection, payerKeypair } from './config';
import { getAccountsToWithdrawFrom } from './utils/getAccountsToWithdrawFrom';

async function collectTransferFees() {
    const mint = new PublicKey(""); // TO DO put the mint address of your token
    const destinationAddress = new PublicKey(""); // TO DO put the desired address
    const withdrawWithheldAuthority = payerKeypair.publicKey; // We assume the payer is also the withdraw authority

    const accountsToWithdrawFrom = await getAccountsToWithdrawFrom(mint);
    console.log("Collect started...")

    const transaction1 = new Transaction();

    const destinationAccount = await getAssociatedTokenAddress(mint, destinationAddress, undefined, TOKEN_2022_PROGRAM_ID);
    const info = await connection.getAccountInfo(destinationAccount);
    if (info == null) {
        transaction1.add(
            createAssociatedTokenAccountInstruction(payerKeypair.publicKey, destinationAccount, destinationAddress, mint, TOKEN_2022_PROGRAM_ID))
        const signature = await sendAndConfirmTransaction(connection, transaction1, [payerKeypair], { skipPreflight: true });
        console.log("Destination token account created: ", signature)
    }

    const nbWithdrawsPerTx = 30; // lower this value if "RangeError: encoding overruns Uint8Array" happens

    // calculate the total number of transactions to do
    let nbTx: number;
    if (accountsToWithdrawFrom.length % nbWithdrawsPerTx == 0) {
        nbTx = accountsToWithdrawFrom.length / nbWithdrawsPerTx;
    } else {
        nbTx = Math.floor(accountsToWithdrawFrom.length / nbWithdrawsPerTx) + 1;
    }

    // for each transaction
    for (let i = 0; i < nbTx; i++) {
        let bornSup: number;
        if (i == nbTx - 1) {
            bornSup = accountsToWithdrawFrom.length;
        } else {
            bornSup = nbWithdrawsPerTx * (i + 1);
        }

        const transaction = new Transaction();

        const start = nbWithdrawsPerTx * i; // index of the begining of the sub array
        const end = bornSup; // index of the end of the sub array

        transaction.add(createWithdrawWithheldTokensFromAccountsInstruction(mint, destinationAccount, withdrawWithheldAuthority, [], accountsToWithdrawFrom.slice(start, end), TOKEN_2022_PROGRAM_ID));
        const withdrawSignature = await sendAndConfirmTransaction(connection, transaction, [payerKeypair], { skipPreflight: true });
        console.log("Fees collected (", i + 1, "/", nbTx, ")", "signature:", withdrawSignature)
    }

    console.log("Collect finished!")
}

collectTransferFees()