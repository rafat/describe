// app/context/Web3Provider.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createWalletClient, custom, WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains'; // Import Base Sepolia configuration

// Define the shape of our context
interface Web3ContextType {
    account: `0x${string}` | null;
    connectWallet: () => Promise<void>;
    walletClient: WalletClient | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Main provider component
export function Web3Provider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<`0x${string}` | null>(null);
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

    // Initialize the Wallet Client
    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const client = createWalletClient({
                chain: baseSepolia, 
                transport: custom(window.ethereum),
            });
            setWalletClient(client);
        }
    }, []);

    // Check for an existing connected account
    useEffect(() => {
        async function checkConnection() {
            if (walletClient) {
                try {
                    const accounts = await walletClient.getAddresses();
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    }
                } catch (error) {
                    console.log("Could not get existing accounts. User may not have granted permissions yet.");
                }
            }
        }
        checkConnection();
    }, [walletClient]);

    // Set up event listeners for account and chain changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: `0x${string}`[]) => {
                setAccount(accounts.length > 0 ? accounts[0] : null);
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    // Function to connect the wallet
    const connectWallet = async () => {
        if (!walletClient) {
            alert('MetaMask is not installed. Please install it to use this feature.');
            return;
        }
        try {
            const [address] = await walletClient.requestAddresses();
            setAccount(address);
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    };

    return (
        <Web3Context.Provider value={{ account, connectWallet, walletClient }}>
            {children}
        </Web3Context.Provider>
    );
}

// Custom hook to use the context
export function useWeb3() {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}