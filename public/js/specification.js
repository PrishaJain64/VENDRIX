
/* ═══════════════════════════════════════════════════
   PER-COLOR IMAGE DATA
   Each color key maps to an array of { src, alt }.


/* ═══════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════ */
const curDot  = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  curDot.style.left=mx+'px'; curDot.style.top=my+'px';
});
(function loop(){
  rx+=(mx-rx)*.11; ry+=(my-ry)*.11;
  curRing.style.left=rx+'px'; curRing.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
function attachHover(){
  document.querySelectorAll('a,button,.color-swatch,.variant-btn,.trust-it,.video-card,.thumb').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
  });
}
attachHover();

/* ═══════════════════════════════════════════════════
   NAVBAR SCROLL SHADOW
═══════════════════════════════════════════════════ */
window.addEventListener('scroll',()=>
  document.getElementById('navbar').classList.toggle('scrolled', scrollY>40),
  {passive:true}
);

// /* ═══════════════════════════════════════════════════
//    BOOTSTRAP CAROUSEL — BUILD & REBUILD PER COLOR
// ═══════════════════════════════════════════════════ */
// const bsIndicators = document.getElementById('bsIndicators');
// const bsInner      = document.getElementById('bsInner');
// const thumbStrip   = document.getElementById('thumbStrip');
// let bsCarousel     = null;   // Bootstrap Carousel instance

// function buildCarousel(colorKey) {
//   const slides = COLOR_SLIDES[colorKey] || [];

//   /* ── 1. Destroy existing Bootstrap instance ── */
//   if (bsCarousel) {
//     bsCarousel.dispose();
//     bsCarousel = null;
//   }

//   /* ── 2. Build Bootstrap indicators ── */
//   bsIndicators.innerHTML = '';
//   slides.forEach((_, i) => {
//     const btn = document.createElement('button');
//     btn.type = 'button';
//     btn.setAttribute('data-bs-target','#productCarousel');
//     btn.setAttribute('data-bs-slide-to', i);
//     btn.setAttribute('aria-label', `Slide ${i+1}`);
//     if (i === 0) { btn.classList.add('active'); btn.setAttribute('aria-current','true'); }
//     bsIndicators.appendChild(btn);
//   });

//   /* ── 3. Build Bootstrap carousel-inner slides ── */
//   bsInner.innerHTML = '';
//   slides.forEach((s, i) => {
//     const item = document.createElement('div');
//     item.className = 'carousel-item' + (i===0?' active':'');
//     const img = document.createElement('img');
//     img.src = s.src;
//     img.alt = s.alt;
//     img.draggable = false;
//     item.appendChild(img);
//     bsInner.appendChild(item);
//   });

//   /* ── 4. Build thumbnails ── */
//   thumbStrip.innerHTML = '';
//   slides.forEach((s, i) => {
//     const t = document.createElement('div');
//     t.className = 'thumb' + (i===0?' active':'');
//     t.dataset.slideIdx = i;
//     const img = document.createElement('img');
//     img.src = s.src; img.alt = s.alt; img.draggable = false;
//     t.appendChild(img);
//     // clicking a thumb tells Bootstrap to go to that slide
//     t.addEventListener('click', () => {
//       if (bsCarousel) bsCarousel.to(parseInt(t.dataset.slideIdx));
//     });
//     thumbStrip.appendChild(t);
//   });

//   /* ── 5. Re-init Bootstrap Carousel (no auto-ride, no keyboard conflict) ── */
//   bsCarousel = new bootstrap.Carousel(document.getElementById('productCarousel'), {
//     interval: false,
//     ride:     false,
//     wrap:     true,
//     keyboard: true,
//   });

//   /* ── 6. Update counter total ── */
//   document.getElementById('counterTotal').textContent = slides.length;
//   document.getElementById('counterCur').textContent   = 1;

//   /* ── 7. Re-attach cursor hover to new thumb elements ── */
//   attachHover();
// }

// /* ── Listen to Bootstrap's slide event → sync counter + thumbs ── */
// document.getElementById('productCarousel').addEventListener('slid.bs.carousel', e => {
//   const idx = e.to;

//   /* counter */
//   document.getElementById('counterCur').textContent = idx + 1;

//   /* thumbs */
//   document.querySelectorAll('.thumb').forEach((t,i) =>
//     t.classList.toggle('active', i === idx)
//   );
// });

// /* ── Initial build ── */
// buildCarousel('black');

// /* ═══════════════════════════════════════════════════
//    COLOR SWATCH  →  swap entire carousel
// ═══════════════════════════════════════════════════ */
// function selectColor(el, name, colorKey, dotColor) {
//   document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
//   el.classList.add('selected');

//   document.getElementById('selectedColor').textContent      = name;
//   document.getElementById('galleryColorLabel').textContent  = name;
//   document.getElementById('galleryColorDot').style.background = dotColor;

//   buildCarousel(colorKey);   // ← replaces ALL slides, indicators, thumbs
// }

/* ═══════════════════════════════════════════════════
   VARIANT
═══════════════════════════════════════════════════ */
function selectVariant(btn, name, price, emi) {
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('selectedVariant').textContent = name;
  document.getElementById('priceDisplay').textContent    = '₹' + price.toLocaleString('en-IN');
  document.getElementById('emiDisplay').textContent      = '₹' + emi.toLocaleString('en-IN') + '/mo';
}

/* ═══════════════════════════════════════════════════
   QTY  /  CART  /  SPECS
═══════════════════════════════════════════════════ */
let qty = 1;
function changeQty(d){ qty=Math.max(1,qty+d); document.getElementById('qtyVal').textContent=qty; }

function addToCart(btn){
  const txt=document.getElementById('cartBtnText');
  btn.style.background='var(--orange2)'; btn.style.boxShadow='0 0 28px var(--og-glow)';
  txt.textContent='Added ✓';
  setTimeout(()=>{ btn.style.background=''; btn.style.boxShadow=''; txt.textContent='Add to Cart'; },1800);
}

let specsOpen=true;
document.getElementById('specsHeader').onclick=()=>{
  specsOpen=!specsOpen;
  document.getElementById('specsBody').style.display = specsOpen?'block':'none';
  document.getElementById('specsToggleIcon').className = specsOpen?'fas fa-minus':'fas fa-plus';
};

/* ═══════════════════════════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════════════════════════ */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
setTimeout(()=>{
  document.querySelectorAll('.reveal').forEach(el=>{
    if(el.getBoundingClientRect().top<innerHeight) el.classList.add('in');
  });
},80);