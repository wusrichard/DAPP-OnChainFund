import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { COMPTROLLER_ABI, ERC20_ABI, DENOMINATION_ASSET_ADDRESSES } from '../constants/contracts';
import { BLOCK_EXPLORER_URL } from '../constants/contracts';

interface FundData {
    id: number;
    name: string;
    symbol: string;
    comptrollerProxy: string;
    vaultProxy: string;
    denominationAsset: string;
}

interface FundCardProps {
    fund: FundData;
}

const getDenominationAssetSymbol = (address: string): string => {
    const symbol = Object.keys(DENOMINATION_ASSET_ADDRESSES).find(
        key => DENOMINATION_ASSET_ADDRESSES[key].toLowerCase() === address.toLowerCase()
    );
    return symbol || 'Unknown Asset';
}

const FundCard: React.FC<FundCardProps> = ({ fund }) => {
    const { signer } = useWallet();
    const [buyAmount, setBuyAmount] = useState('');
    const [redeemShares, setRedeemShares] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null); // 'approve', 'buy', 'redeem'
    const [error, setError] = useState('');
    const [txHash, setTxHash] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const denominationSymbol = getDenominationAssetSymbol(fund.denominationAsset);

    const handleApprove = async () => {
        if (!signer || !buyAmount) return;
        setError('');
        setTxHash('');
        setSuccessMessage('');
        setIsProcessing('approve');

        try {
            const amount = ethers.parseUnits(buyAmount, 6); // Assuming USDC has 6 decimals
            const tokenContract = new ethers.Contract(fund.denominationAsset, ERC20_ABI, signer);

            const tx = await tokenContract.approve(fund.vaultProxy, amount);
            setTxHash(tx.hash);
            await tx.wait();

            setSuccessMessage(`成功授權 ${buyAmount} ${denominationSymbol}！`);
        } catch (err: any) {
            const errorMessage = err.reason || err.message || '發生未知錯誤';
            setError(`授權失敗: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleBuy = async () => {
        if (!signer || !buyAmount) return;
        setError('');
        setTxHash('');
        setSuccessMessage('');
        setIsProcessing('buy');

        try {
            const investmentAmount = ethers.parseUnits(buyAmount, 6); // Assuming USDC has 6 decimals
            const comptrollerContract = new ethers.Contract(fund.comptrollerProxy, COMPTROLLER_ABI, signer);

            const tx = await comptrollerContract.buyShares(investmentAmount, 0); // minSharesQuantity set to 0 for simplicity
            setTxHash(tx.hash);
            await tx.wait();

            setSuccessMessage(`成功申購價值 ${buyAmount} ${denominationSymbol} 的基金份額！`);
            setBuyAmount('');

        } catch (err: any) {
            const errorMessage = err.reason || err.message || '發生未知錯誤';
            setError(`申購失敗: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRedeem = async () => {
        if (!signer || !redeemShares) return;
        setError('');
        setTxHash('');
        setSuccessMessage('');
        setIsProcessing('redeem');

        try {
            const sharesQuantity = ethers.parseUnits(redeemShares, 18); // Share tokens usually have 18 decimals
            const comptrollerContract = new ethers.Contract(fund.comptrollerProxy, COMPTROLLER_ABI, signer);
            const userAddress = await signer.getAddress();

            // redeemSharesInKind(address, uint256, address[], address[])
            const tx = await comptrollerContract.redeemSharesInKind(userAddress, sharesQuantity, [], []);
            setTxHash(tx.hash);
            await tx.wait();

            setSuccessMessage(`成功贖回 ${redeemShares} 份額！`);
            setRedeemShares('');

        } catch (err: any) {
             const errorMessage = err.reason || err.message || '發生未知錯誤';
            setError(`贖回失敗: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800 truncate" title={fund.name}>
                    {fund.name} <span className="text-lg font-normal text-gray-500">(${fund.symbol})</span>
                </h2>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>
                        <span className="font-semibold">Vault:</span>
                        <a href={`${BLOCK_EXPLORER_URL}/address/${fund.vaultProxy}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 break-all hover:underline">
                            {fund.vaultProxy}
                        </a>
                    </p>
                    <p>
                        <span className="font-semibold">Comptroller:</span>
                         <a href={`${BLOCK_EXPLORER_URL}/address/${fund.comptrollerProxy}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 break-all hover:underline">
                           {fund.comptrollerProxy}
                        </a>
                    </p>
                </div>
            </div>

            {/* Interaction Section */}
            <div className="mt-6 space-y-4">
                {/* Approve & Buy */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-700">申購基金 (以 {denominationSymbol} 計價)</h3>
                    <div className="flex items-center mt-2 space-x-2">
                        <input
                            type="number"
                            placeholder={`申購金額 (${denominationSymbol})`}
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            disabled={!!isProcessing}
                        />
                         <button
                            onClick={handleApprove}
                            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md text-sm hover:bg-blue-600 disabled:bg-blue-300 whitespace-nowrap"
                            disabled={!!isProcessing || !buyAmount}
                        >
                            {isProcessing === 'approve' ? '處理中...' : '授權'}
                        </button>
                    </div>
                     <button
                        onClick={handleBuy}
                        className="mt-2 w-full px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 disabled:bg-emerald-300"
                        disabled={!!isProcessing || !buyAmount}
                    >
                        {isProcessing === 'buy' ? '處理中...' : '申購'}
                    </button>
                </div>

                {/* Redeem */}
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-700">贖回份額</h3>
                     <input
                        type="number"
                        placeholder="贖回份額數量"
                        value={redeemShares}
                        onChange={(e) => setRedeemShares(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled={!!isProcessing}
                    />
                    <button
                        onClick={handleRedeem}
                        className="mt-2 w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 disabled:bg-red-300"
                        disabled={!!isProcessing || !redeemShares}
                    >
                        {isProcessing === 'redeem' ? '處理中...' : '贖回'}
                    </button>
                </div>

                {/* Status Messages */}
                <div className="mt-2 text-xs text-center">
                    {isProcessing && <p className="text-gray-600 animate-pulse">交易處理中，請在錢包確認...</p>}
                    {txHash && (
                         <a href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                            查看交易狀態
                        </a>
                    )}
                    {successMessage && <p className="text-green-600 font-semibold mt-1">{successMessage}</p>}
                    {error && <p className="text-red-600 font-semibold mt-1">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default FundCard;
