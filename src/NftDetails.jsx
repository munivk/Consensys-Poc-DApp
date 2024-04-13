import { useEffect, useState } from "react";
import './NftDetails.css';
export const NftDetails = (
   nft,
   index=0
)=> {

    const [image, setImage] = useState('');
    const [value, setValue] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [amt, setAmt] = useState(0)
    const getNftImage = async (nft) => {
        try {
                const nftDetails = await fetch(nft);
                const nftDetailsObj = await nftDetails.json();
                setImage (nftDetailsObj.image);
        }
        catch (error) {
            console.error('Error in fetching Json:', nft);
        }
    };
    const randomNFTValue = ()=>{
        const demand = Math.random()* 1000;
        const rarity = Math.random()*1000;
        const rarityWeight = 0.6;
        const demandWeight = 0.4;

        // Calculate value based on rarity and demand
        const value = (rarity * rarityWeight) + (demand * demandWeight);
        setValue(value.toFixed(2));
    }
    useEffect(()=>{
        getNftImage(nft.nft.tokenURI);
        randomNFTValue();
    },[]);
   const canLend =(event)=>{
        const loanAmount = parseInt(event.target.value);
        if (loanAmount <= value) {
            setDisabled(false);
            setAmt(loanAmount);
        }
   }
   const lendAmount = ()=>{
    setValue((value-amt).toFixed(2));
    setAmt(0);
   }
return(
    <div className="container">
        <img src={image} height="250px" width="250px" alt={`NFT ${index}`} />
        <p>Token ID: {nft.nft.tokenId}</p>
        <p>Owner: {nft.nft.owner}</p>
        <p> Estimated Value : {value} USD</p>
        <input type="text" onChange={(e)=>canLend(e)} value={amt} />
        <button disabled={disabled} onClick={()=>{lendAmount()}}>Loan this amount </button>
    </div>
)
}

export default NftDetails