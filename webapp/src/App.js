import React, {useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { XummAuthService } from "./service/XummAuthService";

import { XummApp } from "./pages/XummApp";
import { Home } from "./pages/Home";

import "./styles.css";

export function App() {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */

    const [isAuthorized, setIsAuthorized] = useState(null);
    const [xumm, setXumm] = useState(null);
    const [isWebApp, setIsWebApp] = useState(false);
    const [isXApp, setIsXApp] = useState(false);

    useEffect(() => {
        XummAuthService.getXummSDK().then((xummSdk) => {   
            if(xummSdk !== null) {
                setIsAuthorized(true);
                setXumm(xummSdk);
            }
        });
    }, []);

    useEffect(() => {
        if(xumm) {
            if (xumm.runtime.xapp) setIsXApp(true);
            if (xumm.runtime.browser && !xumm.runtime.xapp) setIsWebApp(true);
        }
    }, [xumm]);

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



    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/xapp" element={<Home 
                    xumm={xumm} isWebApp={isWebApp} isXApp={isXApp} isAuthorized={isAuthorized} setIsAuthorized={setIsAuthorized} setXumm={setXumm}/>} />  
                <Route path="/" element={<Home 
                    xumm={xumm} isWebApp={isWebApp} isXApp={isXApp} isAuthorized={isAuthorized} setIsAuthorized={setIsAuthorized} setXumm={setXumm} />} />
            </Routes>
        </BrowserRouter>
        </>



    );
}