import React, {useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";

import { XummAuthService } from "./service/XummAuthService";
import { AccountService } from "./service/AccountService";
// import AccountInfo from "./components/AccountInfo";
// import AccountNfts from "./components/AccountNfts";
// import { Spinner } from "./components/Base";

// import imgLogo from "./assets/logo_niftyx.png";
// import wordLogo from "./assets/word_artsnew2.png";

// import fooPage from "./public/foo.html";

import { Home } from "./pages/Home";

import "./styles.css";

export function App() {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */

    const [isAuthorized, setIsAuthorized] = useState(null);
    // const [account, setAccount] = useState(null);
    // const [accountInfo, setAccountInfo] = useState(null);
    // const [accountNfts, setAccountNfts] = useState(null);
    // const [openid, setOpenId] = useState(null);
    const [xumm, setXumm] = useState(null);
    const [isWebApp, setIsWebApp] = useState(false);
    const [isXApp, setIsXApp] = useState(false);


    useEffect(() => {
        XummAuthService.getXummSDK().then((xummSdk) => {   
            if(xummSdk !== null) {
                setIsAuthorized(true);
                if (xummSdk.runtime.xapp) setIsXApp(true);
                if (xummSdk.runtime.browser && !xummSdk.runtime.xapp) setIsWebApp(true);
                setXumm(xummSdk);
            }
        });
    }, []);

    // useEffect(() => {
    //     if(xumm) {

    //         if (xumm.runtime.xapp) setIsXApp(true);
    //         if (xumm.runtime.browser && !xumm.runtime.xapp) setIsWebApp(true);

    //         xumm.user?.account.then((res) => {
    //             setAccount(res);
    //         });
    //         xumm.environment?.openid.then((res) => {
    //             setOpenId(res);                    
    //         });

    //         AccountService.getAccountInfo().then((res) => {
    //             setAccountInfo(res.data);
    //         });
    //         AccountService.getAccountNfts().then((res) => {
    //             setAccountNfts(res.data);
    //         });    
    //     }

    // }, [xumm]);


    useEffect(() => {
        if(xumm){
            xumm.on("error", (error) => {
                console.log("error", error)
            })
    
            xumm.on("success", async () => {
            console.log('success', await xumm.user.account)
            })
    
            xumm.on("retrieved", async () => {
                console.log("Retrieved: from localStorage or mobile browser redirect", await xumm.user.account)
            })
        }

    }, [isWebApp]);

    useEffect(() => {
        if(xumm && isXApp){
            xumm.xapp.on('destination', data => {
                console.log('xapp-destination@' + data.destination?.name, data.destination?.address, data?.reason)
            })
        }
    }, [isXApp]);


    // const signInWithXumm = async () => {
    //     if(xumm) {
    //         xumm.authorize().then((res) => {
    //             setIsAuthorized(true);
    //             xumm.user?.account.then((res) => {
    //                 setAccount(res);
    //             });
    //             xumm.environment?.openid.then((res) => {
    //                 setOpenId(res);
    //             });
    //         });
    //     } else {
    //         console.log("xumm is null");
    //         const xummSdk = await XummAuthService.makeXummSdk();
    //         xummSdk.authorize().then((res) => {
    //             setIsAuthorized(true);
    //             setXumm(xummSdk);
    //             xummSdk.user?.account.then((res) => {
    //                 setAccount(res);
    //             });
    //             xummSdk.environment?.openid.then((res) => {
    //                 setOpenId(res);
    //             });
    //         });
    //     }
    // };

    // const logoutXumm = async () => {
    //     await xumm.logout();
    //     setIsAuthorized(false);
    // };


    return (
        <>
        <BrowserRouter>
            <Routes>
                {/* <Route path="/foo" element={fooPage} /> */}
                <Route path="/" element={<Home 
                    xumm={xumm} isWebApp={isWebApp} isXApp={isXApp} isAuthorized={isAuthorized} setIsAuthorized={setIsAuthorized} setXumm={setXumm} />} />
            </Routes>
        </BrowserRouter>
        </>



    );
}