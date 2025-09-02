import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Switch from '../components/Switch';
import { useWallet } from '../contexts/WalletContext';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';
import {
    ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS,
    BLOCK_EXPLORER_URL,
    DENOMINATION_ASSET_ADDRESSES,
    ENTRANCE_RATE_DIRECT_FEE_ADDRESS, FUND_DEPLOYER_ABI,
    FUND_DEPLOYER_ADDRESS
} from "../constants/contracts.ts";

// ----------------------------------------------

const stepsConfig = [
    { id: 1, title: '基礎設定' },
    { id: 2, title: '費用設定' },
    { id: 3, title: '申購策略' },
    { id: 4, title: '份額轉讓性' },
    { id: 5, title: '贖回策略' },
    { id: 6, title: '資產管理' },
    { id: 7, title: '預覽及確認' },
];

const StepIndicator = ({ currentStep, goToStep }: { currentStep: number; goToStep: (step: number) => void }) => {
    return (
        <nav>
            {stepsConfig.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                let stateClasses = 'text-gray-500';
                let circleClasses = 'bg-gray-200 text-gray-600';
                if (isCompleted) {
                    stateClasses = 'text-blue-500';
                    circleClasses = 'bg-blue-500 text-white';
                } else if (isCurrent) {
                    stateClasses = 'text-emerald-500';
                    circleClasses = 'bg-emerald-500 text-white';
                }

                return (
                    <a href="#" key={step.id} onClick={(e) => { e.preventDefault(); goToStep(step.id); }} className={`flex items-center mb-6 relative ${stateClasses}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 transition-colors ${circleClasses}`}>{step.id}</div>
                        <span className="font-semibold">{step.title}</span>
                        {index < stepsConfig.length - 1 && <div className="absolute left-4 top-10 w-0.5 h-[calc(100%-1rem)] bg-gray-200 -z-10"></div>}
                    </a>
                );
            })}
        </nav>
    );
};

const FeeSetting = ({ title, description, isEnabled, onToggle, children }: { title: string; description: string; isEnabled: boolean; onToggle: (enabled: boolean) => void; children: React.ReactNode }) => (
    <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Switch checked={isEnabled} onChange={onToggle} label={title} />
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {isEnabled && <div className="mt-4 space-y-4">{children}</div>}
    </div>
);

const CreateFundPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const { signer, isConnected, role } = useWallet();
    const navigate = useNavigate();

    // Form State
    const [fundName, setFundName] = useState('');
    const [fundSymbol, setFundSymbol] = useState('');
    const [denominationAsset, setDenominationAsset] = useState('USDC');
    const [fees, setFees] = useState({
        management: { enabled: false, rate: 2 },
        performance: { enabled: false, rate: 20 },
        entrance: { enabled: false, rate: 1 },
        exit: { enabled: false, rate: 1 },
    });
    const [policies, setPolicies] = useState({
        depositorWhitelist: { enabled: false, list: '' },
        depositLimits: { enabled: false, min: 0, max: 10000 },
        shareTransferWhitelist: { enabled: false, list: '' },
    });

    // Transaction State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');
    const [newComptrollerProxy, setNewComptrollerProxy] = useState('');
    const [newVaultProxy, setNewVaultProxy] = useState('');

    const totalSteps = stepsConfig.length;

    const goToStep = (stepNumber: number) => {
        if (stepNumber >= 1 && stepNumber <= totalSteps) {
            setCurrentStep(stepNumber);
        }
    };

    const handleNext = () => goToStep(currentStep + 1);
    const handlePrev = () => goToStep(currentStep - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer) {
            alert('請先連接您的基金經理錢包。');
            return;
        }
        if (!fundName.trim() || !fundSymbol.trim()) {
            alert('請填寫基金名稱和代號。');
            goToStep(1);
            return;
        }

        setError('');
        setTxHash('');
        setIsSubmitting(true);

        try {
            const fundDeployer = new ethers.Contract(FUND_DEPLOYER_ADDRESS, FUND_DEPLOYER_ABI, signer);
            const assetAddress = DENOMINATION_ASSET_ADDRESSES[denominationAsset];
            if (!assetAddress) {
                throw new Error(`Unsupported denomination asset: ${denominationAsset}`);
            }

            const defaultAbiCoder = new ethers.AbiCoder();
            let feeManagerConfigData = '0x';
            let policyManagerConfigData = '0x';

            if (fees.entrance.enabled && ENTRANCE_RATE_DIRECT_FEE_ADDRESS) {
                const rateInBps = fees.entrance.rate * 100;
                const entranceFeeSettings = defaultAbiCoder.encode(
                    ['uint256', 'address'],
                    [rateInBps, await signer.getAddress()]
                );
                feeManagerConfigData = defaultAbiCoder.encode(
                    ['address[]', 'bytes[]'],
                    [[ENTRANCE_RATE_DIRECT_FEE_ADDRESS], [entranceFeeSettings]]
                );
            }

            if (policies.depositorWhitelist.enabled && ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS) {
                const addresses = policies.depositorWhitelist.list
                    .split('\n')
                    .map(addr => addr.trim())
                    .filter(addr => ethers.isAddress(addr));

                if (addresses.length > 0) {
                    const newListData = defaultAbiCoder.encode(
                        ['address', 'uint8', 'address[]'],
                        [await signer.getAddress(), 0, addresses]
                    );
                    const policySettingsData = defaultAbiCoder.encode(
                        ['uint256[]', 'bytes[]'],
                        [[], [newListData]]
                    );
                    policyManagerConfigData = defaultAbiCoder.encode(
                        ['address[]', 'bytes[]'],
                        [[ALLOWED_DEPOSIT_RECIPIENTS_POLICY_ADDRESS], [policySettingsData]]
                    );
                }
            }

            const tx = await fundDeployer.createNewFund(
                await signer.getAddress(),
                fundName,
                fundSymbol,
                assetAddress,
                0, // sharesActionTimelock
                feeManagerConfigData,
                policyManagerConfigData
            );

            setTxHash(tx.hash);
            const receipt = await tx.wait();

            if (receipt?.logs) {
                const eventInterface = new ethers.Interface(FUND_DEPLOYER_ABI);
                const eventTopic = eventInterface.getEvent("NewFundCreated")?.topicHash;

                const log = receipt.logs.find(l => l.topics[0] === eventTopic);
                if (log) {
                    const parsedLog = eventInterface.parseLog({ topics: [...log.topics], data: log.data });
                    if (parsedLog) {
                        setNewVaultProxy(parsedLog.args.vaultProxy);
                        setNewComptrollerProxy(parsedLog.args.comptrollerProxy);
                    }
                }
            }

        } catch (err: any) {
            const errorMessage = err.reason || err.message || '發生未知錯誤';
            setError(errorMessage);
            console.error('基金創建失敗:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isConnected || role !== 'manager') {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <WalletConnectionPrompt
                    roleToConnect="manager"
                    message="請連接您的基金經理錢包"
                    subMessage="您必須以基金經理身份登入才能創建新基金。"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="w-full md:w-1/4 p-8 bg-gray-50 border-r border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-800 mb-8">創建您的基金</h1>
                        <StepIndicator currentStep={currentStep} goToStep={goToStep} />
                    </div>

                    <div className="w-full md:w-3/4 p-8 md:p-12">
                        <form onSubmit={handleSubmit}>
                            {/* All steps content here... */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">基礎設定</h2>
                                    <p className="text-gray-500 mb-8">為您的基金設定基本資料。這些是投資人第一眼會看到的資訊。</p>
                                    <div>
                                        <label htmlFor="fundName" className="block text-sm font-medium text-gray-700 mb-1">基金名稱 (Name)</label>
                                        <input type="text" id="fundName" value={fundName} onChange={e => setFundName(e.target.value)} required placeholder="例如：穩健增長一號" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition" />
                                        <p className="text-xs text-gray-500 mt-1">基金的顯示名稱。</p>
                                    </div>
                                    <div>
                                        <label htmlFor="fundSymbol" className="block text-sm font-medium text-gray-700 mb-1">基金代號 (Symbol)</label>
                                        <input type="text" id="fundSymbol" value={fundSymbol} onChange={e => setFundSymbol(e.target.value)} required placeholder="例如：SGF01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition" />
                                        <p className="text-xs text-gray-500 mt-1">基金份額代幣的代號，建議 3-5 個英文字母。</p>
                                    </div>
                                    <div>
                                        <label htmlFor="denominationAsset" className="block text-sm font-medium text-gray-700 mb-1">計價資產 (Denomination Asset)</label>
                                        <select id="denominationAsset" value={denominationAsset} onChange={e => setDenominationAsset(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition">
                                            <option value="USDC">USDC - USD Coin</option>
                                            <option value="WETH">WETH - Wrapped Ether</option>
                                            <option value="ASVT">ASVT - ASVT Token</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">用於衡量基金淨值和績效的基礎資產。 <span className="font-semibold text-amber-600">此為半永久性設定。</span></p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">費用設定</h2>
                                    <p className="text-gray-500 mb-8">設定基金的各項費用結構。開啟的費用將會自動從基金資產中收取。</p>
                                    <FeeSetting title="申購費 (Entrance Fee)" description="在每次申購時收取固定比例的費用。" isEnabled={fees.entrance.enabled} onToggle={v => setFees(f => ({ ...f, entrance: { ...f.entrance, enabled: v } }))}>
                                        <div><label htmlFor="entranceFeeRate" className="block text-sm font-medium text-gray-700">費率 (%)</label><input type="number" id="entranceFeeRate" value={fees.entrance.rate} onChange={e => setFees(f => ({ ...f, entrance: { ...f.entrance, rate: +e.target.value } }))} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg" /></div>
                                    </FeeSetting>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">申購策略</h2>
                                    <p className="text-gray-500 mb-8">設定誰可以投資您的基金，以及投資的額度限制。</p>
                                    <FeeSetting title="投資人白名單" description="開啟後，只有白名單內的錢包地址才能申購基金份額。" isEnabled={policies.depositorWhitelist.enabled} onToggle={v => setPolicies(p => ({ ...p, depositorWhitelist: { ...p.depositorWhitelist, enabled: v } }))}>
                                        <div><label htmlFor="depositorWhitelist" className="block text-sm font-medium text-gray-700">錢包地址列表</label><textarea id="depositorWhitelist" rows={3} placeholder="每行一個地址，例如：0x..." className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg" value={policies.depositorWhitelist.list} onChange={e => setPolicies(p => ({ ...p, depositorWhitelist: { ...p.depositorWhitelist, list: e.target.value } }))}></textarea></div>
                                    </FeeSetting>
                                </div>
                            )}

                            {/* Dummy steps for brevity */}
                            {currentStep > 3 && currentStep < 7 && (
                                <div><h2 className="text-3xl font-bold">Step {currentStep}</h2><p>Configuration for step {currentStep} goes here.</p></div>
                            )}

                            <div className="mt-12 pt-5 border-t border-gray-200">
                                <div className="flex justify-between">
                                    <button type="button" onClick={handlePrev} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentStep === 1 || isSubmitting || !!newVaultProxy}>上一步</button>
                                    {currentStep < totalSteps ? (
                                        <button type="button" onClick={handleNext} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition" disabled={isSubmitting || !!newVaultProxy}>下一步</button>
                                    ) : (
                                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={isSubmitting || !fundName || !fundSymbol || !!newVaultProxy}>
                                            {isSubmitting ? '交易處理中...' : '創建基金'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 text-center text-sm">
                                {isSubmitting && !txHash && <p className="text-gray-600">正在送出交易，請在您的錢包中確認...</p>}
                                {txHash && !newVaultProxy && !error && <p className="text-blue-600">交易已送出！等待區塊鏈確認中...</p>}
                                {txHash && (
                                    <div className="my-4">
                                        <a href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                            在區塊鏈瀏覽器上查看交易
                                        </a>
                                    </div>
                                )}
                                {error && <p className="text-red-600 font-semibold mt-2">錯誤: {error}</p>}

                                {newVaultProxy && (
                                    <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-lg text-left">
                                        <h4 className="font-bold text-lg text-green-800">🎉 基金創建成功！</h4>
                                        <p className="text-sm text-gray-700 mt-2">您的新基金合約已成功部署。請妥善保管以下地址：</p>
                                        <div className="mt-3 space-y-2 text-xs">
                                            <p>
                                                <strong className="font-semibold text-gray-600">Vault (資產庫) 地址:</strong>
                                                <a href={`${BLOCK_EXPLORER_URL}/address/${newVaultProxy}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 break-all hover:underline">{newVaultProxy}</a>
                                            </p>
                                            <p>
                                                <strong className="font-semibold text-gray-600">Comptroller (控制器) 地址:</strong>
                                                <a href={`${BLOCK_EXPLORER_URL}/address/${newComptrollerProxy}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 break-all hover:underline">{newComptrollerProxy}</a>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/dashboard/manager')}
                                            className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all"
                                        >
                                            返回基金經理儀表板
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFundPage;