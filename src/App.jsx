import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { contractABI } from './contractABI.js';
import "./App.css";
import NftDetails from "./NftDetails.jsx";

const contractAddress = '0x214519c6105298767B004C3A07732b33E4761be5';
//const infuraWebSocketURL = 'wss://polygon-amoy.infura.io/ws/v3/XXXX';

const App = () => {
    const [hasProvider, setHasProvider] = useState();
    const initialState = { accounts: [] };
    const [wallet, setWallet] = useState(initialState);
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);
    let web3;

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
                web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                console.log("Account:", accounts[0]);
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                const totalSupply = await contract.methods.balanceOf(accounts[0]).call();
                console.log("Total supply:", totalSupply);
                let nftsData = [];
                for (let i = 0; i < totalSupply; i++) {
                    let tokenId = i;
                    const owner = await contract.methods.ownerOf(tokenId).call();
                    const tokenURI = await contract.methods.tokenURI(tokenId).call();
                    console.log("Fetching Json details...");
                    nftsData.push({ tokenId, owner, tokenURI });
                }
                setNfts(nftsData);
                
                // Subscribe to MintEvent
                contract.events.MintEvent({ filter: { to: accounts[0] } })
                    .on('data', event => {
                        console.log('MintEvent:', event);
                        // Reload NFTs after mint event
                        loadNFTs();
                    })
                    .on('error', error => {
                        console.error('MintEvent error:', error);
                    });
                
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
            <header>
            <h1> Lending & Borrowing DApp </h1>
            </header>
            

            {window.ethereum?.isMetaMask && 
                wallet.accounts.length < 1 && (                       
                    <button onClick={handleConnect}><h3>Connect MetaMask</h3></button>
                )}

            {wallet.accounts.length > 0 && (
                <div>Wallet Accounts: {wallet.accounts[0]}</div>
            )}
            <hr height='2px' width='75%'/>
            <h2>NFT Dashboard</h2>
            {loading && <p>Loading NFTs...</p>}
            <div className="Nft-list">
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
