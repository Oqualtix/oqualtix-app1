/**
 * Bank Connection Context
 * Manages bank account connections and synchronization for offline use
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bank Connection Context
const BankConnectionContext = createContext({
  connectedBanks: [],
  lastSyncTime: null,
  addBankConnection: () => {},
  removeBankConnection: () => {},
  updateBankConnection: () => {},
  syncBankData: () => {},
  getBankTransactions: () => [],
  isSyncing: false,
  syncStatus: 'idle',
  offlineMode: true // Always offline since Oqualtix is standalone
});

// Default bank structure
const createBankConnection = (bankData) => ({
  id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: bankData.name || 'Unknown Bank',
  accountNumber: bankData.accountNumber || '****',
  accountType: bankData.accountType || 'checking',
  balance: bankData.balance || 0,
  currency: bankData.currency || 'USD',
  connected: true,
  lastSync: new Date().toISOString(),
  transactions: bankData.transactions || [],
  isActive: true,
  connectionMethod: 'file_import', // Since we're offline
  metadata: {
    ...bankData.metadata,
    addedAt: new Date().toISOString(),
    source: 'manual_import'
  }
});

// Bank Connection Provider Component
export const BankConnectionProvider = ({ children }) => {
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Load bank connections on startup
  useEffect(() => {
    loadBankConnections();
  }, []);

  // Load bank connections from storage
  const loadBankConnections = async () => {
    try {
      const stored = await AsyncStorage.getItem('@bank_connections');
      if (stored) {
        const banks = JSON.parse(stored);
        setConnectedBanks(banks);
        
        // Get last sync time
        if (banks.length > 0) {
          const lastSync = Math.max(...banks.map(bank => new Date(bank.lastSync).getTime()));
          setLastSyncTime(new Date(lastSync).toISOString());
        }
      }
    } catch (error) {
      console.log('Error loading bank connections:', error);
    }
  };

  // Save bank connections to storage
  const saveBankConnections = async (banks) => {
    try {
      await AsyncStorage.setItem('@bank_connections', JSON.stringify(banks));
    } catch (error) {
      console.log('Error saving bank connections:', error);
    }
  };

  // Add new bank connection
  const addBankConnection = async (bankData) => {
    try {
      const newBank = createBankConnection(bankData);
      const updatedBanks = [...connectedBanks, newBank];
      
      setConnectedBanks(updatedBanks);
      await saveBankConnections(updatedBanks);
      
      // Update sync time
      setLastSyncTime(newBank.lastSync);
      
      return newBank;
    } catch (error) {
      console.log('Error adding bank connection:', error);
      return null;
    }
  };

  // Remove bank connection
  const removeBankConnection = async (bankId) => {
    try {
      const updatedBanks = connectedBanks.filter(bank => bank.id !== bankId);
      setConnectedBanks(updatedBanks);
      await saveBankConnections(updatedBanks);
      
      return true;
    } catch (error) {
      console.log('Error removing bank connection:', error);
      return false;
    }
  };

  // Update bank connection
  const updateBankConnection = async (bankId, updates) => {
    try {
      const updatedBanks = connectedBanks.map(bank => 
        bank.id === bankId 
          ? { ...bank, ...updates, lastSync: new Date().toISOString() }
          : bank
      );
      
      setConnectedBanks(updatedBanks);
      await saveBankConnections(updatedBanks);
      setLastSyncTime(new Date().toISOString());
      
      return true;
    } catch (error) {
      console.log('Error updating bank connection:', error);
      return false;
    }
  };

  // Sync bank data (offline simulation)
  const syncBankData = async (bankId = null) => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      // Simulate sync process for offline mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedBanks = connectedBanks.map(bank => {
        if (bankId === null || bank.id === bankId) {
          return {
            ...bank,
            lastSync: new Date().toISOString(),
            connected: true
          };
        }
        return bank;
      });
      
      setConnectedBanks(updatedBanks);
      await saveBankConnections(updatedBanks);
      setLastSyncTime(new Date().toISOString());
      setSyncStatus('success');
      
      return { success: true, message: 'Bank data synchronized successfully' };
    } catch (error) {
      console.log('Error syncing bank data:', error);
      setSyncStatus('error');
      return { success: false, message: 'Failed to sync bank data' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Get transactions for a specific bank or all banks
  const getBankTransactions = (bankId = null, limit = null) => {
    let transactions = [];
    
    const banksToCheck = bankId 
      ? connectedBanks.filter(bank => bank.id === bankId)
      : connectedBanks;
    
    banksToCheck.forEach(bank => {
      if (bank.transactions && bank.transactions.length > 0) {
        const bankTransactions = bank.transactions.map(transaction => ({
          ...transaction,
          bankId: bank.id,
          bankName: bank.name,
          accountNumber: bank.accountNumber
        }));
        transactions = [...transactions, ...bankTransactions];
      }
    });
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply limit if specified
    if (limit && limit > 0) {
      transactions = transactions.slice(0, limit);
    }
    
    return transactions;
  };

  // Get bank summary
  const getBankSummary = () => {
    const summary = {
      totalBanks: connectedBanks.length,
      activeBanks: connectedBanks.filter(bank => bank.isActive).length,
      totalBalance: connectedBanks.reduce((sum, bank) => sum + (bank.balance || 0), 0),
      totalTransactions: connectedBanks.reduce((sum, bank) => sum + (bank.transactions?.length || 0), 0),
      currencies: [...new Set(connectedBanks.map(bank => bank.currency))],
      lastSyncTime
    };
    
    return summary;
  };

  const value = {
    connectedBanks,
    lastSyncTime,
    addBankConnection,
    removeBankConnection,
    updateBankConnection,
    syncBankData,
    getBankTransactions,
    getBankSummary,
    isSyncing,
    syncStatus,
    offlineMode: true, // Always offline
    loadBankConnections
  };

  return (
    <BankConnectionContext.Provider value={value}>
      {children}
    </BankConnectionContext.Provider>
  );
};

// Hook to use bank connections
export const useBankConnection = () => {
  const context = useContext(BankConnectionContext);
  if (!context) {
    throw new Error('useBankConnection must be used within a BankConnectionProvider');
  }
  return context;
};

export { BankConnectionContext };
export default BankConnectionContext;