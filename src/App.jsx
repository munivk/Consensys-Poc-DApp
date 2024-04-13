import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { contractABI } from './contractABI.js';
import "./App.css";
import NftDetails from "./NftDetails.jsx";

const contractAddress = '0xE33041504B044770B22b92120DD2382001718fEc';

const App = () => {
    const [hasProvider, setHasProvider] = useState();
    const initialState = { accounts: [] };
    const [wallet, setWallet] = useState(initialState);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);
    

    useEffect(() => {
        const refreshAccounts = async (accounts) => {
            if (accounts.length > 0) {
                updateWallet(accounts);
            } else {
                setWallet(initialState);
            }
            loadNFTs();
        };

        const getProvider = async () => {
            try {
                const provider = await detectEthereumProvider({ silent: true });
                setHasProvider(Boolean(provider));

                if (provider) {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    refreshAccounts(accounts);
                    window.ethereum.on("accountsChanged", refreshAccounts);
                }
            } catch (error) {
                console.error('Error detecting Ethereum provider:', error);
            }
        };

        getProvider();
        return () => {
            window.ethereum?.removeListener("accountsChanged", refreshAccounts);
        };
    }, []);

    const updateWallet = (accounts) => {
        setWallet({ accounts });
    };
    async function loadNFTs() {
        setLoading(true);
        try {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                const totalSupply = await contract.methods.balanceOf(accounts[0]).call();
                let nftsData = [];
                for (let i = 0; i < totalSupply; i++) {
                    let tokenId = i + 1;
                    const owner = await contract.methods.ownerOf(tokenId).call();
                    const tokenURI = await contract.methods.tokenURI(tokenId).call();
                    console.log("Fetching Json details...");
                    nftsData.push({ tokenId, owner, tokenURI });
                }
                setNfts(nftsData);
            } else {
                console.error('Web3 not found. Please use a Web3-enabled browser.');
            }
        } catch (error) {
            console.error('Error fetching NFTs:', error);
        }
        setLoading(false);
    }

    const handleConnect = async () => {
        try {
            let accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            updateWallet(accounts);
        } catch (error) {
            console.error('Error connecting MetaMask:', error);
        }
    };

    

    return (
        <div className="App">
            <div>
                {/* Make sure mmLogo is properly imported */}
                 <img src='/metamask-logo.jpeg' alt="logo" /> 
            </div>

            {window.ethereum?.isMetaMask && 
                wallet.accounts.length < 1 && (                       
                    <button onClick={handleConnect}>Connect MetaMask</button>
                )}

            {wallet.accounts.length > 0 && (
                <div>Wallet Accounts: {wallet.accounts[0]}</div>
            )}
            <hr height='2px' width='50%'/>
            <h1>NFT Viewer</h1>
            {loading && <p>Loading NFTs...</p>}
            <div className="nft-list">
                {nfts.map((nft, index) => 
                    (<div className="nft-card" key={index}>
                    <NftDetails nft={nft} index={index}></NftDetails>
                </div>)
                )}
            </div>
        </div>
    );
};

export default App;



/*
import mmLogo from './metamask-logo.jpeg';
//<img src={mmLogo} alt="logo" />

import "./App.css";
import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import contractABI from './contractABI.json';

const contractAddress = '0x1A338C199D78392604c276CCa9e71a4786bC5189';

const App = () => {
    const [hasProvider, setHasProvider] = useState<boolean | null>(null);
    const initialState = { accounts: [] };
    const [wallet, setWallet] = useState(initialState);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const refreshAccounts = (accounts: any) => {              
            if (accounts.length > 0) {                            
                updateWallet(accounts);                           
            } else {                                              
                // if length 0, user is disconnected              
                setWallet(initialState);                          
            }      
            loadNFTs();                                               
        };                                                        

        const getProvider = async () => {
            const provider = await detectEthereumProvider({ silent: true });
            setHasProvider(Boolean(provider));

            if (provider) {                                       
                const accounts = await window.ethereum.request(   
                    { method: "eth_accounts" }                    
                );                                                
                refreshAccounts(accounts);                        
                window.ethereum.on(                               
                    "accountsChanged",                            
                    refreshAccounts                               
                );                                                
            }                                                     
        };

        getProvider();
        return () => {                                            
            window.ethereum?.removeListener("accountsChanged", refreshAccounts);
        };                                                        
    }, []);

    const updateWallet = async (accounts: any) => {
        setWallet({ accounts });
    };
    async function loadNFTs() {
        setLoading(true);
        try {
          // Connect to the Ethereum network
          if (window.ethereum) {
            console.log('Web3 detected');
            const web3 = new Web3(window.ethereum);
    
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
      
            const accounts = await web3.eth.getAccounts();
      
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log('Contract initialized:', contract);
      
            // Get the total supply of NFTs
            const totalSupply = await contract.methods.balanceOf('0x9e7FC97BA12e3df4bd1c55202dB85c76E45B5c80').call();
            console.log('Total NFTs:', totalSupply);
      
            // Fetch details of each NFT
            let nftsData = [];
            for (let i = 0; i < totalSupply; i++) {
              let tokenId = i+1; // await contract.methods.tokenByIndex(i).call();
              const owner = await contract.methods.ownerOf(tokenId).call();
              const tokenURI = await contract.methods.tokenURI(tokenId).call();
              console.log(tokenURI.slice(0,tokenURI.indexOf('?')));
              nftsData.push({ tokenId, owner, tokenURI });
            }
      
            console.log('NFTs Data:', nftsData);
            setNfts(nftsData);
          } else {
            console.error('Web3 not found. Please use a Web3-enabled browser.');
          }
        } catch (error) {
          console.error('Error fetching NFTs:', error);
        }
        setLoading(false);
      }

    const handleConnect = async () => {
        let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        updateWallet(accounts);
    };

    return (
        <div className="App">
            <div>
              <img src={mmLogo} alt="logo" />
            </div>

            {window.ethereum?.isMetaMask &&                       
                wallet.accounts.length < 1 && (                       
                    <button onClick={handleConnect}>Connect MetaMask</button>
                )}

            {wallet.accounts.length > 0 && (
                <div>Wallet Accounts: {wallet.accounts[0]}</div>
            )}

            <h1>NFT Viewer</h1>
            {loading && <p>Loading NFTs...</p>}
            <div className="nft-list">
                {nfts.map((nft, index) => (
                <div className="nft-card" key={index}>
                    <img src={nft.tokenURI} height="250px" width="250px"  alt={`NFT ${index}`} />
                    <p>Token ID: {nft.tokenId}</p>
                    <p>Owner: {nft.owner}</p>
                </div>
                ))}
            </div>
        </div>
    );
};

export default App;
*/