import { useAuthStore } from '@/stores/auth';
import type { Setting } from '@/stores/canvasHandlerStore';
import axios, { Axios, type AxiosResponse } from 'axios';

const baseUrl = `${import.meta.env.VITE_SERVER_BASE}`;

export async function getGeoTiff(color: string, fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/${color}/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'arraybuffer'
    });
    return response.data;
}

export async function getGMM(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/gmm/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
            'Content-Type': 'application/json'
        },
    });
    return response.data.details.gmm;
}

export async function getScl(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/scl/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
            'Content-Type': 'application/json'
        },
    });
    return response.data.details.scl;
}

export async function getGMMProba(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/gmm-proba/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
            'Content-Type': 'application/json'
        },
    });
    return response.data.details.gmm;
}

export function getSettings() {
    let settings = localStorage.getItem('settings');
    if (!settings) {
        let settings = [
            { id: 1, name: 'hk_toggle_pen', value: ['q'], type: 'string[]', display_name: 'Toggle Pen' },
            { id: 2, name: 'hk_toggle_eraser', value: ['w'], type: 'string[]', display_name: 'Toggle Eraser' },
            { id: 3, name: 'hk_toggle_magic_stick', value: ['r'], type: 'string[]', display_name: 'Toggle Magic Stick' },
            { id: 4, name: 'hk_toggle_bucket_fill', value: ['t'], type: 'string[]', display_name: 'Toggle Bucket Fill' },
            { id: 5, name: 'hk_undo', value: ['Control', 'z'], type: 'string[]', display_name: 'Undo' },
            { id: 6, name: 'hk_redo', value: ['Control', 'y'], type: 'string[]', display_name: 'Redo' },
            { id: 7, name: 'hk_save', value: ['s'], type: 'string[]', display_name: 'Save' },
            { id: 8, name: 'hk_map', value: ['f'], type: 'string[]', display_name: 'Toggle Map' },
            { id: 9, name: 'hk_incr_pen_size', value: ['v'], type: 'string[]', display_name: 'Increase Pen Size' },
            { id: 10, name: 'hk_decr_pen_size', value: ['c'], type: 'string[]', display_name: 'Decrease Pen Size' },
            { id: 11, name: 'hk_toggle_norm', value: ['x'], type: 'string[]', display_name: 'Switch Normalization' },
            { id: 12, name: 'hk_toggle_pan', value: ['e'], type: 'string[]', display_name: 'Toggle Pan' },
            { id: 13, name: 'hk_toggle_ab_stick', value: ['a'], type: 'string[]', display_name: 'Toggle A/B' }
        ];
        localStorage.setItem('settings', JSON.stringify(settings));
    }
    return JSON.parse(settings!);

}

export async function updateSetting(setting: Setting) {
    await axios.post(`${baseUrl}/api/update-setting`, setting, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
            'Content-Type': 'application/json'
        },
    });
}

export async function toggleTag(fullTitle: string, tag: string): Promise<string[]> {
    const response = await axios.post(`${baseUrl}/api/tag`, {
        fullTitle,
        tag
    }, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
            'Content-Type': 'application/json'
        },
    });
    return response.data.details.tags;
}

export async function getTags(fullTitle: string): Promise<string[]> {
    const response = await axios.get(`${baseUrl}/api/tags/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
    });
    return response.data.details.tags;
}

export async function getContour(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/contour/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getTides(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/tides/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getWinter(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/winter/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}



export async function getSeason(fullTitle: string, season: string) {
    const response = await axios.get(`${baseUrl}/api/${season}/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}


export async function getColorbar(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/colorbar/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getSummer(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/summer/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getSpring(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/spring/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getAutumn(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/autumn/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export async function getHeatmap(fullTitle: string) {
    const response = await axios.get(`${baseUrl}/api/heatmap/${fullTitle}`, {
        headers: {
            Authorization: `Bearer ${useAuthStore().user.token}`,
        },
        responseType: 'blob'
    });
    return response.data;
}

export const request = {
    get: processRequest('get'),
    post: processRequest('post'),
    put: processRequest('put'),
    delete: processRequest('delete')
};

function processRequest(method: 'get' | 'post' | 'put' | 'delete') {
    return (url: string, body?: object) => {
        const headers = authHeader(url);
        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        if (method === 'get' || method === 'delete') {
            return axios[method](url, { headers }).then(handleResponse);
        } else {
            return axios[method](url, body, { headers }).then(handleResponse)
        }
    };
}

interface temp {
    method: string;
    headers: Record<string, string>;
    body?: string;
}

function authHeader(url: string): Record<string, string> {
    // return auth header with jwt if user is logged in and request is to the api url
    const { user } = useAuthStore();
    const isLoggedIn = !!user?.token;
    const isApiUrl = url.startsWith(baseUrl);
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
}

function handleResponse(response: AxiosResponse) {
    if (response && response.data) {

        if (response.data.status === 'fail') {
            const { user, logout } = useAuthStore();
            if ([401, 403].includes(response.status) && user) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                logout();
            }

            const error: string = response.data.details || response.statusText;
            return Promise.reject(error);
        }

        return response.data.details;
    }
}
