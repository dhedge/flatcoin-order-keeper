export const FlatcoinErrors = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minAmount',
        type: 'uint256',
      },
    ],
    name: 'AmountTooSmall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'CannotLiquidate',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'collateralCap',
        type: 'uint256',
      },
    ],
    name: 'DepositCapReached',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ETHPriceInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ETHPriceStale',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'executableTime',
        type: 'uint256',
      },
    ],
    name: 'ExecutableTimeNotReached',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'supplied',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'accepted',
        type: 'uint256',
      },
    ],
    name: 'HighSlippage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientGlobalMargin',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'lower',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'upper',
        type: 'uint256',
      },
    ],
    name: 'InvalidBounds',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'InvalidFee',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLeverageCriteria',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxVelocitySkew',
        type: 'uint256',
      },
    ],
    name: 'InvalidMaxVelocitySkew',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'skewFractionMax',
        type: 'uint256',
      },
    ],
    name: 'InvalidSkewFractionMax',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'priceLowerThreshold',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'priceUpperThreshold',
        type: 'uint256',
      },
    ],
    name: 'InvalidThresholds',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'variableName',
        type: 'string',
      },
    ],
    name: 'InvariantViolation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'leverageMax',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'leverage',
        type: 'uint256',
      },
    ],
    name: 'LeverageTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'leverageMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'leverage',
        type: 'uint256',
      },
    ],
    name: 'LeverageTooLow',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'LimitOrderInvalid',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'priceLowerThreshold',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'priceUpperThreshold',
        type: 'uint256',
      },
    ],
    name: 'LimitOrderPriceNotInRange',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MarginMismatchOnClose',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'marginMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'margin',
        type: 'uint256',
      },
    ],
    name: 'MarginTooSmall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxFillPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentPrice',
        type: 'uint256',
      },
    ],
    name: 'MaxFillPriceTooLow',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'skewFraction',
        type: 'uint256',
      },
    ],
    name: 'MaxSkewReached',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'variableName',
        type: 'string',
      },
    ],
    name: 'MaxVarianceExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'minFillPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentPrice',
        type: 'uint256',
      },
    ],
    name: 'MinFillPriceTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ModuleKeyEmpty',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
    ],
    name: 'NotEnoughBalanceForWithdraw',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'marginAmount',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
    ],
    name: 'NotEnoughMarginForFees',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'msgSender',
        type: 'address',
      },
    ],
    name: 'NotTokenOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'msgSender',
        type: 'address',
      },
    ],
    name: 'OnlyAuthorizedModule',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'msgSender',
        type: 'address',
      },
    ],
    name: 'OnlyOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OracleConfigInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OrderHasExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OrderHasNotExpired',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'moduleKey',
        type: 'bytes32',
      },
    ],
    name: 'Paused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PositionCreatesBadDebt',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PriceImpactDuringFullWithdraw',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PriceImpactDuringWithdraw',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'enum FlatcoinErrors.PriceSource',
        name: 'priceSource',
        type: 'uint8',
      },
    ],
    name: 'PriceInvalid',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'diffPercent',
        type: 'uint256',
      },
    ],
    name: 'PriceMismatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'enum FlatcoinErrors.PriceSource',
        name: 'priceSource',
        type: 'uint8',
      },
    ],
    name: 'PriceStale',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RefundFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'variableName',
        type: 'string',
      },
    ],
    name: 'ValueNotPositive',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'keeperFee',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalTooSmall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'variableName',
        type: 'string',
      },
    ],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'variableName',
        type: 'string',
      },
    ],
    name: 'ZeroValue',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'DelayedOrderInvalid',
    type: 'error',
  },
];
