import jwtdecode from 'jwt-decode';
import moment from 'moment';
import Axios from 'axios';

import { apiConfig } from "../env";

Axios.defaults.withCredentials = false;
export const AccountService = {
    async getAccountInfo () {    
        return await Axios.get(`${apiConfig().apiBaseUrl}/account/info`);
    },
    async getAccountNfts () {
        return await Axios.get(`${apiConfig().apiBaseUrl}/account/nfts`);
    }
};