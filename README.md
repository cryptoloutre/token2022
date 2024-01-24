# Token2022 aka Token Extension

Starter codes for getting started with [Tokens Extensions](https://spl.solana.com/token-2022). You will find code to:
- create your token
- airdrop it
- collect transfer fees if your token has this extention
- update your token (TO DO)
  

## Installation
Clone the repo and install the dependencies.
```
git clone https://github.com/cryptoloutre/token2022.git
cd token2022
npm install
```

## Configuration
Open the `config.ts` file and set your private key in Bytes and set the endpoint.

## Create a token
1. Open the `tokenConfig.ts` file and fill in the infos of your token and set to `true` the extensions you want to enabled
2. Create your token by running `npx ts-node create.ts`

## Airdrop your token
1. Open the `receivers.json` file and paste the list of addresses you want to airdrop to and the amounts of tokens. The file has to look like this:
```
   [
    {
        "address": "C7JveuVsEnkUc7FLKH9gxLpcU5zzsJ9r9AesGq6wHve",
        "amount": 10
    },
    {
        "address": "4S4b59gNHxaXUxoDmGHF6MJcE5rkEjWrDvkinEWawJqF",
        "amount": 100
    }
]
```
2. Airdrop your token by running `npx ts-node mintTo.ts`

## Collect transfer fees
If your token has transfer fees, you can collect them. To do it:
1. Open the `collectTransferFees.ts` file and set the `mint` addresse of your token and the `destinationAddress` (where the fees will be send to)
2. Collect the fees by running `npx ts-node collectTransferFees.ts` 

## Update your token
TO DO...
