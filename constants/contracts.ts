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
export const FUND_DEPLOYER_ABI = [{"inputs":[{"internalType":"address","name":"_dispatcher","type":"address"},{"internalType":"address","name":"_gasRelayPaymasterFactory","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"}],"name":"BuySharesOnBehalfCallerDeregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"}],"name":"BuySharesOnBehalfCallerRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"comptrollerLib","type":"address"}],"name":"ComptrollerLibSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"address","name":"comptrollerProxy","type":"address"},{"indexed":true,"internalType":"address","name":"denominationAsset","type":"address"},{"indexed":false,"internalType":"uint256","name":"sharesActionTimelock","type":"uint256"}],"name":"ComptrollerProxyDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"nextDeactivateFeeManagerGasLimit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"nextPayProtocolFeeGasLimit","type":"uint256"}],"name":"GasLimitsForDestructCallSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":true,"internalType":"address","name":"vaultProxy","type":"address"},{"indexed":false,"internalType":"address","name":"comptrollerProxy","type":"address"}],"name":"MigrationRequestCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"address","name":"vaultProxy","type":"address"},{"indexed":false,"internalType":"address","name":"comptrollerProxy","type":"address"}],"name":"NewFundCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"protocolFeeTracker","type":"address"}],"name":"ProtocolFeeTrackerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vaultProxy","type":"address"},{"indexed":true,"internalType":"address","name":"nextComptrollerProxy","type":"address"}],"name":"ReconfigurationRequestCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":true,"internalType":"address","name":"vaultProxy","type":"address"},{"indexed":false,"internalType":"address","name":"comptrollerProxy","type":"address"},{"indexed":false,"internalType":"uint256","name":"executableTimestamp","type":"uint256"}],"name":"ReconfigurationRequestCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"vaultProxy","type":"address"},{"indexed":true,"internalType":"address","name":"prevComptrollerProxy","type":"address"},{"indexed":true,"internalType":"address","name":"nextComptrollerProxy","type":"address"}],"name":"ReconfigurationRequestExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"nextTimelock","type":"uint256"}],"name":"ReconfigurationTimelockSet","type":"event"},{"anonymous":false,"inputs":[],"name":"ReleaseIsLive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"bytes4","name":"selector","type":"bytes4"},{"indexed":false,"internalType":"bytes32","name":"dataHash","type":"bytes32"}],"name":"VaultCallDeregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"bytes4","name":"selector","type":"bytes4"},{"indexed":false,"internalType":"bytes32","name":"dataHash","type":"bytes32"}],"name":"VaultCallRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"vaultLib","type":"address"}],"name":"VaultLibSet","type":"event"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"},{"internalType":"bool","name":"_bypassPrevReleaseFailure","type":"bool"}],"name":"cancelMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"}],"name":"cancelReconfiguration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"},{"internalType":"address","name":"_denominationAsset","type":"address"},{"internalType":"uint256","name":"_sharesActionTimelock","type":"uint256"},{"internalType":"bytes","name":"_feeManagerConfigData","type":"bytes"},{"internalType":"bytes","name":"_policyManagerConfigData","type":"bytes"},{"internalType":"bool","name":"_bypassPrevReleaseFailure","type":"bool"}],"name":"createMigrationRequest","outputs":[{"internalType":"address","name":"comptrollerProxy_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_fundOwner","type":"address"},{"internalType":"string","name":"_fundName","type":"string"},{"internalType":"string","name":"_fundSymbol","type":"string"},{"internalType":"address","name":"_denominationAsset","type":"address"},{"internalType":"uint256","name":"_sharesActionTimelock","type":"uint256"},{"internalType":"bytes","name":"_feeManagerConfigData","type":"bytes"},{"internalType":"bytes","name":"_policyManagerConfigData","type":"bytes"}],"name":"createNewFund","outputs":[{"internalType":"address","name":"comptrollerProxy_","type":"address"},{"internalType":"address","name":"vaultProxy_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"},{"internalType":"address","name":"_denominationAsset","type":"address"},{"internalType":"uint256","name":"_sharesActionTimelock","type":"uint256"},{"internalType":"bytes","name":"_feeManagerConfigData","type":"bytes"},{"internalType":"bytes","name":"_policyManagerConfigData","type":"bytes"}],"name":"createReconfigurationRequest","outputs":[{"internalType":"address","name":"comptrollerProxy_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_callers","type":"address[]"}],"name":"deregisterBuySharesOnBehalfCallers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_contracts","type":"address[]"},{"internalType":"bytes4[]","name":"_selectors","type":"bytes4[]"},{"internalType":"bytes32[]","name":"_dataHashes","type":"bytes32[]"}],"name":"deregisterVaultCalls","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"},{"internalType":"bool","name":"_bypassPrevReleaseFailure","type":"bool"}],"name":"executeMigration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"}],"name":"executeReconfiguration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getComptrollerLib","outputs":[{"internalType":"address","name":"comptrollerLib_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCreator","outputs":[{"internalType":"address","name":"creator_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDispatcher","outputs":[{"internalType":"address","name":"dispatcher_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGasLimitsForDestructCall","outputs":[{"internalType":"uint256","name":"deactivateFeeManagerGasLimit_","type":"uint256"},{"internalType":"uint256","name":"payProtocolFeeGasLimit_","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGasRelayPaymasterFactory","outputs":[{"internalType":"address","name":"gasRelayPaymasterFactory_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGasRelayTrustedForwarder","outputs":[{"internalType":"address","name":"trustedForwarder_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"owner_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getProtocolFeeTracker","outputs":[{"internalType":"address","name":"protocolFeeTracker_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"}],"name":"getReconfigurationRequestForVaultProxy","outputs":[{"components":[{"internalType":"address","name":"nextComptrollerProxy","type":"address"},{"internalType":"uint256","name":"executableTimestamp","type":"uint256"}],"internalType":"struct IFundDeployer.ReconfigurationRequest","name":"reconfigurationRequest_","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReconfigurationTimelock","outputs":[{"internalType":"uint256","name":"reconfigurationTimelock_","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVaultLib","outputs":[{"internalType":"address","name":"vaultLib_","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultProxy","type":"address"}],"name":"hasReconfigurationRequest","outputs":[{"internalType":"bool","name":"hasReconfigurationRequest_","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"_nextComptrollerProxy","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"invokeMigrationInCancelHook","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum IMigrationHookHandler.MigrationOutHook","name":"_hook","type":"uint8"},{"internalType":"address","name":"_vaultProxy","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"invokeMigrationOutHook","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_who","type":"address"}],"name":"isAllowedBuySharesOnBehalfCaller","outputs":[{"internalType":"bool","name":"isAllowed_","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contract","type":"address"},{"internalType":"bytes4","name":"_selector","type":"bytes4"},{"internalType":"bytes32","name":"_dataHash","type":"bytes32"}],"name":"isAllowedVaultCall","outputs":[{"internalType":"bool","name":"isAllowed_","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contract","type":"address"},{"internalType":"bytes4","name":"_selector","type":"bytes4"},{"internalType":"bytes32","name":"_dataHash","type":"bytes32"}],"name":"isRegisteredVaultCall","outputs":[{"internalType":"bool","name":"isRegistered_","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"_callers","type":"address[]"}],"name":"registerBuySharesOnBehalfCallers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_contracts","type":"address[]"},{"internalType":"bytes4[]","name":"_selectors","type":"bytes4[]"},{"internalType":"bytes32[]","name":"_dataHashes","type":"bytes32[]"}],"name":"registerVaultCalls","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"releaseIsLive","outputs":[{"internalType":"bool","name":"isLive_","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_comptrollerLib","type":"address"}],"name":"setComptrollerLib","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"_nextDeactivateFeeManagerGasLimit","type":"uint32"},{"internalType":"uint32","name":"_nextPayProtocolFeeGasLimit","type":"uint32"}],"name":"setGasLimitsForDestructCall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_protocolFeeTracker","type":"address"}],"name":"setProtocolFeeTracker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nextTimelock","type":"uint256"}],"name":"setReconfigurationTimelock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"setReleaseLive","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_vaultLib","type":"address"}],"name":"setVaultLib","outputs":[],"stateMutability":"nonpayable","type":"function"}];

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
