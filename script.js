// Real Estate E-commerce Application
class RealEstateApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem("cart")) || [];
        this.favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        this.user = JSON.parse(localStorage.getItem("user")) || null;
        this.theme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.applyTheme();
        this.loadProperties();
        this.setupPropertyCards();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.querySelector(".theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => this.toggleTheme());
        }

        // Cart toggle
        const cartToggle = document.querySelector(".cart-toggle");
        if (cartToggle) {
            cartToggle.addEventListener("click", () => this.toggleCart());
        }

        // Cart close
        const cartClose = document.querySelector(".cart-close");
        if (cartClose) {
            cartClose.addEventListener("click", () => this.closeCart());
        }

        // User menu toggle
        const userMenuToggle = document.querySelector(".user-menu-toggle");
        if (userMenuToggle) {
            userMenuToggle.addEventListener("click", () => this.toggleUserMenu());
        }

        // Search functionality
        const searchButton = document.querySelector(".search-bar button");
        if (searchButton) {
            searchButton.addEventListener("click", (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Contact form
        const contactForm = document.querySelector(".contact-form form");
        if (contactForm) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleContactForm(e);
            });
        }

        // Close modals on overlay click
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("modal-overlay")) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeModal();
                this.closeCart();
            }
        });
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === "light" ? "dark" : "light";
        this.applyTheme();
        localStorage.setItem("theme", this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute("data-theme", this.theme);
        const themeToggle = document.querySelector(".theme-toggle");
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === "light" 
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
    }

    // Cart Management
    addToCart(property) {
        const existingItem = this.cart.find(item => item.id === property.id);
        
        if (existingItem) {
            this.showNotification("Property already in cart!", "error");
            return;
        }

        this.cart.push({
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            image: property.image || "/api/placeholder/300/200"
        });

        localStorage.setItem("cart", JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification("Property added to cart!", "success");
    }

    removeFromCart(propertyId) {
        this.cart = this.cart.filter(item => item.id !== propertyId);
        localStorage.setItem("cart", JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification("Property removed from cart!", "success");
    }

    updateCartCount() {
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
            cartCount.textContent = this.cart.length;
            cartCount.style.display = this.cart.length > 0 ? "flex" : "none";
        }
    }

    updateCartDisplay() {
        const cartItems = document.querySelector(".cart-items");
        const cartTotal = document.querySelector(".cart-total span:last-child");
        
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Your cart is empty</div>';
            if (cartTotal) cartTotal.textContent = "Ksh 0";
            return;
        }

        const total = this.cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ""));
            return sum + price;
        }, 0);

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-location">${item.location}</div>
                    <div class="cart-item-price">${item.price}</div>
                </div>
                <button onclick="app.removeFromCart('${item.id}')" class="button button-icon" style="color: #ef4444;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
                    </svg>
                </button>
            </div>
        `).join("");

        if (cartTotal) {
            cartTotal.textContent = `Ksh ${total.toLocaleString()}`;
        }
    }

    toggleCart() {
        const cartSidebar = document.querySelector(".cart-sidebar");
        if (cartSidebar) {
            cartSidebar.classList.toggle("open");
            this.updateCartDisplay();
        }
    }

    closeCart() {
        const cartSidebar = document.querySelector(".cart-sidebar");
        if (cartSidebar) {
            cartSidebar.classList.remove("open");
        }
    }

    // Favorites Management
    toggleFavorite(property) {
        const index = this.favorites.findIndex(fav => fav.id === property.id);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification("Removed from favorites!", "success");
        } else {
            this.favorites.push(property);
            this.showNotification("Added to favorites!", "success");
        }
        
        localStorage.setItem("favorites", JSON.stringify(this.favorites));
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll(".favorite-btn");
        favoriteButtons.forEach(btn => {
            const propertyId = btn.dataset.propertyId;
            const isFavorite = this.favorites.some(fav => fav.id === propertyId);
            btn.innerHTML = isFavorite 
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            btn.style.color = isFavorite ? "#ef4444" : "var(--text-secondary)";
        });
    }

    // Property Management
    loadProperties() {
        // Sample property data - in a real app, this would come from an API
        this.properties = [
            {
                id: "prop1",
                title: "Luxury Villa in Muthaiga",
                location: "Muthaiga, Nairobi",
                price: "Ksh 85,000,000",
                bedrooms: 5,
                bathrooms: 4,
                area: "450m²",
                description: "Exquisite 5-bedroom villa with swimming pool, manicured gardens, and 24/7 security in prestigious Muthaiga area.",
                image: "/api/placeholder/400/300",
                features: ["Swimming Pool", "Garden", "Security", "Parking"]
            },
            {
                id: "prop2",
                title: "Modern Apartment in Westlands",
                location: "Westlands, Nairobi",
                price: "Ksh 18,000,000",
                bedrooms: 3,
                bathrooms: 2,
                area: "180m²",
                description: "Contemporary 3-bedroom apartment with city views, gym, and shopping mall access in the heart of Westlands.",
                image: "/api/placeholder/400/300",
                features: ["City View", "Gym", "Mall Access", "Elevator"]
            },
            {
                id: "prop3",
                title: "Beachfront Villa in Diani",
                location: "Diani Beach, Kwale",
                price: "Ksh 120,000,000",
                bedrooms: 4,
                bathrooms: 3,
                area: "380m²",
                description: "Stunning 4-bedroom beachfront villa with private beach access, infinity pool, and breathtaking ocean views.",
                image: "/api/placeholder/400/300",
                features: ["Beach Access", "Ocean View", "Infinity Pool", "Private"]
            }
        ];
    }

    setupPropertyCards() {
        const propertyCards = document.querySelectorAll(".property-card");
        
        propertyCards.forEach((card, index) => {
            const property = this.properties[index];
            if (!property) return;

            // Add property image
            const imageContainer = card.querySelector(".property-image");
            if (!imageContainer) {
                const contentDiv = card.querySelector(".property-content");
                if (contentDiv) {
                    const imageDiv = document.createElement("div");
                    imageDiv.className = "property-image";
                    imageDiv.style.backgroundImage = `url('${property.image}')`;
                    imageDiv.style.backgroundSize = "cover";
                    imageDiv.style.backgroundPosition = "center";
                    card.insertBefore(imageDiv, contentDiv);
                }
            }

            // Add action buttons
            const actionsContainer = card.querySelector(".property-actions");
            if (!actionsContainer) {
                const contentDiv = card.querySelector(".property-content");
                if (contentDiv) {
                    const actionsDiv = document.createElement("div");
                    actionsDiv.className = "property-actions";
                    actionsDiv.innerHTML = `
                        <button class="button button-primary" onclick="app.addToCart(app.properties[${index}])">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Add to Cart
                        </button>
                        <button class="button button-secondary favorite-btn" data-property-id="${property.id}" onclick="app.toggleFavorite(app.properties[${index}])">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                        <button class="button button-secondary" onclick="app.viewPropertyDetails(app.properties[${index}])">
                            View Details
                        </button>
                    `;
                    contentDiv.appendChild(actionsDiv);
                }
            }
        });

        this.updateFavoriteButtons();
    }

    viewPropertyDetails(property) {
        const modal = this.createModal("Property Details", `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="width: 100%; height: 200px; background-image: url('${property.image}'); background-size: cover; background-position: center; border-radius: 8px; margin-bottom: 1rem;"></div>
                <h3 style="margin-bottom: 0.5rem;">${property.title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${property.location}</p>
                <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">${property.price}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; text-align: center;">
                <div>
                    <div style="font-weight: 600;">${property.bedrooms}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">Bedrooms</div>
                </div>
                <div>
                    <div style="font-weight: 600;">${property.bathrooms}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">Bathrooms</div>
                </div>
                <div>
                    <div style="font-weight: 600;">${property.area}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">Area</div>
                </div>
            </div>
            
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">${property.description}</p>
            
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem;">Features:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${property.features.map(feature => `
                        <span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">${feature}</span>
                    `).join("")}
                </div>
            </div>
        `, `
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
            <button class="button button-primary" onclick="app.addToCart(app.properties.find(p => p.id === '${property.id}')); app.closeModal();">Add to Cart</button>
        `);
        
        this.showModal(modal);
    }

    // Search Functionality
    performSearch() {
        const location = document.querySelector(".search-bar input:nth-child(1)").value;
        const propertyType = document.querySelector(".search-bar input:nth-child(2)").value;
        const priceRange = document.querySelector(".search-bar input:nth-child(3)").value;
        
        this.showNotification(`Searching for ${propertyType || "properties"} in ${location || "all locations"} with price range ${priceRange || "any"}`, "success");
        
        // In a real app, this would filter the properties and update the display
        console.log("Search params:", { location, propertyType, priceRange });
    }

    // User Management
    toggleUserMenu() {
        // For now, this will trigger a login/logout flow or show user profile
        if (this.user) {
            this.showNotification(`Welcome back, ${this.user.name}!`, "success");
            // In a real app, show user profile modal or dropdown
        } else {
            this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = this.createModal("Login / Sign Up", `
            <form id="auth-form">
                <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-input" required>
                </div>
                <button type="submit" class="button button-primary" style="width: 100%;">Login</button>
                <p style="text-align: center; margin-top: 1rem;">Don't have an account? <a href="#" id="signup-link" style="color: var(--primary-color); text-decoration: none;">Sign Up</a></p>
            </form>
        `);
        this.showModal(modal);

        document.getElementById("auth-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            this.handleAuth(email, password, "login");
        });

        document.getElementById("signup-link").addEventListener("click", (e) => {
            e.preventDefault();
            this.showSignupModal();
        });
    }

    showSignupModal() {
        const modal = this.createModal("Sign Up", `
            <form id="signup-form">
                <div class="form-group">
                    <label for="signup-name" class="form-label">Name</label>
                    <input type="text" id="signup-name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="signup-email" class="form-label">Email</label>
                    <input type="email" id="signup-email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="signup-password" class="form-label">Password</label>
                    <input type="password" id="signup-password" class="form-input" required>
                </div>
                <button type="submit" class="button button-primary" style="width: 100%;">Sign Up</button>
                <p style="text-align: center; margin-top: 1rem;">Already have an account? <a href="#" id="login-link" style="color: var(--primary-color); text-decoration: none;">Login</a></p>
            </form>
        `);
        this.showModal(modal);

        document.getElementById("signup-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            this.handleAuth(email, password, "signup", name);
        });

        document.getElementById("login-link").addEventListener("click", (e) => {
            e.preventDefault();
            this.showLoginModal();
        });
    }

    handleAuth(email, password, type, name = null) {
        // This is a mock authentication. In a real app, you'd send this to a backend.
        if (type === "signup") {
            this.user = { name, email, id: Date.now() };
            localStorage.setItem("user", JSON.stringify(this.user));
            this.showNotification(`Welcome, ${name}! You are now signed up.`, "success");
        } else if (type === "login") {
            // Mock login: any email/password works for now
            this.user = { name: "Test User", email, id: Date.now() }; 
            localStorage.setItem("user", JSON.stringify(this.user));
            this.showNotification(`Welcome back, ${email}!`, "success");
        }
        this.closeModal();
    }

    // Checkout Process
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification("Your cart is empty. Add some properties first!", "error");
            return;
        }

        if (!this.user) {
            this.showNotification("Please login to proceed to checkout.", "error");
            this.showLoginModal();
            return;
        }

        const totalAmount = this.cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ""));
            return sum + price;
        }, 0);

        const checkoutModalContent = `
            <h3>Checkout Summary</h3>
            <p>Total items: ${this.cart.length}</p>
            <p>Total amount: <span style="font-weight: 700; color: var(--primary-color);">Ksh ${totalAmount.toLocaleString()}</span></p>
            
            <div class="form-group" style="margin-top: 2rem;">
                <label for="payment-method" class="form-label">Select Payment Method</label>
                <select id="payment-method" class="form-select">
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                </select>
            </div>
            <div id="payment-details" style="margin-top: 1rem;">
                <!-- Payment method specific details will be loaded here -->
            </div>
        `;

        const checkoutModalFooter = `
            <button class="button button-secondary" onclick="app.closeModal()">Cancel</button>
            <button class="button button-primary" onclick="app.completePurchase()">Complete Purchase</button>
        `;

        const modal = this.createModal("Proceed to Checkout", checkoutModalContent, checkoutModalFooter);
        this.showModal(modal);

        document.getElementById("payment-method").addEventListener("change", (e) => {
            this.updatePaymentDetails(e.target.value);
        });
        this.updatePaymentDetails("mpesa"); // Load default payment details
    }

    updatePaymentDetails(method) {
        const paymentDetailsDiv = document.getElementById("payment-details");
        if (!paymentDetailsDiv) return;

        let html = "";
        switch (method) {
            case "mpesa":
                html = `
                    <p>Send money to M-Pesa Paybill: <strong>123456</strong> Account No: <strong>${this.user.id}</strong></p>
                    <div class="form-group">
                        <label for="mpesa-code" class="form-label">M-Pesa Confirmation Code</label>
                        <input type="text" id="mpesa-code" class="form-input" placeholder="Enter M-Pesa code" required>
                    </div>
                `;
                break;
            case "card":
                html = `
                    <div class="form-group">
                        <label for="card-number" class="form-label">Card Number</label>
                        <input type="text" id="card-number" class="form-input" placeholder="XXXX XXXX XXXX XXXX" required>
                    </div>
                    <div class="form-group">
                        <label for="expiry-date" class="form-label">Expiry Date</label>
                        <input type="text" id="expiry-date" class="form-input" placeholder="MM/YY" required>
                    </div>
                    <div class="form-group">
                        <label for="cvv" class="form-label">CVV</label>
                        <input type="text" id="cvv" class="form-input" placeholder="XXX" required>
                    </div>
                `;
                break;
            case "bank":
                html = `
                    <p>Bank Name: <strong>Kenya National Bank</strong></p>
                    <p>Account Name: <strong>Kenya Realty Ltd</strong></p>
                    <p>Account Number: <strong>0123456789</strong></p>
                    <p>Swift Code: <strong>KNBKENXXX</strong></p>
                `;
                break;
        }
        paymentDetailsDiv.innerHTML = html;
    }

    completePurchase() {
        // In a real application, this would involve sending payment details to a backend
        this.showNotification("Purchase completed successfully!", "success");
        this.cart = []; // Clear cart after purchase
        localStorage.setItem("cart", JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.closeModal();
    }

    // Modal Management
    createModal(title, content, footer = "") {
        const modalOverlay = document.createElement("div");
        modalOverlay.className = "modal-overlay";
        modalOverlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="cart-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${footer}
                </div>
            </div>
        `;
        return modalOverlay;
    }

    showModal(modalElement) {
        document.body.appendChild(modalElement);
        setTimeout(() => {
            modalElement.classList.add("open");
        }, 10);
    }

    closeModal() {
        const modalOverlay = document.querySelector(".modal-overlay.open");
        if (modalOverlay) {
            modalOverlay.classList.remove("open");
            setTimeout(() => {
                modalOverlay.remove();
            }, 300); // Allow transition to finish
        }
    }

    // Notification System
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("show");
        }, 10);

        setTimeout(() => {
            notification.classList.remove("show");
            notification.addEventListener("transitionend", () => {
                notification.remove();
            });
        }, 3000);
    }
}

const app = new RealEstateApp();

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    app.init();
});


