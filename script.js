// Real Estate E-commerce Application
class RealEstateApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.theme = localStorage.getItem('theme') || 'light';
        
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
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Cart toggle
        const cartToggle = document.querySelector('.cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.toggleCart());
        }

        // Cart close
        const cartClose = document.querySelector('.cart-close');
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }

        // User menu toggle
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', () => this.toggleUserMenu());
        }

        // Search functionality
        const searchButton = document.querySelector('.search-bar button');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Contact form
        const contactForm = document.querySelector('.contact-form form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e);
            });
        }

        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeCart();
            }
        });
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === 'light' 
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
    }

    // Cart Management
    addToCart(property) {
        const existingItem = this.cart.find(item => item.id === property.id);
        
        if (existingItem) {
            this.showNotification('Property already in cart!', 'error');
            return;
        }

        this.cart.push({
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            image: property.image || '/api/placeholder/300/200'
        });

        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification('Property added to cart!', 'success');
    }

    removeFromCart(propertyId) {
        this.cart = this.cart.filter(item => item.id !== propertyId);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification('Property removed from cart!', 'success');
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
            cartCount.style.display = this.cart.length > 0 ? 'flex' : 'none';
        }
    }

    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total span:last-child');
        
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Your cart is empty</div>';
            if (cartTotal) cartTotal.textContent = 'Ksh 0';
            return;
        }

        const total = this.cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ''));
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
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = `Ksh ${total.toLocaleString()}`;
        }
    }

    toggleCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
            this.updateCartDisplay();
        }
    }

    closeCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }

    // Favorites Management
    toggleFavorite(property) {
        const index = this.favorites.findIndex(fav => fav.id === property.id);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification('Removed from favorites!', 'success');
        } else {
            this.favorites.push(property);
            this.showNotification('Added to favorites!', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            const propertyId = btn.dataset.propertyId;
            const isFavorite = this.favorites.some(fav => fav.id === propertyId);
            btn.innerHTML = isFavorite 
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            btn.style.color = isFavorite ? '#ef4444' : 'var(--text-secondary)';
        });
    }

    // Property Management
    loadProperties() {
        // Sample property data - in a real app, this would come from an API
        this.properties = [
            {
                id: 'prop1',
                title: 'Luxury Villa in Muthaiga',
                location: 'Muthaiga, Nairobi',
                price: 'Ksh 85,000,000',
                bedrooms: 5,
                bathrooms: 4,
                area: '450m²',
                description: 'Exquisite 5-bedroom villa with swimming pool, manicured gardens, and 24/7 security in prestigious Muthaiga area.',
                image: '/api/placeholder/400/300',
                features: ['Swimming Pool', 'Garden', 'Security', 'Parking']
            },
            {
                id: 'prop2',
                title: 'Modern Apartment in Westlands',
                location: 'Westlands, Nairobi',
                price: 'Ksh 18,000,000',
                bedrooms: 3,
                bathrooms: 2,
                area: '180m²',
                description: 'Contemporary 3-bedroom apartment with city views, gym, and shopping mall access in the heart of Westlands.',
                image: '/api/placeholder/400/300',
                features: ['City View', 'Gym', 'Mall Access', 'Elevator']
            },
            {
                id: 'prop3',
                title: 'Beachfront Villa in Diani',
                location: 'Diani Beach, Kwale',
                price: 'Ksh 120,000,000',
                bedrooms: 4,
                bathrooms: 3,
                area: '380m²',
                description: 'Stunning 4-bedroom beachfront villa with private beach access, infinity pool, and breathtaking ocean views.',
                image: '/api/placeholder/400/300',
                features: ['Beach Access', 'Ocean View', 'Infinity Pool', 'Private']
            }
        ];
    }

    setupPropertyCards() {
        const propertyCards = document.querySelectorAll('.property-card');
        
        propertyCards.forEach((card, index) => {
            const property = this.properties[index];
            if (!property) return;

            // Add property image
            const imageContainer = card.querySelector('.property-image');
            if (!imageContainer) {
                const contentDiv = card.querySelector('.property-content');
                if (contentDiv) {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'property-image';
                    imageDiv.style.backgroundImage = `url('${property.image}')`;
                    imageDiv.style.backgroundSize = 'cover';
                    imageDiv.style.backgroundPosition = 'center';
                    card.insertBefore(imageDiv, contentDiv);
                }
            }

            // Add action buttons
            const actionsContainer = card.querySelector('.property-actions');
            if (!actionsContainer) {
                const contentDiv = card.querySelector('.property-content');
                if (contentDiv) {
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'property-actions';
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
        const modal = this.createModal('Property Details', `
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
                    `).join('')}
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
        const location = document.querySelector('.search-bar input:nth-child(1)').value;
        const propertyType = document.querySelector('.search-bar input:nth-child(2)').value;
        const priceRange = document.querySelector('.search-bar input:nth-child(3)').value;
        
        this.showNotification(`Searching for ${propertyType || 'properties'} in ${location || 'all locations'} with price range ${priceRange || 'any'}`, 'success');
        
        // In a real app, this would filter the properties and update the display
        console.log('Search params:', { location, propertyType, priceRange });
    }

    // User Management
    toggleUserMenu() {
        if (this.user) {
            this.showUserMenu();
        } else {
            this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = this.createModal('Login', `
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" required>
                </div>
            </form>
        `, `
            <button class="button button-secondary" onclick="app.closeModal()">Cancel</button>
            <button class="button button-primary" onclick="app.handleLogin()">Login</button>
        `);
        
        this.showModal(modal);
    }

    handleLogin() {
        // Simulate login
        this.user = {
            name: 'John Doe',
            email: 'john@example.com'
        };
        localStorage.setItem('user', JSON.stringify(this.user));
        this.closeModal();
        this.showNotification('Logged in successfully!', 'success');
    }

    showUserMenu() {
        const modal = this.createModal('User Menu', `
            <div style="text-align: center;">
                <h3>Welcome, ${this.user.name}!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">${this.user.email}</p>
                
                <div style="display: grid; gap: 1rem;">
                    <button class="button button-secondary" onclick="app.showFavorites()">View Favorites</button>
                    <button class="button button-secondary" onclick="app.showPurchaseHistory()">Purchase History</button>
                    <button class="button button-secondary" onclick="app.logout()">Logout</button>
                </div>
            </div>
        `, `
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
        `);
        
        this.showModal(modal);
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
        this.closeModal();
        this.showNotification('Logged out successfully!', 'success');
    }

    showFavorites() {
        const favoritesHtml = this.favorites.length > 0 
            ? this.favorites.map(fav => `
                <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                    <div style="width: 80px; height: 60px; background-image: url('${fav.image}'); background-size: cover; background-position: center; border-radius: 8px;"></div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${fav.title}</div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">${fav.location}</div>
                        <div style="color: var(--primary-color); font-weight: 600;">${fav.price}</div>
                    </div>
                </div>
            `).join('')
            : '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No favorites yet</div>';

        const modal = this.createModal('Your Favorites', favoritesHtml, `
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
        `);
        
        this.showModal(modal);
    }

    showPurchaseHistory() {
        const modal = this.createModal('Purchase History', `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                No purchases yet
            </div>
        `, `
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
        `);
        
        this.showModal(modal);
    }

    // Contact Form
    handleContactForm(e) {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showNotification('Message sent successfully! We will get back to you soon.', 'success');
        e.target.reset();
    }

    // Modal Management
    createModal(title, content, footer = '') {
        return `
            <div class="modal-overlay" onclick="app.closeModal()">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button onclick="app.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;
    }

    showModal(modalHtml) {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.querySelector('.modal-overlay');
        setTimeout(() => modal.classList.add('open'), 10);
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: var(--text-secondary);">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Checkout Process
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        if (!this.user) {
            this.showNotification('Please login to proceed with checkout', 'error');
            this.showLoginModal();
            return;
        }

        const total = this.cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ''));
            return sum + price;
        }, 0);

        const modal = this.createModal('Checkout', `
            <div style="margin-bottom: 1.5rem;">
                <h4>Order Summary</h4>
                ${this.cart.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                        <span>${item.title}</span>
                        <span>${item.price}</span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; font-weight: 600; font-size: 1.125rem;">
                    <span>Total:</span>
                    <span>Ksh ${total.toLocaleString()}</span>
                </div>
            </div>
            
            <form id="checkoutForm">
                <div class="form-group">
                    <label class="form-label">Payment Method</label>
                    <select class="form-select" required>
                        <option value="">Select payment method</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-input" placeholder="+254 700 000 000" required>
                </div>
            </form>
        `, `
            <button class="button button-secondary" onclick="app.closeModal()">Cancel</button>
            <button class="button button-primary" onclick="app.processPayment()">Complete Purchase</button>
        `);
        
        this.showModal(modal);
    }

    processPayment() {
        // Simulate payment processing
        this.showNotification('Processing payment...', 'success');
        
        setTimeout(() => {
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCount();
            this.updateCartDisplay();
            this.closeModal();
            this.closeCart();
            this.showNotification('Payment successful! Thank you for your purchase.', 'success');
        }, 2000);
    }
}

// Initialize the application
const app = new RealEstateApp();

// Add cart sidebar to the page
document.addEventListener('DOMContentLoaded', () => {
    // Add navigation icons
    const navActions = document.querySelector('.nav-actions') || document.querySelector('nav .container');
    if (navActions && !document.querySelector('.theme-toggle')) {
        navActions.innerHTML += `
            <div class="nav-actions">
                <button class="theme-toggle" title="Toggle theme">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                </button>
                <button class="cart-toggle" title="Shopping cart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span class="cart-count">0</span>
                </button>
                <button class="user-menu-toggle" title="User menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 20a6 6 0 0 0-12 0"/>
                        <circle cx="12" cy="10" r="4"/>
                    </svg>
                </button>
            </div>
        `;
    }

    // Add cart sidebar
    if (!document.querySelector('.cart-sidebar')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button class="cart-close">&times;</button>
                </div>
                <div class="cart-items"></div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span>Ksh 0</span>
                    </div>
                    <button class="button button-primary" style="width: 100%;" onclick="app.proceedToCheckout()">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `);
    }

    // Re-initialize the app to set up new event listeners
    app.setupEventListeners();
    app.updateCartCount();
    app.applyTheme();
});

