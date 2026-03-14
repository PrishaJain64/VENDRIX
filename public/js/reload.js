window.addEventListener("beforeunload", () => {
  localStorage.setItem("scrollPos", window.scrollY);
});
window.addEventListener("DOMContentLoaded", () => {
  const pos = localStorage.getItem("scrollPos");
  if (pos) window.scrollTo(0, pos);
});