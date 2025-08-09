import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  SKU?: string
  companyId?: string
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  uniqueCount: number
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => { added: boolean }
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.reduce((sum, it) => sum + it.quantity, 0),
    uniqueCount: items.length,
    addToCart(item, quantity = 50) {
      let added = false
      setItems(prev => {
        const existing = prev.find(i => i.productId === item.productId)
        if (existing) {
          // do not add duplicate; return as-is
          added = false
          return prev
        }
        added = true
        const qty = Math.max(50, quantity)
        return [...prev, { ...item, quantity: qty }]
      })
      return { added }
    },
    removeFromCart(productId) {
      setItems(prev => prev.filter(i => i.productId !== productId))
    },
    updateQuantity(productId, quantity) {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
    },
    clearCart() {
      setItems([])
    },
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


