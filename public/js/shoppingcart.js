let discountCode = null;
let discountAmount = 0;
let discountType = null;
let discountApplicable = "all";
let couponsVisible = false;

//yes
let cartData = [];
let allCOUPONS = [];
let COUPONS = [];
let amount = {
  all:0,
  buy:0,
  rent:0,
  refurbish:0
};

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
function updateQuantity(intent,id,variant,color, change, btn,startdate=-1,enddate=-1,stock=-1,price) {
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
      //qty.textContent = data.quantity;
      total.textContent = `Total: ${formatPrice(Number(data.quantity) * price)}`;

      const item = cartData.find(i => String(i.id) === String(id));
      if (item) item.quantity = Number(data.quantity);

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
        const idx = cartData.findIndex(i => String(i.id) === String(id));
        if (idx > -1) cartData.splice(idx, 1);
        renderCart();
      }, 380);
    }
  })

}
//yes
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


function useCoupon(c) {
  const input = document.getElementById('promoInput');
  input.value = c.code;
  applyCoupon();
  toggleCouponsPanel();
}

function applyCoupon() {
  const input = document.getElementById('promoInput');
  const code = input.value.toUpperCase().trim();
  if (!code) return;
  const c= COUPONS.find(coupon => coupon.code === code);
  if (c) {
    discountCode = c.code;
    discountAmount = c.discount.value;
    discountType = c.discount.type;
    discountApplicable = c.validity_check.applicable_category;
    input.style.borderColor = 'var(--primary-orange)';
    input.style.background = 'rgba(255,107,53,.15)';
    input.placeholder = 'Coupon applied! ✓';
    input.value = '';
    const r = input.getBoundingClientRect();
    createParticles(r.right - 20, r.top + r.height / 2);
    pulseElement(document.querySelector('.summary-card'));
    console.log(discountCode+" "+discountAmount)
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
  discountAmount = 0;
  discountAmount = null;
  discountApplicable = "all";

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
