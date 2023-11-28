export class AnnouncedOrder {
  blockNumber: number;
  transactionHash: string;
  orderType: string;
  account: string;
  blockTimestamp: number;
  executeInTime: number;
  expirationTime: number;
}

export enum OrderType {
  NONE = 0,
  STABLE_DEPOSIT = 1,
  STABLE_WITHDRAW = 2,
  LEVERAGE_OPEN = 3,
  LEVERAGE_CLOSE = 4,
  LEVERAGE_ADJUST = 5,
}
