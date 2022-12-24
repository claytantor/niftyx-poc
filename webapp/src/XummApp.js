import React, {useEffect, useState } from "react"

import { AccountService } from "../service/AccountService";
import AccountInfo from "../components/AccountInfo";
import AccountNfts from "../components/AccountNfts";
import { Spinner } from "../components/Base";
import { HeroImage, ActionList } from "../components/HomeComponents";

import Page from "../components/Page";


export const XummApp = ({xumm, isWebApp, isXApp, isAuthorized, setIsAuthorized, setXumm}) => {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */
    const [account, setAccount] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [accountNfts, setAccountNfts] = useState(null);
    const [openid, setOpenId] = useState(null);

    useEffect(() => {
        if(xumm) {
            xumm.user?.account.then((res) => {
                setAccount(res);
            });
            xumm.environment?.openid.then((res) => {
                setOpenId(res);                    
            });
            AccountService.getAccountInfo().then((res) => {
                setAccountInfo(res.data);
            });
            AccountService.getAccountNfts().then((res) => {
                setAccountNfts(res.data);
            });    
        }

    }, [xumm]);


    return (
        <Page xumm={xumm} isWebApp={isWebApp} isXApp={isXApp} isAuthorized={isAuthorized} setIsAuthorized={setIsAuthorized} setXumm={setXumm}>
            <div>

                {isAuthorized ?
                <div className="p-2">      
                    {accountInfo ? <AccountInfo accountInfo={accountInfo} showJSON={false}/> : 
                        <div>{ isAuthorized && <><Spinner/> loading account info...</>}</div>}
                    {accountNfts ? <AccountNfts accountNfts={accountNfts} showJSON={false}/> : 
                        <div>{ isAuthorized && <><Spinner/> loading account NFTs...</>}</div>}                                       
                </div>:
                <>  
                    <div>
                        <HeroImage/>
                    </div>
                    <div>
                        <ActionList/>
                    </div>
                </>}

            </div>


        </Page>
    );
}