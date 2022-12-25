import React, {useEffect, useState } from "react"

import { AccountService } from "../service/AccountService";

import AccountInfo from "../components/AccountInfo";
import AccountNfts from "../components/AccountNfts";
import { Spinner } from "../components/Base";
import { HeroImage, ActionList } from "../components/HomeComponents";

import Page from "../components/Page";


export const Home = ({
    xumm=null,
    isWebApp=false, 
    isXApp=false, 
    isAuthorized=false,
    login=null,
    logout=null}) => {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */
    const [account, setAccount] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [accountNfts, setAccountNfts] = useState(null);
    const [openid, setOpenId] = useState(null);
    const [ott, setOtt] = useState(null);


    useEffect(() => {
        const url = new URL(window.location.href);
        const xAppToken = url.searchParams.get("xAppToken") || null;
        console.log("Home xAppToken", xAppToken, isAuthorized);
        if(!xumm || !isAuthorized) return;

        AccountService.getAccountInfo().then((res) => {
            console.log("Home account info", res);
            setAccountInfo(res.data);
        });

        AccountService.getAccountNfts().then((res) => {
            console.log("Home account nfts", res);
            setAccountNfts(res.data);
        });

        xumm.then((xummSdk) => {
            xummSdk.user?.account.then((res) => {
                console.log("Home xumm account", res);
                setAccount(res);
            });
        });

     }, [xumm, isAuthorized]);


    return (
        <Page 
            xumm={xumm}
            isWebApp={isWebApp} 
            isXApp={isXApp}
            isAuthorized={isAuthorized}
            login={login}
            logout={logout}>
            <div>
                {isAuthorized ?
                <div className="p-2">  
                    {accountInfo ? <AccountInfo accountInfo={accountInfo} showJSON={false}/> : 
                        <div><Spinner/> loading account info...</div>}
                    {accountNfts ? <AccountNfts 
                        xumm={xumm}
                        isAuthorized={isAuthorized}
                        isWebApp={isWebApp} 
                        isXApp={isXApp} 
                        accountNfts={accountNfts} showJSON={false}/> : 
                        <div><Spinner/> loading account NFTs...</div>}                                     
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