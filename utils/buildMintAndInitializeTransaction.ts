import {
    AccountState,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeDefaultAccountStateInstruction,
    createInitializeInterestBearingMintInstruction,
    createInitializeMetadataPointerInstruction,
    createInitializeMintCloseAuthorityInstruction,
    createInitializeMintInstruction,
    createInitializeNonTransferableMintInstruction,
    createInitializePermanentDelegateInstruction,
    createInitializeTransferFeeConfigInstruction,
    createInitializeTransferHookInstruction,
    getMintLen
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { config } from "../tokenConfig";

export async function buildMintAndInitializeTransaction(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
): Promise<Transaction> {

    const transaction = new Transaction();
    const extensions: ExtensionType[] = [];
    const instructions: TransactionInstruction[] = [];

    /// Mint Close Authority
    if (config.mintCloseExtension.enabled == true) {
        const closeAuthority = new PublicKey(config.mintCloseExtension.closeAuthority);
        extensions.push(ExtensionType.MintCloseAuthority);
        instructions.push(createInitializeMintCloseAuthorityInstruction(mint, closeAuthority, TOKEN_2022_PROGRAM_ID));
    };

    /// Transfer Fees
    if (config.transferFeesExtension.enabled == true) {
        const transferFeeConfigAuthority = new PublicKey(config.transferFeesExtension.transferFeeConfigAuthority);
        const withdrawWithheldAuthority = new PublicKey(config.transferFeesExtension.withdrawWithheldAuthority);
        extensions.push(ExtensionType.TransferFeeConfig);
        instructions.push(createInitializeTransferFeeConfigInstruction(
            mint,
            transferFeeConfigAuthority,
            withdrawWithheldAuthority,
            config.transferFeesExtension.feeBasisPoints,
            BigInt(config.transferFeesExtension.maxFee),
            TOKEN_2022_PROGRAM_ID
        ));
    };

    /// Default Account State
    if (config.defaultAccountStateExtension.enabled == true) {
        extensions.push(ExtensionType.DefaultAccountState);
        instructions.push(createInitializeDefaultAccountStateInstruction(mint, AccountState.Frozen, TOKEN_2022_PROGRAM_ID));
    };

    /// Non-Transferable Tokens
    if (config.nonTransferableTokensExtension.enabled == true) {
        extensions.push(ExtensionType.NonTransferable);
        instructions.push(createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID));;
    };

    /// Interest-Bearing Tokens
    if (config.interestBearingTokensExtension.enabled == true) {
        const rateAuthority = new PublicKey(config.interestBearingTokensExtension.rateAuthority);
        const rate = config.interestBearingTokensExtension.rate;
        extensions.push(ExtensionType.InterestBearingConfig);
        instructions.push(createInitializeInterestBearingMintInstruction(mint, rateAuthority, rate, TOKEN_2022_PROGRAM_ID));
    };

    /// Permanent Delegate
    if (config.permanentDelegateExtension.enabled == true) {
        const permanentDelegate = config.permanentDelegateExtension.permanentDelegate ? new PublicKey(config.permanentDelegateExtension.permanentDelegate) : null;
        extensions.push(ExtensionType.PermanentDelegate);
        instructions.push(createInitializePermanentDelegateInstruction(mint, permanentDelegate, TOKEN_2022_PROGRAM_ID));
    };

    /// Transfer Hook
    if (config.transferHookExtension.enabled == true) {
        const transferHookAuthority = new PublicKey(config.transferHookExtension.transferHookAuthority);
        const transferHookProgramId = new PublicKey(config.transferHookExtension.transferHookProgramId);
        extensions.push(ExtensionType.TransferHook);
        instructions.push(createInitializeTransferHookInstruction(mint, transferHookAuthority, transferHookProgramId, TOKEN_2022_PROGRAM_ID));
    }

    /// Metadata Pointer
    if (config.metadataPointerExtension.enabled == true) {
        const pointerAuthority = config.metadataPointerExtension.pointerAuthority ? new PublicKey(config.metadataPointerExtension.pointerAuthority) : null;
        let metadataAddress: PublicKey | null;
        if (config.metadataExtension.enabled == true) {
            metadataAddress = mint;
        }
        else {
            metadataAddress = config.metadataPointerExtension.metadataAddress ? new PublicKey(config.metadataPointerExtension.metadataAddress) : null;
        }
        extensions.push(ExtensionType.MetadataPointer);
        instructions.push(createInitializeMetadataPointerInstruction(mint, pointerAuthority, metadataAddress, TOKEN_2022_PROGRAM_ID));
    }

    // calculate the size of the extensions in order to determine the rent fees
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    // we add the mint account creation instruction
    transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: lamports,
        programId: TOKEN_2022_PROGRAM_ID,
    }));

    // we add the instructions related to the extensions
    for (const instruction of instructions) {
        transaction.add(instruction)
    }

    // we initialize the mint account
    const decimals = config.decimals;
    const mintAuthority = new PublicKey(config.mintAuthority);
    const freezeAuthority = config.freezeAuthority ? new PublicKey(config.freezeAuthority) : null;

    transaction.add(createInitializeMintInstruction(mint, decimals, mintAuthority, freezeAuthority, TOKEN_2022_PROGRAM_ID));

    return transaction;
}