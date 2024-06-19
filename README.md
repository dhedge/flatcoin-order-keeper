# Flatcoin Keeper Backend Service

## Configuration

1. Install Node.js version higher than 18: https://nodejs.org/en/download/package-manager
2. Install yarn package manager: https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable
3. Clone project: $ git clone https://github.com/dhedge/flatcoin-order-keeper.git
4. Install dependencies: $ yarn install
5. Configure .env file properties:

| Variable                                 | Required | Description                                                  | Example                                                                                                                             |
|------------------------------------------|----------|--------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| PORT                                     | Yes      | Port to deploy application                                   | 3000                                                                                                                                |
| BLOCKCHAIN_NETWORK_NAME                  | Yes      | Network name                                                 | Base                                                                                                                                |
| CHAIN_ID                                 | Yes      | Chain id                                                     | 8453                                                                                                                                |
| PROVIDER_HTTPS_URL                       | Yes      | Provider URL                                                 | See https://hermes.pyth.network/docs/                                                                                               |
| DELAYED_ORDER_CONTRACT_ADDRESS           | Yes      | DelayedOrder contract address                                | https://github.com/dhedge/flatcoin-v1/blob/master/deployments/8453/8453.toml                                                        |
| FLATCOIN_VAULT_CONTRACT_ADDRESS          | Yes      | Flatcoin Vault contract address                              | https://github.com/dhedge/flatcoin-v1/blob/master/deployments/8453/8453.toml                                                        |
| PYTH_NETWORK_PRICE_URI                   | Yes      | Off-chain HTTP API endpoint used to fetch Pyth oracle prices | See https://docs.pyth.network/documentation                                                                                         |
| PYTH_NETWORK_ETH_USD_PRICE_ID            | Yes      | rETH/USD price feed ID                                       | See https://pyth.network/developers/price-feed-ids (can be used 0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13) |
| SIGNER_WALLET_PK                         | Yes      | Signer wallet private key                                    |                                                                                                                                     |
| ORDER_MIN_EXECUTABILITY_AGE              | Yes      | Min order execution time from the moment of creation, ms     | 5000                                                                                                                                |
| ORDER_MAX_EXECUTABILITY_AGE              | Yes      | Max order execution time from the moment of creation, ms     | 60000                                                                                                                               |

6. Run project: $ yarn run start


