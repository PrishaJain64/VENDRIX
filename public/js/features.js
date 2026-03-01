// ---- Price slider ----
const priceSlider = document.getElementById('priceSlider');
const priceVal = document.getElementById('priceVal');
priceSlider.addEventListener('input', () => {
  maxPrice = parseInt(priceSlider.value);
  const pct = (maxPrice / 250000) * 100;
  priceSlider.style.background = `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${pct}%, #ddd ${pct}%, #ddd 100%)`;
  priceVal.textContent = '₹' + maxPrice.toLocaleString('en-IN');
});


// ---- Wishlist toggle ----
document.querySelectorAll('.wish-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.className = btn.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
  });
});