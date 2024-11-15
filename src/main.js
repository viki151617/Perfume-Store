class Shop {
  constructor(shopItemsData) {
    this.shopItemsData = shopItemsData;
    this.filteredItemsData = shopItemsData;
    this.basket = new Basket();
    this.shopElement = document.getElementById("shop");
    this.selectedVolumes = {};
    this.filter = new Filter(this.shopItemsData, (filteredData) => {
      this.filteredItemsData = filteredData;
      this.generateShop();
    });
    this.generateShop();
  }

  generateShop() {
    this.shopElement.innerHTML = this.filteredItemsData
      .map((x) => {
        let { id, name, prices, desc, img } = x;
        let defaultVolume = 30;
        let currentVolume = this.selectedVolumes[id] || defaultVolume;
        let currentPrice = prices[currentVolume];

        return `
          <div id="product-id-${id}" class="item">
            <img width="220" src=${img} alt="">
            <div class="details">
              <h3>${name}</h3>
              <p>${desc}</p>
              <div class="price-quantity">
                <h2 id="price-${id}">$ ${currentPrice} </h2>
                <div class="buttons">
                
                  <i onclick="shop.increment('${id}')" class="bi bi-plus-lg" style="font-size: 22px;   color: rgb(128, 60, 0);"></i>

                </div>
              </div>
              <div class="action-buttons">
                <button onclick="shop.selectVolume('${id}', 30)">30 мл</button>
                <button onclick="shop.selectVolume('${id}', 50)">50 мл</button>
                <button onclick="shop.selectVolume('${id}', 100)">100 мл</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
    document.getElementById("cartAmount").innerHTML =
      this.basket.calculateTotalItems();
  }

  selectVolume(id, volume) {
    this.selectedVolumes[id] = volume;
    const item = this.shopItemsData.find((item) => item.id === id);
    if (item) {
      const priceElement = document.getElementById(`price-${id}`);
      const newPrice = item.prices[volume];
      priceElement.innerHTML = `$ ${newPrice}`;
    }
  }
  increment(id) {
    const volume = this.selectedVolumes[id] || 30;
    this.selectedVolumes[id] = volume;
    const item = this.shopItemsData.find((item) => item.id === id);
    if (item) {
      const priceElement = document.getElementById(`price-${id}`);
      const newPrice = item.prices[volume];
      priceElement.innerHTML = `$ ${newPrice}`;
      this.basket.addItem(id, newPrice, volume);
    }
  }
  updateCartAmount() {
    document.getElementById("cartAmount").innerHTML =
      this.basket.calculateTotalItems();
  }
}
class Filter {
  constructor(shopItemsData, onFilterChange) {
    this.shopItemsData = shopItemsData;
    this.onFilterChange = onFilterChange;
    this.priceRange = document.getElementById("priceRange"); // Поле для вибору діапазону цін
    this.categorySelect = document.getElementById("categorySelect"); // Поле для вибору категорії
    this.perfumeSearch = document.getElementById("perfumeSearch"); // Нове поле для пошуку
    this.searchButton = document.getElementById("searchButton");

    this.priceRange.addEventListener("change", () => this.applyFilters());
    this.categorySelect.addEventListener("change", () => this.applyFilters());
    this.searchButton.addEventListener("click", () => this.handleSearchClick());
  }

  handleSearchClick() {
    const searchQuery = this.perfumeSearch.value.toLowerCase();

    try {
      if (searchQuery === "") {
        throw new Error("Будь ласка, введіть товар для пошуку.");
      }
      this.applyFilters();
      // location.reload();
    } catch (error) {
      alert(error.message);
    }
  }

  applyFilters() {
    const selectedPriceRange = this.priceRange.value;
    const selectedCategory = this.categorySelect.value;
    const searchQuery = this.perfumeSearch.value.toLowerCase();

    // Фільтрація за ціною, категорією та назвою
    const filteredItemsData = this.shopItemsData.filter((item) => {
      // Фільтрація за ціною
      const withinPriceRange =
        selectedPriceRange === "all" ||
        (item.prices[30] >= parseFloat(selectedPriceRange.split("-")[0]) &&
          item.prices[30] <= parseFloat(selectedPriceRange.split("-")[1]));

      // Фільтрація за категорією
      const inCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // Фільтрація за назвою
      const matchesName =
        searchQuery === "" || item.name.toLowerCase().includes(searchQuery);

      return withinPriceRange && inCategory && matchesName;
    });

    try {
      if (searchQuery !== "" && filteredItemsData.length === 0) {
        throw new Error("Товар не знайдено.");
      }
    } catch (error) {
      alert(error.message);
    }

    filteredItemsData.sort((a, b) => a.prices[30] - b.prices[30]);

    this.onFilterChange(filteredItemsData);
  }
}

class Basket {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("data")) || [];
  }

  addItem(id, price, volume) {
    let search = this.items.find((x) => x.id === id && x.volume === volume);

    if (!search) {
      this.items.push({
        id: id,
        item: 1,
        price: price,
        volume: volume,
      });
    } else {
      search.item += 1;
    }
    this.updateLocalStorage();
    this.updateCartAmount();
  }

  removeItem(id, volume) {
    let search = this.items.find((x) => x.id === id && x.volume === volume);
    if (!search) return;

    search.item -= 1;
    if (search.item === 0) {
      this.items = this.items.filter((x) => x.id !== id || x.volume !== volume);
    }
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem("data", JSON.stringify(this.items));
  }

  getItemQuantity(id, volume) {
    let search = this.items.find((x) => x.id === id && x.volume === volume);
    return search ? search.item : 0;
  }

  calculateTotalItems() {
    return this.items.reduce((total, item) => total + item.item, 0);
  }
  updateCartAmount() {
    let cartIcon = document.getElementById("cartAmount");
    cartIcon.innerHTML = this.calculateTotalItems();
  }
}
const shop = new Shop(shopItemsData);
