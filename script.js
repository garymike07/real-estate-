// Real Estate E-commerce Application
class RealEstateApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem("cart")) || [];
        this.favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        this.comparison = JSON.parse(localStorage.getItem("comparison")) || [];
        this.theme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.applyTheme();
        this.loadProperties();
        this.renderProperties();
        this.updateComparisonToolbar();
        this.renderRecommendations();
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
        this.renderRecommendations();
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

    // Comparison Management
    toggleComparison(property) {
        const index = this.comparison.findIndex(p => p.id === property.id);
        if (index > -1) {
            this.removeFromComparison(property.id);
        } else {
            this.addToComparison(property);
        }
    }

    addToComparison(property) {
        if (this.comparison.length >= 3) {
            this.showNotification("You can only compare up to 3 properties.", "error");
            return;
        }
        if (this.comparison.find(item => item.id === property.id)) {
            this.showNotification("Property already in comparison list.", "error");
            return;
        }
        this.comparison.push(property);
        localStorage.setItem("comparison", JSON.stringify(this.comparison));
        this.showNotification("Property added to comparison.", "success");
        this.updateCompareButtons();
        this.updateComparisonToolbar();
    }

    removeFromComparison(propertyId) {
        this.comparison = this.comparison.filter(item => item.id !== propertyId);
        localStorage.setItem("comparison", JSON.stringify(this.comparison));
        this.showNotification("Property removed from comparison.", "success");
        this.updateCompareButtons();
        this.updateComparisonToolbar();
    }

    clearComparison() {
        this.comparison = [];
        localStorage.removeItem("comparison");
        this.updateCompareButtons();
        this.updateComparisonToolbar();
    }

    updateCompareButtons() {
        const compareButtons = document.querySelectorAll(".compare-btn");
        compareButtons.forEach(btn => {
            const propertyId = btn.dataset.propertyId;
            const isCompared = this.comparison.some(p => p.id === propertyId);
            if (isCompared) {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                btn.classList.add("active");
            } else {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                btn.classList.remove("active");
            }
        });
    }

    updateComparisonToolbar() {
        const toolbar = document.querySelector(".comparison-toolbar");
        const itemsContainer = document.querySelector(".comparison-items");

        if (!toolbar || !itemsContainer) return;

        if (this.comparison.length > 0) {
            toolbar.classList.remove("hidden");
            toolbar.classList.add("show");
            itemsContainer.innerHTML = this.comparison.map(p => `
                <div class="comparison-item">
                    <img src="${p.image}" alt="${p.title}">
                    <span>${p.title}</span>
                </div>
            `).join('');
        } else {
            toolbar.classList.remove("show");
            toolbar.classList.add("hidden");
        }
    }

    showComparisonView() {
        if (this.comparison.length === 0) {
            this.showNotification("Add some properties to compare first.", "error");
            return;
        }

        let comparisonContent = `
            <table class="comparison-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">Feature</th>
                        ${this.comparison.map(p => `<th style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${p.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 1rem; font-weight: 600;">Image</td>
                        ${this.comparison.map(p => `<td style="padding: 1rem;"><img src="${p.image}" style="width: 100%; height: auto; border-radius: 8px;"></td>`).join('')}
                    </tr>
                    <tr>
                        <td style="padding: 1rem; font-weight: 600;">Price</td>
                        ${this.comparison.map(p => `<td style="padding: 1rem;">${p.price}</td>`).join('')}
                    </tr>
                    <tr>
                        <td style="padding: 1rem; font-weight: 600;">Bedrooms</td>
                        ${this.comparison.map(p => `<td style="padding: 1rem;">${p.bedrooms}</td>`).join('')}
                    </tr>
                    <tr>
                        <td style="padding: 1rem; font-weight: 600;">Bathrooms</td>
                        ${this.comparison.map(p => `<td style="padding: 1rem;">${p.bathrooms}</td>`).join('')}
                    </tr>
                    <tr>
                        <td style="padding: 1rem; font-weight: 600;">Area</td>
                        ${this.comparison.map(p => `<td style="padding: 1rem;">${p.area}</td>`).join('')}
                    </tr>
                </tbody>
            </table>
        `;

        const modal = this.createModal("Compare Properties", comparisonContent, `
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
        `);
        this.showModal(modal);
    }

    // Recommendation Engine
    getRecommendations() {
        const numberOfRecommendations = 4;
        let recommendedProperties = [];

        // Filter out properties that are in the cart or favorites
        const filterOut = [...this.cart, ...this.favorites].map(p => p.id);
        let availableProperties = this.properties.filter(p => !filterOut.includes(p.id));

        if (this.favorites.length === 0) {
            // No favorites, show random properties from available
            recommendedProperties = [...availableProperties].sort(() => 0.5 - Math.random()).slice(0, numberOfRecommendations);
        } else {
            const lastFavorite = this.favorites[this.favorites.length - 1];
            const favoriteLocation = lastFavorite.location.split(',')[1]?.trim();
            const favoriteType = lastFavorite.title.split(" in ")[0].split(" ").slice(-1)[0];

            let potentialRecommendations = availableProperties.filter(p => {
                const isInSameLocation = favoriteLocation && p.location.includes(favoriteLocation);
                const isSameType = p.title.includes(favoriteType);
                return (isInSameLocation || isSameType) && p.id !== lastFavorite.id;
            });

            // Shuffle potential recommendations
            potentialRecommendations.sort(() => 0.5 - Math.random());

            // If not enough recommendations, fill with random available properties
            if (potentialRecommendations.length < numberOfRecommendations) {
                const randomProperties = availableProperties.filter(p =>
                    !potentialRecommendations.some(rec => rec.id === p.id)
                ).sort(() => 0.5 - Math.random());
                potentialRecommendations.push(...randomProperties);
            }

            recommendedProperties = potentialRecommendations.slice(0, numberOfRecommendations);
        }
        return recommendedProperties;
    }

    renderRecommendations() {
        const recommendations = this.getRecommendations();
        this.renderProperties(recommendations, "#recommended-property-grid");
    }

    // Property Management

    startVirtualTour(propertyId) {
        this.closeModal();
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;

        const propertyType = property.title.split(" in ")[0].split(" ").slice(-1)[0];
        let tourImages = this.properties
            .filter(p => p.title.includes(propertyType))
            .map(p => ({ image: p.image, description: p.title }));

        if (tourImages.length === 0) {
            tourImages.push({ image: property.image, description: property.title });
        }

        let currentImageIndex = tourImages.findIndex(p => p.image === property.image);
        if (currentImageIndex === -1) currentImageIndex = 0;

        const tourModalContent = `
            <div class="virtual-tour-modal">
                <button class="cart-close" style="position: absolute; top: 2rem; right: 2rem; font-size: 2rem; color: white;" onclick="app.closeModal()">&times;</button>
                <div class="virtual-tour-image-container">
                    <img src="${tourImages[currentImageIndex].image}" id="virtual-tour-image" style="max-width: 80vw; max-height: 70vh; object-fit: contain;">
                    <button class="virtual-tour-nav prev" id="vt-prev" style="position: absolute; top: 50%; left: 1rem; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; font-size: 2rem; padding: 1rem; cursor: pointer;">&lt;</button>
                    <button class="virtual-tour-nav next" id="vt-next" style="position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; font-size: 2rem; padding: 1rem; cursor: pointer;">&gt;</button>
                </div>
                <div id="virtual-tour-caption" style="margin-top: 1rem; font-size: 1.25rem;">${tourImages[currentImageIndex].description}</div>
            </div>
        `;

        const modal = this.createModal("", tourModalContent, "");
        this.showModal(modal);

        const updateTourImage = () => {
            document.getElementById("virtual-tour-image").src = tourImages[currentImageIndex].image;
            document.getElementById("virtual-tour-caption").textContent = tourImages[currentImageIndex].description;
        };

        document.getElementById("vt-prev").addEventListener("click", () => {
            currentImageIndex = (currentImageIndex - 1 + tourImages.length) % tourImages.length;
            updateTourImage();
        });

        document.getElementById("vt-next").addEventListener("click", () => {
            currentImageIndex = (currentImageIndex + 1) % tourImages.length;
            updateTourImage();
        });
    }

    toggleMortgageCalculator() {
        const container = document.getElementById("mortgage-calculator-container");
        if (container) {
            container.style.display = container.style.display === "none" ? "block" : "none";
        }
    }

    calculateMortgage() {
        const price = parseFloat(document.getElementById("mc-price").value);
        const downPaymentPercent = parseFloat(document.getElementById("mc-down-payment").value);
        const interestRate = parseFloat(document.getElementById("mc-interest-rate").value);
        const loanTermYears = parseFloat(document.getElementById("mc-loan-term").value);
        const resultDiv = document.getElementById("mc-result");

        if (isNaN(price) || isNaN(downPaymentPercent) || isNaN(interestRate) || isNaN(loanTermYears)) {
            resultDiv.textContent = "Please enter valid numbers.";
            resultDiv.style.color = "#ef4444";
            return;
        }

        const downPaymentAmount = price * (downPaymentPercent / 100);
        const principal = price - downPaymentAmount;
        const monthlyInterestRate = (interestRate / 100) / 12;
        const numberOfPayments = loanTermYears * 12;

        if (monthlyInterestRate === 0) { // Handle zero interest case
            const monthlyPayment = principal / numberOfPayments;
            resultDiv.textContent = `Estimated Monthly Payment: Ksh ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultDiv.style.color = "var(--primary-color)";
            return;
        }

        const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
        const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
        const monthlyPayment = principal * (numerator / denominator);

        if (isFinite(monthlyPayment)) {
            resultDiv.textContent = `Estimated Monthly Payment: Ksh ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            resultDiv.style.color = "var(--primary-color)";
        } else {
            resultDiv.textContent = "Could not calculate. Please check your inputs.";
            resultDiv.style.color = "#ef4444";
        }
    }

    loadProperties() {
        // Professional property data with real images
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
                image: "images/villa1.jpg",
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
                image: "images/apartment1.jpg",
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
                image: "images/beach1.jpg",
                features: ["Beach Access", "Ocean View", "Infinity Pool", "Private"]
            },
            {
                id: "prop4",
                title: "Executive Townhouse in Karen",
                location: "Karen, Nairobi",
                price: "Ksh 45,000,000",
                bedrooms: 4,
                bathrooms: 3,
                area: "320m²",
                description: "Elegant 4-bedroom townhouse in exclusive Karen neighborhood with modern amenities and spacious compound.",
                image: "images/townhouse1.jpg",
                features: ["Gated Community", "Modern Kitchen", "Garden", "Double Garage"]
            },
            {
                id: "prop5",
                title: "Luxury Penthouse in Kilimani",
                location: "Kilimani, Nairobi",
                price: "Ksh 35,000,000",
                bedrooms: 3,
                bathrooms: 2,
                area: "250m²",
                description: "Sophisticated penthouse with panoramic city views, premium finishes, and exclusive rooftop terrace.",
                image: "images/apartment2.jpg",
                features: ["Panoramic Views", "Rooftop Terrace", "Premium Finishes", "Concierge"]
            },
            {
                id: "prop6",
                title: "Contemporary Villa in Runda",
                location: "Runda, Nairobi",
                price: "Ksh 95,000,000",
                bedrooms: 6,
                bathrooms: 5,
                area: "520m²",
                description: "Magnificent 6-bedroom villa with state-of-the-art architecture, home theater, and wine cellar.",
                image: "images/villa2.jpg",
                features: ["Home Theater", "Wine Cellar", "Smart Home", "Staff Quarters"]
            },
            {
                id: "prop7",
                title: "Oceanfront Resort Villa in Malindi",
                location: "Malindi, Kilifi",
                price: "Ksh 150,000,000",
                bedrooms: 5,
                bathrooms: 4,
                area: "480m²",
                description: "Exclusive oceanfront villa with private beach, tropical gardens, and resort-style amenities.",
                image: "images/beach2.jpg",
                features: ["Private Beach", "Tropical Gardens", "Resort Amenities", "Ocean Views"]
            },
            {
                id: "prop8",
                title: "Modern Apartment in Kileleshwa",
                location: "Kileleshwa, Nairobi",
                price: "Ksh 22,000,000",
                bedrooms: 3,
                bathrooms: 2,
                area: "200m²",
                description: "Stylish 3-bedroom apartment with modern design, balcony views, and premium location access.",
                image: "images/apartment3.jpg",
                features: ["Balcony Views", "Modern Design", "Secure Parking", "Backup Generator"]
            },
            {
                id: "prop9",
                title: "Luxury Beachfront Estate in Watamu",
                location: "Watamu, Kilifi",
                price: "Ksh 200,000,000",
                bedrooms: 7,
                bathrooms: 6,
                area: "650m²",
                description: "Spectacular beachfront estate with multiple pavilions, infinity pool, and direct ocean access.",
                image: "images/beach3.jpg",
                features: ["Multiple Pavilions", "Infinity Pool", "Direct Ocean Access", "Staff Accommodation"]
            },
            {
                id: "prop10",
                title: "Executive Townhouse in Lavington",
                location: "Lavington, Nairobi",
                price: "Ksh 38,000,000",
                bedrooms: 4,
                bathrooms: 3,
                area: "280m²",
                description: "Premium townhouse in sought-after Lavington with contemporary finishes and private garden.",
                image: "images/townhouse2.jpg",
                features: ["Contemporary Finishes", "Private Garden", "Study Room", "Servant Quarter"]
            },
            {
                id: "prop11",
                title: "Architectural Masterpiece in Gigiri",
                location: "Gigiri, Nairobi",
                price: "Ksh 180,000,000",
                bedrooms: 5,
                bathrooms: 4,
                area: "600m²",
                description: "Award-winning architectural design with cutting-edge technology and sustainable features.",
                image: "images/villa3.jpg",
                features: ["Award-Winning Design", "Sustainable Features", "Smart Technology", "Art Gallery"]
            },
            {
                id: "prop12",
                title: "Luxury High-Rise Apartment",
                location: "Upper Hill, Nairobi",
                price: "Ksh 28,000,000",
                bedrooms: 2,
                bathrooms: 2,
                area: "160m²",
                description: "Premium 2-bedroom apartment in iconic high-rise with world-class amenities and city views.",
                image: "images/apartment4.jpg",
                features: ["World-Class Amenities", "City Views", "High-Rise Living", "Concierge Service"]
            },
            {
                id: "prop13",
                title: "Coastal Paradise Villa in Kilifi",
                location: "Kilifi, Coast",
                price: "Ksh 110,000,000",
                bedrooms: 4,
                bathrooms: 3,
                area: "420m²",
                description: "Tranquil coastal villa with traditional Swahili architecture and modern luxury amenities.",
                image: "images/beach4.jpg",
                features: ["Swahili Architecture", "Coastal Views", "Traditional Design", "Modern Luxury"]
            },
            {
                id: "prop14",
                title: "Contemporary Estate in Spring Valley",
                location: "Spring Valley, Nairobi",
                price: "Ksh 75,000,000",
                bedrooms: 5,
                bathrooms: 4,
                area: "450m²",
                description: "Elegant estate home with landscaped gardens, entertainment areas, and premium security.",
                image: "images/villa4.jpg",
                features: ["Landscaped Gardens", "Entertainment Areas", "Premium Security", "Guest Wing"]
            },
            {
                id: "prop15",
                title: "Exclusive Beachfront Retreat",
                location: "Msambweni, Kwale",
                price: "Ksh 135,000,000",
                bedrooms: 6,
                bathrooms: 5,
                area: "550m²",
                description: "Private beachfront retreat with multiple living areas, spa facilities, and pristine beach access.",
                image: "images/beach5.jpg",
                features: ["Multiple Living Areas", "Spa Facilities", "Pristine Beach", "Private Retreat"]
            }
        ];
    }

    renderProperties(propertiesToRender = this.properties, targetSelector = ".property-grid") {
        const propertyGrid = document.querySelector(targetSelector);
        if (!propertyGrid) return;

        const spinner = propertyGrid.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }

        propertyGrid.innerHTML = ""; // Clear existing properties

        propertiesToRender.forEach((property, index) => {
            const card = document.createElement("div");
            card.className = "property-card";
            card.style.setProperty('--animation-order', index);

            const propertyIndex = this.properties.findIndex(p => p.id === property.id);

            const imageDiv = document.createElement('div');
            imageDiv.className = 'property-image';
            imageDiv.style.backgroundImage = `url('${property.image}')`;
            imageDiv.style.backgroundSize = 'cover';
            imageDiv.style.backgroundPosition = 'center';
            imageDiv.innerHTML = '<span class="badge">For Sale</span>';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'property-content';

            contentDiv.innerHTML = `
                <h3>${property.title}</h3>
                <p class="location">${property.location}</p>
                <p class="description">${property.description}</p>
                <div class="features">
                    <div class="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10H2V8z"/><path d="M12 4h4"/>
                        </svg>
                        <span>${property.bedrooms}</span>
                    </div>
                    <div class="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 6v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H11a2 2 0 0 0-2 2Z"/><path d="M3 15h6"/><path d="M11 15h2"/><path d="M13 15h2"/><path d="M15 15h2"/>
                        </svg>
                        <span>${property.bathrooms}</span>
                    </div>
                    <div class="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.4 2.4a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.4-2.4a2.41 2.41 0 0 1 3.4 0Z"/><path d="m7.5 12.5 4.5 4.5"/><path d="m12.5 7.5 4.5 4.5"/><path d="m16.5 3.5 4 4"/>
                        </svg>
                        <span>${property.area}</span>
                    </div>
                </div>
                <p class="price">${property.price}</p>
            `;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'property-actions';

            const addToCartBtn = document.createElement('button');
            addToCartBtn.className = 'button button-primary';
            addToCartBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart';
            addToCartBtn.addEventListener('click', () => this.addToCart(this.properties[propertyIndex]));

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'button button-secondary favorite-btn';
            favoriteBtn.dataset.propertyId = property.id;
            favoriteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            favoriteBtn.addEventListener('click', () => this.toggleFavorite(this.properties[propertyIndex]));

            const viewDetailsBtn = document.createElement('button');
            viewDetailsBtn.className = 'button button-secondary';
            viewDetailsBtn.textContent = 'View Details';
            viewDetailsBtn.addEventListener('click', () => this.viewPropertyDetails(this.properties[propertyIndex]));

            const compareBtn = document.createElement('button');
            compareBtn.className = 'button button-secondary compare-btn';
            compareBtn.dataset.propertyId = property.id;
            compareBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
            compareBtn.addEventListener('click', () => this.toggleComparison(this.properties[propertyIndex]));

            actionsDiv.append(addToCartBtn, favoriteBtn, viewDetailsBtn, compareBtn);
            contentDiv.appendChild(actionsDiv);
            card.append(imageDiv, contentDiv);
            propertyGrid.appendChild(card);
        });

        this.updateFavoriteButtons();
        this.updateCompareButtons();
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

            <div id="mortgage-calculator-container" style="display: none; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <h4 style="margin-bottom: 1rem;">Mortgage Calculator</h4>
                <div class="form-group">
                    <label class="form-label">Property Price (Ksh)</label>
                    <input type="number" id="mc-price" class="form-input" value="${parseInt(property.price.replace(/[^\d]/g, ""))}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Down Payment (%)</label>
                    <input type="number" id="mc-down-payment" class="form-input" value="20">
                </div>
                <div class="form-group">
                    <label class="form-label">Interest Rate (%)</label>
                    <input type="number" id="mc-interest-rate" class="form-input" value="12.5" step="0.1">
                </div>
                <div class="form-group">
                    <label class="form-label">Loan Term (Years)</label>
                    <input type="number" id="mc-loan-term" class="form-input" value="20">
                </div>
                <button class="button button-primary" onclick="app.calculateMortgage()">Calculate</button>
                <div id="mc-result" style="margin-top: 1rem; font-size: 1.25rem; font-weight: 600;"></div>
            </div>
        `, `
            <button class="button button-secondary" onclick="app.showBookingForm('${property.id}')">Book a Viewing</button>
            <button class="button button-secondary" onclick="app.startVirtualTour('${property.id}')">Virtual Tour</button>
            <button class="button button-secondary" onclick="app.toggleMortgageCalculator()">Mortgage Calculator</button>
            <button class="button button-secondary" onclick="app.closeModal()">Close</button>
            <button class="button button-primary" onclick="app.addToCart(app.properties.find(p => p.id === '${property.id}')); app.closeModal();">Add to Cart</button>
        `);
        
        this.showModal(modal);
    }

    showBookingForm(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;

        const bookingModalContent = `
            <p>You are booking a viewing for:</p>
            <h4 style="margin: 0.5rem 0 1.5rem;">${property.title}</h4>
            <form id="booking-form">
                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Your Email</label>
                    <input type="email" class="form-input" name="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Preferred Date</label>
                    <input type="date" class="form-input" name="date" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Preferred Time</label>
                    <input type="time" class="form-input" name="time" required>
                </div>
            </form>
        `;

        const bookingModalFooter = `
            <button class="button button-secondary" onclick="app.closeModal()">Cancel</button>
            <button class="button button-primary" onclick="app.submitBooking('${property.id}')">Submit Request</button>
        `;

        const modal = this.createModal("Book a Viewing", bookingModalContent, bookingModalFooter);
        this.showModal(modal);
    }

    submitBooking(propertyId) {
        const form = document.getElementById("booking-form");
        if (form.checkValidity()) {
            const formData = new FormData(form);
            const name = formData.get("name");
            const email = formData.get("email");
            const date = formData.get("date");
            const time = formData.get("time");
            console.log(`Booking submitted for property ${propertyId} by ${name} (${email}) for ${date} at ${time}`);
            this.closeModal();
            this.showNotification("Your viewing request has been submitted!", "success");
        } else {
            this.showNotification("Please fill out all fields correctly.", "error");
        }
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

    // Checkout Process
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification("Your cart is empty. Add some properties first!", "error");
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
                <label for="customer-name" class="form-label">Full Name</label>
                <input type="text" id="customer-name" class="form-input" placeholder="Enter your full name" required>
            </div>
            <div class="form-group">
                <label for="customer-email" class="form-label">Email Address</label>
                <input type="email" id="customer-email" class="form-input" placeholder="Enter your email" required>
            </div>
            <div class="form-group">
                <label for="customer-phone" class="form-label">Phone Number</label>
                <input type="tel" id="customer-phone" class="form-input" placeholder="Enter your phone number" required>
            </div>
            
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
                    <p>Send money to M-Pesa Paybill: <strong>123456</strong> Account No: <strong>KENYAREALTY</strong></p>
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
        // Validate customer information
        const customerName = document.getElementById("customer-name")?.value;
        const customerEmail = document.getElementById("customer-email")?.value;
        const customerPhone = document.getElementById("customer-phone")?.value;
        const paymentMethod = document.getElementById("payment-method")?.value;

        if (!customerName || !customerEmail || !customerPhone) {
            this.showNotification("Please fill in all customer information fields.", "error");
            return;
        }

        // Validate payment method specific fields
        if (paymentMethod === "mpesa") {
            const mpesaCode = document.getElementById("mpesa-code")?.value;
            if (!mpesaCode) {
                this.showNotification("Please enter M-Pesa confirmation code.", "error");
                return;
            }
        } else if (paymentMethod === "card") {
            const cardNumber = document.getElementById("card-number")?.value;
            const expiryDate = document.getElementById("expiry-date")?.value;
            const cvv = document.getElementById("cvv")?.value;
            if (!cardNumber || !expiryDate || !cvv) {
                this.showNotification("Please fill in all card details.", "error");
                return;
            }
        }

        // Calculate total amount
        const totalAmount = this.cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ""));
            return sum + price;
        }, 0);

        // Create order summary
        const orderSummary = {
            orderId: `ORD-${Date.now()}`,
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            items: this.cart,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            orderDate: new Date().toISOString(),
            status: "Confirmed"
        };

        // Store order in localStorage (in real app, this would go to backend)
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push(orderSummary);
        localStorage.setItem("orders", JSON.stringify(orders));

        // Show success message with order details
        this.showNotification(`Order ${orderSummary.orderId} completed successfully! Total: Ksh ${totalAmount.toLocaleString()}`, "success");
        
        // Clear cart after purchase
        this.cart = [];
        localStorage.setItem("cart", JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        this.closeModal();

        // Send confirmation email (mock)
        console.log("Order confirmation sent to:", customerEmail);
        console.log("Order details:", orderSummary);
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

var app;
// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    app = new RealEstateApp();
    app.init();
});
