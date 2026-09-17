import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Product } from "@kampus-bite/shared";

export interface CartItem {
  Product: Product;
  Quantity: number;
}

interface CartContextValue {
  Items: CartItem[];
  StoreId: string | null;
  TotalQuantity: number;
  TotalPrice: number;
  AddItem: (product: Product) => void;
  DecrementItem: (productId: string) => void;
  RemoveItem: (productId: string) => void;
  ClearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product): void => {
    setItems((current) => {
      const differentStore =
        current.length > 0 && current[0].Product.StoreId !== product.StoreId;
      if (differentStore) {
        const confirmReset = window.confirm(
          "Keranjang hanya bisa berisi produk dari satu toko. Kosongkan keranjang dan mulai dari toko ini?",
        );
        if (!confirmReset) return current;
        return [{ Product: product, Quantity: 1 }];
      }

      const existing = current.find((item) => item.Product.Id === product.Id);
      if (existing) {
        return current.map((item) =>
          item.Product.Id === product.Id
            ? { ...item, Quantity: item.Quantity + 1 }
            : item,
        );
      }
      return [...current, { Product: product, Quantity: 1 }];
    });
  };

  const decrementItem = (productId: string): void => {
    setItems((current) =>
      current
        .map((item) =>
          item.Product.Id === productId
            ? { ...item, Quantity: item.Quantity - 1 }
            : item,
        )
        .filter((item) => item.Quantity > 0),
    );
  };

  const removeItem = (productId: string): void => {
    setItems((current) =>
      current.filter((item) => item.Product.Id !== productId),
    );
  };

  const clearCart = (): void => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.Quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.Product.Price * item.Quantity,
      0,
    );
    return {
      Items: items,
      StoreId: items.length > 0 ? items[0].Product.StoreId : null,
      TotalQuantity: totalQuantity,
      TotalPrice: totalPrice,
      AddItem: addItem,
      DecrementItem: decrementItem,
      RemoveItem: removeItem,
      ClearCart: clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function UseCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("UseCart harus dipakai di dalam CartProvider.");
  return context;
}
