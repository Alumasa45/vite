interface Product {
  name: string;
  category: string;
  price: number;
  image: {
    thumbnail: string;
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

interface CartItem {
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export type NotificationType = 'success' | 'error';

let products: Product[] = [];
let cart: CartItem[] = [];

async function fetchProducts() {
  const res = await fetch('/data.json');
  products = await res.json();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productGrid')!;
  grid.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image.thumbnail}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.category}</p>
        <div class="product-footer">
          <span>$${product.price.toFixed(2)}</span>
          <button data-name="${product.name}">🛒 Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('button[data-name]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = (e.target as HTMLButtonElement).dataset.name!;
      addToCart(name);
    });
  });
}

function addToCart(productName: string) {
  const product = products.find(p => p.name === productName);
  if (!product) return;
  const existing = cart.find(item => item.name === productName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      image: product.image.thumbnail,
      quantity: 1,
    });
  }
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems')!;
  const cartCount = document.getElementById('cartCount')!;
  const cartTotal = document.getElementById('cartTotal')!;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your added items will appear here</p>';
    cartCount.textContent = '0';
    cartTotal.textContent = '0.00';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1em;">
      <div style="display: flex; align-items: center; gap: 0.5em;">
        <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" />
        <div>
          <div style="font-weight: 500;">${item.name}</div>
          <div style="font-size: 0.9em; color: #888;">${item.quantity} × $${item.price.toFixed(2)}</div>
        </div>
      </div>
      <button data-remove="${item.name}" style="background: none; border: none; color: #b85c2b; font-size: 1.2em; cursor: pointer;">&times;</button>
    </div>
  `).join('');

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0).toString();
  cartTotal.textContent = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  cartItems.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = (e.target as HTMLButtonElement).dataset.remove!;
      cart = cart.filter(item => item.name !== name);
      renderCart();
    });
  });
}

fetchProducts();
renderCart();