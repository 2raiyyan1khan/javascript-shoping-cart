const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");

const cartIcon = document.getElementById("cart-icon");
const cartbar = document.getElementById("cart-bar");

const closeSidebar = document.getElementById("closeBtn");
const closeCartBar = document.getElementById("cart-bar-close");
const collectionContainer = document.querySelector(".collection-container");
const filterBtnContainer = document.querySelector(".filter");
const cartContainer = document.querySelector(".cart-item");
const total = document.querySelector(".total");
const clearCartBtn = document.querySelector(".clear-cart");
const cartLength = document.querySelector(".cart-length");
let data;

window.addEventListener("scroll", () => {
  let nav = document.querySelector("nav");
  let scrollHeight = window.scrollY;
  if (scrollHeight >= nav.offsetHeight) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
});

menu.addEventListener("click", () => {
  sidebar.classList.add("opennav");
});

closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("opennav");
});
cartIcon.addEventListener("click", () => {
  cartbar.classList.add("open-cart-bar");
});
closeCartBar.addEventListener("click", () => {
  cartbar.classList.remove("open-cart-bar");
});
window.addEventListener("DOMContentLoaded", () => {
  getData();
  addCartProductsUI();
  clearCartBtn.addEventListener("click", () => {
    clearCart();
  });
  getCartLength();
});
async function getData() {
  let res = await fetchData();
  data = res;
  setProductUI(data);
  setCatUI(data);
}
async function fetchData() {
  let response = await fetch("./products.json");
  let data = await response.json();
  return data;
}

function filter(i) {
  i === "All"
    ? setProductUI(data)
    : setProductUI(data.filter((item) => item.category === i));
}

function setCatUI(data) {
  let cat = ["All", ...new Set(data.map((item) => item.category))];
  cat.map((item) => {
    let button = document.createElement("button");
    button.className = "filter-btn";
    button.innerText = item;
    button.onclick = () => filter(item);
    filterBtnContainer.appendChild(button);
  });
}

function setProductUI(data) {
  collectionContainer.innerHTML = "";
  data.map((item) => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
    <img src=${item.image} alt=${item.image} />
    <div class="card-body">
      <p class="title">${item.title.substring(0, 20).concat("...")}</p>
      <p>$ ${item.price}</p>
    </div>
    <span onclick='addToCart(${item.id})'>Add to Cart</span>
`;
    collectionContainer.appendChild(card);
  });
}

function addToCart(id) {
  let product = data.find((item) => item.id === id);
  product.quantity = 1;
  let cartItems = getLocalStorageData("products");

  if (cartItems.length === 0) {
    cartItems.push(product);
    setLocalStorageData("products", cartItems);
  } else {
    let existingItem = cartItems.find((i) => i.id === product.id);
    if (existingItem === undefined) {
      cartItems.push(product);
      setLocalStorageData("products", cartItems);
    } else {
      let updatedItems = cartItems.map((i) => {
        if (i.id === existingItem.id) {
          i.quantity = i.quantity + 1;
        }
        return i;
      });
      setLocalStorageData("products", updatedItems);
    }
  }

  addCartProductsUI();
}
function addCartProductsUI() {
  cartContainer.innerHTML = "";
  let cartItems = getLocalStorageData("products");
  getCartLength();
  if (cartItems.length !== 0) {
    cartItems?.map((item) => {
      let itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.innerHTML = `
      <img src=${item.image} alt=${item.image}  />
      <div class="item-detail">
        <p class="title">${item.title}</p>
        <p>${item.price}</p>
        <span class="text_small" onclick="removeItem(${item.id})"> remove</span>
      </div>
      <div class="quantity">
        <button onclick='decreaseQuantity(${item.id})'><ion-icon name="remove-outline"></ion-icon></button>
        <p>${item.quantity}</p>
        <button onclick='increaseQuantity(${item.id})'><ion-icon name="add-outline"></ion-icon></button>
      </div>`;
      cartContainer.appendChild(itemDiv);
      let totalPrice = cartItems.reduce((total, i) => {
        total += i.price * i.quantity;
        return total;
      }, 0);
      total.innerHTML = `<h3>Total: <span>$${totalPrice.toFixed(
        2
      )}</span></h3>`;
    });
  } else {
    cartContainer.innerHTML = "<p style='text-align:center'>Cart is empty!</p>";
    total.innerHTML = "<h3>Total: <span>$00.00</span></h3>";
  }
}

function removeItem(id) {
  let cartItems = getLocalStorageData("products");
  let updatedItems = cartItems.filter((item) => item.id !== id);
  if (updatedItems.length === 0) {
    localStorage.removeItem("products");
  } else {
    setLocalStorageData("products", updatedItems);
  }
  addCartProductsUI();
}
function increaseQuantity(id) {
  let cartItems = getLocalStorageData("products");
  let updatedItems = cartItems.map((item) => {
    if (item.id === id) {
      item.quantity = item.quantity + 1;
    }
    return item;
  });
  setLocalStorageData("products", updatedItems);
  addCartProductsUI();
}
function decreaseQuantity(id) {
  let cartItems = getLocalStorageData("products");
  let product = cartItems.findIndex((i) => i.id === id);
  cartItems[product].quantity = cartItems[product].quantity - 1;
  if (cartItems[product].quantity === 0) {
    let updatedItems = cartItems.filter(
      (item) => item.id !== cartItems[product].id
    );
    if (updatedItems.length === 0) {
      localStorage.removeItem("products");
    } else {
      setLocalStorageData("products", updatedItems);
    }
  } else {
    setLocalStorageData("products", cartItems);
  }

  addCartProductsUI();
}
function clearCart() {
  let cartItems = getLocalStorageData("products");
  if (cartItems.length === 0) {
    alert("Cart is already empty!");
  } else {
    let confirmation = confirm("Are You Sure?");
    confirmation ? localStorage.removeItem("products") : "";
    addCartProductsUI();
  }
}
function getCartLength() {
  let totalCartLength = getLocalStorageData("products").reduce((total, i) => {
    total += i.quantity;
    return total;
  }, 0);
  cartLength.innerHTML = `<span>${totalCartLength}</span>`;
}
function getLocalStorageData(name) {
  return JSON.parse(localStorage.getItem(name)) || [];
}
function setLocalStorageData(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}
