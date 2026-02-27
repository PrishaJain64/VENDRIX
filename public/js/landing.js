document.addEventListener("DOMContentLoaded", function () {

  // ── Smooth scroll with navbar offset ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    });
  });

  // ── Auth Modal ──
  const modal        = document.getElementById('authModal');
  const openBtn      = document.getElementById('openModal');
  const closeBtn     = document.getElementById('closeModal');
  const signinTab    = document.getElementById('signinTab');
  const signupTab    = document.getElementById('signupTab');
  const signinForm   = document.getElementById('signinForm');
  const signupForm   = document.getElementById('signupForm');
  const goSignup     = document.getElementById('goSignup');
  const goSignin     = document.getElementById('goSignin');

  function showSignin() {
    signinForm.classList.add('active');
    signupForm.classList.remove('active');
    signinTab.classList.add('active');
    signupTab.classList.remove('active');
  }

  function showSignup() {
    signupForm.classList.add('active');
    signinForm.classList.remove('active');
    signupTab.classList.add('active');
    signinTab.classList.remove('active');
  }

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    showSignin();
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });

  signinTab.addEventListener('click', showSignin);
  signupTab.addEventListener('click', showSignup);
  goSignup.addEventListener('click', showSignup);
  goSignin.addEventListener('click', showSignin);

  // ── Fade-in on scroll ──
  const fadeEls = document.querySelectorAll(
    '.category-card, .why-card, .step, .testimonial-card, .cta-box'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => {
    el.classList.add('fade-hidden');
    observer.observe(el);
  });

  console.log("Vendrix landing page loaded.");
});