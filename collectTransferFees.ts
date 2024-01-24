import {
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    Transaction,
    PublicKey,
} from '@solana/web3.js';

import {
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToCheckedInstruction,
    unpackAccount,
    getTransferFeeAmount,
    withdrawWithheldTokensFromAccounts,
    createWithdrawWithheldTokensFromAccountsInstruction
} from '@solana/spl-token';
import { connection, payerKeypair } from './config';
import { getAccountsToWithdrawFrom } from './utils/getAccountsToWithdrawFrom';

async function collectTransferFees() {
    const mint = new PublicKey("2dPVbiuaye6pYSWEvRgy2qLPjqEHUKgP1ubuzZSiB8xp"); // TO DO put the mint address of your token
    const destinationAddress = new PublicKey("devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm"); // TO DO put the desired address
    const withdrawWithheldAuthority = new PublicKey("devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm"); // TO DO put the withdraw Authority of your token

    const accountsToWithdrawFrom = await getAccountsToWithdrawFrom(mint);

    console.log(accountsToWithdrawFrom)

    const transaction1 = new Transaction();

    const destinationAccount = await getAssociatedTokenAddress(mint, destinationAddress, undefined, TOKEN_2022_PROGRAM_ID);
    const info = await connection.getAccountInfo(destinationAccount);
    if (info == null) {
        transaction1.add(
            createAssociatedTokenAccountInstruction(payerKeypair.publicKey, destinationAccount, destinationAddress, mint, TOKEN_2022_PROGRAM_ID))
            const signature = await sendAndConfirmTransaction(connection, transaction1, [payerKeypair], { skipPreflight: true });
            console.log(signature)
    }

    const transaction = new Transaction();
    transaction.add(createWithdrawWithheldTokensFromAccountsInstruction(mint, destinationAccount, withdrawWithheldAuthority, [], accountsToWithdrawFrom, TOKEN_2022_PROGRAM_ID));

    const withdrawSignature = await sendAndConfirmTransaction(connection, transaction, [payerKeypair], { skipPreflight: true });
    console.log(withdrawSignature)
}

collectTransferFees()