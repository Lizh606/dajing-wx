import { defineStore } from 'pinia'
import type { EntrustOrder } from '@/types/business'
import { mockOrders } from '@/services/api/mockBusiness'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: mockOrders as EntrustOrder[],
  }),
  actions: {
    setOrders(nextOrders: EntrustOrder[]) {
      this.orders = nextOrders
    },
  },
})
