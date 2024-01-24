import { ExtensionType, TOKEN_2022_PROGRAM_ID, TokenAccountNotFoundError, getNewAccountLenForExtensionLen } from "@solana/spl-token";
import { Field, TokenMetadata } from "@solana/spl-token-metadata";
import {
    createInitializeInstruction,
    createRemoveKeyInstruction,
    createUpdateAuthorityInstruction,
    createUpdateFieldInstruction,
    pack,
    unpack,
} from '@solana/spl-token-metadata';
import { Connection, PublicKey } from "@solana/web3.js";

export async function getAdditionalRentForNewMetadata(
    connection: Connection,
    address: PublicKey,
    tokenMetadata: TokenMetadata,
    programId = TOKEN_2022_PROGRAM_ID
): Promise<number> {
    const info = await connection.getAccountInfo(address);
    if (!info) {
        throw new TokenAccountNotFoundError();
    }

    const extensionLen = pack(tokenMetadata).length;
    const newAccountLen = getNewAccountLenForExtensionLen(
        info,
        address,
        ExtensionType.TokenMetadata,
        extensionLen,
        programId
    );

    if (newAccountLen <= info.data.length) {
        return 0;
    }

    const newRentExemptMinimum = await connection.getMinimumBalanceForRentExemption(newAccountLen);

    return newRentExemptMinimum - info.lamports;
}

const TYPE_SIZE = 2;
const LENGTH_SIZE = 2;

export function addTypeAndLengthToLen(len: number): number {
    return len + TYPE_SIZE + LENGTH_SIZE;
}

// async function getAdditionalRentForUpdatedMetadata(
//     connection: Connection,
//     address: PublicKey,
//     field: string | Field,
//     value: string,
//     programId = TOKEN_2022_PROGRAM_ID
// ): Promise<number> {
//     const info = await connection.getAccountInfo(address);
//     if (!info) {
//         throw new TokenAccountNotFoundError();
//     }

//     const mint = unpackMint(address, info, programId);
//     const extensionData = getExtensionData(ExtensionType.TokenMetadata, mint.tlvData);
//     if (extensionData === null) {
//         throw new Error('TokenMetadata extension not initialized');
//     }

//     const updatedTokenMetadata = updateTokenMetadata(unpack(extensionData), field, value);
//     const extensionLen = pack(updatedTokenMetadata).length;

//     const newAccountLen = getNewAccountLenForExtensionLen(
//         info,
//         address,
//         ExtensionType.TokenMetadata,
//         extensionLen,
//         programId
//     );

//     if (newAccountLen <= info.data.length) {
//         return 0;
//     }

//     const newRentExemptMinimum = await connection.getMinimumBalanceForRentExemption(newAccountLen);

//     return newRentExemptMinimum - info.lamports;
// }