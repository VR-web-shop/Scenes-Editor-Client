import ProductsSDK from '@vr-web-shop/products'
import { ref } from 'vue'

const SERVER_URL = 'http://localhost:3002'
const sdk = new ProductsSDK(SERVER_URL)
const valuta = ref(null)

export function useProductsSDK() {

    async function start() {
        const { rows } = await sdk.api.ValutaSettingController.findAll({
            limit: 10,
            where: {
                active: 1
            }
        })

        valuta.value = rows[0]
    }
    
    return {
        sdk,
        start,
        valuta
    }
}