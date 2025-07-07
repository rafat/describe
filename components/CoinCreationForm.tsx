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
  const [statusMessage, setStatusMessage] = useState('');

  const { account, createCoin, isCreatingCoin } = useWeb3();

  // --- CHANGE START ---
  // You must get a JWT from Pinata by signing up for a free account.
  // Go to https://app.pinata.cloud/keys and create a new key.
  // For production, this key should be stored securely as an environment variable.
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  // --- CHANGE END ---


  /**
   * Uploads the metadata JSON object to IPFS using Pinata.
   * @returns The IPFS hash (CID) of the uploaded metadata.
   */
  const uploadMetadataToIpfs = async (): Promise<string> => {
    if (PINATA_JWT === 'YOUR_PINATA_JWT') {
      throw new Error('Pinata JWT is not configured. Please add your key.');
    }

    setStatusMessage('Uploading metadata to IPFS...');
    
    // 1. Construct the metadata object
    const metadata = {
      name: coinName,
      description: description || `A coin representing the post: ${postTitle}`,
      image: imageUrl || `https://placehold.co/400x400/7c3aed/ffffff?text=${encodeURIComponent(coinSymbol)}`,
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

    // 2. Upload to Pinata
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${coinSymbol}-metadata.json`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinata API Error: ${errorData.error?.details || response.statusText}`);
      }

      const responseData = await response.json();
      return responseData.IpfsHash;

    } catch (error) {
      console.error('IPFS Upload Error:', error);
      // Re-throw the error to be caught by the main handler
      throw error;
    }
  };


  const handleCreateCoin = async () => {
    // Basic validation
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    if (!coinName.trim() || !coinSymbol.trim()) {
      alert('Please fill in coin name and symbol');
      return;
    }

    try {
      // 1. Upload metadata and get the real IPFS URI
      const ipfsHash = await uploadMetadataToIpfs();
      const uri = `ipfs://${ipfsHash}`;
      console.log('Successfully uploaded metadata to IPFS. URI:', uri);
      
      setStatusMessage('Creating coin on the blockchain...');

      // 2. Create the coin with the real URI
      const result = await createCoin({
        name: coinName.trim(),
        symbol: coinSymbol.trim().toUpperCase(),
        uri,
        payoutRecipient: account as Address,
      });

      console.log('Coin created successfully:', result);
      setStatusMessage(`Success! Coin Address: ${result.address}`);
      onCoinCreated(result.address);
      
      // Consider replacing alert with a more modern notification component
      alert(`Coin created successfully! Address: ${result.address}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Failed to create coin:', error);
      setStatusMessage(`Error: ${errorMessage}`);
      // Consider replacing alert with a more modern notification component
      alert(`Failed to create coin: ${errorMessage}`);
    }
  };

  if (!account) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Connect your wallet to create a coin for this post.</p>
      </div>
    );
  }

  // Determine if the main button should be disabled
  const isButtonDisabled = disabled || isCreatingCoin || !coinName.trim() || !coinSymbol.trim();

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">Create a Coin for This Post</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="coinName" className="block text-sm font-medium mb-1 text-gray-200">Coin Name</label>
          <input
            id="coinName"
            type="text"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-purple-500"
            placeholder="My Awesome Coin"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label htmlFor="coinSymbol" className="block text-sm font-medium mb-1 text-gray-200">Symbol (Max 6 chars)</label>
          <input
            id="coinSymbol"
            type="text"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value.toUpperCase().substring(0, 6))}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-purple-500"
            placeholder="SYMBOL"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-200">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Describe your coin..."
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1 text-gray-200">Image URL (Optional)</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-purple-500"
            placeholder="https://example.com/image.png"
            disabled={disabled || isCreatingCoin}
          />
        </div>

        <button
          onClick={handleCreateCoin}
          disabled={isButtonDisabled}
          className="w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isCreatingCoin ? 'Processing...' : 'Create Coin'}
        </button>

        {isCreatingCoin && (
          <p className="text-sm text-center text-gray-400 animate-pulse">
            {statusMessage || "This may take a few moments. Please keep the browser open."}
          </p>
        )}
        {!isCreatingCoin && statusMessage && (
           <p className={`text-sm text-center ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
