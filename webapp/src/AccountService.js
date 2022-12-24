import jwtdecode from 'jwt-decode';
import moment from 'moment';
import Axios from 'axios';
import { Xumm } from "xumm";

import { xummConfig, apiConfig } from "../env";


export const xumm = new Xumm(
    xummConfig.AppId,
    xummConfig.AppSecret,
);


export const AccountService = {
    async getAccountInfo () {    
        return await Axios.get(`${apiConfig().apiBaseUrl}/account/info`);
    },
    async getAccountNfts () {
        return await Axios.get(`${apiConfig().apiBaseUrl}/account/nfts`);
    }
};