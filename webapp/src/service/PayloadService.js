import Axios from 'axios';

import { apiConfig } from "../env";

Axios.defaults.withCredentials = false; 

export const PayloadService = {
    async getPayment (prompt) {    
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/payment`, data={prompt});
    },
    async postGenerate (payload_uuidv4) {    
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/generate`, data={payload_uuidv4});
    },
    async postMintNft (payload_uuidv4) {    
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/mint_nft`, data={payload_uuidv4});
    }
};