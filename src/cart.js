class Cart {
  constructor() {
    this.label = document.getElementById("label");
    this.shoppingCart = document.getElementById("shopping-cart");
    this.basket = JSON.parse(localStorage.getItem("data")) || [];
    this.calculateCartAmount();
  }

  calculateCartAmount() {
    let cartIcon = document.getElementById("cartAmount");
    cartIcon.innerHTML = this.basket
      .map((x) => x.item) // Assuming 'item' property exists in basket items
      .reduce((x, y) => x + y, 0);
  }

  generateCartItems() {
    if (this.basket.length !== 0) {
      this.shoppingCart.innerHTML = this.basket
        .map((x) => {
          let { id, item, price, volume } = x;
          let search = shopItemsData.find((y) => y.id === id) || []; // Assuming shopItemsData exists and has items with 'id' property
          return `
            <div class="cart-item">
              <img width="100" src=${search.img} alt="" />
              <div class="details">
                <div class="title-price-x">
                  <h4 class="title-price">
                    <p>${
                      search.name
                    } (${volume} мл)</p> <p class="cart-item-price">$ ${price}</p>
                  </h4>
                  <i onclick="shoppingBasket.removeItem('${id}', '${volume}')" class="bi bi-x-lg"></i>

                </div>
                <div class="buttons">
                  <i onclick="shoppingBasket.decrement('${id}', '${volume}')" class="bi bi-dash-lg"></i>
                  <div id=${id} class="quantity">${item}</div>
                  <i onclick="shoppingBasket.increment('${id}', '${volume}')" class="bi bi-plus-lg"></i>
                </div>
                <h3>$ ${item * price}</h3> </div>
            </div>
          `;
        })
        .join("");
    } else {
      this.shoppingCart.innerHTML = "";
      this.label.innerHTML = `
        <h2>Cart is Empty</h2>
        <a href="index.html">
          <button class="HomeBtn">Back to home</button>
        </a>
      `;
    }
  }
}

class ShoppingBasket {
  constructor(cart, totalCalculator) {
    this.cart = cart;
    this.totalCalculator = totalCalculator;
  }

  increment(id, volume) {
    const idStr = String(id);
    const volumeStr = String(volume);

    let search = this.cart.basket.find(
      (x) => String(x.id) === idStr && String(x.volume) === volumeStr
      // (x) => (x.id === id && x.volume === volume)
    );
    search.item += 1;

    localStorage.setItem("data", JSON.stringify(this.cart.basket));
    this.cart.generateCartItems();
    this.updateCartAmount();
  }

  decrement(id, volume) {
    const idStr = String(id);
    const volumeStr = String(volume);

    let search = this.cart.basket.find(
      (x) => String(x.id) === idStr && String(x.volume) === volumeStr
    );
    if (search && search.item > 1) {
      search.item -= 1; // Зменшити кількість
    } else if (search && search.item === 1) {
      // Якщо кількість дорівнює 1, видаляємо товар
      this.cart.basket = this.cart.basket.filter(
        (x) => !(String(x.id) === idStr && String(x.volume) === volumeStr)
      );
    }
    localStorage.setItem("data", JSON.stringify(this.cart.basket));
    this.cart.generateCartItems();
    this.updateCartAmount();
  }

  updateCartAmount() {
    this.cart.calculateCartAmount();
    this.totalCalculator.updateTotalAmount();
  }

  removeItem(id, volume) {
    const idStr = String(id);
    const volumeStr = String(volume);

    // Оновлюємо кошик, зберігаючи всі елементи, які НЕ збігаються з переданим id та volume
    this.cart.basket = this.cart.basket.filter(
      (x) => !(String(x.id) === idStr && String(x.volume) === volumeStr)
    );

    localStorage.setItem("data", JSON.stringify(this.cart.basket));
    this.cart.generateCartItems();
    this.cart.calculateCartAmount();
    this.totalCalculator.updateTotalAmount();
  }

  clearCart() {
    this.cart.basket = [];
    localStorage.setItem("data", JSON.stringify(this.cart.basket));
    this.cart.calculateCartAmount();
    this.cart.generateCartItems();
  }
}

class TotalCalculator {
  constructor(cart) {
    this.cart = cart;
  }

  updateTotalAmount() {
    if (this.cart.basket.length !== 0) {
      let amount = this.cart.basket
        .map((x) => {
          let { item, id } = x;
          let search = shopItemsData.find((y) => y.id === id) || [];
          return item * x.price; // Використовуємо ціну з кошика
        })
        .reduce((x, y) => x + y, 0);
      this.cart.label.innerHTML = `
         <h2>Total Bill : $ ${amount}</h2>
         <button onclick="shoppingBasket.clearCart()" class="removeAll">Clear Cart</button>
       `;
    } else return;
  }
}

// Instantiate classes
const cart = new Cart();
const totalCalculator = new TotalCalculator(cart);
const shoppingBasket = new ShoppingBasket(cart, totalCalculator);

// Initial call to generate cart items
cart.generateCartItems();
totalCalculator.updateTotalAmount();
