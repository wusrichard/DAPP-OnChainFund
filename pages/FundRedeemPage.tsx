import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useFund } from '../contexts/FundContext';
import { ethers } from 'ethers';
import { BLOCK_EXPLORER_URL, COMPTROLLER_ABI, VAULT_PROXY_ABI } from '../constants/contracts';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';

const FundDetails: React.FC = () => (
    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
        {/* Static content */}
        <h2 className="text-2xl font-bold mb-4">基金詳情</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
            <div><p className="text-sm text-gray-500">總管理資產 (AUM)</p><p className="text-2xl font-bold">$1,234,567</p></div>
            <div><p className="text-sm text-gray-500">目前份額淨值 (NAV)</p><p className="text-2xl font-bold">$1.15</p></div>
            <div><p className="text-sm text-gray-500">管理費</p><p className="text-2xl font-bold">2%</p></div>
            <div><p className="text-sm text-gray-500">贖回費</p><p className="text-2xl font-bold">0.5%</p></div>
        </div>
    </div>
);

const FundRedeemPage: React.FC = () => {
    const { fundId } = useParams<{ fundId: string }>();
    const { signer, isConnected } = useWallet();
    const { loadFund, comptrollerProxy, vaultProxy, loading, error: fundError } = useFund();

    const [amount, setAmount] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const SHARE_BALANCE = 8695.65; // This would come from a contract call in a real app

    useEffect(() => {
        if (fundId && signer) {
            loadFund(fundId);
        }
    }, [fundId, signer, loadFund]);

    const handleRedeem = async () => {
        if (!signer || !amount || !vaultProxy) return;

        setIsRedeeming(true);
        setError('');
        setTxHash('');
        try {
            const sharesToRedeem = ethers.parseUnits(amount, 18); // Assuming 18 decimals for shares
            const recipient = await signer.getAddress();
            const vaultContract = new ethers.Contract(vaultProxy, VAULT_PROXY_ABI, signer);

            const tx = await vaultContract.redeemSharesInKind(recipient, sharesToRedeem, [], []);
            setTxHash(tx.hash);
            await tx.wait();

            alert(`贖回成功！\n您已成功贖回 ${amount} 份額。`);
            setAmount('');
        } catch (err: any) {
            setError(err.reason || err.message || '贖回失敗');
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!isConnected) {
        return <div className="container mx-auto p-4 md:p-8"><WalletConnectionPrompt roleToConnect="investor" message="請連接您的投資人錢包" /></div>;
    }

    if (!fundId) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">未指定基金</h1>
                <p className="text-gray-600 mt-2">請從儀表板選擇一個基金來進行贖回。</p>
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
                <h1 className="text-4xl font-bold text-gray-900">贖回基金</h1>
                <p className="text-lg text-gray-500 truncate">基金地址: {comptrollerProxy}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <FundDetails />
                <div className="bg-white p-8 rounded-2xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold mb-6 text-center">贖回基金份額</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="redeemAmount" className="block text-sm font-medium text-gray-700 mb-1">贖回數量</label>
                                <span className="text-sm text-gray-500">持有份額: {SHARE_BALANCE.toLocaleString()}</span>
                            </div>
                            <div className="relative">
                                <input id="redeemAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                                <button onClick={() => setAmount(String(SHARE_BALANCE))} className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-blue-600 hover:text-blue-800">最大值</button>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <button onClick={handleRedeem} disabled={!amount || parseFloat(amount) <= 0 || isRedeeming} className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:bg-gray-400">
                                {isRedeeming ? '交易發送中...' : '確認贖回'}
                            </button>
                        </div>
                        {(txHash || error) && (
                            <div className="text-center text-sm mt-4">
                                {txHash && <a href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">在區塊鏈瀏覽器上查看交易</a>}
                                {error && <div className="text-red-600 mt-2 break-all">錯誤: {error}</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundRedeemPage;
