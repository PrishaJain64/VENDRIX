const COUPONS = {
  SAVE10:    { percent: 10, description: 'Flat 10% off on all products', minOrder: 0 },
  SAVE15:    { percent: 15, description: 'Flat 15% off on your order', minOrder: 5000 },
  TECH20:    { percent: 20, description: '20% off on all tech purchases', minOrder: 10000 },
  REFURB5:   { percent: 5,  description: 'Extra 5% off on refurbished items', minOrder: 0 },
  WELCOME25: { percent: 25, description: '25% off for new customers', minOrder: 20000 },
};

let discountCode = null;
let discountPercent = 0;
let couponsVisible = false;
let cartData = [];

//yes
const TYPE_CONFIG = {
  buy:       { label: 'Buy',       bg: 'rgba(100,180,255,0.13)', border: 'rgba(100,180,255,0.35)', color: '#7ec8f7', icon: '🛒' },
  refurbish: { label: 'Refurbish', bg: 'rgba(100,220,140,0.13)', border: 'rgba(100,220,140,0.35)', color: '#7de5a0', icon: '♻️' },
  rent:      { label: 'Rent',      bg: 'rgba(255,160,180,0.13)', border: 'rgba(255,160,180,0.35)', color: '#ffaabf', icon: '🔑' },
};

//yes
function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

//yes
function createParticles(x, y) {
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:8px;background:var(--primary-orange);border-radius:50%;pointer-events:none;z-index:9999;box-shadow:0 0 10px var(--primary-orange);`;
    document.body.appendChild(d);
    const angle = (Math.PI * 2 * i) / 6;
    let px = x, py = y, op = 1;
    const vx = Math.cos(angle) * (3 + Math.random() * 2);
    const vy = Math.sin(angle) * (3 + Math.random() * 2);
    const anim = () => {
      px += vx; py += vy; op -= 0.03;
      d.style.left = px + 'px'; d.style.top = py + 'px'; d.style.opacity = op;
      if (op > 0) requestAnimationFrame(anim); else d.remove();
    };
    anim();
  }
}

//yes
function pulseElement(el) {
  el.style.animation = 'none';
  setTimeout(() => { el.style.animation = 'pulse 0.6s ease-out'; }, 10);
}

//yes
function animateValue(el, val) {
  el.textContent = formatPrice(Math.round(val));
  pulseElement(el);
}

//yes
function updateQuantity(intent,id,variant,color, change, btn,startdate=-1,enddate=-1,stock=-1,price,idx,otherbtn) {
  console.log("hi");
  const parent = btn.closest(".item-controls"); // go up to parent div
  const qty = parent.querySelector(".qty-display");  // find qty inside it
  
  const priceparent = btn.closest(".cart-item");
  const total = priceparent.querySelector(".item-total");

  const formdata = new FormData();
  formdata.append("quantity",Number(qty.textContent)+change);
  if(startdate != -1 && enddate !=-1){
  formdata.append("startdate",startdate);
  formdata.append("enddate",enddate);
  }

  fetch(`/vendrix/cart/${intent}/${id}/${encodeURIComponent(variant)}/${encodeURIComponent(color)}`,{
    method:"post",
    body:formdata
  }).then(res=>res.json())
  .then(data=>{
    if(data.valid){
      qty.textContent = data.quantity;
      total.textContent = formatPrice(Number(data.quantity)*price);
      cartData[idx].quantity = Number(data.quantity);
      const r = btn.getBoundingClientRect();
      createParticles(r.left + r.width / 2, r.top + r.height / 2);
      updateSummary();
    }else{console.log("fetching error")};
  })
}

//yes
function removeItem(intent,id,variant,color,idx) {
    fetch(`/vendrix/delete/${intent}/${id}/${encodeURIComponent(variant)}/${color}`,{
      method:"DELETE"
    }).then(res=>res.json()).then(data=>{
      if(data.valid){
      const el = document.querySelector(`[data-item-id="${id}"]`);
      el.style.transition = 'all .35s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      const r = el.getBoundingClientRect();
      createParticles(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(() => {
        cartData.splice(idx, 1);
        renderCart();
      }, 380);
    }
  })

}

function toggleCouponsPanel() {
  couponsVisible = !couponsVisible;
  const panel = document.getElementById('couponsPanel');
  const btn = document.querySelector('.view-coupons-btn');
  if (couponsVisible) {
    renderCouponCards();
    panel.classList.add('open');
    btn.textContent = 'Hide';
  } else {
    panel.classList.remove('open');
    btn.textContent = 'View Available';
  }
}

function renderCouponCards() {
  const list = document.getElementById('couponCardList');
  list.innerHTML = '';
  Object.entries(COUPONS).forEach(([code, info]) => {
    const card = document.createElement('div');
    card.className = 'coupon-card';
    card.innerHTML = `
      <div class="coupon-card-left">
        <div class="coupon-code-badge">${code}</div>
        <div class="coupon-desc">${info.description}</div>
        ${info.minOrder > 0 ? `<div class="coupon-min">Min. order: ${formatPrice(info.minOrder)}</div>` : ''}
      </div>
      <div class="coupon-card-right">
        <div class="coupon-off">${info.percent}%<br/><span>OFF</span></div>
        <button class="coupon-use-btn" onclick="useCoupon('${code}')">Use</button>
      </div>`;
    list.appendChild(card);
  });
}

function useCoupon(code) {
  const input = document.getElementById('promoInput');
  input.value = code;
  applyCoupon();
  toggleCouponsPanel();
}

function applyCoupon() {
  const input = document.getElementById('promoInput');
  const code = input.value.toUpperCase().trim();
  if (!code) return;
  if (COUPONS[code]) {
    discountCode = code;
    discountPercent = COUPONS[code].percent;
    input.style.borderColor = 'var(--primary-orange)';
    input.style.background = 'rgba(255,107,53,.15)';
    input.placeholder = 'Coupon applied! ✓';
    input.value = '';
    const r = input.getBoundingClientRect();
    createParticles(r.right - 20, r.top + r.height / 2);
    pulseElement(document.querySelector('.summary-card'));
    updateSummary();
  } else {
    input.style.borderColor = '#ff4444';
    input.style.animation = 'none';
    setTimeout(() => { input.style.animation = 'shake 0.35s ease-out'; }, 10);
    setTimeout(() => { input.style.borderColor = 'rgba(255,107,53,.3)'; }, 600);
  }
}

function removeCoupon() {
  discountCode = null;
  discountPercent = 0;
  const input = document.getElementById('promoInput');
  input.style.borderColor = 'rgba(255,107,53,.3)';
  input.style.background = 'rgba(0,0,0,.45)';
  input.placeholder = 'Enter coupon code...';
  updateSummary();
}

document.getElementById('promoInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') applyCoupon();
});

document.getElementById('checkoutBtn').addEventListener('click', function() {
  const r = this.getBoundingClientRect();
  createParticles(r.left + r.width / 2, r.top + r.height / 2);
  pulseElement(this);
  this.textContent = '🚀 PROCESSING...';
  this.disabled = true;
  setTimeout(() => {
    this.textContent = '✓ ORDER CONFIRMED';
    this.style.background = 'linear-gradient(135deg,#4CAF50,#66BB6A)';
  }, 800);
});

const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse { 0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,107,53,.7);}50%{transform:scale(1.03);box-shadow:0 0 0 10px rgba(255,107,53,0);}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,107,53,0);} }
  @keyframes shake { 0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);} }
`;
document.head.appendChild(style);

//renderCart();
