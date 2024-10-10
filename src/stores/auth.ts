import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import axios from 'axios';
import { request } from '@/utils/helpers/api';

const baseUrl = `${import.meta.env.VITE_SERVER_BASE}`;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null
  }),
  actions: {
    async login(username: string, password: string) {
      // const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });

      const {token, username: returnedUsername} = await request.post(`${baseUrl}/auth/login`, { username, password }); // await axios.post(`${baseUrl}/auth/login`, { username, password });

      this.user = {
        token,
        username: returnedUsername
      };
      localStorage.setItem('user', JSON.stringify(this.user));
      router.push(this.returnUrl || '/dashboard/default');
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  }
});
