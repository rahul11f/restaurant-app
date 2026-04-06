import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ──────────────────────────────────────────────────────────────
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,

      // ─── Cart ──────────────────────────────────────────────────────────────
      cart: [],
      addToCart: (item, quantity = 1, variant = null, addons = [], notes = '') => {
        const cart = get().cart;
        const key = `${item._id}_${variant}_${addons.join(',')}`;
        const existing = cart.find(c => c.key === key);
        if (existing) {
          set({ cart: cart.map(c => c.key === key ? { ...c, quantity: c.quantity + quantity } : c) });
        } else {
          const price = variant
            ? (item.variants?.find(v => v.name === variant)?.price || item.discountedPrice || item.price)
            : (item.discountedPrice || item.price);
          set({ cart: [...cart, { key, menuItem: item._id, name: item.name, image: item.images?.[0], price, quantity, variant, addons, notes, originalItem: item }] });
        }
      },
      removeFromCart: (key) => set({ cart: get().cart.filter(c => c.key !== key) }),
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) { get().removeFromCart(key); return; }
        set({ cart: get().cart.map(c => c.key === key ? { ...c, quantity } : c) });
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // ─── UI State ──────────────────────────────────────────────────────────
      cartOpen: false,
      setCartOpen: (v) => set({ cartOpen: v }),
      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),

      // ─── Wishlist ──────────────────────────────────────────────────────────
      wishlist: [],
      toggleWishlist: (itemId) => {
        const wishlist = get().wishlist;
        set({ wishlist: wishlist.includes(itemId) ? wishlist.filter(id => id !== itemId) : [...wishlist, itemId] });
      },
      isWishlisted: (itemId) => get().wishlist.includes(itemId),

      // ─── Order type ────────────────────────────────────────────────────────
      orderType: 'delivery',
      setOrderType: (t) => set({ orderType: t }),
    }),
    { name: 'spice-soul-store', partialize: (s) => ({ user: s.user, token: s.token, cart: s.cart, wishlist: s.wishlist, orderType: s.orderType }) }
  )
);
