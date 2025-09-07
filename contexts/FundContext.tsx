import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

// Interface for the state of the fund
interface FundState {
  comptrollerProxy: string | null;
  vaultProxy: string | null;
}

// Interface for the context value
interface FundContextType extends FundState {
  setFund: (comptrollerProxy: string, vaultProxy: string) => void;
  clearFund: () => void;
}

// Create the context with an undefined default value
const FundContext = createContext<FundContextType | undefined>(undefined);

// Provider component
export const FundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fund, setFundState] = useState<FundState>({
    comptrollerProxy: null,
    vaultProxy: null,
  });

  // Function to set the fund addresses
  const setFund = (comptrollerProxy: string, vaultProxy: string) => {
    setFundState({ comptrollerProxy, vaultProxy });
    // Optional: Persist to localStorage to survive page reloads
    localStorage.setItem('fundContext', JSON.stringify({ comptrollerProxy, vaultProxy }));
  };

  // Function to clear the fund addresses
  const clearFund = () => {
    setFundState({ comptrollerProxy: null, vaultProxy: null });
    localStorage.removeItem('fundContext');
  };

  // On initial load, try to get the fund from localStorage
  useState(() => {
    const storedFund = localStorage.getItem('fundContext');
    if (storedFund) {
      try {
        const parsedFund = JSON.parse(storedFund);
        if(parsedFund.comptrollerProxy && parsedFund.vaultProxy) {
            setFundState(parsedFund);
        }
      } catch (e) {
        console.error("Failed to parse fund context from localStorage", e);
        localStorage.removeItem('fundContext');
      }
    }
  });

  // useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...fund,
    setFund,
    clearFund,
  }), [fund]);

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
