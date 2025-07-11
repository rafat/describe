// components/RewardButton.tsx
'use client';

import { useState } from 'react';
import { useWeb3 } from '@/context/Web3Provider';
import { createPublicClient, createWalletClient, http, custom, parseEther, erc20Abi } from 'viem';
import { baseSepolia } from 'viem/chains';

interface RewardButtonProps {
    coinAddress: `0x${string}`;
    recipientAddress: `0x${string}`;
    customLabel: string;
}

export default function RewardButton({ coinAddress, recipientAddress, customLabel }: RewardButtonProps) {
    const { isConnected, account, connect } = useWeb3();
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('');

    const handleReward = async () => {
        if (!isConnected || !account) {
            await connect();
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        setIsLoading(true);
        try {
            const publicClient = createPublicClient({
                chain: baseSepolia,
                transport: http(),
            });

            const walletClient = createWalletClient({
                account: account as `0x${string}`,
                chain: baseSepolia,
                transport: custom(window.ethereum!),
            });

            const { request } = await publicClient.simulateContract({
                address: coinAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [recipientAddress, parseEther(amount)],
                account: account as `0x${string}`,
            });

            const hash = await walletClient.writeContract(request);

            alert(`Successfully sent ${amount} coins! Transaction Hash: ${hash}`);
            setAmount('');

        } catch (error) {
            console.error('Failed to send reward:', error);
            alert('Failed to send reward. See the console for more details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-full">
            {customLabel && (
                <div className="text-xs text-gray-400 mb-2">
                    {customLabel}
                </div>
            )}
            <div className="flex items-center gap-2 w-full">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 min-w-0 px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                />
                <button
                    onClick={handleReward}
                    disabled={isLoading || !isConnected}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold text-white disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                    {isLoading ? 'Sending...' : 'Reward'}
                </button>
            </div>
        </div>
    );
}