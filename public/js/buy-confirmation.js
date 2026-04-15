// Category chip toggle
  document.getElementById('cats').addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });

  // Add to cart feedback
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = '+ Add to cart';
        btn.classList.remove('added');
      }, 1600);
    });
  });