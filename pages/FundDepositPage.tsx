import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useFund } from '../contexts/FundContext';
import { ethers } from 'ethers';
import { COMPTROLLER_ABI, ERC20_ABI, DENOMINATION_ASSET_ADDRESSES, BLOCK_EXPLORER_URL } from '../constants/contracts';
import WalletConnectionPrompt from "../components/WalletConnectionPrompt.tsx";

const FundDetails: React.FC = () => (
    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
        {/* Static content for now */}
        <h2 className="text-2xl font-bold mb-4">基金詳情</h2>
        {/* ... */}
    </div>
);

const FundDepositPage: React.FC = () => {
    const { fundId } = useParams<{ fundId: string }>();
    const { signer, isConnected } = useWallet();
    const { loadFund, comptrollerProxy, vaultProxy, loading, error: fundError } = useFund();

    const [amount, setAmount] = useState('');
    const [denominationAsset, setDenominationAsset] = useState<{ address: string; symbol: string } | null>(null);
    const [isApproved, setIsApproved] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (fundId && signer) {
            loadFund(fundId);
        }
    }, [fundId, signer, loadFund]);

    useEffect(() => {
        const getDenomination = async () => {
            if (comptrollerProxy && signer) {
                try {
                    setError('');
                    const comptroller = new ethers.Contract(comptrollerProxy, COMPTROLLER_ABI, signer);
                    const address = await comptroller.getDenominationAsset();
                    const symbol = Object.keys(DENOMINATION_ASSET_ADDRESSES).find(key => DENOMINATION_ASSET_ADDRESSES[key] === address) || 'UNKNOWN';
                    setDenominationAsset({ address, symbol });
                } catch (e) {
                    console.error("Failed to get denomination asset", e);
                    setError("無法加載基金計價單位");
                }
            }
        };
        getDenomination();
    }, [comptrollerProxy, signer]);

    const handleApprove = async () => {
        if (!signer || !amount || !denominationAsset || !vaultProxy) return;

        setIsApproving(true);
        setError('');
        setTxHash('');
        try {
            const investmentAmount = ethers.parseUnits(amount, 18); // Assuming 18 decimals, should be dynamic
            const investmentAssetContract = new ethers.Contract(denominationAsset.address, ERC20_ABI, signer);

            const tx = await investmentAssetContract.approve(vaultProxy, investmentAmount);
            setTxHash(tx.hash);
            await tx.wait();

            setIsApproved(true);
            alert('資產授權成功！');
        } catch (err: any) {
            setError(err.reason || err.message || '授權失敗');
        } finally {
            setIsApproving(false);
        }
    };

    const handleDeposit = async () => {
        if (!signer || !amount || !comptrollerProxy) return;

        setIsDepositing(true);
        setError('');
        setTxHash('');
        try {
            const investmentAmount = ethers.parseUnits(amount, 18); // Assuming 18 decimals
            const minSharesQuantity = 0;
            const comptrollerContract = new ethers.Contract(comptrollerProxy, COMPTROLLER_ABI, signer);

            const tx = await comptrollerContract.buyShares(investmentAmount, minSharesQuantity);
            setTxHash(tx.hash);
            await tx.wait();

            alert('申購成功！');
            setAmount('');
            setIsApproved(false); // Reset approval state
        } catch (err: any) {
            setError(err.reason || err.message || '申購失敗');
        } finally {
            setIsDepositing(false);
        }
    };

    if (!isConnected) {
        return <div className="container mx-auto p-4 md:p-8"><WalletConnectionPrompt roleToConnect="investor" message="請連接您的投資人錢包" /></div>;
    }

    if (!fundId) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">未指定基金</h1>
                <p className="text-gray-600 mt-2">請從儀表板選擇一個基金來進行申購。</p>
            </div>
        );
    }

    if (loading) {
        return <div className="container mx-auto p-4 md:p-8 text-center">正在加載基金資訊...</div>;
    }

    if (fundError) {
        return <div className="container mx-auto p-4 md:p-8 text-center text-red-600">加載基金失敗: {fundError}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8 mt-4">
                <h1 className="text-4xl font-bold text-gray-900">申購基金</h1>
                <p className="text-lg text-gray-500 truncate">基金地址: {comptrollerProxy}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <FundDetails />
                <div className="bg-white p-8 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold mb-6 text-center">申購基金</h2>
                    {denominationAsset ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">投資資產</label>
                                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg">{denominationAsset.symbol}</div>
                            </div>
                            <div>
                                <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">投資金額</label>
                                <input id="depositAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-3 pt-2">
                                <button onClick={handleApprove} disabled={isApproved || isApproving || !amount} className="w-full font-bold py-3 px-6 rounded-lg transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400">
                                    {isApproving ? '授權中...' : (isApproved ? '✓ 已授權' : `1. 授權 ${denominationAsset.symbol}`)}
                                </button>
                                <button onClick={handleDeposit} disabled={!isApproved || isDepositing || !amount} className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400">
                                    {isDepositing ? '交易發送中...' : '2. 確認申購'}
                                </button>
                            </div>
                            {(txHash || error) && (
                                <div className="text-center text-sm mt-4">
                                    {txHash && <a href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">在區塊鏈瀏覽器上查看交易</a>}
                                    {error && <div className="text-red-600 mt-2 break-all">錯誤: {error}</div>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">正在確認基金計價單位...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FundDepositPage;
