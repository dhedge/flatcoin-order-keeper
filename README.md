# Flatcoin Keeper Backend Service

## Configuration

| Variable                      | Required | Description                                                                        | Example                                                                                             |
|-------------------------------|----------|------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| PORT                          | Yes      | Port to deploy application                                                         | 3000                                                                                                |
| BLOCKCHAIN_NETWORK_NAME       | Yes      | Network name                                                                       | Base Goerli                                                                                         |
| CHAIN_ID                      | Yes      | Chain id                                                                           | 84351                                                                                               |
| PROVIDER_HTTPS_URL            | Yes      | Provider URL                                                                       | https://goerli.base.org                                                                             |
| DELAYED_ORDER_CONTRACT        | Yes      | DelayedOrder contract address                                                      | See https://github.com/dhedge/flatcoin-v1/blob/testnet-system/deployments/testnet/testnet.base.json |
| PYTH_NETWORK_PRICE_URI        | Yes      | Off-chain HTTP API endpoint used to fetch Pyth oracle prices                       | See https://docs.pyth.network/documentation                                                         |
| PYTH_NETWORK_ETH_USD_PRICE_ID | Yes      | ETH/USD price feed ID                                                              | See https://pyth.network/developers/price-feed-ids                                                  |
| SIGNER_WALLET_PK              | Yes      | Signer wallet private key                                                          |                                                                                                     |
| ORDER_MIN_EXECUTABILITY_AGE   | Yes      | Min order execution time from the moment of creation, ms                           | 5000                                                                                                |
| ORDER_MAX_EXECUTABILITY_AGE   | Yes      | Max order execution time from the moment of creation, ms                           | 12000                                                                                               |

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
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```


