export const config = {

    // Token Infos
    name: "Token2k24",
    symbol: "Tk24",
    uri: "https://raw.githubusercontent.com/proxycapital/solana-civ-frontend/main/public/gems_metadata.json",
    additionalMetadata: [],
    decimals: 9,
    mintAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm",
    freezeAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Optional authority that can freeze token accounts. String | null

    /// Mint Close Authority
    // Allow to close mint account
    // Set enabled to false to disable this extension
    mintCloseExtension: {
        enabled: false,
        closeAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Authority that can close the mint

    },

    /// Transfer Fees
    // Allow to assess a fee on every transfer
    // Set enabled to false to disable this extension
    transferFeesExtension: {
        enabled: true,
        feeBasisPoints: 50, // Amount of transfer collected as fees, expressed as basis points of the transfer amount
        maxFee: 5000, // Maximum fee assessed on transfers
        transferFeeConfigAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Optional authority that can update the fees. String | null
        withdrawWithheldAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Optional authority that can withdraw fees. String | null
    },

    /// Default Account State
    // If enabled all new token accounts will be frozen
    // Set enabled to false to disable this extension
    defaultAccountStateExtension: {
        enabled: false
    },

    /// Non-Transferable Tokens
    // Allows for "soul-bound" tokens that cannot be moved to any other entity
    // Set enabled to false to disable this extension
    nonTransferableTokensExtension: {
        enabled: false,
    },

    /// Interest-Bearing Tokens
    // Allows to set an interest rate on the token
    // Set enabled to false to disable this extension
    interestBearingTokensExtension: {
        enabled: false,
        rate: 10, // The initial interest rate
        rateAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // The public key for the account that can update the rate
    },

    /// Permanent Delegate
    // Allows to specify a permanent account delegate for a mint. This authority has unlimited delegate privileges over any account for that mint, meaning that it can burn or transfer any amount of tokens.
    // Set enabled to false to disable this extension
    permanentDelegateExtension: {
        enabled: false,
        permanentDelegate: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Optional authority that may sign for `Transfer`s and `Burn`s on any account. String | null
    },

    /// Transfer Hook
    // Allows to add more control over how the token is transferred. A custom program will execute new actions when a token, transfer is initiated.
    // Set enabled to false to disable this extension
    transferHookExtension: {
        enabled: false,
        transferHookAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Transfer hook authority account
        transferHookProgramId: "7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj", // Transfer hook program account
    },

    /// Metadata Pointer
    // Allows to designate an address that describes the canonical metadata of the token.
    // Set enabled to false to disable this extension
    metadataPointerExtension: {
        enabled: false,
        pointerAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm", // Optional authority that can set the metadata address. String | null
        metadataAddress: "Djt6H92CGnvnKCWUGPZD7po5uXcMcQjhBZ8jcXtnFKsC", // Optional address that holds the metadata. String | null                         
    },

    /// Metadata
    // Allows to include the token's metadata directly in the mint account
    // Set enabled to false to disable this extension.
    // Note: metadataPointerExtension has to be enabled to use metadataExtension. In this case no need to set the metadataAddress
    metadataExtension: {
        enabled: false,
        metadataUpdateAuthority: "devqs7wyk1pXMP6ikntGQJSzmtkztcrUSXnFe4jwQAm",
    },

    // Allows to use Metaplex for the token metadatas
    // Note: if you want to use Metaplex for the metadata, you have to disable metadataPointerExtension and metadataExtension
    metaplexMetadata: {
        enabled: true,
    },
}