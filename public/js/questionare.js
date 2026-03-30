const answers = {};
let current = 1; // must match with the starting point
const totalSlides = document.querySelectorAll('.dq-slide').length + 1;

// Option click handler (radio + checkbox)
document.querySelectorAll('.dq-options').forEach(opts => {
  opts.addEventListener('click', e => {
    const opt = e.target.closest('.dq-option');
    if (!opt) return;
    const type = opts.dataset.type;
    if (type === 'radio') {
      opts.querySelectorAll('.dq-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    } else {
      const input = opt.querySelector('input');

      input.checked = !input.checked; // toggle checkbox

      if (input.checked) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    }
    collectAnswers(current);
  });
});

// Next buttons
document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const slideno = parseInt(btn.dataset.slideno);
    collectAnswers(slideno);
    showSlide(slideno + 1);
  });
});

// Prev buttons
document.querySelectorAll('.btn-prev').forEach(btn => {
  btn.addEventListener('click', () => {
    const slideno = parseInt(btn.dataset.slideno);
    showSlide(slideno - 1);
  });
});

function showSlide(n) {
  if(current==1){
    document.getElementById("dp-wrap").style.display = "grid";
  }
  document.getElementById('slide-' + current).classList.remove('active');
  current = n;
  document.getElementById('slide-' + current).classList.add('active');
  document.getElementById('stepLabel').textContent =
    'Step ' + (current - 1) + ' of ' + (totalSlides - 1);
  document.getElementById('progressBar').style.width =
    ((current - 1) / (totalSlides - 1) * 100) + '%';
}

function collectAnswers(slide) {
  const s = document.getElementById('slide-' + slide);
  if (!s) return;
  const opts = s.querySelector('.dq-options');
  if (!opts) return;
  const name = opts.dataset.name;
  const type = opts.dataset.type;
  if (type === 'radio') {
    const checked = s.querySelector('input[type=radio]:checked');
    if (checked) answers[name] = [checked.value];
  } else {
    const checked = [...s.querySelectorAll('input[type=checkbox]:checked')];
    answers[name] = checked.map(c => c.value);
  }
  renderSummary();
}

function renderSummary() {
  const el = document.getElementById('summaryContent');
  if (!Object.keys(answers).length) {
    el.innerHTML = '<p class="dq-empty">Your answers will appear here.</p>';
    return;
  }
  let html = '';
  for (const [section, vals] of Object.entries(answers)) {
    if (!vals.length) continue;
    html += `<div class="dq-summary-section">
      <div class="dq-summary-section-label">${section}</div>`;
    vals.forEach(v => {
      html += `<div class="dq-summary-item">
        <div class="dq-bullet"></div>
        <span class="dq-summary-text">${v}</span>
      </div>`;
    });
    html += '</div>';
  }
  el.innerHTML = html || '<p class="dq-empty">Your answers will appear here.</p>';
}