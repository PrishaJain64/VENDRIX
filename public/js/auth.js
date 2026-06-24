let tempToken="";
let countdown = null;
function sixtySeconds(){
  if(clearInterval)clearInterval(countdown)
let timeLeft = 60;
const timerbox = document.getElementById("timerbox");
const forgetpass = document.getElementById("forgetpass");
timerbox.textContent=timeLeft+"s";

countdown = setInterval(()=>{
    timeLeft--;
    timerbox.textContent=timeLeft+"s";
    if(timeLeft <=0){
        clearInterval(countdown);
        timerbox.style.display = "none";
        forgetpass.style.display = "inline";
    }
    
},1000)
}
/* ── CURSOR ── */
const cd=document.getElementById('cd'),cr=document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cd.style.left=mx+'px';cd.style.top=my+'px';
  const el=document.elementFromPoint(mx,my);
  const onOg=el&&el.closest('.og-slab');
  document.body.classList.toggle('on-og',!!onOg);
});
(function loop(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;cr.style.left=rx+'px';cr.style.top=ry+'px';requestAnimationFrame(loop)})();
document.querySelectorAll('a,button,input,label').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});
// re-run for dynamically shown modal elements
document.getElementById('fp-ov').addEventListener('mouseover',e=>{
  if(e.target.closest('a,button,input,label')) document.body.classList.add('hov');
  else document.body.classList.remove('hov');
});

/* ── MODE TOGGLE ── */
let mode='signup';

function setMode(m){
  if(m===mode)return;
  mode=m;
  document.getElementById('scene').className='scene '+m;
  if(m==='login'){
    hide('og-signup'); show('og-login');
    hide('dk-signup'); show('dk-login');
  } else {
    show('og-signup'); hide('og-login');
    show('dk-signup'); hide('dk-login');
  }
}

function show(id){
  const el=document.getElementById(id);
  el.style.display='block';
  const c=el.querySelector('.panel-content')||el;
  c.style.animation='none';c.offsetWidth;
  c.style.animation='pfade .4s cubic-bezier(.22,1,.36,1) both';
}
function hide(id){document.getElementById(id).style.display='none'}

/* ── PASSWORD TOGGLE ── */
function tpw(id,btn){
  const el=document.getElementById(id),h=el.type==='password';
  el.type=h?'text':'password';
  btn.innerHTML=h?'<i class="fas fa-eye-slash"></i>':'<i class="fas fa-eye"></i>';
}

/* ── STRENGTH ── */
function strScore(pw){let s=0;if(pw.length>=8)s++;if(/[A-Z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^a-zA-Z0-9]/.test(pw))s++;return s}
document.getElementById('spw').addEventListener('input',function(){
  const s=strScore(this.value),cl=['','c1','c2','c3','c4'],lb=['','Weak','Fair','Good','Strong'];
  [1,2,3,4].forEach(i=>{const b=document.getElementById('b'+i);b.className='sb';if(i<=s)b.classList.add(cl[s])});
  document.getElementById('slbl').textContent=this.value?(lb[s]||'Weak')+' password':'Enter a password';
});
function passScore(pw){
  let s=0;
  if(pw.length>=8)s++;
  if(/[A-Z]/.test(pw))s++;
  if(/[0-9]/.test(pw))s++;
  if(/[^a-zA-Z0-9]/.test(pw))s++;
  return s
}

document.getElementById('fp-np').addEventListener('input',function(){
  const s=strScore(this.value),cl=['','c1','c2','c3','c4'],lb=['','Weak','Fair','Good','Strong'];
  [1,2,3,4].forEach(i=>{
    const b=document.getElementById('fpb'+i);
    if(b)b.className='sb';
    if(i<=s && b)b.classList.add(cl[s])
  });
  document.getElementById('fp-np-hint').textContent=this.value?(lb[s]||'Weak')+' password':'Enter password';
});

/* ── EMAIL LIVE VALIDATION ── */
function isEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}

function liveEm(inId,hId,hintCls){
  const el=document.getElementById(inId),h=document.getElementById(hId);if(!el)return;
  el.addEventListener('blur',function(){
    if(!this.value){h.textContent='';return}
    if(!isEmail(this.value)){this.classList.add('bad');this.classList.remove('ok');h.className=hintCls+' e';h.innerHTML='<i class="fas fa-circle-exclamation"></i> Enter a valid email'}
    else{this.classList.add('ok');this.classList.remove('bad');h.className=hintCls+' g';h.innerHTML='<i class="fas fa-circle-check"></i> Looks good!'}
  });
  el.addEventListener('focus',function(){this.classList.remove('bad','ok');h.textContent=''});
}
liveEm('sem','hse','of-hint');
liveEm('lem','hle','of-hint');

/* ── TOAST ── */
function toast(msg,type=''){
  const t=document.getElementById('toast'),m=document.getElementById('tmsg'),ic=t.querySelector('.tic');
  t.className='toast show '+type;m.textContent=msg;
  ic.className='tic fas fa-'+(type==='e'?'circle-xmark':type==='g'?'circle-check':'circle-info');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3500);
}

/* ── SUCCESS ── */
function redirection(){window.location.href= window.redirect}
function showSov(title,sub,url="/"){document.getElementById('stitle').textContent=title;document.getElementById('ssub').textContent=sub;document.getElementById('sov').classList.add('show');window.redirect=url}
function closeSov(){document.getElementById('sov').classList.remove('show')}
document.getElementById('sov').addEventListener('click',e=>{if(e.target===e.currentTarget)closeSov()});

/* ── SHAKE ── */
function shake(id){const el=document.getElementById(id);el.style.animation='';el.offsetWidth;el.style.animation='shakeX .4s ease';setTimeout(()=>el.style.animation='',400)}

/* ── SIGN UP ── */
function doSignup(e){
  e.preventDefault();
  const form = document.getElementById("fsup");
  const formdata = new FormData(form);
  
  const fn=document.getElementById('sfn').value.trim();
  const ln=document.getElementById('sln').value.trim();
  const em=document.getElementById('sem').value.trim();
  const pw=document.getElementById('spw').value;
  const tc=document.getElementById('stc').checked;
  if(!fn){toast('Enter your first name','e');shake('sfn');return}
  if(!ln){toast('Enter your last name','e');shake('sln');return}
  if(!em||!isEmail(em)){toast('Enter a valid email address','e');shake('sem');return}
  if(!pw||pw.length<6){toast('Password must be at least 6 characters','e');shake('spw');return}
  if(strScore(pw)<2){toast('Choose a stronger password','e');shake('spw');return}
  if(!tc){toast('Please accept the Terms & Conditions','e');return}
  document.getElementById('bsub').classList.add('ld');

  fetch("/vendrix/register",{
    method :"POST",
    body:formdata
  }).then(res=>res.json())
.then(data=>{
  if(data.valid){
    toast(data.msg,'g');
  document.getElementById('bsub').classList.remove('ld');

  }else{
    document.getElementById("lem").value = data.email;
    document.getElementById("login").click(); 
  }
});
}

/* ── LOG IN ── */
function doLogin(e){
  e.preventDefault();
  const em=document.getElementById('lem').value.trim();
  const pw=document.getElementById('lpw').value;
  // const rm=document.getElementById('lrm').checked;
  if(!em||!isEmail(em)){toast('Enter a valid email address','e');shake('lem');return}
  if(!pw){toast('Enter your password','e');shake('lpw');return}

  const form = document.getElementById("flg");
  const formdata = new FormData(form);
  fetch("/vendrix/login",{
    method:"post",
    body:formdata
  }).then(res=>res.json())
  .then(data=>{
    console.log(data);
    if(data.valid){
      document.getElementById('flg').reset();
      showSov('Welcome Back!','You\'ve successfully signed in to your Vendrix account.',data.redirect);
    }else{
      toast(data.message,'e');shake('lpw');
    }
  }
  )
}

/* ── FORGOT PASSWORD FLOW ── */

function doForgot(){
  const em = document.getElementById('lem').value.trim();
  if(!em || !isEmail(em)){
    toast('Enter your email address first','e');
    document.getElementById('lem').focus();
    return;
  }
  // Populate email badge in modal
  document.getElementById('fp-em-show').textContent = em;
  document.getElementById('fp-em-show2').textContent = em;
  // Reset to step 1
  fpGoStep(1, true);
  document.getElementById('fp-ov').classList.add('show');
}

function closeFp(){
  if(countdown)clearInterval(countdown);
  document.getElementById('fp-ov').classList.remove('show');
  // clear OTP input
  const otpEl = document.getElementById('otp-single');
  if(otpEl){ otpEl.value=''; otpEl.className='otp-single'; }
  document.getElementById('otp-hint').textContent='';
  // clear new password fields
  const np=document.getElementById('fp-np'), cp=document.getElementById('fp-cp');
  if(np) np.value=''; if(cp) cp.value='';
  document.getElementById('fp-np-hint').textContent='';
  document.getElementById('fp-cp-hint').textContent='';
  [1,2,3,4].forEach(i=>{ const b=document.getElementById('fpb'+i); if(b) b.className='sb'; });
}

function fpBgClose(e){ if(e.target===e.currentTarget) closeFp(); }

function fpGoStep(n, init=false){
  [1,2,3].forEach(i=>{
    document.getElementById('fps'+i).classList.toggle('act', i===n);
  });
  // dots
  [1,2,3].forEach(i=>{
    const d = document.getElementById('fsd'+i);
    d.className = 'fp-step-dot';
    if(i < n) d.classList.add('done');
    else if(i === n) d.classList.add('act');
  });
  // lines
  [1,2].forEach(i=>{
    const l = document.getElementById('fsl'+i);
    l.className = 'fp-step-line';
    if(i < n) l.classList.add('done');
  });
}

function fpSendOtp(){
  const email = document.getElementById("fp-em-show").innerText;
   console.log(email);
   const formdata = new FormData();
   formdata.append("email",email);
   fetch("/forget/generateOtp",{
    method : "post",
    body:formdata,
   }).then(res=>res.json())
   .then(data=>{
    if(data.valid){
      tempToken = data.tempToken;
      toast('OTP sent! Check your inbox','g');
      sixtySeconds();
      fpGoStep(2);
    }else{
      toast('Email Id not found','e');
      closeFp();
    }
   });
}

function resendOtp(){
  const timerbox = document.getElementById("timerbox");
  const forgetpass = document.getElementById("forgetpass");
  timerbox.style.display = "inline";
  forgetpass.style.display = "none";
  sixtySeconds();

  const el = document.getElementById('otp-single');
  el.value = '';
  el.className = 'otp-single';
  document.getElementById('otp-hint').textContent='';
  el.focus();

  fpSendOtp();
}

/* Single OTP input — cap at 6 digits, clear error state */
function otpSingleInput(el){
  let v = el.value.replace(/\D/g,'');
  if(v.length > 6) v = v.slice(0,6);
  el.value = v;
  el.classList.remove('bad','ok');
  document.getElementById('otp-hint').textContent='';
}

function fpVerifyOtp(){
  //invalid, expired, valid
  const el = document.getElementById('otp-single');
  const entered = el.value.trim();
  const hint = document.getElementById('otp-hint');
  hint.textContent='';
  el.classList.remove('bad','ok');

  if(entered.length < 6){
    hint.className='otp-hint e';
    hint.innerHTML='<i class="fas fa-circle-exclamation"></i> Enter the full 6-digit OTP';
    el.classList.add('bad');
    shake('otp-single');
    return;
  }
  const form = document.getElementById("userotp");
  const formdata = new FormData(form);
  formdata.append("tempToken",tempToken);

  fetch("/forget/verifyOtp",{
    method:"post",
    body:formdata
  }).then(res=>res.json()).then(data=>{
    if(data.valid =="expired"){
      hint.className='otp-hint e';
      hint.innerHTML='<i class="fas fa-circle-exclamation"></i> OTP Expired. Try again';
      el.classList.add('bad');
      shake('otp-single');
      return;
    }else if(data.valid == "invalid"){
      hint.className='otp-hint e';
      hint.innerHTML='<i class="fas fa-circle-exclamation"></i> Incorrect OTP. Try again';
      el.classList.add('bad');
      shake('otp-single');
      return;
    }else{
      el.classList.add('ok');
      hint.className='otp-hint g';
      hint.innerHTML='<i class="fas fa-circle-check"></i> Verified!';
      setTimeout(()=>fpGoStep(3), 600);
    }
  })
  
}

/* Password toggle in modal */
function tpwFp(id, btn){
  const el=document.getElementById(id), h=el.type==='password';
  el.type=h?'text':'password';
  btn.innerHTML=h?'<i class="fas fa-eye-slash"></i>':'<i class="fas fa-eye"></i>';
}

/* Strength for new password in modal */
document.addEventListener('DOMContentLoaded', ()=>{
  const npEl = document.getElementById('fp-np');
  if(npEl) npEl.addEventListener('input', function(){
    const s=strScore(this.value), cl=['','c1','c2','c3','c4'];
    [1,2,3,4].forEach(i=>{const b=document.getElementById('fpb'+i);if(b){b.className='sb';if(i<=s)b.classList.add(cl[s])}});
  });
});

function fpResetPw(){
  const np=document.getElementById('fp-np').value;
  const cp=document.getElementById('fp-cp').value;
  const nh=document.getElementById('fp-np-hint');
  const ch=document.getElementById('fp-cp-hint');
  nh.textContent=''; ch.textContent='';
  document.getElementById('fp-np').classList.remove('bad','ok');
  document.getElementById('fp-cp').classList.remove('bad','ok');

  if(!np || np.length < 6){
    nh.className='fp-hint e';
    nh.innerHTML='<i class="fas fa-circle-exclamation"></i> Min. 6 characters';
    document.getElementById('fp-np').classList.add('bad');
    shake('fp-np'); return;
  }
  if(passScore(np) < 2){
    nh.className='fp-hint e';
    nh.innerHTML='<i class="fas fa-circle-exclamation"></i> Choose a stronger password';
    document.getElementById('fp-np').classList.add('bad');
    shake('fp-np'); return;
  }
  if(!cp){
    ch.className='fp-hint e';
    ch.innerHTML='<i class="fas fa-circle-exclamation"></i> Confirm your password';
    document.getElementById('fp-cp').classList.add('bad');
    shake('fp-cp'); return;
  }
  if(np !== cp){
    ch.className='fp-hint e';
    ch.innerHTML='<i class="fas fa-circle-exclamation"></i> Passwords do not match';
    document.getElementById('fp-cp').classList.add('bad');
    shake('fp-cp'); return;
  }
  const form = document.getElementById("updatePassword");
  const formdata = new FormData(form);
  const email = document.getElementById("fp-em-show").innerText;
  formdata.append("username",email);
  fetch("/forget/updatePassword",{
    method:"post",
    body:formdata
  }).then(res=>res.json()).then(data=>{
    if(data.error){
      ch.className='fp-hint e';
      ch.innerHTML='<i class="fas fa-circle-exclamation"></i> User not found';
      document.getElementById('fp-cp').classList.add('bad');
      shake('fp-cp'); 
      closeFp();
      return;
    }else{
      const btn=document.getElementById('fp-reset-btn');
      btn.classList.add('ld');
      setTimeout(()=>{
        btn.classList.remove('ld');
        closeFp();
        showSov('Password Reset!', 'Your password has been updated. You can now log in with your new password.',"/vendrix/login");
      }, 1500);
    }
  })
}
