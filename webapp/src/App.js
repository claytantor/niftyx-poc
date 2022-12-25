import React, {useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from 'axios';

import { XummAuthService } from "./service/XummAuthService";

import { Home } from "./pages/Home";

import "./styles.css";


/**
 * IMPORTANT!
 * this is the Xumm SDK, its super important that you
 * you create this as a global top level reference.
 * Creating this within a component will cause the
 * component to re-render every time the state changes
 * and breaks the sdk
 */
const xumm = XummAuthService.getXumm();


export function App() {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */

    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isWebApp, setIsWebApp] = useState(false);
    const [isXApp, setIsXApp] = useState(false);
    const [openid, setOpenid] = useState(null);
    const [bearer, setBearer] = useState(null);
    const [ott, setOtt] = useState(null);

    useEffect(() => {
        console.log("App.js useEffect");
        
        if(!xumm) return;
        console.log("App.js xumm", xumm);

        xumm.then((xummSdk) => {
            if (xummSdk.runtime.xapp) setIsXApp(true);
            if (xummSdk.runtime.browser && !xummSdk.runtime.xapp) setIsWebApp(true);
            xummSdk.environment.ott?.then(r => setOtt(r));
            xummSdk.environment.openid?.then((r) => {
                setOpenid(r);
                console.log('openid', r);
                setIsAuthorized(true);
            });
            xummSdk.environment.bearer?.then(r => {
                setBearer(r)
                console.log('bearer', r);
                Axios.defaults.headers.common['Authorization'] = `Bearer ${r}`;
            });
        });

    }, [xumm]);


    const login = (e) => {
        e.preventDefault();
        console.log('login');
        if(!xumm) return;
        console.log("App.js xumm", xumm);
        xumm.then((xummSDK) => {
            xummSDK.authorize().then((res) => { 
                console.log("authorized", res);   
                xumm.environment.jwt?.then(r => console.log('jwt', r));
                setIsAuthorized(true);
            }).catch ((err) => {
                console.log("error with auth", err);
            });
        });
    }

    const logout = (e) => {
        e.preventDefault();
        console.log("logout");
        if(!xumm) return;
        console.log("App.js xumm", xumm);

        xumm.then((xummSDK) => {
            xummSDK.logout();
            setIsAuthorized(false);
        });
        
    };

    useEffect(() => {
        if(xumm && isWebApp){
            xumm.then((xummSDK) => {
                console.log("web runtime", isWebApp);
                xummSDK.on("error", (error) => {
                    console.log("error", error)
                })
        
                xummSDK.on("success", async () => {
                    console.log('success', await xummSDK.user.account)
                })
        
                xummSDK.on("retrieved", async () => {
                    console.log("Retrieved: from localStorage or mobile browser redirect", await xummSDK.user.account)
                })
            });
        }

    }, [isWebApp]);

    useEffect(() => {
        if(xumm && isXApp){
            xumm.then((xummSDK) => {
                console.log("xumm runtime", isXApp);
                xummSDK.xapp.on('destination', data => {
                    console.log('xapp-destination@' + data.destination?.name, data.destination?.address, data?.reason)
                });
        });
        }
    }, [isXApp]);


    return (
        <>
        {/* <div>
            {xummSDK && !isAuthorized && <div onClick={()=>login(xummSDK)}>auth</div>}
            {xummSDK && isAuthorized && <div onClick={()=>logout(xummSDK)}>logout</div>}       
        </div> */}
        <BrowserRouter>
            <Routes>
                {/* <Route path="/foo" element={<Foo />} /> */}
                <Route path="/xapp" element={<Home 
                    xumm={xumm}
                    isWebApp={isWebApp} 
                    isXApp={isXApp}
                    isAuthorized={isAuthorized}
                    login={login}
                    logout={logout}/>} />  
                <Route path="/" element={<Home 
                    xumm={xumm}
                    isWebApp={isWebApp} 
                    isXApp={isXApp}
                    isAuthorized={isAuthorized}
                    login={login}
                    logout={logout}/>} />
            </Routes>
        </BrowserRouter>
        </>
    );
}