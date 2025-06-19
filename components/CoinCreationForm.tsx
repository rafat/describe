// components/CoinCreationForm.tsx
'use client';

import { useState } from 'react';
import { useWeb3 } from '@/context/Web3Provider';
import { Address } from 'viem';

interface CoinCreationFormProps {
  postTitle: string;
  onCoinCreated: (coinAddress: string) => void;
  disabled?: boolean;
}

export default function CoinCreationForm({ 
  postTitle, 
  onCoinCreated, 
  disabled = false 
}: CoinCreationFormProps) {
  const [coinName, setCoinName] = useState(`${postTitle} Coin`);
  const [coinSymbol, setCoinSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { account, createCoin, isCreatingCoin } = useWeb3();

  // Generate symbol from title
  const generateSymbol = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 6); // Limit to 6 characters
  };

  const handleTitleChange = (title: string) => {
    setCoinName(`${title} Coin`);
    if (!coinSymbol) {
      setCoinSymbol(generateSymbol(title));
    }
  };

  const createMetadataUri = () => {
    // For demo purposes, we'll create a simple metadata object
    // In production, you'd want to upload this to IPFS
    const metadata = {
      name: coinName,
      description: description || `A coin representing the post: ${postTitle}`,
      image: imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(coinSymbol)}`,
      attributes: [
        {
          trait_type: "Post Title",
          value: postTitle
        },
        {
          trait_type: "Creator",
          value: account
        }
      ]
    };

    // For demo, we'll use a placeholder IPFS URI
    // You should upload the actual metadata to IPFS
    return "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy";
  };

  const handleCreateCoin = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!coinName.trim() || !coinSymbol.trim()) {
      alert('Please fill in coin name and symbol');
      return;
    }

    try {
      const uri = createMetadataUri();
      
      const result = await createCoin({
        name: coinName.trim(),
        symbol: coinSymbol.trim().toUpperCase(),
        uri,
        payoutRecipient: account as Address,
        // Optional: Add platform referrer if you want to earn fees
        // platformReferrer: "0xYourPlatformAddress" as Address,
      });

      console.log('Coin created successfully:', result);
      onCoinCreated(result.address);
      
      // Show success message
      alert(`Coin created successfully! Address: ${result.address}`);
      
    } catch (error) {
      console.error('Error creating coin:', error);
      alert(`Failed to create coin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!account) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Connect your wallet to create a coin for this post</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Create a Coin for This Post</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Coin Name</label>
          <input
            type="text"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="My Awesome Coin"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Symbol (Max 6 chars)</label>
          <input
            type="text"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value.toUpperCase().substring(0, 6))}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="COIN"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            rows={3}
            placeholder="Describe your coin..."
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="https://example.com/image.png"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <button
          onClick={handleCreateCoin}
          disabled={disabled || isCreatingCoin || !coinName.trim() || !coinSymbol.trim()}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isCreatingCoin ? 'Creating Coin...' : 'Create Coin'}
        </button>

        {isCreatingCoin && (
          <p className="text-sm text-gray-400">
            This may take a few minutes. Please don't close the browser.
          </p>
        )}
      </div>
    </div>
  );
}