import React, {useEffect, useState} from "react"
import Axios from 'axios';

import {FaGithubAlt} from "react-icons/fa"
import {IoIosPaper} from "react-icons/io"
import {TbCertificate} from "react-icons/tb"
import {BiSupport} from "react-icons/bi"

import { apiConfig } from "../env";

const whitepaperUrl = "https://niftyx.io/whitepaper.pdf";

const Footer = () => {

    let [apiInfo, setApiInfo] = useState();
    let [baseUrl, setBaseUrl] = useState();

    useEffect(() => {
        if(window.location.port != "80" && window.location.port != "443") {
            setBaseUrl(`${window.location.protocol}/${window.location.hostname}:${window.location.port}`);

            Axios.get(`${apiConfig().apiBaseUrl}/info`).then((res) => {
                setApiInfo(res.data);
            }).catch((err) => {
                console.log(err);
            });


        } else {
            setBaseUrl(`${window.location.protocol}/${window.location.hostname}`);
        }
    }, []);

    return (
        <>
        <footer className="sticky top-[100vh] text-white bg-slate-900">
            <div className="p-6 w-full">
                <div className="grid gap-x-0.8 grid-cols-1 md:grid-cols-2"> 

                    <div className="mb-6 sm:w-full md:w-1/2">
                         <h5 className="text-slate-300 font-heading text-2xl"><span className="text-yellow-400">nifty</span><span>X</span><span className="text-slate-500">.net</span></h5>
                         <div className="text-slate-500">by rapaygo LLC</div>
                         <div>The fun and simple way to use Stable Diffusion AI to create, 
                             share and sell NFTs on the XRPL blockchain.</div>
                        {apiInfo ? <div className="text-slate-500">API Version: {apiInfo.version}</div>:<div className="text-red-600">API NOT CONNECTED</div>}
                     </div>
                    <div className="mb-6">
                             <h5 className="mb-2.5 font-heading uppercase text-slate-300">Links</h5>
                             <ul className="mb-0 list-none space-y-2">
                                    {/* <li><a href="https://github.com/claytantor/xrpl-poc-python" target="_new" 
                                    className="text-slate-200 underline flex justify-left items-center"> <FaGithubAlt className="mr-1"/> Github Repo</a></li> */}
                                    {/* <li><a href={whitepaperUrl} target="_new" className="text-slate-200 underline flex
                                        justify-left items-center"> <IoIosPaper className="mr-1"/> Whitepaper</a></li> */}
                                    <li><a href={`${baseUrl}/static/tos.html`} target="_new" className="text-slate-200 underline flex justify-left items-center"> <TbCertificate className="mr-1"/> Terms Of Service</a></li>
                                    <li><a href={`${baseUrl}/static/privacy.html`} target="_new" className="text-slate-200 underline flex justify-left items-center"> <TbCertificate className="mr-1"/> Privacy Policy</a></li>

                                    <li><a href="https://rapaygo.freshdesk.com/support/home" target="_new" className="text-slate-200 underline flex justify-left items-center"> <BiSupport className="mr-1"/> Support</a></li>



                             </ul>
                    </div>




                </div>
            </div>     
            <div className="p-2 text-center">copyright 2022,2023 by rapaygo LLC.</div>     
        </footer>
        </>

    );
  };
  
export default Footer;
