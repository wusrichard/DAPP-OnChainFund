// ABI for the FundDeployer contract
export const FUND_DEPLOYER_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_fundOwner", "type": "address" },
            { "internalType": "string", "name": "_fundName", "type": "string" },
            { "internalType": "string", "name": "_fundSymbol", "type": "string" },
            {
                "components": [
                    { "internalType": "address", "name": "denominationAsset", "type": "address" },
                    { "internalType": "uint256", "name": "sharesActionTimelock", "type": "uint256" },
                    { "internalType": "bytes", "name": "feeManagerConfigData", "type": "bytes" },
                    { "internalType": "bytes", "name": "policyManagerConfigData", "type": "bytes" },
                    { "components": [], "internalType": "struct IComptroller.ExtensionConfigInput[]", "name": "extensionsConfig", "type": "tuple[]" }
                ],
                "internalType": "struct IComptroller.ConfigInput",
                "name": "_comptrollerConfig",
                "type": "tuple"
            }
        ],
        "name": "createNewFund",
        "outputs": [
            { "internalType": "address", "name": "comptrollerProxy_", "type": "address" },
            { "internalType": "address", "name": "vaultProxy_", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const FUND_DEPLOYER_ADDRESS = import.meta.env.VITE_FUND_DEPLOYER_ADDRESS;
export const DENOMINATION_ASSET_ADDRESSES: { [key: string]: string } = {
    'USDC': import.meta.env.VITE_USDC_ADDRESS,
    'WETH': import.meta.env.VITE_WETH_ADDRESS,
    'ASVT': import.meta.env.VITE_ASVT_ADDRESS,
};
export const ENTRANCE_RATE_DIRECT_FEE_ADDRESS = import.meta.env.VITE_ENTRANCE_RATE_DIRECT_FEE_ADDRESS;
export const ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS = import.meta.env.VITE_ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS;
