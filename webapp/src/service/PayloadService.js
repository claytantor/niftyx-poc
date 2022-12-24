import Axios from 'axios';

import { apiConfig } from "../env";

Axios.defaults.withCredentials = false; 

export const PayloadService = {
    async getPayment (prompt) {    
        console.log('PayloadService.getPayment prompt:', prompt);
        let data = {'prompt': prompt};
        // if(user_token) {
        //     data['user_token'] = user_token;
        // }
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/payment`, data);
    },
    async postGenerate (payload_uuidv4) {    
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/generate`, {'payload_uuidv4':payload_uuidv4});
    },
    async postMintNft (payload_uuidv4) {    
        return await Axios.post(`${apiConfig().apiBaseUrl}/payload/mint_nft`, {'payload_uuidv4':payload_uuidv4});
    }
};