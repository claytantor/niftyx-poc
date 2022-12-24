import React, {useEffect, useState} from "react"

import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"

const Page = ({
    withSidenav=false,
    xumm=null, 
    isWebApp=false, 
    isXApp=false, 
    isAuthorized=false,
    setIsAuthorized={},
    setXumm={},
    children,
  }) => {

  return (
    <>
      <div id="container" className="flex min-h-screen flex-col">
        <div id="header" className="flex"><Header xumm={xumm} isWebApp={isWebApp} isXApp={isXApp} isAuthorized={isAuthorized} setIsAuthorized={setIsAuthorized} setXumm={setXumm}/></div>
        {withSidenav ? <div id="main" className="flex flex-grow flex-col md:flex-row">
          <div className="flex bg-gray-900  md:bg-gray-800 text-white"><Sidebar/></div>
          <div className="flex-grow">{children}</div>
        </div>:
        <div id="main" className="flex flex-grow flex-col md:flex-row">
            <div className="flex-grow">{children}</div>
        </div>
        }
        <div id="footer" className="p-0 bg-black color-white">
         <Footer/>
        </div>
      </div>   

    </>
  );
};
  
export default Page