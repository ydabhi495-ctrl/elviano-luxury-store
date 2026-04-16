const CART_KEY = "cart";
const PRODUCT_KEY = "product";
const API_BASE = window.ELVIANO_API_BASE || "http://127.0.0.1:5000";

let generatedOTP = null;

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  return readJSON(CART_KEY, []);
}

function setCart(items) {
  writeJSON(CART_KEY, items);
  updateCartCount();
}

function updateCartCount() {
  const countNode = document.getElementById("cartCount");
  if (countNode) {
    countNode.textContent = `(${getCart().length})`;
  }
}

function toProduct(record) {
  if (Array.isArray(record)) {
    return {
      id: record[0],
      name: record[1],
      price: Number(record[2]),
      image: record[3]
    };
  }

  return {
    id: record?.id,
    name: record?.name,
    price: Number(record?.price),
    image: record?.image
  };
}

function addToCart(name, sizeId, price) {
  const size = document.getElementById(sizeId)?.value || "M";
  const parsedPrice = Number(price);

  if (!name || !Number.isFinite(parsedPrice)) {
    alert("Unable to add item. Please refresh and try again.");
    return;
  }

  const cart = getCart();
  cart.push({ name, size, price: parsedPrice });
  setCart(cart);

  alert("Added to cart");
}

function goCart() {
  window.location.href = "cart.html";
}

function goLogin() {
  window.location.href = "login.html";
}

function scrollToProducts() {
  const section = document.getElementById("products");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function viewProduct(name) {
  localStorage.setItem(PRODUCT_KEY, name);
  window.location.href = "product.html";
}

async function loadProducts() {
  const container = document.getElementById("products");
  if (!container) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error(`Products request failed with ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data.map(toProduct) : [];

    if (!products.length) {
      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      if (!product.name || !Number.isFinite(product.price)) {
        return;
      }

      const card = document.createElement("div");
      card.className = "card";

      const image = document.createElement("img");
      image.src = product.image || "";
      image.alt = product.name;
      image.style.width = "100%";

      const heading = document.createElement("h3");
      heading.textContent = product.name;

      const price = document.createElement("p");
      price.textContent = `₹${product.price}`;

      const sizeSelect = document.createElement("select");
      const sizeId = `size${product.id ?? product.name.replace(/\s+/g, "")}`;
      sizeSelect.id = sizeId;
      ["M", "L", "XL"].forEach((size) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        sizeSelect.append(option);
      });

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Add to Cart";
      button.addEventListener("click", () => {
        addToCart(product.name, sizeId, product.price);
      });

      card.append(image, heading, price, sizeSelect, button);
      container.append(card);
    });
  } catch {
    // Keep the existing static products when backend is not available.
  }
}

function sendOTP() {
  const mobile = document.getElementById("mobile")?.value?.trim();

  if (!/^\d{10}$/.test(mobile || "")) {
    alert("Enter valid mobile number");
    return;
  }

  generatedOTP = Math.floor(1000 + Math.random() * 9000);
  alert(`Your OTP: ${generatedOTP}`);
}

function verifyOTP() {
  const userOTP = document.getElementById("otp")?.value?.trim();

  if (!generatedOTP) {
    alert("Please request OTP first");
    return;
  }

  if (String(userOTP) === String(generatedOTP)) {
    alert("Login Success ✅");
    window.location.href = "index.html";
  } else {
    alert("Wrong OTP ❌");
  }
}

async function sendOrderToBackend() {
  const cart = getCart();

  if (!cart.length) {
    return;
  }

  try {
    await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cart)
    });
  } catch {
    alert("Order service unavailable. Please try again.");
  }
}

function payNow() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  if (!total) {
    alert("Your cart is empty");
    return;
  }

  if (typeof window.Razorpay === "undefined") {
    alert("Payment gateway is not loaded.");
    return;
  }

  const options = {
    key: "YOUR_RAZORPAY_KEY",
    amount: total * 100,
    currency: "INR",
    name: "Elviano",
    description: "Luxury Menswear",
    handler: async function () {
      await sendOrderToBackend();
      alert("Payment Success 🎉");
      localStorage.removeItem(CART_KEY);
      window.location.href = "index.html";
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

window.addToCart = addToCart;
window.goCart = goCart;
window.goLogin = goLogin;
window.scrollToProducts = scrollToProducts;
window.viewProduct = viewProduct;
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.sendOrderToBackend = sendOrderToBackend;
window.payNow = payNow;

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();
});
