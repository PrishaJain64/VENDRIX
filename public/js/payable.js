/* ══ PICKUP DATES ══ */
function buildPickupDates() {
  var container = document.getElementById('pickup-dates');
  container.innerHTML = '';
  var today = new Date();
  var days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  for (var i = 1; i <= 3; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    var yyyy = d.getFullYear();
    var mm   = String(d.getMonth() + 1).padStart(2, '0');
    var dd   = String(d.getDate()).padStart(2, '0');
    var key  = yyyy + '-' + mm + '-' + dd;

    var btn = document.createElement('button');
    btn.className   = 'pickup-date-btn';
    btn.dataset.key = key;
    btn.innerHTML = '<span class="pickup-date-label">' + days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + '</span>';

    (function(dateKey) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.pickup-date-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedSlotDate = dateKey;
        selectedSlotTime = null;
        buildTimeSlots();
        clearSlotPill();
        updatePayBtn();
      });
    })(key);

    container.appendChild(btn);
  }
}

/* ══ TIME SLOTS ══ */
function buildTimeSlots() {
  var container = document.getElementById('pickup-slots');
  var lbl       = document.getElementById('slot-time-label');
  container.innerHTML = '';
  lbl.style.display   = 'flex';

  var hours = [10,11,12,13,14,15,16,17];
  function fmtHour(h) {
    var sfx = h >= 12 ? 'PM' : 'AM';
    var h12 = h > 12 ? h - 12 : h;
    return h12 + ':00 ' + sfx;
  }

  hours.forEach(function(h) {
    var slotLabel = fmtHour(h) + ' – ' + fmtHour(h + 1);
    var btn = document.createElement('button');
    btn.className    = 'pickup-slot-btn';
    btn.dataset.slot = slotLabel;
    btn.innerHTML    = '<i class="fas fa-clock"></i><span>' + slotLabel + '</span>';

    (function(sl) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.pickup-slot-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedSlotTime = sl;
        showSlotPill();
        updatePayBtn();
        bumpProgress(8);
      });
    })(slotLabel);

    container.appendChild(btn);
  });
}

function showSlotPill() {
  if (!selectedSlotDate || !selectedSlotTime) return;
  var d      = new Date(selectedSlotDate + 'T00:00:00');
  var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var nice   = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' · ' + selectedSlotTime;

  document.getElementById('slot-selected-txt').textContent   = nice;
  document.getElementById('slot-selected-pill').style.display = 'flex';

  var status = document.getElementById('payout-slot-status');
  status.classList.add('booked');
  status.innerHTML = '<i class="fas fa-calendar-check"></i><span>' + nice + '</span>';

  toast('📅', 'Pickup slot booked: ' + nice, 'success');
}

function clearSlotPill() {
  document.getElementById('slot-selected-pill').style.display = 'none';
  document.getElementById('slot-selected-txt').textContent    = '—';
  document.querySelectorAll('.pickup-slot-btn').forEach(function(b) { b.classList.remove('active'); });
  var status = document.getElementById('payout-slot-status');
  status.classList.remove('booked');
  status.innerHTML = '<i class="fas fa-calendar-xmark"></i><span>Book a pickup slot to continue</span>';
}

function clearSlot() {
  selectedSlotDate = null;
  selectedSlotTime = null;
  clearSlotPill();
  document.querySelectorAll('.pickup-date-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('slot-time-label').style.display = 'none';
  document.getElementById('pickup-slots').innerHTML = '';
  updatePayBtn();
}


/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', function() {
  buildPickupDates();
});