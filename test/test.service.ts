import { EthersContract, InjectContractProvider, InjectSignerProvider, EthersSigner } from 'nestjs-ethers';
import { Wallet } from '@ethersproject/wallet';
import { Contract } from '@ethersproject/contracts';
import { Network } from '@ethersproject/networks';
import * as ABI from '../src/contracts/abi/DelayedOrder.json';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  constructor(
    @InjectSignerProvider()
    private readonly ethersSigner: EthersSigner,

    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
  ) {}
  async contractTest(): Promise<Network> {
    const contract: Contract = this.ethersContract.create('0x012363d61bdc53d0290a0f25e9c89f8257550fb8', ABI);

    return contract.provider.getNetwork();
  }

  async walletTest(): Promise<string> {
    const wallet: Wallet = this.ethersSigner.createWallet('0x4c94faa2c558a998d10ee8b2b9b8eb1fbcb8a6ac5fd085c6f95535604fc1bffb');

    return wallet.getAddress();
  }
}
