# Flatcoin Keeper Backend Service

## Configuration

| Variable                                 | Required | Description                                                  | Example                                                                      |
|------------------------------------------|----------|--------------------------------------------------------------|------------------------------------------------------------------------------|
| PORT                                     | Yes      | Port to deploy application                                   | 3000                                                                         |
| BLOCKCHAIN_NETWORK_NAME                  | Yes      | Network name                                                 | Base                                                                         |
| CHAIN_ID                                 | Yes      | Chain id                                                     | 8453                                                                         |
| PROVIDER_HTTPS_URL                       | Yes      | Provider URL                                                 | https://mainnet.base.org                                                     |
| DELAYED_ORDER_CONTRACT_ADDRESS           | Yes      | DelayedOrder contract address                                | https://github.com/dhedge/flatcoin-v1/blob/master/deployments/8453/8453.toml |
| FLATCOIN_VAULT_CONTRACT_ADDRESS          | Yes      | Flatcoin Vault contract address                              | https://github.com/dhedge/flatcoin-v1/blob/master/deployments/8453/8453.toml |
| PYTH_NETWORK_PRICE_URI                   | Yes      | Off-chain HTTP API endpoint used to fetch Pyth oracle prices | See https://docs.pyth.network/documentation                                  |
| PYTH_NETWORK_ETH_USD_PRICE_ID            | Yes      | rETH/USD price feed ID                                       | See https://pyth.network/developers/price-feed-ids                           |
| SIGNER_WALLET_PK                         | Yes      | Signer wallet private key                                    |                                                                              |
| ORDER_MIN_EXECUTABILITY_AGE              | Yes      | Min order execution time from the moment of creation, ms     | 5000                                                                         |
| ORDER_MAX_EXECUTABILITY_AGE              | Yes      | Max order execution time from the moment of creation, ms     | 60000                                                                        |

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# e2e tests
$ yarn run test:e2e

```


