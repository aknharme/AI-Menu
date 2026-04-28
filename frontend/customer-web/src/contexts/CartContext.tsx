import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { AddToCartInput, CartItem } from '../types/order';

type CartContextValue = {
  cartItems: CartItem[];
  totalPrice: number;
  itemCount: number;
  addToCart: (input: AddToCartInput) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function buildCartItemId(productId: string, variantId?: string) {
  return `${productId}:${variantId ?? 'base'}`;
}

export function CartProvider({ children }: PropsWithChildren) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cartItems,
      totalPrice,
      itemCount,
      addToCart: (input) => {
        const cartItemId = buildCartItemId(input.productId, input.variantId);

        setCartItems((current) => {
          const existing = current.find((item) => item.cartItemId === cartItemId);
          if (!existing) {
            return [
              ...current,
              {
                cartItemId,
                productId: input.productId,
                productName: input.productName,
                categoryName: input.categoryName,
                quantity: input.quantity,
                note: input.note.trim(),
                unitPrice: input.unitPrice,
                basePrice: input.basePrice,
                variantId: input.variantId,
                variantName: input.variantName ?? '',
              },
            ];
          }

          return current.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: item.quantity + input.quantity,
                  note: input.note.trim() || item.note,
                  unitPrice: input.unitPrice,
                  variantName: input.variantName ?? item.variantName,
                }
              : item,
          );
        });
      },
      removeFromCart: (cartItemId) => {
        setCartItems((current) => current.filter((item) => item.cartItemId !== cartItemId));
      },
      updateQuantity: (cartItemId, quantity) => {
        setCartItems((current) =>
          current.flatMap((item) => {
            if (item.cartItemId !== cartItemId) {
              return [item];
            }

            if (quantity <= 0) {
              return [];
            }

            return [{ ...item, quantity }];
          }),
        );
      },
      updateItemNote: (cartItemId, note) => {
        setCartItems((current) =>
          current.map((item) =>
            item.cartItemId === cartItemId ? { ...item, note } : item,
          ),
        );
      },
      clearCart: () => {
        setCartItems([]);
      },
    };
  }, [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider.');
  }

  return context;
}
