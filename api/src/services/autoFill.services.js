import axios from 'axios';
import config from 'config';
import { getBankAddressDetails, createBankRoutingNum } from '../models/bankAutoFill.model.js';
import { getRegionByPin } from '../models/regionByPin.model.js';

const getZylaToken = () => {
    if (config.has('zyla.api_token')) return config.get('zyla.api_token');
    return process.env.ZYLA_API_TOKEN || null;
};

export const fetchBankFromZyla = async (routingNumber) => {
    const bearerToken = getZylaToken();
    if (!bearerToken) return null;

    try {
        const apiUrl =
            'https://zylalabs.com/api/331/routing+number+bank+lookup+api/266/get+bank+information';
        const response = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${bearerToken}` },
            params: { routingnumber: routingNumber },
            timeout: 5000,
        });
        const result = response.data[0];
        if (result.status === 'fail') return null;
        return result.data;
    } catch (err) {
        console.error('fetchBankFromZyla error:', err?.message);
        return null;
    }
};

export const getBankByRoutingNum = async (routingNum) => {
    try{
        const payload = {
            routingNumber: routingNum
        }
        const res = await getBankAddressDetails(payload);

        if(!(res)) {
            throw new Error ('Routing number does not exist');
        }
        return res;
    } catch (err) {
        throw err;
    }
}

export const getRegionAddress = async (zipcode) => {
    try{
        const payload = {
            zipcode
        }
        const res = await getRegionByPin(payload);

        if(!(res)) {
            throw new Error ('Pin code does not exist');
        }
        return res;
    } catch (err) {
        throw err;
    }
}

export const addBankRoutingNum = async (payload) => {
    try{ 
        const res = await createBankRoutingNum(payload);
        if(!(res)){
            throw new Error ('Unable to add bank and routing number');
        }
        return res;
    } catch (err) {
        throw err;
    }
}
