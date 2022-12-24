import jwtdecode from 'jwt-decode';
import moment from 'moment';
import Axios from 'axios';

Axios.defaults.withCredentials = false; 

import { Xumm } from "xumm";
import {xummConfig} from "../env";

export const XummAuthService = {
    async getXummSDK () {
        const xummAuthValue = localStorage.getItem('XummPkceJwt');
        if (xummAuthValue) {
            const xummAuth = JSON.parse(xummAuthValue);
            const decoded = jwtdecode(xummAuth.jwt);
            if (decoded.exp > moment().unix()) {
                // console.log("xummAuth jwt", xummAuth.jwt);
                Axios.defaults.headers.common['Authorization'] = `Bearer ${xummAuth.jwt}`;
                return new Xumm(xummAuth.jwt);
            }
        }
        return null;     
    },
    async makeXummSdk () {
        return new Xumm(xummConfig.AppId, xummConfig.AppSecret);   
    }

};