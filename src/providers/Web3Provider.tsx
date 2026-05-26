```javascript
/**
 * @module Web3Provider
 * Provides a consistent interface for interacting with various web3 wallets
 * using WalletConnect and RainbowKit in a Next.js project.
 */

import { useState, useEffect } from 'react';
import { connectorsForWallets, RainbowKitProvider, walletList } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import WalletConnectConnector from '@wagmi/connector-walletconnect';

/**
 * @constant {Array} chains
 * List of supported chains.
 */
const chains = configureChains(
  [mainnet, polygon, arbitrum],
  [
    WalletConnectConnector({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID }),
  ],
);

/**
 * @constant {Object} web3Provider
 * Main component that provides the web3 context to the application.
 */
const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const wagmiClient = createClient({
      autoConnect: true,
      connectors: connectorsForWallets(walletList),
      provider: chains.provider,
    });

    wagmiClient.connectors.forEach((connector) => {
      connector.on('change', (data) => {
        if (data.isConnected && data.account) {
          setIsConnected(true);
          setAddress(data.account);
        } else {
          setIsConnected(false);
          setAddress(null);
        }
      });
    });

    return () => {
      wagmiClient.disconnect();
    };
  }, []);

  return (
    <WagmiConfig client={createClient({
      connectors: connectorsForWallets(walletList),
      provider: chains.provider,
    })}>
      <RainbowKitProvider modalSize="compact" chains={chains.chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
```