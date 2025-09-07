
import React from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { FundProvider } from './contexts/FundContext';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreateFundPage from './pages/CreateFundPage';
import InvestorDashboardPage from './pages/InvestorDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import FundDepositPage from './pages/FundDepositPage';
import FundRedeemPage from './pages/FundRedeemPage';
import ManageFundPage from './pages/ManageFundPage';
import TradeTerminalPage from './pages/TradeTerminalPage';


const AppLayout = () => {
    const location = useLocation();
    // Do not show header on the home page
    if (location.pathname === '/') {
        return <Outlet />;
    }
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
};


const App: React.FC = () => {
  return (
    <WalletProvider>
      <FundProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="create-fund" element={<CreateFundPage />} />
              <Route path="dashboard/investor" element={<InvestorDashboardPage />} />
              <Route path="dashboard/manager" element={<ManagerDashboardPage />} />
            <Route path="fund/deposit" element={<FundDepositPage />} />
            <Route path="fund/redeem" element={<FundRedeemPage />} />
            <Route path="manage" element={<ManageFundPage />} />
            <Route path="manage/trade" element={<TradeTerminalPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </FundProvider>
    </WalletProvider>
  );
};

export default App;
