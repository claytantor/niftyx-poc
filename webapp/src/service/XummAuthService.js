import jwtdecode from 'jwt-decode';
import moment from 'moment';
import Axios from 'axios';

Axios.defaults.withCredentials = false; 

import { Xumm } from "xumm";
import {xummConfig} from "../env";

export const XummAuthService = {
    async getXumm () {
        const xummAuthValue = localStorage.getItem('XummPkceJwt');
        if (xummAuthValue) {
            const xummAuth = JSON.parse(xummAuthValue);
            const decoded = jwtdecode(xummAuth.jwt);
            console.log("XummAuthService getXumm", xummAuth.jwt);
            Axios.defaults.headers.common['Authorization'] = `Bearer ${xummAuth.jwt}`;
            return await new Xumm(xummAuth.jwt);
        } else {
            console.log("XummAuthService getXummByApp");
            return await new Xumm(xummConfig.AppId, xummConfig.AppSecret); 
        }
    },
    setBearer (token) {
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};