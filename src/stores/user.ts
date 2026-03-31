import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userType: 'personal' as 'personal' | 'enterprise',
    nickname: '张工',
    company: '深圳先进电子有限公司',
    avatar: ''
  }),
  actions: {
    login(type: 'personal' | 'enterprise') {
      this.isLoggedIn = true
      this.userType = type
    },
    logout() {
      this.isLoggedIn = false
    }
  }
})
