/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
var newAddrOpen     = false;
var currentAddrType = 'home';
var currentTotal    = 0;
var addrSelected    = false;

var savedAddresses  = [];
var selectedAddrIdx = -1;

const BASE_SUBTOTAL = 152880;
const GST_RATE      = 0.18;

const SHIPPING_RATES = {
  'india': 0,
  'united states': 2499, 'usa': 2499, 'us': 2499,
  'united kingdom': 1999, 'uk': 1999, 'britain': 1999,
  'united arab emirates': 1499, 'uae': 1499,
  'singapore': 1799,
  'australia': 2299,
  'default': 1999
};

const PAYMENT_STEPS = [
  { lbl: 'Verifying details\u2026',   pct: 20 },
  { lbl: 'Connecting gateway\u2026', pct: 45 },
  { lbl: 'Authorizing\u2026',         pct: 70 },
  { lbl: 'Confirming order\u2026',    pct: 90 },
  { lbl: 'Finalizing\u2026',          pct: 100 }
];

/* ══════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════ */
var progScore = 0;
function bumpProgress(pts) {
  progScore = Math.min(98, progScore + pts);
  document.getElementById('js-prog').style.width = progScore + '%';
}

/* ══════════════════════════════════════════
   RENDER SAVED ADDRESSES
══════════════════════════════════════════ */
function renderSavedAddrs() {
  var list      = document.getElementById('saved-addr-list');
  var noMsg     = document.getElementById('no-addr-msg');
  var addToggle = document.getElementById('add-addr-toggle');
  var maxNotice = document.getElementById('addr-max-notice');

  list.innerHTML = '';

  if (savedAddresses.length === 0) {
    noMsg.style.display = 'flex';
  } else {
    noMsg.style.display = 'none';
    savedAddresses.forEach(function(addr, i) {
      var tagClass   = addr.type === 'home' ? 'tag-home' : addr.type === 'work' ? 'tag-work' : 'tag-other';
      var isSelected = i === selectedAddrIdx;
      var landmark   = addr.landmark ? ', ' + addr.landmark : '';
      var card = document.createElement('div');
      card.className = 'saved-addr-card' + (isSelected ? ' selected' : '');
      card.id = 'saddr-' + i;
      card.innerHTML =
        '<div class="saved-addr-radio"></div>' +
        '<div class="saved-addr-info" onclick="pickSavedAddr(' + i + ')" style="cursor:pointer;flex:1">' +
          '<div class="saved-addr-name">' +
            addr.fname + ' ' + addr.lname +
            ' <span class="saved-addr-tag ' + tagClass + '">' +
              addr.type.charAt(0).toUpperCase() + addr.type.slice(1) +
            '</span>' +
          '</div>' +
          '<div class="saved-addr-line">' +
            addr.flat + ', ' + addr.building + landmark + ', ' + addr.road + '<br>' +
            addr.city + ', ' + addr.state + ', ' + addr.country +
            ' &mdash; ' + addr.pin +
            ' &middot; ' + addr.code + ' ' + addr.phone +
          '</div>' +
        '</div>' +
        '<button class="saved-addr-remove" onclick="event.stopPropagation();removeAddr(' + i + ')" title="Remove">' +
          '<i class="fas fa-trash-alt"></i>' +
        '</button>';
      list.appendChild(card);
    });
  }

  if (savedAddresses.length >= 3) {
    addToggle.style.display = 'none';
    maxNotice.style.display = 'flex';
  } else {
    addToggle.style.display = 'flex';
    maxNotice.style.display = 'none';
  }
}

/* ══════════════════════════════════════════
   PICK / REMOVE ADDRESS
══════════════════════════════════════════ */
function pickSavedAddr(idx) {
  selectedAddrIdx = idx;
  addrSelected    = true;
  var addr = savedAddresses[idx];
  updateSummary(addr.country);
  renderSavedAddrs();
  bumpProgress(10);
  toast('\uD83D\uDCCD', 'Delivering to: ' + addr.city + ', ' + addr.state, 'success');
}

function removeAddr(idx) {
  savedAddresses.splice(idx, 1);
  if (selectedAddrIdx === idx) {
    if (savedAddresses.length > 0) {
      selectedAddrIdx = 0;
      addrSelected    = true;
      updateSummary(savedAddresses[0].country);
    } else {
      selectedAddrIdx = -1;
      addrSelected    = false;
      clearSummary();
    }
  } else if (selectedAddrIdx > idx) {
    selectedAddrIdx--;
  }
  renderSavedAddrs();
  toast('\uD83D\uDDD1\uFE0F', 'Address removed.', 'info');
}

/* ══════════════════════════════════════════
   ADD NEW ADDRESS TOGGLE / FORM
══════════════════════════════════════════ */
function toggleNewAddr() {
  if (savedAddresses.length >= 3) return;
  newAddrOpen = !newAddrOpen;
  var form = document.getElementById('new-addr-form');
  form.style.display = newAddrOpen ? 'block' : 'none';
  var lbl = document.getElementById('add-addr-label');
  var ico = document.querySelector('#add-addr-toggle i');
  if (newAddrOpen) {
    lbl.textContent = 'Cancel';
    ico.className   = 'fas fa-times-circle';
  } else {
    lbl.textContent = 'Add a new address';
    ico.className   = 'fas fa-plus-circle';
    resetAddrForm();
  }
}

function resetAddrForm() {
  ['addr-fname','addr-lname','addr-phone','addr-flat','addr-building',
   'addr-landmark','addr-road','addr-city','addr-state','addr-country','addr-pin']
    .forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
  var locDisp = document.getElementById('device-loc-display');
  if (locDisp) locDisp.style.display = 'none';
  currentAddrType = 'home';
  document.querySelectorAll('.addr-type-tab').forEach(function(t, i) {
    t.classList.toggle('active', i === 0);
  });
  ['err-fname','err-lname','err-phone','err-flat','err-building',
   'err-road','err-city','err-state','err-country','err-pin']
    .forEach(function(id) { clearErr(id); });
}

function pickAddrType(el, type) {
  document.querySelectorAll('.addr-type-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  currentAddrType = type;
}

function saveNewAddr() {
  if (savedAddresses.length >= 3) {
    toast('\u26A0\uFE0F', 'Maximum 3 addresses allowed.', 'error');
    return;
  }
  var fname    = document.getElementById('addr-fname').value.trim();
  var lname    = document.getElementById('addr-lname').value.trim();
  var phone    = document.getElementById('addr-phone').value.trim();
  var code     = document.getElementById('addr-code').value;
  var flat     = document.getElementById('addr-flat').value.trim();
  var building = document.getElementById('addr-building').value.trim();
  var landmark = document.getElementById('addr-landmark').value.trim();
  var road     = document.getElementById('addr-road').value.trim();
  var city     = document.getElementById('addr-city').value.trim();
  var state    = document.getElementById('addr-state').value.trim();
  var country  = document.getElementById('addr-country').value.trim();
  var pin      = document.getElementById('addr-pin').value.trim();

  var ok = true;
  function req(val, errId, msg) {
    if (!val) { showErr(errId, msg); ok = false; } else clearErr(errId);
  }
  req(fname,    'err-fname',    'First name required');
  req(lname,    'err-lname',    'Last name required');
  req(phone,    'err-phone',    'Mobile number required');
  req(flat,     'err-flat',     'Flat / Wing required');
  req(building, 'err-building', 'Building name required');
  req(road,     'err-road',     'Road name required');
  req(city,     'err-city',     'City required');
  req(state,    'err-state',    'State required');
  req(country,  'err-country',  'Country required');
  req(pin,      'err-pin',      'Pincode required');
  if (!ok) { toast('\u26A0\uFE0F', 'Please fill all required fields.', 'error'); return; }

  savedAddresses.push({
    fname: fname, lname: lname, phone: phone, code: code,
    flat: flat, building: building, landmark: landmark, road: road,
    city: city, state: state, country: country, pin: pin, type: currentAddrType
  });

  selectedAddrIdx = savedAddresses.length - 1;
  addrSelected    = true;
  updateSummary(country);

  newAddrOpen = false;
  document.getElementById('new-addr-form').style.display  = 'none';
  document.getElementById('add-addr-label').textContent    = 'Add a new address';
  document.querySelector('#add-addr-toggle i').className   = 'fas fa-plus-circle';
  resetAddrForm();
  renderSavedAddrs();

  toast('\u2705', 'Address saved! Delivering to ' + city + '.', 'success');
  bumpProgress(15);
}

/* ══════════════════════════════════════════
   SUMMARY: SHIPPING + GST + TOTAL
══════════════════════════════════════════ */
function getShippingRate(country) {
  var key  = (country || '').trim().toLowerCase();
  var rate = SHIPPING_RATES[key];
  if (rate === undefined) rate = SHIPPING_RATES['default'];
  return rate;
}

function updateSummary(country) {
  var rate    = getShippingRate(country);
  var gst     = Math.round(BASE_SUBTOTAL * GST_RATE);
  currentTotal = BASE_SUBTOTAL + gst + rate;

  /* Shipping */
  var shipEl = document.getElementById('shipping-val');
  shipEl.innerHTML = rate === 0
    ? '<span class="fee-row__val--free">FREE</span>'
    : '<span>\u20B9' + rate.toLocaleString('en-IN') + '</span>';

  /* GST */
  document.getElementById('gst-val').innerHTML =
    '<span>\u20B9' + gst.toLocaleString('en-IN') + '</span>';

  /* Total */
  var fmt = '\u20B9' + currentTotal.toLocaleString('en-IN');
  document.getElementById('js-total').textContent      = fmt;
  document.getElementById('pay-btn-txt').textContent   = 'Pay ' + fmt;
  document.getElementById('total-note').style.opacity  = '1';
}

function clearSummary() {
  var placeholder = '<span class="shipping-no-addr">Select an address first</span>';
  document.getElementById('shipping-val').innerHTML = placeholder;
  document.getElementById('gst-val').innerHTML      = placeholder;
  document.getElementById('js-total').textContent   = '\u2014';
  document.getElementById('pay-btn-txt').textContent = 'Pay';
  document.getElementById('total-note').style.opacity = '0';
  currentTotal = 0;
}

/* ══════════════════════════════════════════
   DEVICE LOCATION
══════════════════════════════════════════ */
function useDeviceLocation() {
  var btn     = document.querySelector('.btn-device-loc');
  var display = document.getElementById('device-loc-display');
  var txt     = document.getElementById('device-loc-txt');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location\u2026';
  btn.disabled  = true;
  display.style.display = 'flex';
  txt.textContent = 'Requesting access to your location\u2026';

  if (!navigator.geolocation) {
    txt.textContent = 'Geolocation is not supported by your browser.';
    btn.innerHTML   = '<i class="fas fa-location-crosshairs"></i> Use Device Location';
    btn.disabled    = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      txt.textContent = 'Resolving address\u2026';

      fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var a = data.address || {};
          var readable = [
            a.road || a.pedestrian,
            a.suburb || a.neighbourhood,
            a.city || a.town || a.village,
            a.state, a.country, a.postcode
          ].filter(Boolean).join(', ');

          txt.textContent = readable || (lat.toFixed(5) + ', ' + lng.toFixed(5));

          function fill(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; }
          fill('addr-city',    a.city || a.town || a.village);
          fill('addr-state',   a.state);
          fill('addr-country', a.country);
          fill('addr-pin',     a.postcode);
          fill('addr-road',    a.road || a.pedestrian);
          toast('\uD83D\uDCCD', 'Location detected & fields auto-filled!', 'success');
        })
        .catch(function() {
          txt.textContent = 'Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5);
        })
        .finally(function() {
          btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Device Location';
          btn.disabled  = false;
        });
    },
    function() {
      txt.textContent = 'Unable to access location. Check browser permissions.';
      btn.innerHTML   = '<i class="fas fa-location-crosshairs"></i> Use Device Location';
      btn.disabled    = false;
      toast('\u274C', 'Location access denied.', 'error');
    },
    { timeout: 10000 }
  );
}

/* ══════════════════════════════════════════
   PINCODE
══════════════════════════════════════════ */
function onPinInput(el) {
  el.value = el.value.replace(/\D/g, '').slice(0, 10);
}

/* ══════════════════════════════════════════
   ERROR HELPERS
══════════════════════════════════════════ */
function showErr(id, msg) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<i class="fas fa-circle-exclamation"></i>' + msg;
}
function clearErr(id) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

/* ══════════════════════════════════════════
   PAY BUTTON
══════════════════════════════════════════ */
function doPay(e) {
  if (!addrSelected || selectedAddrIdx < 0) {
    toast('\uD83D\uDCCD', 'Please select a delivery address first.', 'error');
    return;
  }

  var btn  = document.getElementById('js-pay');
  var rect = btn.getBoundingClientRect();
  var r    = document.createElement('span');
  r.className   = 'ripple';
  r.style.left  = (e.clientX - rect.left - 25) + 'px';
  r.style.top   = (e.clientY - rect.top  - 25) + 'px';
  btn.appendChild(r);
  setTimeout(function() { r.remove(); }, 700);

  btn.disabled = true;
  var overlay  = document.getElementById('pay-overlay');
  var bar      = document.getElementById('pay-progress-bar');
  var lbl      = document.getElementById('pay-progress-lbl');
  overlay.classList.add('visible');

  var step = 0;
  function runStep() {
    if (step >= PAYMENT_STEPS.length) {
      setTimeout(function() {
        overlay.classList.remove('visible');
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-pay__sheen"></span><i class="fas fa-bolt"></i> <span id="pay-btn-txt">Pay \u20B9' + currentTotal.toLocaleString('en-IN') + '</span>';
        showSuccess();
      }, 400);
      return;
    }
    var s = PAYMENT_STEPS[step];
    lbl.textContent = s.lbl;
    bar.style.width = s.pct + '%';
    step++;
    setTimeout(runStep, 560);
  }
  runStep();
  bumpProgress(20);
}

function showSuccess() {
  document.getElementById('suc-amount').textContent = '\u20B9' + currentTotal.toLocaleString('en-IN');
  document.getElementById('suc-txid').textContent   = 'TXN-' + Math.random().toString(36).slice(2,10).toUpperCase();
  var now = new Date();
  document.getElementById('suc-date').textContent =
    now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) +
    ' ' +
    now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('js-success').classList.add('visible');
}

function closeSuc() {
  document.getElementById('js-success').classList.remove('visible');
}

function fakeDownload() {
  toast('\uD83D\uDCC4', 'Receipt download started\u2026', 'success');
  closeSuc();
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function toast(icon, msg, type) {
  type = type || 'info';
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML =
    '<span class="toast__icon">'  + icon + '</span>' +
    '<span class="toast__text">'  + msg  + '</span>' +
    '<span class="toast__x" onclick="killToast(this.parentElement)">\u2715</span>';
  document.getElementById('toasts').appendChild(el);
  setTimeout(function() { killToast(el); }, 4000);
}

function killToast(el) {
  if (!el || el.classList.contains('out')) return;
  el.classList.add('out');
  setTimeout(function() { el.remove(); }, 220);
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  renderSavedAddrs();
  clearSummary();
});
