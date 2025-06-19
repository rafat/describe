// context/Web3Provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createCoin, createCoinCall, DeployCurrency } from '@zoralabs/coins-sdk';
import { createWalletClient, createPublicClient, http, custom, Address, Hex } from 'viem';
import { baseSepolia } from 'viem/chains'; // Using Base Sepolia for testing

interface CoinCreationParams {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer?: Address;
}

interface CoinCreationResult {
  hash: string;
  address: Address;
  deployment: any;
}

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  createCoin: (params: CoinCreationParams) => Promise<CoinCreationResult>;
  isCreatingCoin: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCreatingCoin, setIsCreatingCoin] = useState(false);

  const isConnected = !!account;

  // Check if wallet is already connected on load
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          setChainId(parseInt(chainId, 16));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        setChainId(parseInt(chainId, 16));

        // Switch to Base Sepolia if not already on it
        if (parseInt(chainId, 16) !== baseSepolia.id) {
          await switchToBaseSepolia();
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    } else {
      throw new Error('No Web3 wallet found. Please install MetaMask.');
    }
  };

  const switchToBaseSepolia = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }],
        });
        setChainId(baseSepolia.id);
      } catch (switchError: any) {
        // Chain not added to wallet
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${baseSepolia.id.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              }],
            });
            setChainId(baseSepolia.id);
          } catch (addError) {
            console.error('Error adding Base Sepolia network:', addError);
            throw addError;
          }
        } else {
          console.error('Error switching to Base Sepolia:', switchError);
          throw switchError;
        }
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
  };

  const createCoinForPost = async (params: CoinCreationParams): Promise<CoinCreationResult> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== baseSepolia.id) {
      await switchToBaseSepolia();
    }

    setIsCreatingCoin(true);

    try {
      // Set up viem clients for Base Sepolia
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org'), // Base Sepolia RPC
      });

      const walletClient = createWalletClient({
        account: account as Hex,
        chain: baseSepolia,
        transport: custom(window.ethereum!),
      });

      // Create coin parameters
      const coinParams = {
        name: params.name,
        symbol: params.symbol,
        uri: params.uri,
        payoutRecipient: params.payoutRecipient,
        platformReferrer: params.platformReferrer,
        chainId: baseSepolia.id,
        currency: DeployCurrency.ETH, // Using ETH on Base Sepolia (ZORA not supported)
      };

      // Create the coin
      const result = await createCoin(coinParams, walletClient, publicClient, {
        gasMultiplier: 120, // Add 20% gas buffer
      });

      if (!result.address || !result.deployment) {
        // This can happen if the transaction fails very early.
        throw new Error('Failed to retrieve coin address after transaction. The deployment may have failed.');
      }

      return result as CoinCreationResult;
    } catch (error) {
      console.error('Error creating coin:', error);
      throw error;
    } finally {
      setIsCreatingCoin(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value: Web3ContextType = {
    account,
    isConnected,
    chainId,
    connect,
    disconnect,
    createCoin: createCoinForPost,
    isCreatingCoin,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}