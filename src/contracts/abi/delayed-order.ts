export const DelayedOrder = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes[]',
        name: 'priceUpdateData',
        type: 'bytes[]',
      },
    ],
    name: 'executeOrder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasOrderExpired',
    outputs: [
      {
        internalType: 'bool',
        name: 'expired',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum FlatcoinStructs.OrderType',
        name: 'orderType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'keeperFee',
        type: 'uint256',
      },
    ],
    name: 'OrderAnnounced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum FlatcoinStructs.OrderType',
        name: 'orderType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'keeperFee',
        type: 'uint256',
      },
    ],
    name: 'OrderExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum FlatcoinStructs.OrderType',
        name: 'orderType',
        type: 'uint8',
      },
    ],
    name: 'OrderCancelled',
    type: 'event',
  },
];
