
/* ─── CURSOR ─── */
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
});
(function loop(){
  rx+=(mx-rx)*.11; ry+=(my-ry)*.11;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
function addHover(sel){
  document.querySelectorAll(sel).forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
  });
}
addHover('a,button,.cat-pill,.buy-card,.filter-label,.filter-section-title,.fsoc');

/* ─── NAVBAR SCROLL ─── */
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY>50);
},{passive:true});

/* ─── STATE ─── */
let activeCategory = 'all';
let activeSort     = 'default';
let priceMax       = 250000;
let activeBrands   = new Set();
let minRating      = 0;
let wishlist       = new Set();


/* ─── CHIPS ─── */
function renderChips(){
  const wrap=document.getElementById('activeChips');
  wrap.innerHTML='';

  if(activeCategory!=='all'){
    addChip(wrap, activeCategory, ()=>{ activeCategory='all'; document.querySelectorAll('.cat-pill').forEach(p=>{p.classList.remove('active');}); document.querySelector('.cat-pill[data-filter="all"]').classList.add('active'); renderCards(); });
  }
  activeBrands.forEach(b=>{
    addChip(wrap, b, ()=>{ activeBrands.delete(b); document.querySelector(`.brand-filter[value="${b}"]`).checked=false; renderCards(); });
  });
  if(priceMax<250000){
    addChip(wrap, 'Max: '+fmt(priceMax), ()=>{ priceMax=250000; document.getElementById('priceSlider').value=250000; document.getElementById('priceVal').textContent='₹2,50,000'; renderCards(); });
  }
  if(minRating>0){
    addChip(wrap, minRating+'★+', ()=>{ minRating=0; document.querySelector('input[name="rating"][value="0"]').checked=true; renderCards(); });
  }
}

function addChip(wrap, label, onRemove){
  const chip=document.createElement('div');
  chip.className='chip';
  chip.innerHTML=`${label}<span class="chip-remove"><i class="fas fa-times"></i></span>`;
  chip.querySelector('.chip-remove').addEventListener('click', onRemove);
  wrap.appendChild(chip);
}

/* ─── CATEGORY PILLS ─── */
document.querySelectorAll('.cat-pill').forEach(pill=>{
  pill.addEventListener('click', ()=>{
    document.querySelectorAll('.cat-pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    activeCategory=pill.dataset.filter;
    renderCards();
  });
});

/* ─── FILTER SECTION TOGGLES ─── */
document.querySelectorAll('.filter-section-title').forEach(title=>{
  title.addEventListener('click', ()=>{
    const target=document.getElementById(title.dataset.target);
    title.classList.toggle('open');
    target.classList.toggle('visible');
  });
});

/* ─── PRICE SLIDER ─── */
document.getElementById('priceSlider').addEventListener('input', e=>{
  priceMax=parseInt(e.target.value);
  const formatted='₹'+priceMax.toLocaleString('en-IN');
  document.getElementById('priceVal').textContent=formatted;
});

/* ─── APPLY FILTERS ─── */
document.getElementById('applyFilters').addEventListener('click', ()=>{
  // brands
  activeBrands=new Set();
  document.querySelectorAll('.brand-filter:checked').forEach(cb=>activeBrands.add(cb.value));
  // sort
  activeSort=document.querySelector('input[name="sort"]:checked')?.value||'default';
  // rating
  minRating=parseFloat(document.querySelector('input[name="rating"]:checked')?.value||0);
  renderCards();
  // close sidebar on mobile
  if(window.innerWidth<=1024){
    document.getElementById('filterSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
  }
});

document.getElementById('clearAll').addEventListener('click', clearAll);
document.getElementById('resetBtn')?.addEventListener('click', clearAll);

/* ─── MOBILE SIDEBAR ─── */
document.getElementById('mobileFilterBtn').addEventListener('click', ()=>{
  document.getElementById('filterSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
});
document.getElementById('sidebarOverlay').addEventListener('click', ()=>{
  document.getElementById('filterSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
});

/* ─── INIT ─── */
renderCards();
