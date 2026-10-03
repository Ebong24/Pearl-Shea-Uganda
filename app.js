const products = {
  classic: {
    name: "Everyday Shea",
    size: "100 g",
    price: 25000,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=70",
  },
  daily: {
    name: "Daily Ritual",
    size: "200 g",
    price: 40000,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=240&q=70",
  },
  mini: {
    name: "Little Pearl",
    size: "50 g",
    price: 15000,
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=240&q=70",
  },
};

const whatsappNumber = "256777502530";
const bag = new Map();
const bagButton = document.querySelector(".bag-button");
const bagCount = document.querySelector(".bag-count");
const drawer = document.querySelector(".cart-drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const itemsContainer = document.querySelector(".cart-items");
const emptyState = document.querySelector(".cart-empty");
const cartFooter = document.querySelector(".cart-footer");
const drawerCount = document.querySelector(".drawer-count");
const subtotal = document.querySelector(".cart-subtotal strong");
const checkoutLink = document.querySelector(".checkout-link");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
let lastFocusedElement;

function formatPrice(amount) {
  return `UGX ${new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(amount)}`;
}

function updateBag() {
  const itemCount = [...bag.values()].reduce((total, quantity) => total + quantity, 0);
  const bagTotal = [...bag.entries()].reduce((total, [id, quantity]) => total + products[id].price * quantity, 0);

  bagCount.textContent = itemCount;
  bagButton.setAttribute("aria-label", `Open shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  drawerCount.textContent = `(${itemCount})`;
  subtotal.textContent = formatPrice(bagTotal);
  emptyState.hidden = itemCount > 0;
  cartFooter.hidden = itemCount === 0;
  itemsContainer.innerHTML = [...bag.entries()].map(([id, quantity]) => {
    const product = products[id];
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="">
        <div>
          <h3>${product.name}</h3>
          <p>${product.size} · ${formatPrice(product.price)}</p>
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
            <button type="button" data-quantity-action="decrease" data-product="${id}" aria-label="Remove one ${product.name}">−</button>
            <span>${quantity}</span>
            <button type="button" data-quantity-action="increase" data-product="${id}" aria-label="Add one ${product.name}">+</button>
          </div>
        </div>
        <span class="line-total">${formatPrice(product.price * quantity)}</span>
      </article>`;
  }).join("");

  if (itemCount > 0) {
    const orderLines = [...bag.entries()].map(([id, quantity]) => `${quantity} x ${products[id].name} (${products[id].size})`).join("\n");
    const message = `Hello Pearl Shea Uganda, I would like to order:\n${orderLines}\nSubtotal: ${formatPrice(bagTotal)}\nPlease confirm delivery details.`;
    checkoutLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}

function openBag() {
  lastFocusedElement = document.activeElement;
  drawer.hidden = false;
  backdrop.hidden = false;
  document.body.classList.add("drawer-open");
  drawer.querySelector(".close-cart").focus();
}

function closeBag() {
  drawer.hidden = true;
  backdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  lastFocusedElement?.focus();
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.add;
    bag.set(id, (bag.get(id) ?? 0) + 1);
    updateBag();
    openBag();
  });
});

bagButton.addEventListener("click", openBag);
drawer.querySelector(".close-cart").addEventListener("click", closeBag);
backdrop.addEventListener("click", closeBag);
drawer.querySelector(".continue-shopping").addEventListener("click", () => {
  closeBag();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

itemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity-action]");
  if (!button) return;

  const id = button.dataset.product;
  const nextQuantity = bag.get(id) + (button.dataset.quantityAction === "increase" ? 1 : -1);
  if (nextQuantity > 0) bag.set(id, nextQuantity);
  else bag.delete(id);
  updateBag();
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll(".product-card").forEach((card) => {
      card.hidden = filter !== "all" && !card.dataset.category.split(" ").includes(filter);
    });
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mainNav.classList.toggle("is-open", isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mainNav.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !drawer.hidden) closeBag();
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateBag();