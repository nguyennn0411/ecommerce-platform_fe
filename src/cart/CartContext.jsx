import { createContext, useContext, useEffect, useState } from 'react'

const CART_STORAGE_KEY = 'stepzone-cart'
const CartContext = createContext(null)

function readCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item, availableQuantity) {
    const key = `${item.id}:${item.size}:${item.color || ''}`
    setItems((current) => {
      const existing = current.find((cartItem) => cartItem.key === key)
      if (!existing) {
        return [...current, { ...item, key, quantity: 1 }]
      }

      const nextQuantity = Math.min(
        existing.quantity + 1,
        Math.max(1, Number(availableQuantity) || 1),
      )
      return current.map((cartItem) =>
        cartItem.key === key ? { ...cartItem, quantity: nextQuantity } : cartItem,
      )
    })
  }

  function updateQuantity(key, quantity) {
    const nextQuantity = Number(quantity)
    setItems((current) =>
      nextQuantity > 0
        ? current.map((item) => (item.key === key ? { ...item, quantity: nextQuantity } : item))
        : current.filter((item) => item.key !== key),
    )
  }

  function removeItem(key) {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  function updatePrices(pricesByProductId) {
    setItems((current) =>
      current.map((item) => {
        const latestPrice = pricesByProductId[item.id]
        return Number.isFinite(latestPrice)
          ? { ...item, unitPrice: latestPrice }
          : item
      }),
    )
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, updatePrices, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
