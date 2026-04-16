
  /* ━━━━  DATA  ━━━━ */
  const transactions = [
    { id:'TXN001', name:'Sony WF-1000XM5 Earbuds',   amount:18990,  date:'12 Mar 2025', intent:'buy',   status:'completed' },
    { id:'TXN002', name:'iPad Pro 11" M4',             amount:89900,  date:'08 Mar 2025', intent:'rent',  status:'completed', period:'1 Month'  },
    { id:'TXN003', name:'Dell XPS 15 Laptop',          amount:149999, date:'01 Mar 2025', intent:'refurb',status:'completed' },
    { id:'TXN004', name:'Samsung Galaxy S24 Ultra',    amount:129999, date:'22 Feb 2025', intent:'buy',   status:'pending'   },
    { id:'TXN005', name:'Bose QuietComfort 45',        amount:31990,  date:'15 Feb 2025', intent:'refurb',status:'completed' },
    { id:'TXN006', name:'Apple Watch Series 9',        amount:41900,  date:'10 Feb 2025', intent:'rent',  status:'failed',   period:'2 Weeks'  },
  ];
  const TAB_PROG  = { overview:20, profile:45, transactions:65};

  let chartYear = 2025;
  let analyticsChart;

  /* ━━━━  UTILS  ━━━━ */
  const fmt   = n  => '₹' + Math.round(n).toLocaleString('en-IN');
  const rand6 = () => Math.random().toString(36).slice(2,8).toUpperCase();
  const getEl = id => document.getElementById(id);
  const fullName = () => `${userProfile.firstName} ${userProfile.lastName}`.trim();
  const initials = () => {
    const f = userProfile.firstName?.[0] || '';
    const l = userProfile.lastName?.[0]  || '';
    return (f + l).toUpperCase() || '?';
  };

  /* ━━━━  TOAST  ━━━━ */
  function showToast(icon, msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = `<span class="toast__icon">${icon}</span><span class="toast__text">${msg}</span><span class="toast__close" onclick="dismissToast(this.parentElement)">✕</span>`;
    getEl('js-toast-container').appendChild(t);
    setTimeout(() => dismissToast(t), 3500);
  }
  function dismissToast(el) {
    if (!el || el.classList.contains('toast--out')) return;
    el.classList.add('toast--out');
    setTimeout(() => el.remove(), 220);
  }

  /* ━━━━  MODAL  ━━━━ */
  function openModal() {
    getEl('js-modal').classList.add('modal-overlay--visible');
  }
  function closeModal() { getEl('js-modal').classList.remove('modal-overlay--visible'); }

  /* ━━━━  TABS  ━━━━ */
  function switchTab(name, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('panel--active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    getEl(`panel-${name}`).classList.add('panel--active');
    btn.classList.add('tab-btn--active');
    getEl('js-progress-fill').style.width = (TAB_PROG[name] || 20) + '%';
    if (name === 'overview')     {renderAnalyticsChart(); }
    if (name === 'profile')      syncProfileInputs();
  }

  function renderAnalyticsChart() {
    const ctx = getEl('js-analytics-chart').getContext('2d');
    const monthlyCounts = Array(12).fill(0);
    transactions.forEach(tx => {
      const parts = tx.date.split(' ');
      const monthStr = parts[1];
      const year = parseInt(parts[2]);
      if (year === chartYear) {
        const monthIndex = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(monthStr);
        if (monthIndex !== -1) monthlyCounts[monthIndex]++;
      }
    });
    if (analyticsChart) analyticsChart.destroy();
    analyticsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Transactions',
          data: monthlyCounts,
          backgroundColor: 'rgba(255,107,53,0.6)',
          borderColor: 'var(--og)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function setChartYear(year) {
    chartYear = year;
    document.querySelectorAll('.year-buttons button').forEach(btn => btn.classList.remove('tx-filter-btn--active'));
    event.target.classList.add('tx-filter-btn--active');
    renderAnalyticsChart();
  }

  function populateYearSelect() {
    const years = [...new Set(transactions.map(tx => parseInt(tx.date.split(' ')[2])))].sort((a,b) => b - a);
    if (years.length === 0) years.push(2025); // fallback
  }

  /* ━━━━  PROFILE  ━━━━ */

  function saveProfile() {
    const fn = getEl('inp-firstname').value.trim();
    const ln = getEl('inp-lastname').value.trim();
    if (!fn || !ln) { showToast('⚠️','First and last name are required.','error'); return; }

    const form = document.getElementById("credentials");
    const formdata = new FormData(form);
    fetch("/vendrix/updateName",{
      method:"POST",
      body:formdata
    }).then(res=>res.json()).then(data=>{
      if(data.valid){
        window.location.href="/vendrix/profile"
      }
    })
  }


  /* ━━━━  TRANSACTIONS  ━━━━ */

  /* ━━━━  LOGOUT  ━━━━ */
  function confirmLogout() {
    openModal('Log Out?','You will be signed out of your Vendrix account.', () => showToast('👋','Signed out. See you soon!','success'));
  }

  /* ━━━━  INIT  ━━━━ */
  const availableYears = [...new Set(transactions.map(tx => parseInt(tx.date.split(' ')[2])))];
  chartYear = Math.max(...availableYears) || 2025;
  populateYearSelect();
  renderAnalyticsChart();
 
  (function () {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /*
     * TX_DATA — replace these arrays with real values from your backend.
     * Shape: { [year]: { buy: [12 ints], rent: [12 ints], refurb: [12 ints] } }
     */
    const TX_DATA = {
      2022: {
        buy:    [3,5,4,6,8,7,5,9,6,7,8,10],
        rent:   [2,3,2,4,3,5,4,6,5,4,3,5],
        refurb: [1,1,2,1,2,2,3,2,1,2,3,2]
      },
      2023: {
        buy:    [6,7,9,8,11,10,8,12,9,10,13,15],
        rent:   [4,5,6,5,7,8,6,9,7,8,7,10],
        refurb: [2,3,3,4,3,5,4,5,4,3,6,5]
      },
      2024: {
        buy:    [10,12,14,11,16,15,13,18,14,17,20,22],
        rent:   [7,8,9,8,11,12,10,13,11,12,14,16],
        refurb: [4,5,5,6,6,7,6,8,7,7,9,8]
      },
      2025: {
        buy:    [18,20,17,22,19,24,21,25,23,22,26,28],
        rent:   [12,14,13,15,14,17,15,18,16,15,19,21],
        refurb: [7,8,8,9,9,10,9,11,10,10,12,11]
      }
    };

    const YEARS        = Object.keys(TX_DATA).map(Number).sort((a, b) => b - a);
    let   activeYear   = YEARS[0];
    let   chartInstance = null;

    /* year dropdown */
    function buildYearSelect() {
      const sel = document.getElementById('js-chart-year-select');
      if (!sel) return;
      sel.innerHTML = '';
      YEARS.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr;
        opt.textContent = yr;
        if (yr === activeYear) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => setYear(parseInt(sel.value)));
    }

    /* mini-stat pills: total / peak / avg */
    function updateMiniStats(yr) {
      const d      = TX_DATA[yr];
      const totals = MONTHS.map((_, i) => d.buy[i] + d.rent[i] + d.refurb[i]);
      const grand  = totals.reduce((a, b) => a + b, 0);
      const peakIdx = totals.indexOf(Math.max(...totals));
      const avg    = Math.round(grand / 12);

      const el = id => document.getElementById(id);
      if (el('js-chart-total')) el('js-chart-total').innerHTML = grand + ' <span>txns</span>';
      if (el('js-chart-peak'))  el('js-chart-peak').innerHTML  = MONTHS[peakIdx] + ' <span>(' + totals[peakIdx] + ')</span>';
      if (el('js-chart-avg'))   el('js-chart-avg').innerHTML   = avg + ' <span>/mo</span>';
    }

    /* draw / redraw the stacked bar chart */
    function drawChart(yr) {
      const canvas = document.getElementById('js-tx-bar-chart');
      if (!canvas) return;
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

      const d = TX_DATA[yr];
      chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: MONTHS,
          datasets: [
            {
              label: 'Buy',
              data: d.buy,
              backgroundColor: 'rgba(255,107,53,0.85)',
              borderRadius: 3,
              borderSkipped: false
            },
            {
              label: 'Rent',
              data: d.rent,
              backgroundColor: 'rgba(62,200,255,0.80)',
              borderRadius: 3,
              borderSkipped: false
            },
            {
              label: 'Refurbished',
              data: d.refurb,
              backgroundColor: 'rgba(180,130,255,0.80)',
              borderRadius: 3,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#16161b',
              borderColor: '#2a2a36',
              borderWidth: 1,
              titleColor: '#f0f0f4',
              bodyColor: '#888899',
              padding: 10,
              callbacks: {
                footer: items => 'Total: ' + items.reduce((s, i) => s + i.raw, 0)
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(255,107,53,0.07)' },
              ticks: {
                color: '#888899',
                font: { size: 10, family: "'Space Mono', monospace" },
                autoSkip: false,
                maxRotation: 0
              },
              border: { color: 'transparent' }
            },
            y: {
              stacked: true,
              grid: { color: 'rgba(255,107,53,0.07)' },
              ticks: {
                color: '#888899',
                font: { size: 10, family: "'Space Mono', monospace" },
                stepSize: 5
              },
              border: { color: 'transparent' }
            }
          },
          animation: { duration: 400, easing: 'easeInOutQuart' }
        }
      });
    }

    /* switch active year */
    function setYear(yr) {
      activeYear = yr;
      const sel = document.getElementById('js-chart-year-select');
      if (sel) sel.value = yr;
      updateMiniStats(yr);
      drawChart(yr);
    }

    /* init */
    function init() {
      buildYearSelect();
      updateMiniStats(activeYear);
      drawChart(activeYear);
    }

    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', init)
      : init();
  })();
