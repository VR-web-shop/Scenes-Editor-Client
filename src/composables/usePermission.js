import { useAuthSDK } from "./useAuthSDK.js";

const { sdk } = useAuthSDK();

export function usePermission(permissionName) {
    const allowed = sdk.api.users.hasPermission(permissionName);

    return allowed;
}
