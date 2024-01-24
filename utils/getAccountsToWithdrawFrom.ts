import {
    PublicKey,
} from '@solana/web3.js';

import {
    TOKEN_2022_PROGRAM_ID,
    unpackAccount,
    getTransferFeeAmount,
} from '@solana/spl-token';
import { connection } from '../config';

export async function getAccountsToWithdrawFrom(
    mint: PublicKey,
): Promise<PublicKey[]> {

    const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: mint.toString(),
                },
            },
        ],
    });
    const accountsToWithdrawFrom: PublicKey[] = [];
    for (const accountInfo of allAccounts) {
        const account = unpackAccount(accountInfo.pubkey, accountInfo.account, TOKEN_2022_PROGRAM_ID);
        const transferFeeAmount = getTransferFeeAmount(account);
        if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
            accountsToWithdrawFrom.push(accountInfo.pubkey);
        }
    }

    return accountsToWithdrawFrom
}