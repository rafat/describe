// components/CoinInfoSidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCoin, GetCoinResponse } from '@zoralabs/coins-sdk';
import { baseSepolia } from 'viem/chains';

interface CoinInfoSidebarProps {
    coinAddress: string;
}

type Zora20Token = GetCoinResponse['zora20Token'];

export default function CoinInfoSidebar({ coinAddress }: CoinInfoSidebarProps) {
    const [coinInfo, setCoinInfo] = useState<Zora20Token | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!coinAddress) {
            setIsLoading(false);
            return;
        };

        const fetchCoinInfo = async () => {
            try {
                setIsLoading(true);
                const response = await getCoin({
                    address: coinAddress,
                    chain: baseSepolia.id,
                });
                const coin = response.data?.zora20Token;
                setCoinInfo(coin);
            } catch (err) {
                setError('Failed to fetch coin information.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoinInfo();
    }, [coinAddress]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-5"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>;
    }

    if (!coinInfo) {
        return null;
    }

    return (
        <div className="p-6 bg-white text-gray-900 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Coin Information</h3>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-lg">{coinInfo.name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Symbol</p>
                    <p className="font-semibold text-gray-700">{coinInfo.symbol}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <a
                        href={`https://sepolia-explorer.base.org/token/${coinAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 hover:underline text-sm break-all transition-colors"
                    >
                        {coinAddress}
                    </a>
                </div>
                 <div>
                    <p className="text-sm text-gray-500">Total Supply</p>
                    <p className="font-semibold text-gray-700">{coinInfo.totalSupply}</p>
                </div>
            </div>
        </div>
    );
}