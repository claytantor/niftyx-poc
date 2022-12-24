import React from "react"
import lodash from "lodash"
import { Buffer } from "buffer";
import MintNftModal from "./MintNftModal";

import { apiConfig } from "../env";

const AccountNfts = ({
    xumm=null, 
    isWebApp=false, 
    isXApp=false,
    accountNfts, 
    showJSON=false}) => {


    // MintNftModal = ({ 
    //     xumm=null, 
    //     isWebApp=false, 
    //     isXApp=false}) =>

    function convertHexToString(
        hex,
        encoding = 'utf8',
      ) {
        // console.log('apiConfig', apiConfig);
        const baseUri = Buffer.from(hex, 'hex').toString(encoding).replace('ipfs://', apiConfig().pinataGateway+"/");
        // console.log('baseUri', baseUri);
        return baseUri;
      }
      

    let renderNfts = (accountNfts) => {
        return accountNfts.result.account_nfts.map((nft, index) => (
            <div className="flex flex-col w-32 h-32 bg-slate-800 text-yellow-400 m-1 rounded-lg p-1 break-words" key={index}>
                <div className="text-xs font-bold text-yellow-400">
                    <img className="rounded-lg" src={convertHexToString(nft.URI)}/></div> 
            </div>
        ));
    };

    return (
        <>
            {accountNfts && accountNfts.result && accountNfts.result.account_nfts && accountNfts.result.account_nfts.length &&
             <div className="flex flex-col">                
                <div className="flex flex-row text-heading text-2xl justify-between">
                    <div>NFTs ({accountNfts.result.account_nfts.length})</div>
                    <MintNftModal xumm={xumm} isWebApp={isWebApp} isXApp={isXApp}/>
                </div>
                {showJSON && <div className="flex flex-row">
                    <code className="w-full"><pre>{JSON.stringify(accountNfts,null,2)}</pre></code>
                </div>}
                {accountNfts.result.account_nfts.length > 0 ? <div className="flex flex-wrap w-full bg-slate-700 p-1">{renderNfts(accountNfts)}</div>:
                <div className="flex flex-wrap w-full bg-slate-700 p-1">No NFTs</div>}
            </div>}
        </>
    );
  };
  
export default AccountNfts