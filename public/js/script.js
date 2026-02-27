AOS.init();

/* ================= NAVBAR SHRINK ================= */
window.addEventListener("scroll", function(){
  document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 50);
});

/* ================= HAMBURGER + OVERLAY ================= */
const hamburger = document.querySelector(".hamburger");
const navLinks  = document.getElementById("navLinks");
const navOverlay = document.getElementById("navOverlay");

hamburger.addEventListener("click", function(){
  navLinks.classList.toggle("active");
  navOverlay.classList.toggle("active");
});

navOverlay.addEventListener("click", function(){
  navLinks.classList.remove("active");
  navOverlay.classList.remove("active");
});

/* ================= MAIN DROPDOWN CLICK ================= */
document.querySelectorAll(".dropdown > a").forEach(item => {
  item.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();

    let parent = this.parentElement;

    document.querySelectorAll(".dropdown").forEach(drop => {
      if(drop !== parent){
        drop.classList.remove("active");
      }
    });

    parent.classList.toggle("active");

    if(!parent.classList.contains("active")){
      document.querySelectorAll(".has-sub").forEach(menu => {
        menu.classList.remove("active");
      });
    }
  });
});

/* ================= SUB MENU CLICK ================= */
document.querySelectorAll(".has-sub > a").forEach(item => {
  item.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();

    let parent = this.parentElement;

    document.querySelectorAll(".has-sub").forEach(menu => {
      if(menu !== parent){
        menu.classList.remove("active");
      }
    });

    const subMenu = parent.querySelector(".sub-menu");
    if(subMenu){
      parent.classList.remove("flip-left");
      parent.classList.toggle("active");
      if(parent.classList.contains("active")){
        const rect = subMenu.getBoundingClientRect();
        if(rect.right > window.innerWidth - 20){
          parent.classList.add("flip-left");
        }
      }
    }
  });
});

/* ================= CLOSE WHEN CLICKING OUTSIDE ================= */
document.addEventListener("click", function(e){
  if(!e.target.closest(".dropdown")){
    document.querySelectorAll(".dropdown").forEach(drop => {
      drop.classList.remove("active");
    });
    document.querySelectorAll(".has-sub").forEach(menu => {
      menu.classList.remove("active");
    });
  }
  if(!e.target.closest(".has-sub")){
    document.querySelectorAll(".has-sub").forEach(menu => {
      menu.classList.remove("active");
    });
  }
});

/* ================= IMAGE SLIDER ================= */
const slides   = document.querySelectorAll(".slide");
const nextBtn  = document.querySelector(".next");
const prevBtn  = document.querySelector(".prev");
let currentSlide = 0;
let slideInterval;

function showSlide(index){
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

function nextSlide(){
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide(){
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function startSlider(){
  slideInterval = setInterval(nextSlide, 4000);
}

function stopSlider(){
  clearInterval(slideInterval);
}

nextBtn.addEventListener("click", function(){
  nextSlide(); stopSlider(); startSlider();
});

prevBtn.addEventListener("click", function(){
  prevSlide(); stopSlider(); startSlider();
});

startSlider();
