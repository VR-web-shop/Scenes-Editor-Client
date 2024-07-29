import { useSceneSDK } from "./useScenesSDK.js";

const { sdk } = useSceneSDK();

export const getVectors = async (entities, attributes) => {

    const vector3dIds = entities.map(e => {
        return attributes.map(attribute => e[attribute]);
    }).flat();
    const { rows: vectors } = await sdk.Vector3D.batchByUUID(vector3dIds);
    entities.forEach((element, index) => {
        for (const attribute of attributes) {
            const vector_client_side_uuid = element[attribute];
            const vector = vectors.find(v => v.client_side_uuid === vector_client_side_uuid);
            entities[index][attribute] = { ...vector, vector_client_side_uuid };
        }
    });
};