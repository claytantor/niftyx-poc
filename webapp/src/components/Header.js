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
    login=null,
    logout=null,
    children,
  }) => {

    /**
     * we want the app to behave the same depending on if
     * this a XAPP or a webapp
     */
     const [account, setAccount] = useState(null);
     const [openid, setOpenId] = useState(null);
     const [ott, setOtt] = useState(null);


     useEffect(() => {
        const url = new URL(window.location.href);
        const xAppToken = url.searchParams.get("xAppToken") || null;
        console.log("Header xAppToken", xAppToken, isAuthorized);
        if(xumm) {
            xumm.then((xummSdk) => {
                xummSdk.user?.account.then((res) => {
                    console.log("Header xumm account", res);
                    setAccount(res);
                });

                // only on webapp
                if (isAuthorized && isWebApp) {
                    xummSdk.environment?.openid.then((res) => {
                        setOpenId(res);                    
                    });
                }

                // only on xapp
                if (isAuthorized && isXApp) {
                    xummSdk.environment?.ott.then((res) => {
                        setOtt(res);                    
                    });
                }

            });
        }

     }, [xumm, isAuthorized]);
 

    return (
      <div className="w-full">
            
            <nav className="flex flex-col md:flex-row items-center justify-between bg-slate-700 p-1">
                <div className="flex w-full md:w-1/2 ml-1 mt-1">
                    <div className="ml-2 mt-2 items-center font-semibold text-2xl tracking-tight
                         text-white" onClick={()=>navigate('/')}>
                        <span className="text-yellow-500">nifty</span><img src={xLogo} 
                            className="w-10 h-8 inline-block"/><span className="text-slate-400">.net</span> 
                    </div>


                </div>
                <div className="flex flex-row md:w-1/2 justify-end w-full">
                    <div className="mr-3 mt-3">
                    {isWebApp && <>                    
                        <button className="block mt-4 md:inline-block md:mt-0 text-white hover:text-yellow-400 underline cursor-pointer" onClick={()=>{window.open("https://xumm.app/")}}>
                        Get Xumm
                        </button>              
                    </>}
                    </div>
                    <div>
                        {!isAuthorized && 
                        <div className="bg-slate-700 flex flex-col justify-start md:flex-row md:justify-end items-center">
                            <div className="rounded p-3 m-2 hover:bg-white hover:cursor-pointer
                             bg-slate-200" onClick={(e)=>login(e)}>
                                <img className="h-4 w-36" src={loginXumm}/>
                            </div>                                            
                        </div>}
                    </div>
                </div>   
            </nav>
            {isAuthorized ?
            <div className="bg-slate-700 flex flex-col justify-start md:flex-row md:justify-between items-center p-1">

                <div className="md:ml-1 flex w-full flex-col justify-start md:flex-row md:justify-between p-1">

                    {account && <div className="mr-1 md:mr-3 flex flex-col md:flex-row w-full">
                        <div className="mr-2">Account</div>
                        <div className="text-yellow-500 font-mono text-sm sm:text-sm md:text-lg">{account}</div>
                    </div>}
                    <div className="flex break-words justify-between text-right">
                        {ott && isXApp && <> {ott.nodetype} XAPP</>}
                        {openid && isWebApp && <> {openid.networkType} BROWSER</>}                
                    </div>
                </div>
                <div className="w-full md:w-fit md:mr-1">
                    
                    <div className="p-2 btn-common bg-slate-600 text-white hover:bg-slate-500"
                        onClick={logout}> 
                            {openid && openid.picture && isWebApp && <img src={openid.picture} className="w-4 h-4 inline-block ml-1"/>}
                            {ott && isXApp && <img src={`https://xumm.app/avatar/${ott.account}.png`} className="w-4 h-4 inline-block ml-2"/>}            
                            <span className="mr-2 ml-2 md:text-lg">Logout</span>
                    </div>
                </div>
                
            </div>:
                <>
                </>
            }

            
      </div>
    );
};

const dropdownStyle = {
    zIndex: 50
};
  
export default Header