import { Connection, Keypair } from "@solana/web3.js";

export const payerKeypair = Keypair.fromSecretKey(
    Uint8Array.from([
        170, 253, 179, 56, 200, 101, 142, 90, 196, 51, 126, 187, 154, 219, 76, 204,
        211, 117, 129, 71, 5, 106, 16, 242, 178, 90, 10, 74, 44, 110, 121, 144, 9, 99,
        203, 120, 227, 221, 251, 160, 64, 114, 36, 140, 16, 53, 55, 8, 45, 183, 170,
        241, 163, 34, 151, 60, 92, 97, 1, 60, 54, 230, 217, 162
    ])
);

export const connection = new Connection("https://api.devnet.solana.com", "confirmed");