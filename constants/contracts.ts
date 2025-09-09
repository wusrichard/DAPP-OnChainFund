import { ethers } from 'ethers';

/**
 * This file contains the ABI and addresses for the smart contracts used in the application.
 * It serves as a single source of truth to avoid duplication and ease maintenance.
 *
 * It also cleans and checksums addresses read from environment variables.
 */

// Helper function to safely get a checksummed address from env
const getAddressFromEnv = (key: string): string => {
    const address = import.meta.env[key];
    if (!address || address.trim() === '') {
        console.warn(`Environment variable ${key} is not set or is empty.`);
        return ethers.ZeroAddress;
    }
    try {
        return ethers.getAddress(address);
    } catch (e) {
        console.error(`Invalid address for ${key}: "${address}"`, e);
        return ethers.ZeroAddress;
    }
};


// --- ABIs ---

/**
 * Standard ERC20 token ABI, including functions for balance, allowance, and approval.
 */
export const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];

/**
 * ABI for the FundDeployer contract, used for creating new funds.
 */
export const FUND_DEPLOYER_ABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "vaultProxy", "type": "address" },
            { "indexed": false, "internalType": "address", "name": "comptrollerProxy", "type": "address" }
        ],
        "name": "NewFundCreated",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_fundOwner", "type": "address" },
            { "internalType": "string", "name": "_fundName", "type": "string" },
            { "internalType": "string", "name": "_fundSymbol", "type": "string" },
            { "internalType": "address", "name": "_denominationAsset", "type": "address" },
            { "internalType": "uint256", "name": "_sharesActionTimelock", "type": "uint256" },
            { "internalType": "bytes", "name": "_feeManagerConfigData", "type": "bytes" },
            { "internalType": "bytes", "name": "_policyManagerConfigData", "type": "bytes" }
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

/**
 * ABI for a fund's VaultProxy, which holds the assets.
 */
export const VAULT_PROXY_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "getAccessor",
        "outputs": [{ "name": "", "type": "address" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "internalType": "address", "name": "_recipient", "type": "address" },
            { "internalType": "uint256", "name": "_sharesQuantity", "type": "uint256" },
            { "internalType": "address[]", "name": "_additionalAssets", "type": "address[]" },
            { "internalType": "address[]", "name": "_assetsToSkip", "type": "address[]" }
        ],
        "name": "redeemSharesInKind",
        "outputs": [
            { "internalType": "address[]", "name": "payoutAssets_", "type": "address[]" },
            { "internalType": "uint256[]", "name": "payoutAmounts_", "type": "uint256[]" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "internalType": "address", "name": "_recipient", "type": "address" },
            { "internalType": "uint256", "name": "_sharesQuantity", "type": "uint256" },
            { "internalType": "address[]", "name": "_payoutAssets", "type": "address[]" },
            { "internalType": "uint256[]", "name": "_payoutAssetPercentages", "type": "uint256[]" }
        ],
        "name": "redeemSharesForSpecificAssets",
        "outputs": [
            { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

/**
 * ABI for a fund's Comptroller, which manages logic and policies.
 */
export const COMPTROLLER_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "calcGav",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "calcGrossShareValue",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_investmentAmount", "type": "uint256" }, { "name": "_minSharesQuantity", "type": "uint256" }],
        "name": "buyShares",
        "outputs": [],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_minSharesQuantity", "type": "uint256" }],
        "name": "buySharesWithEth",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getDenominationAsset",
        "outputs": [{ "name": "", "type": "address" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getVaultProxy",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "recipient", "type": "address" },
            { "name": "shareQuantity", "type": "uint256" },
            { "name": "payoutAssets", "type": "address[]" },
            { "name": "payoutAssetPercentages", "type": "address[]" }
        ],
        "name": "redeemSharesInKind",
        "outputs": [],
        "type": "function"
    }
];


// --- Addresses ---

export const BLOCK_EXPLORER_URL = import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://sepolia.etherscan.io';

export const FUND_DEPLOYER_ADDRESS = getAddressFromEnv('VITE_FUND_DEPLOYER_ADDRESS');
export const ENTRANCE_RATE_DIRECT_FEE_ADDRESS = getAddressFromEnv('VITE_ENTRANCE_RATE_DIRECT_FEE_ADDRESS');
export const ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS = getAddressFromEnv('VITE_ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS');

export const DENOMINATION_ASSET_ADDRESSES: { [key: string]: string } = {
    'USDC': getAddressFromEnv('VITE_USDC_ADDRESS'),
    'WETH': getAddressFromEnv('VITE_WETH_ADDRESS'),
    'ASVT': getAddressFromEnv('VITE_ASVT_ADDRESS'),
};
