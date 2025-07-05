# Describe

A Science and Research-focused Group Blogging Platform that allows any post to be minted as a Coin on Base Sepolia Testnet using Zora protocol Coins SDK. The aim is not just to enable bloggers to be rewarded with a sizeable supply of the coin, but also to enable creators to build a community of readers by letting them reward the community for commenting and sharing these posts. More on this below.

-----

## Demo

The project is live on Netlify at [https://playful-gecko-9fae0a.netlify.app/](https://playful-gecko-9fae0a.netlify.app/).

You will need some Base Sepolia Tokens if you want to interact with the Zora coin contracts.

-----

## Getting Started Locally

The project is built on Next.Js 15+.

```bash
git clone https://github.com/rafat/describe.git
cd describe
npm install
npm run dev
```

You'll also have to rename `.example` to `.env` and add your keys.

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

-----

## Creating Posts and Coins Concurrently

1.  Construct the metadata object
    ```javascript
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
    ```
2.  Upload to Pinata and get the real IPFS URI
    ```javascript
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
    ```
3.  Create the coin with the real URI
    ```javascript
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
    ```

-----

## Community Engagement

We allow and encourage creators to directly reward all community members who engage with the post. Creators can manually send coins to all commenters based on their own criteria. Referrals are harder to track and measure with greater risk of abuse. To mitigate this, we use a referral validation system involving time spent on the page, scrolling, clicking, and other types of engagement. Each referral link is also unique and connected to the referrer's wallet address. This is also an area where LLMs and AI agents can be truly helpful in weeding out spam and frauds. This is on our To-Do list. Also on our To-Do list is to enable buying and selling the coins on the post page itself.
