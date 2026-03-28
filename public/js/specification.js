//cursor
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
function refreshCursorTargets() {
  document.querySelectorAll('a,button,.thumb,.color-swatch,.variant-btn,.trust-it,.star-pick,.helpful-btn,.star-chip,.sort-select,.photo-drop-zone,.review-photo-thumb,.qr-star').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}
refreshCursorTargets();
/* ═══════════════════════════════════════════════════
   NAVBAR SCROLL SHADOW
═══════════════════════════════════════════════════ */
window.addEventListener('scroll',()=>
  document.getElementById('navbar').classList.toggle('scrolled', scrollY>40),
  {passive:true}
);
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
let specsOpen = true;
document.getElementById('specsHeader').onclick = () => {
  specsOpen = !specsOpen;
  document.getElementById('specsBody').style.display = specsOpen ? 'block' : 'none';
  document.getElementById('specsToggleIcon').className = specsOpen ? 'fas fa-minus' : 'fas fa-plus';
};