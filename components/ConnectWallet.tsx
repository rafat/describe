// app/components/ConnectWallet.tsx
'use client';

import { useWeb3 } from '@/context/Web3Provider';

export default function ConnectWallet() {
    const { account, connect } = useWeb3();

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div>
            {account ? (
                <span className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">
                    {truncateAddress(account)}
                </span>
            ) : (
                <button
                    onClick={connect}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );
}