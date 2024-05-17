import ProductsSDK from '@vr-web-shop/products'
import { ref } from 'vue'

const SERVER_URL = import.meta.env.VITE_PRODUCTS_SERVER_URL
const sdk = new ProductsSDK(SERVER_URL)
const valuta = ref(null)

export function useProductsSDK() {

    async function start() {
        /*const { rows } = await sdk.api.ValutaSettingController.findAll({
            limit: 10,
            where: {
                active: 1
            }
        })*/

        valuta.value = { name: 'USD', short: 'USD', symbol: '$' } 
            //rows[0]
    }
    
    return {
        sdk,
        start,
        valuta
    }
}