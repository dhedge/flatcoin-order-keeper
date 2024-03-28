import { Injectable, Logger } from '@nestjs/common';
import { EthersContract, InjectContractProvider, InjectEthersProvider } from 'nestjs-ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract, ethers, Wallet } from 'ethers';
import * as DelayedOrder from '../contracts/abi/DelayedOrder.json';
import * as FlatcoinVault from '../contracts/abi/FlatcoinVault.json';
import { ErrorHandler } from './error.handler';

@Injectable()
export class BlockchainService {
  private readonly signer: Wallet;
  private readonly delayedOrderContract: Contract;
  private readonly delayedOrderContractWithSigner: Contract;
  private readonly flatcoinVaultContract: Contract;

  constructor(
    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
    @InjectEthersProvider()
    private readonly customProvider: JsonRpcProvider,
    private readonly logger: Logger,
    private readonly errorHandler: ErrorHandler,
  ) {
    this.delayedOrderContract = new ethers.Contract(process.env.DELAYED_ORDER_CONTRACT, DelayedOrder, customProvider);
    this.flatcoinVaultContract = new ethers.Contract(process.env.FLATCOIN_VAULT_CONTRACT_ADDRESS, FlatcoinVault, customProvider);
    this.signer = new Wallet(process.env.SIGNER_WALLET_PK, this.customProvider);
    this.delayedOrderContractWithSigner = new ethers.Contract(process.env.DELAYED_ORDER_CONTRACT, DelayedOrder, this.signer);
  }

  public async executeOrder(priceFeedUpdateData: string[] | null, account: string): Promise<string> {
    this.logger.log(`estimating order ${account} execution...`);

    let estimated;
    try {
      estimated = await this.delayedOrderContractWithSigner.estimateGas.executeOrder(account, priceFeedUpdateData, {
        value: '1',
      });
    } catch (error) {
      const gasEstimateErrorName = this.errorHandler.getGasEstimateErrorName(error);
      this.logger.error(`failed to estimate gas for executeOrder with error name: ${gasEstimateErrorName} for account: ${account}`);
      throw new Error(error);
    }

    this.logger.log(`order ${account} execution tx estimated: ${estimated}`);
    const tx = await this.delayedOrderContractWithSigner.executeOrder(account, priceFeedUpdateData, {
      gasLimit: ethers.utils.hexlify(estimated.add(estimated.mul(40).div(100))),
      value: '1',
    });
    const receipt = await tx.wait();
    return receipt?.transactionHash;
  }

  public getMinExecutabilityAge(): Promise<number> {
    return this.flatcoinVaultContract.minExecutabilityAge();
  }

  public getMaxExecutabilityAge(): Promise<number> {
    return this.flatcoinVaultContract.maxExecutabilityAge();
  }

  public hasOrderExpired(account: string): Promise<boolean> {
    return this.delayedOrderContract.hasOrderExpired(account);
  }
}
