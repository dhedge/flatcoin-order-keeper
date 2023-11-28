import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EthersModule.forRoot({
      network: {
        name: process.env.BLOCKCHAIN_NETWORK_NAME,
        chainId: +process.env.CHAIN_ID,
      },
      custom: process.env.PROVIDER_HTTPS_URL,
      useDefaultProvider: false,
    }),
  ],
})
export class BlockchainModule {}
