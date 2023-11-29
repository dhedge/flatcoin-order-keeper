import { Injectable, Logger } from '@nestjs/common';
import { EthersContract, InjectContractProvider, InjectEthersProvider } from 'nestjs-ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers, Wallet } from "ethers";
import * as DelayedOrder from '../contracts/abi/DelayedOrder.json';

@Injectable()
export class BlockchainService {
  private readonly signer: Wallet;
  private readonly delayedOrderContract: Contract;
  private readonly delayedOrderContractWithSigner: Contract;

  constructor(
    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
    @InjectEthersProvider()
    private readonly customProvider: JsonRpcProvider,
    private readonly logger: Logger,
  ) {
    this.delayedOrderContract = new ethers.Contract(process.env.DELAYED_ORDER_CONTRACT, DelayedOrder, customProvider);
    this.signer = new Wallet(process.env.SIGNER_WALLET_PK, this.customProvider);
    this.delayedOrderContractWithSigner = new ethers.Contract(process.env.DELAYED_ORDER_CONTRACT, DelayedOrder, this.signer);
  }

  public async executeOrder(priceFeedUpdateData: string[] | null, account: string): Promise<string> {
    const tx = await this.delayedOrderContractWithSigner.executeOrder(account, priceFeedUpdateData, {
      gasLimit: ethers.utils.hexlify(BigNumber.from('2000000')),
      gasPrice: ethers.utils.parseUnits('1.5', 'gwei'),
      value: '1',
    });
    const receipt = await tx.wait();
    return receipt?.transactionHash;
  }

  public getMinExecutabilityAge(): Promise<number> {
    return this.delayedOrderContract.minExecutabilityAge();
  }

  public getMaxExecutabilityAge(): Promise<number> {
    return this.delayedOrderContract.maxExecutabilityAge();
  }

  public hasOrderExpired(account: string): Promise<boolean> {
    return this.delayedOrderContract.hasOrderExpired(account);
  }
}
