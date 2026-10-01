let items = [];

export const Cart = {
  get Items() {
    return items;
  },
  get StoreId() {
    return items.length > 0 ? items[0].Product.StoreId : null;
  },
  get TotalQuantity() {
    return items.reduce((sum, item) => sum + item.Quantity, 0);
  },
  get TotalPrice() {
    return items.reduce(
      (sum, item) => sum + item.Product.Price * item.Quantity,
      0,
    );
  },

  AddItem(product) {
    const differentStore =
      items.length > 0 && items[0].Product.StoreId !== product.StoreId;
    if (differentStore) {
      const confirmReset = window.confirm(
        "Keranjang hanya bisa berisi produk dari satu toko. Kosongkan keranjang dan mulai dari toko ini?",
      );
      if (!confirmReset) return;
      items = [{ Product: product, Quantity: 1 }];
      return;
    }

    const existing = items.find((item) => item.Product.Id === product.Id);
    if (existing) {
      existing.Quantity += 1;
    } else {
      items.push({ Product: product, Quantity: 1 });
    }
  },

  DecrementItem(productId) {
    const existing = items.find((item) => item.Product.Id === productId);
    if (!existing) return;
    existing.Quantity -= 1;
    items = items.filter((item) => item.Quantity > 0);
  },

  RemoveItem(productId) {
    items = items.filter((item) => item.Product.Id !== productId);
  },

  ClearCart() {
    items = [];
  },
};
