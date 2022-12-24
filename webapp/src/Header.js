import React, {useState, useEffect} from "react"

import { v4 as uuidv4 } from 'uuid';

import { useNavigate } from "react-router-dom";
import { FaUserCircle } from 'react-icons/fa';

import { AccountService } from "../service/AccountService";
import { XummAuthService } from "../service/XummAuthService";

import { xummConfig } from "../env";
import icon64 from "../assets/favicon-64x64.png"
import xLogo from "../assets/xlogo.png";
import loginXumm from "../assets/login_xumm.png";

const whitepaperUrl = "https://niftyx.io/whitepaper.pdf";

const Header = ({
    xumm=null, 
    isWebApp=false, 
    isXApp=false, 
    isAuthorized=false,
    setIsAuthorized={},
    setXumm={},
    children,
  }) => {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */
     const [account, setAccount] = useState(null);
     const [jwt, setJwt] = useState(null);
     const [accountInfo, setAccountInfo] = useState(null);
     const [accountNfts, setAccountNfts] = useState(null);
     const [openid, setOpenId] = useState(null);

     const [xToken,setXToken] = useState(null);
     const [auth, setAuth] = useState(null);

     useEffect(() => {
        const url = new URL(window.location.href);
        const xAppToken = url.searchParams.get("xAppToken") || null;
        console.log("xAppToken", xAppToken);

        if(xAppToken) {
            console.log("xAppToken", xAppToken);
            setXToken(xAppToken);
            XummAuthService.makeXappXummSdk(xAppToken).then((sdk) => {
                sdk.environment?.bearer.then((token) => {
                    console.log("jwt token", token);
                    XummAuthService.setBearer(token);
                    setXumm(sdk);
                    setIsAuthorized(true);
                });
            });
        } else {
            XummAuthService.makeXummSdk().then((sdk) => {
                setXumm(sdk);

            });
        }

     }, []);
 
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

     const signInWithXumm = async () => {
        if(xumm) {
            xumm.authorize().then((res) => {
                console.log("xumm auth", res);
                setAuth(res);
                setIsAuthorized(true);
                window.location.reload();
            });
        } 
    };

    const logoutXumm = async () => {
        console.log("logout");
        await xumm.logout();
        setIsAuthorized(false);
    };

    return (
      <div className="w-full">
            
            <nav className="flex flex-col md:flex-row items-center justify-between bg-slate-700 p-1">
                <div className="flex w-full md:w-1/2 ml-1 mt-1">
                    {/* <img src={icon64} alt="icon64" className="w-12" /> */}
                    <div className="ml-2 mt-2 items-center font-semibold text-2xl tracking-tight text-white" onClick={()=>navigate('/')}>
                        <span className="text-yellow-500">nifty</span><img src={xLogo} className="w-10 h-8 inline-block"/><span className="text-slate-400">.net</span> 
                    </div>
                    {/* <div className="text-slate-900 rounded-lg bg-slate-200 w-fit pr-1 pl-1 ml-2 mt-3 h-6 items-center">{xummConfig.xrp_network}</div>                   */}
                </div>
                <div className="flex flex-row md:w-1/2 justify-end w-full">
                    {/* <div className="mr-3 mt-3">
                        <a href={whitepaperUrl} className="block mt-4 md:inline-block hover:text-yellow-400 md:mt-0 text-white underline cursor-pointer">
                        White Paper
                        </a> 
                    </div> */}
                    <div className="mr-3 mt-3">
                    {xumm && isWebApp && <>                    
                        <button className="block mt-4 md:inline-block md:mt-0 text-white hover:text-yellow-400 underline cursor-pointer" onClick={()=>{window.open("https://xumm.app/")}}>
                        Get Xumm
                        </button>              
                    </>}
                    </div>
                    
            
                </div>
        
            </nav>
            <div className="bg-slate-700 flex flex-row justify-start p-1">
                {xumm && isXApp && <> XAPP</>}
                {xumm && isWebApp && <> BROWSER</>}   
            </div>
            {isAuthorized ?
            <div className="bg-slate-700 flex flex-row justify-between items-center p-1">

                <div className="ml-1">

                    {account && <div className="mr-3">Account: <span className="text-yellow-500 font-mono">{account}</span></div>}
                    {openid &&
                    <div>
                        <div className="flex flex-row justify-between">
                            <div>{openid.networkType}
                            {xumm && isXApp && <> XAPP</>}
                            {xumm && isWebApp && <> BROWSER</>}                
                            </div>
                        </div>
                    </div>}  
                </div>
                <div className="mr-1">
                    {openid && 
                    <div className="btn-common bg-slate-600 text-white hover:bg-slate-500"
                        onClick={()=>logoutXumm()}>
                            <img src={openid.picture} className="w-4 h-4 inline-block mr-1"/>
                            <span>Logout</span>
                    </div>}
                </div>
                
            </div>:
             <>
             {xumm && isWebApp &&<div className="bg-slate-700 flex flex-row justify-end items-center">
                <div>
                    <div>
                        <div className="rounded p-2 m-2 hover:bg-white hover:cursor-pointer bg-slate-200" 
                            onClick={()=>signInWithXumm()}><img className="h-4 w-36" src={loginXumm}/></div>
                    </div>                                               
                </div>
            </div>}
            </>}

            
      </div>
    );
};

const dropdownStyle = {
    zIndex: 50
};
  
export default Header