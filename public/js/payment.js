/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
var newAddrOpen     = false;
var currentAddrType = 'home';
var currentTotal    = 0;
var addrSelected    = false;

var savedAddresses  = [];
var selectedAddrIdx = -1;

const PAYMENT_STEPS = [
  { lbl: 'Verifying details\u2026',   pct: 20 },
  { lbl: 'Connecting gateway\u2026', pct: 45 },
  { lbl: 'Authorizing\u2026',         pct: 70 },
  { lbl: 'Confirming order\u2026',    pct: 90 },
  { lbl: 'Finalizing\u2026',          pct: 100 }
];

var selectedShipping = 'default'; /* 'default' | 'fast' */

/* ══════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════ */
var progScore = 0;
function bumpProgress(pts) {
  progScore = Math.min(98, progScore + pts);
  document.getElementById('js-prog').style.width = progScore + '%';
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

//yes
function saveNewAddr() {
  if (savedAddresses.length >= 3) {
    toast('\u26A0\uFE0F', 'Maximum 3 addresses allowed.', 'error');
    return;
  }
  var flat     = document.getElementById('addr-flat').value.trim();
  var building = document.getElementById('addr-building').value.trim();
  var road     = document.getElementById('addr-road').value.trim();
  var city     = document.getElementById('cityDropdown').value.trim();
  var state    = document.getElementById('stateDropdown').value.trim();
  var pin      = document.getElementById('addr-pin').value.trim();

  var ok = true;
  function req(val, errId, msg) {
    if (!val) { showErr(errId, msg); ok = false; } else clearErr(errId);
  }
  req(flat,     'err-flat',     'Flat / Wing required');
  req(building, 'err-building', 'Building name required');
  req(road,     'err-road',     'Road name required');
  req(city,     'err-city',     'City required');
  req(state,    'err-state',    'State required');
  req(pin,      'err-pin',      'Pincode required');
  if (!ok) { toast('\u26A0\uFE0F', 'Please fill all required fields.', 'error'); return; }

  const form = document.getElementById("address");
  const formdata = new FormData(form);

  fetch("/vendrix/saveAddress",{
    method:"post",
    body:formdata
  }).then(res=>res.json()).then(data=>{
    if(!data.valid){
      toast('\u26A0\uFE0F', 'Please enter valid pincode.', 'error'); 
    }else{
    toast('\u2705', 'Address saved! Delivering to ' + data.city + '.', 'success');
    bumpProgress(15);
    window.location.href = window.location.href;
    }
  })

}

/* ══════════════════════════════════════════
   DEVICE LOCATION
══════════════════════════════════════════ */
//yes
function useDeviceLocation() {
  var flat     = document.getElementById('dev-flat').value.trim();
  var building = document.getElementById('dev-building').value.trim();

  var ok = true;
  function req(val, errId, msg) {
    if (!val) { showErr(errId, msg); ok = false; } else clearErr(errId);
  }
  req(flat,     'err-flat',     'Flat / Wing required');
  req(building, 'err-building', 'Building name required');
  if (!ok) { toast('\u26A0\uFE0F', 'Please fill all required fields.', 'error'); return; }


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
  const form = document.getElementById("deviceloc");
  const formdata = new FormData(form);
  navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    formdata.append("lat",lat);
    formdata.append("lon",lon);

     fetch('/vendrix/location', {
      method: 'POST',
      body: formdata
    }).then(res=>res.json()).then(data=>{
      window.location.href = window.location.href;
    });
  },
  (error) => {
    console.error(error);
  }
);
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
