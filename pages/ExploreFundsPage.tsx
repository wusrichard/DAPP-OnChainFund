import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { FUND_DEPLOYER_ADDRESS, FUND_DEPLOYER_ABI, COMPTROLLER_ABI, ERC20_ABI } from '../constants/contracts';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';
import FundCard from '../components/FundCard';

// Define the structure for a fund's data
interface FundData {
    id: number;
    name: string;
    symbol: string;
    comptrollerProxy: string;
    vaultProxy: string;
    denominationAsset: string;
}

const ExploreFundsPage: React.FC = () => {
    const { provider, isConnected } = useWallet();
    const [funds, setFunds] = useState<FundData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFunds = async () => {
            if (!provider) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const fundDeployer = new ethers.Contract(FUND_DEPLOYER_ADDRESS, FUND_DEPLOYER_ABI, provider);

                // 1. Query for all NewFundCreated events
                const fundCreatedEvents = await fundDeployer.queryFilter('NewFundCreated');

                if (fundCreatedEvents.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // 2. For each event, fetch detailed fund info
                const fundsDataPromises = fundCreatedEvents.map(async (event, index) => {
                    const eventArgs = event.args;
                    if (eventArgs) {
                        const { comptrollerProxy, vaultProxy } = eventArgs;

                        const vaultContract = new ethers.Contract(vaultProxy, ERC20_ABI, provider);
                        const comptrollerContract = new ethers.Contract(comptrollerProxy, COMPTROLLER_ABI, provider);

                        // Fetch name, symbol, and denomination asset in parallel
                        const [name, symbol, denominationAsset] = await Promise.all([
                            vaultContract.name(),
                            vaultContract.symbol(),
                            comptrollerContract.getDenominationAsset()
                        ]);

                        return {
                            id: index,
                            name,
                            symbol,
                            comptrollerProxy,
                            vaultProxy,
                            denominationAsset,
                        };
                    }
                    return null;
                });

                const settledFunds = await Promise.all(fundsDataPromises);
                const validFunds = settledFunds.filter((fund): fund is FundData => fund !== null);

                setFunds(validFunds.reverse()); // Show newest funds first
            } catch (err: any) {
                console.error("Failed to fetch funds:", err);
                setError("無法讀取基金列表。請確認您已連接到正確的網路(Sepolia)，或稍後再試。");
            } finally {
                setIsLoading(false);
            }
        };

        if(isConnected) {
            fetchFunds();
        }
    }, [provider, isConnected]);

    if (!isConnected) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <WalletConnectionPrompt
                    roleToConnect="investor"
                    message="請連接您的錢包"
                    subMessage="連接錢包以探索所有可投資的基金。"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8 mt-4">
                <h1 className="text-4xl font-bold text-gray-900">探索基金</h1>
                <p className="text-lg text-gray-500">尋找下一個投資機會。這裡列出了所有透過本平台創建的基金。</p>
            </div>

            {isLoading && <div className="text-center py-10"><p className="text-lg font-semibold animate-pulse">正在從區塊鏈讀取基金列表...</p></div>}

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert"><p className="font-bold">發生錯誤</p><p>{error}</p></div>}

            {!isLoading && !error && funds.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-xl font-semibold text-gray-700">目前沒有任何基金</p>
                    <p className="text-gray-500 mt-2">成為第一個創建基金的經理人吧！</p>
                </div>
            )}

            {!isLoading && funds.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {funds.map(fund => (
                        <FundCard key={fund.id} fund={fund} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreFundsPage;
