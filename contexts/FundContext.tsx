import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { COMPTROLLER_ABI } from '../constants/contracts';

// Interface for the state of the fund
interface FundState {
  comptrollerProxy: string | null;
  vaultProxy: string | null;
  loading: boolean;
  error: string | null;
}

// Interface for the context value
interface FundContextType extends FundState {
  setFund: (comptrollerProxy: string, vaultProxy: string) => void;
  loadFund: (comptrollerProxy: string) => Promise<void>;
  clearFund: () => void;
}

// Create the context with an undefined default value
const FundContext = createContext<FundContextType | undefined>(undefined);

// Provider component
export const FundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { signer } = useWallet();
  const [fund, setFundState] = useState<FundState>({
    comptrollerProxy: null,
    vaultProxy: null,
    loading: true,
    error: null,
  });

  const setFund = (comptrollerProxy: string, vaultProxy: string) => {
    setFundState({ comptrollerProxy, vaultProxy, loading: false, error: null });
    localStorage.setItem('fundContext', JSON.stringify({ comptrollerProxy, vaultProxy }));
  };

  const clearFund = () => {
    setFundState({ comptrollerProxy: null, vaultProxy: null, loading: false, error: null });
    localStorage.removeItem('fundContext');
  };

  const loadFund = useCallback(async (comptrollerProxy: string) => {
    if (!signer) {
      setFundState(prevState => ({ ...prevState, error: "Wallet not connected", loading: false }));
      return;
    }
    if (!comptrollerProxy || fund.comptrollerProxy === comptrollerProxy) {
      setFundState(prevState => ({ ...prevState, loading: false }));
      return; // Do nothing if address is invalid or already loaded
    }

    setFundState({ comptrollerProxy, vaultProxy: null, loading: true, error: null });

    try {
      const comptroller = new ethers.Contract(comptrollerProxy, COMPTROLLER_ABI, signer);
      const vaultAddress = await comptroller.getVaultProxy();
      setFund(comptrollerProxy, vaultAddress);
    } catch (e) {
      console.error("Failed to load fund details:", e);
      setFundState(prevState => ({ ...prevState, error: "Failed to load fund details.", loading: false }));
      clearFund();
    }
  }, [signer, fund.comptrollerProxy]);

  // On initial load, try to get the fund from localStorage
  useState(() => {
    const storedFund = localStorage.getItem('fundContext');
    if (storedFund) {
      try {
        const parsedFund = JSON.parse(storedFund);
        if (parsedFund.comptrollerProxy && parsedFund.vaultProxy) {
          setFundState({ ...parsedFund, loading: false, error: null });
        } else {
          setFundState(prevState => ({...prevState, loading: false}));
        }
      } catch (e) {
        console.error("Failed to parse fund context from localStorage", e);
        localStorage.removeItem('fundContext');
        setFundState(prevState => ({...prevState, loading: false}));
      }
    } else {
        setFundState(prevState => ({...prevState, loading: false}));
    }
  });

  // useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...fund,
    setFund,
    loadFund,
    clearFund,
  }), [fund, loadFund]);

  return (
    <FundContext.Provider value={value}>
      {children}
    </FundContext.Provider>
  );
};

// Custom hook to use the FundContext
export const useFund = (): FundContextType => {
  const context = useContext(FundContext);
  if (context === undefined) {
    throw new Error('useFund must be used within a FundProvider');
  }
  return context;
};
