//LIGHTBOX

let lbPhotos = [], lbIdx = 0;
function openLightbox(url) {
  // photos array is stored on the review card via data attr
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.closest('.lightbox-close')) return;
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') { lb.classList.remove('open'); document.body.style.overflow = ''; }
  if (e.key === 'ArrowRight' && lbPhotos.length > 1) { lbIdx = (lbIdx + 1) % lbPhotos.length; document.getElementById('lightboxImg').src = lbPhotos[lbIdx]; document.getElementById('lightboxCaption').textContent = 'Photo ' + (lbIdx+1) + ' of ' + lbPhotos.length + '  ·  ← → to navigate'; }
  if (e.key === 'ArrowLeft'  && lbPhotos.length > 1) { lbIdx = (lbIdx - 1 + lbPhotos.length) % lbPhotos.length; document.getElementById('lightboxImg').src = lbPhotos[lbIdx]; document.getElementById('lightboxCaption').textContent = 'Photo ' + (lbIdx+1) + ' of ' + lbPhotos.length + '  ·  ← → to navigate'; }
});


//MULTI-PHOTO UPLOAD (up to 3)

const MAX_PHOTOS = 3;
let uploadedPhotos = []; // [{dataUrl, name}]
let images = [];

const dropZone = document.getElementById('photoDropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  processPhotoFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
});

function handlePhotoSelect(input) {
  images = Array.from(input.files);
  processPhotoFiles(images);
}

function processPhotoFiles(files) {
  const slots = MAX_PHOTOS - uploadedPhotos.length;
  if (slots <= 0) return;
  const batch = files.slice(0, slots);
  console.log(batch);
  let done = 0;
  batch.forEach(file => {
    if (file.size > 8 * 1024 * 1024) {
      alert('"' + file.name + '" exceeds 8 MB and was skipped.');
      if (++done === batch.length) renderPhotoGrid();
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      uploadedPhotos.push({ dataUrl: ev.target.result, name: file.name });
      if (++done === batch.length) renderPhotoGrid();
    };
    reader.readAsDataURL(file);
  });
}

function removeUploadedPhoto(idx) {
  uploadedPhotos.splice(idx, 1);
  images.splice(idx,1);
  renderPhotoGrid();
}

function renderPhotoGrid() {
  const grid    = document.getElementById('photosPreviewGrid');
  const empty   = document.getElementById('dropZoneEmpty');
  const counter = document.getElementById('dropZoneCounter');
  const n = uploadedPhotos.length;

  counter.textContent = n + ' / ' + MAX_PHOTOS;
  counter.classList.toggle('show', n > 0);
  empty.style.display = n >= MAX_PHOTOS ? 'none' : '';

  if (n === 0) { grid.classList.remove('show'); grid.innerHTML = ''; return; }

  grid.classList.add('show');
  let html = uploadedPhotos.map((p, i) =>
    '<div class="photo-thumb-cell">' +
      '<img src="' + p.dataUrl + '" alt="Photo ' + (i+1) + '">' +
      '<button class="photo-thumb-remove" onclick="removeUploadedPhoto(' + i + ')" title="Remove"><i class="fas fa-times"></i></button>' +
      '<span class="photo-thumb-num">Photo ' + (i+1) + '</span>' +
    '</div>'
  ).join('');

  if (n < MAX_PHOTOS) {
    html +=
      '<div class="photo-add-slot">' +
        '<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onchange="handlePhotoSelect(this)">' +
        '<i class="fas fa-plus"></i>' +
        '<span>Add more</span>' +
      '</div>';
  }
  grid.innerHTML = html;
  refreshCursorTargets();
}

function resetPhotos() {
  uploadedPhotos = [];
  document.getElementById('photoInput').value = '';
  renderPhotoGrid();
}
//REVIEWS ENGINE

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
let visibleCount = 3;
let activeStarFilter = null;

function showReviews(){
  const cards = document.querySelectorAll(".review-card");
  for(var i=0;i<visibleCount&&i<cards.length;++i){
    cards[i].style.display = "block";
  }

  if(visibleCount >= cards.length){
     document.getElementById("loadMoreWrap").style.display = "none";
  }
}

function loadMore(){
  visibleCount+=3;
  showReviews();
}

//Filters
document.getElementById("sortSelect").addEventListener("change", async function () {
  const select = this.value;
  const params = new URLSearchParams(window.location.search);
  params.set("option", select);
  params.set("star", activeStarFilter ?? "null");

  window.location.href = `${window.location.pathname}?${params.toString()}`;
});


function toggleStarFilter(star) {
    if (activeStarFilter === star) { activeStarFilter = null;}
    else { activeStarFilter = star;}
    var select = document.getElementById("sortSelect").value;
     const params = new URLSearchParams(window.location.search);
      params.set("option", select);
      if (activeStarFilter === null) {
          params.delete("star");
      } else {
          params.set("star", activeStarFilter);
      }
      console.log(select);
      window.location.href = `${window.location.pathname}?${params.toString()}`;
  }
function clearFilters() {
  activeStarFilter = null;
  document.querySelectorAll('.star-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('sortSelect').value = 'relevant';
     const params = new URLSearchParams(window.location.search);
     params.delete('star');
     params.delete('option');
      window.location.href = `${window.location.pathname}?${params.toString()}`;

}

function markHelpful(btn, id) {
  const formdata = new FormData();
  formdata.append("id",id);
  fetch(`/review/like?redirect=${encodeURIComponent(window.location.pathname)}`,{
    method:"post",
    credentials:"include",
    body:formdata
  }).then(res=>res.json()).then(data=>{
    if(data.valid==="valid"){
       if (data.liked) {
        btn.classList.add('voted');
      } else {
        btn.classList.remove('voted');
      }
      btn.textContent = data.likes + ' ↑ Yes';

    }else if(data.valid==="notloggedin"){
      window.location.href=data.redirect
    }
  })
}


/* ── FORM STAR PICKER ── */
let selectedRating = 0;
const starPicks = document.querySelectorAll('.star-pick');
const ratingText = document.getElementById('starRatingText');
starPicks.forEach(s => {
  s.addEventListener('mouseenter', () => {
    const v = +s.dataset.val;
    starPicks.forEach(sp => sp.classList.toggle('hovered', +sp.dataset.val <= v));
    ratingText.textContent = STAR_LABELS[v];
  });
  s.addEventListener('mouseleave', () => {
    starPicks.forEach(sp => { sp.classList.remove('hovered'); sp.classList.toggle('selected', +sp.dataset.val <= selectedRating); });
    ratingText.textContent = selectedRating ? STAR_LABELS[selectedRating] : 'Tap to rate';
  });
  s.addEventListener('click', () => {
    selectedRating = +s.dataset.val;
    starPicks.forEach(sp => sp.classList.toggle('selected', +sp.dataset.val <= selectedRating));
    ratingText.textContent = STAR_LABELS[selectedRating];
  });
});

/* ── QUICK RATE STARS ── */
const qrStars = document.querySelectorAll('.qr-star');
const qrHint  = document.getElementById('quickRateHint');
const STAR_LABELS_BIG = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
qrStars.forEach(s => {
  s.addEventListener('mouseenter', () => {
    const v = +s.dataset.val;
    qrStars.forEach(q => q.classList.toggle('lit', +q.dataset.val <= v));
    qrHint.textContent = STAR_LABELS_BIG[v];
    qrHint.classList.add('lit');
  });
  s.addEventListener('mouseleave', () => {
    qrStars.forEach(q => q.classList.remove('lit'));
    qrHint.textContent = 'Tap to Write a Review';
    qrHint.classList.remove('lit');
  });
  s.addEventListener('click', () => {
    const v = +s.dataset.val;
    // Pre-select rating in form
    selectedRating = v;
    starPicks.forEach(sp => sp.classList.toggle('selected', +sp.dataset.val <= v));
    ratingText.textContent = STAR_LABELS[v];
    ratingText.style.color = '';
    // Scroll to write-review form
    document.querySelector('.write-review-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── SUBMIT REVIEW ── */
function submitReview(e,name,intent) {
  e.preventDefault();
  
  const title = document.getElementById('reviewTitle').value.trim();
  const body  = document.getElementById('reviewBody').value.trim();
  if (!selectedRating) { ratingText.textContent = '← Please rate first'; ratingText.style.color = '#ff4040';showToast('Please rate first!','error'); return; }
  if (!title) { document.getElementById('reviewTitle').focus();showToast('Please enter review title!','error'); return; }
  if (!body)  { document.getElementById('reviewBody').focus();showToast('Please enter review description!','error'); return; }

  const form = document.getElementById("submitReview");
  const formdata = new FormData(form);
  formdata.append("stars",selectedRating);
  formdata.append("name",name);
  formdata.append("intent",intent);

  images.forEach(file => {
    formdata.append("reviewImages", file);
  });
  fetch(`/review/upload?redirect=${encodeURIComponent(window.location.pathname)}`,{
    method:"post",
    credentials:"include",//preserve session data
    body:formdata
  }).then(res=>res.json()).then(data=>{
    if(data.valid==="valid"){
      showToast("Review submitted successfully!");
      window.location.href = window.location.href;
    }else if(data.valid ==="notloggedin"){
      window.location.href = data.redirect;
    }
  });
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const text = toast.querySelector(".toast-text");
  const icon = toast.querySelector("i");

  text.innerText = message;

  // reset classes
  toast.className = "toast show " + type;

  // change icon
  if (type === "error") {
    icon.className = "fas fa-exclamation-circle";
  } else {
    icon.className = "fas fa-check-circle";
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}