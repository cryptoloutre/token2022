import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAdditionalRentForNewMetadata } from "./getAdditionalRent";
import { config } from "../tokenConfig";
import { TOKEN_2022_PROGRAM_ID, createInitializeInstruction } from "@solana/spl-token";
import { PublicKey as UMI_Publickey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Collection, CollectionDetails, CreateV1InstructionAccounts, CreateV1InstructionData, Creator, PrintSupply, TokenStandard, Uses, createV1 } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

export async function buildMetadataTransaction(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
): Promise<Transaction> {

    const transaction = new Transaction();
    const mintAuthority = new PublicKey(config.mintAuthority);
    const name = config.name;
    const symbol = config.symbol;
    const uri = config.uri;
    const additionalMetadata = config.additionalMetadata;
    
    // Metadatas store in the mint account
    if (config.metadataExtension.enabled == true) {
        const updateAuthority = new PublicKey(config.metadataExtension.metadataUpdateAuthority);
        
        const additionalLamports = await getAdditionalRentForNewMetadata(
            connection,
            mint,
            {
                updateAuthority,
                mint: mint,
                name: name,
                symbol: symbol,
                uri: uri,
                additionalMetadata: additionalMetadata,
            },
            TOKEN_2022_PROGRAM_ID
        );

        if (additionalLamports > 0) {
            transaction.add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: mint, lamports: additionalLamports }));
        }
        transaction.add(createInitializeInstruction({ programId: TOKEN_2022_PROGRAM_ID, metadata: mint, updateAuthority: updateAuthority, mint: mint, mintAuthority: mintAuthority, name, symbol, uri }))
    }

    // Metaplex metadata
    if (config.metaplexMetadata.enabled == true) {
        const umi = createUmi(connection);
        const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
        umi.use(signerIdentity(signer, true));

        const SPL_TOKEN_2022_PROGRAM_ID: UMI_Publickey = publicKey(
            'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
        );
        
        const accounts: CreateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data: CreateV1InstructionData = {
            discriminator: 0,
            createV1Discriminator: 0,
            name: name,
            symbol: symbol,
            uri: uri,
            sellerFeeBasisPoints: percentAmount(0, 2),
            creators: none<Creator[]>(),
            primarySaleHappened: true,
            isMutable: true,
            tokenStandard: TokenStandard.Fungible,
            collection: none<Collection>(),
            uses: none<Uses>(),
            collectionDetails: none<CollectionDetails>(),
            ruleSet: none<UMI_Publickey>(),
            decimals: none<number>(),
            printSupply: none<PrintSupply>(),
        }
        const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log("Metaplex metadatas added: ", bs58.encode(txid.signature))
    }
    return transaction;
}