import { create } from 'zustand'

const useStore = create(set => ({
  isAdmin: false,
  setIsAdmin: (value) => set({ isAdmin: value }),
}))

export default useStore