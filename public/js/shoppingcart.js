// // Cart Data
// const cartData = [
//     {
//         id: 1,
//         name: 'iPhone 15 Pro Max',
//         category: 'Smartphone',
//         condition: 'Certified Refurbished',
//         price: 79999,
//         quantity: 1,
//         emoji: '📱'
//     },
//     {
//         id: 2,
//         name: 'MacBook Air M3',
//         category: 'Laptop',
//         condition: 'Like New',
//         price: 114999,
//         quantity: 1,
//         emoji: '💻'
//     },
//     {
//         id: 3,
//         name: 'AirPods Pro',
//         category: 'Accessories',
//         condition: 'Certified Refurbished',
//         price: 16999,
//         quantity: 2,
//         emoji: '🎧'
//     }
// ];

// Format price in Indian Rupees
function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// Create particle effects
function createParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = 'var(--primary-orange)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.boxShadow = '0 0 10px var(--primary-orange)';
        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 6;
        const velocity = {
            x: Math.cos(angle) * (3 + Math.random() * 2),
            y: Math.sin(angle) * (3 + Math.random() * 2)
        };

        let opacity = 1;
        const animate = () => {
            x += velocity.x;
            y += velocity.y;
            opacity -= 0.02;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        animate();
    }
}

// Pulse element animation
function pulseElement(element) {
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'pulse 0.6s ease-out';
    }, 10);
}

// Add dynamic animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes pulse {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes pop {
        0% {
            opacity: 0;
            transform: scale(0.5) rotateZ(-10deg);
        }
        50% {
            transform: scale(1.1) rotateZ(5deg);
        }
        100% {
            opacity: 1;
            transform: scale(1) rotateZ(0deg);
        }
    }

    .cart-item.removing {
        animation: slideInRight 0.4s ease-out reverse;
    }

    .discount-badge {
        display: inline-block;
        background: linear-gradient(135deg, var(--primary-orange), var(--accent-orange));
        color: white;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        animation: pop 0.5s ease-out;
    }

    .savings-alert {
        background: rgba(255, 107, 53, 0.15);
        border: 1px solid rgba(255, 107, 53, 0.4);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        animation: slideInRight 0.5s ease-out;
    }

    .savings-text {
        color: var(--primary-orange);
        font-weight: 700;
        font-size: 0.95rem;
    }
`;
document.head.appendChild(style);

// Render cart items
// function renderCart() {
//     const cartItemsContainer = document.getElementById('cartItems');
//     cartItemsContainer.innerHTML = '';

//     if (cartData.length === 0) {
//         cartItemsContainer.innerHTML = `
//             <div class="empty-cart">
//                 <div class="empty-cart-icon" style="animation: pop 0.6s ease-out;">🛒</div>
//                 <div class="empty-cart-text">Your cart is empty</div>
//                 <div class="empty-cart-subtext">Start adding some refurbished tech to get started</div>
//                 <button class="checkout-btn" style="margin: 0 auto;">CONTINUE SHOPPING</button>
//             </div>
//         `;
//         updateSummary();
//         return;
//     }

//     cartData.forEach((item, index) => {
//         const itemTotal = item.price * item.quantity;
//         const cartItem = document.createElement('div');
//         cartItem.className = 'cart-item';
//         cartItem.setAttribute('data-item-id', item.id);
//         cartItem.style.animation = `slideInRight 0.5s ease-out ${index * 0.1}s both`;
        
//         cartItem.innerHTML = `
//             <div class="item-image" style="cursor: pointer; transition: all 0.3s ease;" 
//                  onmouseenter="this.style.transform='scale(1.1) rotateZ(-5deg)'; this.style.filter='brightness(1.2) drop-shadow(0 0 15px var(--primary-orange))'" 
//                  onmouseleave="this.style.transform='scale(1) rotateZ(0)'; this.style.filter='brightness(1)'">${item.emoji}</div>
//             <div class="item-details">
//                 <div class="item-name">${item.name}</div>
//                 <div class="item-meta">
//                     <span>${item.category}</span>
//                     <span>${item.condition}</span>
//                 </div>
//                 <div class="item-controls">
//                     <button class="qty-btn" data-item-id="${item.id}" onclick="updateQuantity(${item.id}, -1, this)">−</button>
//                     <div class="qty-display">${item.quantity}</div>
//                     <button class="qty-btn" data-item-id="${item.id}" onclick="updateQuantity(${item.id}, 1, this)">+</button>
//                 </div>
//             </div>
//             <div class="item-price-section">
//                 <div class="item-price">${formatPrice(item.price)}</div>
//                 <div class="item-total">Total: ${formatPrice(itemTotal)}</div>
//                 <button class="remove-btn" onclick="removeItem(${item.id})">REMOVE</button>
//             </div>
//         `;
//         cartItemsContainer.appendChild(cartItem);
//     });

//     updateSummary();
// }

// Update quantity
function updateQuantity(id, change, btn) {
    const item = cartData.find(i => i.id === id);
    if (item) {
        const oldQty = item.quantity;
        item.quantity += change;
        if (item.quantity < 1) item.quantity = 1;
        
        if (item.quantity !== oldQty) {
            // Pulse animation
            pulseElement(btn);
            
            // Particles on increase
            if (change > 0) {
                const rect = btn.getBoundingClientRect();
                createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
            
            // Smooth update instead of full rerender
            const cartItem = document.querySelector(`[data-item-id="${id}"]`);
            const qtyDisplay = cartItem.querySelector('.qty-display');
            const itemTotal = cartItem.querySelector('.item-total');
            
            qtyDisplay.textContent = item.quantity;
            itemTotal.textContent = `Total: ${formatPrice(item.price * item.quantity)}`;
            
            pulseElement(cartItem);
            updateSummary();
        }
    }
}

// Remove item
// function removeItem(id) {
//     const cartItem = document.querySelector(`[data-item-id="${id}"]`);
//     cartItem.classList.add('removing');
    
//     // Particles effect on remove
//     const rect = cartItem.getBoundingClientRect();
//     createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    
//     setTimeout(() => {
//         const index = cartData.findIndex(i => i.id === id);
//         if (index > -1) {
//             cartData.splice(index, 1);
//             renderCart();
//         }
//     }, 400);
// }

// Update summary totals
// function updateSummary() {
//     const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const discount = subtotal * (discountPercent / 100);
//     const afterDiscount = subtotal - discount;
//     const shipping = afterDiscount > 0 ? (afterDiscount > 100000 ? 0 : 99) : 0;
//     const tax = afterDiscount * 0.18;
//     const total = afterDiscount + shipping + tax;

//     const subtotalEl = document.getElementById('subtotal');
//     const shippingEl = document.getElementById('shipping');
//     const taxEl = document.getElementById('tax');
//     const totalEl = document.getElementById('total');

//     // Animate number changes
//     animateValue(subtotalEl, subtotal);
//     animateValue(taxEl, tax);
//     animateValue(totalEl, total);

//     shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

//     // Show/hide savings alert
//     const savingsContainer = document.getElementById('savingsContainer');
//     if (discountCode) {
//         const savings = discount;
//         let savingsHtml = `
//             <div class="savings-alert">
//                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
//                     <span class="savings-text">🎉 ${discountCode} Applied!</span>
//                     <button onclick="removeCoupon()" style="background: transparent; border: none; color: var(--primary-orange); cursor: pointer; font-size: 1.2rem;">×</button>
//                 </div>
//                 <div class="savings-text">You Save: ${formatPrice(savings)}</div>
//             </div>
//         `;
        
//         if (savingsContainer) {
//             savingsContainer.innerHTML = savingsHtml;
//         } else {
//             const container = document.createElement('div');
//             container.id = 'savingsContainer';
//             document.querySelector('.summary-card').appendChild(container);
//             container.innerHTML = savingsHtml;
//         }
//     } else if (savingsContainer) {
//         savingsContainer.remove();
//     }
// }

// Animate value changes
function animateValue(element, targetValue) {
    const formattedValue = formatPrice(Math.round(targetValue));
    element.textContent = formattedValue;
    pulseElement(element);
}

// Apply coupon code
// function applyCoupon() {
//     const input = document.getElementById('promoInput');
//     const code = input.value.toUpperCase().trim();
    
//     if (!code) return;

//     const coupons = {
//         'SAVE10': 10,
//         'SAVE15': 15,
//         'TECH20': 20,
//         'REFURB5': 5,
//         'WELCOME25': 25
//     };

//     if (coupons[code]) {
//         discountCode = code;
//         discountPercent = coupons[code];
//         input.style.borderColor = 'var(--primary-orange)';
//         input.style.background = 'rgba(255, 107, 53, 0.2)';
        
//         // Success animation
//         const summaryCard = document.querySelector('.summary-card');
//         pulseElement(summaryCard);
        
//         // Particles
//         const rect = input.getBoundingClientRect();
//         createParticles(rect.right - 20, rect.top + rect.height / 2);
        
//         input.placeholder = 'Coupon applied!';
//         input.value = '';
//         updateSummary();

//         // Shake effect
//         input.style.animation = 'none';
//         setTimeout(() => {
//             input.style.animation = 'shake 0.3s ease-out';
//         }, 10);
//     } else {
//         input.style.borderColor = '#ff4444';
//         input.style.animation = 'none';
//         setTimeout(() => {
//             input.style.animation = 'shake 0.3s ease-out';
//         }, 10);
        
//         setTimeout(() => {
//             input.style.borderColor = 'rgba(255, 107, 53, 0.3)';
//         }, 500);
//     }
// }

// Remove coupon
// function removeCoupon() {
//     discountCode = null;
//     discountPercent = 0;
//     document.getElementById('promoInput').style.borderColor = 'rgba(255, 107, 53, 0.3)';
//     document.getElementById('promoInput').style.background = 'rgba(0, 0, 0, 0.3)';
//     document.getElementById('promoInput').placeholder = 'SAVE10, SAVE15, TECH20...';
//     updateSummary();
// }

// Event Listeners
document.getElementById('promoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyCoupon();
    }
});

// Checkout button animation
document.querySelector('.checkout-btn').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    pulseElement(this);
    this.textContent = '🚀 PROCESSING...';
    this.disabled = true;
    
    setTimeout(() => {
        this.textContent = '✓ ORDER CONFIRMED';
        this.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
    }, 800);
});

// Continue shopping button hover
document.querySelector('.continue-shopping').addEventListener('mouseenter', function() {
    this.style.transform = 'translateX(5px)';
});

document.querySelector('.continue-shopping').addEventListener('mouseleave', function() {
    this.style.transform = 'translateX(0)';
});

// Initialize cart
// renderCart();