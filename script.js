// STATE --------------------------------------------------
const STORAGE_KEY = 'user_demo_profile_v1';

const defaultState = {
  name:'Leandro Ferreira',
  email:'leandro@example.com',
  avatar:'',
  fuelPref:'',
  brands:[],
  priceMargin:'',
  car:'',
  reviews:[],
  history:[]
};

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return {...defaultState};
  try { return {...defaultState, ...JSON.parse(raw)}; }
  catch { return {...defaultState}; }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

let state = loadState();

// DOM -----------------------------------------------------
const displayName = document.getElementById('displayName');
const displayEmail = document.getElementById('displayEmail');
const avatarEl = document.getElementById('avatar');
const fuelPref = document.getElementById('fuelPref');
const brandContainer = document.getElementById('brandContainer');
const brandInput = document.getElementById('brandInput');
const priceMargin = document.getElementById('priceMargin');
const carSelect = document.getElementById('carSelect');
const carSpecs = document.getElementById('carSpecs');
const reviewsList = document.getElementById('reviewsList');
const historyList = document.getElementById('historyList');
const reviewStation = document.getElementById('reviewStation');
const reviewText = document.getElementById('reviewText');
const reviewScore = document.getElementById('reviewScore');

// RENDER --------------------------------------------------
function renderAll(){
  displayName.textContent = state.name || 'Usuário';
  displayEmail.textContent = state.email || '';

  avatarEl.textContent = state.avatar ? '' : initials(state.name);
  if(state.avatar){
    avatarEl.style.backgroundImage = `url(${state.avatar})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.color = 'transparent';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarEl.style.color = '';
  }

  fuelPref.value = state.fuelPref;
  priceMargin.value = state.priceMargin;

  brandContainer.innerHTML = '';
  state.brands.forEach((b,idx)=>{
    const t = document.createElement('div');
    t.className = 'tag';
    t.textContent = b;

    const x = document.createElement('button');
    x.textContent = '×';
    x.style.background='transparent';
    x.style.marginLeft='8px';
    x.style.border='none';
    x.style.cursor='pointer';
    x.onclick = ()=>{
      state.brands.splice(idx,1);
      saveState();
    }

    t.appendChild(x);
    brandContainer.appendChild(t);
  });

  if(state.car){
    try{
      const c = JSON.parse(state.car);
      carSpecs.innerHTML = `<strong>${c.name}</strong> — consumo ${c.consumo} km/l • tanque ${c.tanque} L`;
    }catch{
      carSpecs.textContent = 'Erro ao ler carro.';
    }
  } else carSpecs.textContent='Nenhum carro selecionado';

  if(state.history.length===0) historyList.textContent='Nenhum posto visitado ainda';
  else{
    historyList.innerHTML='';
    state.history.slice().reverse().forEach((h,idx)=>{
      const div=document.createElement('div');
      div.className='history-item';
      div.innerHTML=`
        <div>
          <strong>${h.name}</strong>
          <div class="muted" style="font-size:12px">${h.brand} • R$ ${Number(h.price).toFixed(2)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="small" onclick="viewOnMap(${idx})">Mapa</button>
          <button class="small" onclick="removeHistory(${state.history.length-1-idx})">Remover</button>
        </div>`;
      historyList.appendChild(div);
    });
  }

  if(state.reviews.length===0) reviewsList.textContent='Nenhuma avaliação ainda';
  else{
    reviewsList.innerHTML='';
    state.reviews.slice().reverse().forEach(r=>{
      const d=document.createElement('div');
      d.className='history-item';
      d.innerHTML=`
        <div>
          <strong>${r.station}</strong>
          <div class='muted' style='font-size:12px'>${r.score}★ • ${r.comment}</div>
        </div>
        <div><small class='muted'>${new Date(r.date).toLocaleString()}</small></div>`;
      reviewsList.appendChild(d);
    });
  }

  reviewStation.innerHTML='';
  state.history.forEach(h=>{
    const op=document.createElement('option');
    op.value=h.name;
    op.textContent=h.name;
    reviewStation.appendChild(op);
  });

  const reco = document.getElementById('recommendation');
  if(state.history.length===0){
    reco.textContent='Sem histórico: adicione postos para ver recomendações.';
  } else {
    const best = state.history.reduce((a,b)=> Number(a.price)<Number(b.price)?a:b);
    const preferred = state.fuelPref || '—';
    const brandHint = state.brands[0] || 'qualquer marca';

    reco.innerHTML = `
      Recomendação com base nas preferências:<br>
      <strong>${best.name}</strong> (${best.brand}) — R$ ${Number(best.price).toFixed(2)}<br>
      Combustível preferido: ${preferred}<br>
      Marca priorizada: ${brandHint}`;
  }
}

function initials(name){
  if(!name) return 'U';
  return name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
}

// EVENTS --------------------------------------------------
document.getElementById('editProfileBtn').onclick = ()=>{
  document.getElementById('modal').style.display='flex';
  document.getElementById('inputName').value = state.name;
  document.getElementById('inputEmail').value = state.email;
  document.getElementById('inputAvatar').value = state.avatar;
};
document.getElementById('closeModal').onclick = () =>
  document.getElementById('modal').style.display='none';

document.getElementById('saveProfileBtn').onclick = ()=>{
  const n=document.getElementById('inputName').value.trim();
  const e=document.getElementById('inputEmail').value.trim();
  const av=document.getElementById('inputAvatar').value.trim();

  if(n) state.name=n;
  if(e) state.email=e;
  state.avatar = av;

  document.getElementById('modal').style.display='none';
  saveState();
};

fuelPref.onchange = ()=>{state.fuelPref=fuelPref.value;saveState();}
priceMargin.onchange = ()=>{state.priceMargin=priceMargin.value;saveState();}
carSelect.onchange = ()=>{state.car=carSelect.value;saveState();}

brandInput.addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    e.preventDefault();
    const v=brandInput.value.trim();
    if(!v) return;
    if(!state.brands.includes(v)) state.brands.push(v);
    brandInput.value='';
    saveState();
  }
});

document.getElementById('addStationBtn').onclick = ()=>{
  const name=document.getElementById('stationName').value.trim();
  const price=document.getElementById('stationPrice').value;
  const brand=document.getElementById('stationBrand').value;

  if(!name||!price) return alert('Preencha nome e preço.');
  state.history.push({name,price:Number(price).toFixed(2),brand,date:Date.now()});

  document.getElementById('stationName').value='';
  document.getElementById('stationPrice').value='';

  saveState();
};

window.removeHistory = (idx)=>{
  if(!confirm('Remover deste histórico?')) return;
  state.history.splice(idx,1);
  saveState();
};

document.getElementById('addReviewBtn').onclick = ()=>{
  const station=reviewStation.value;
  const score=reviewScore.value;
  const comment=reviewText.value.trim();

  if(!station) return alert('Adicione um posto primeiro.');

  state.reviews.push({station,score,comment,date:Date.now()});
  reviewText.value='';
  saveState();
};

document.getElementById('setFuelGas').onclick = ()=>{state.fuelPref='gasolina';saveState();}
document.getElementById('setFuelEthanol').onclick = ()=>{state.fuelPref='etanol';saveState();}
document.getElementById('clearPrefs').onclick = ()=>{
  if(!confirm('Limpar preferências?')) return;
  state.fuelPref='';
  state.brands=[];
  state.priceMargin='';
  saveState();
};

document.getElementById('exportBtn').onclick = ()=>{
  const dataStr="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(state));
  const a=document.createElement('a');
  a.href=dataStr;
  a.download='perfil_export.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

document.getElementById('importFile').onchange = (e)=>{
  const f=e.target.files[0];
  if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const parsed=JSON.parse(r.result);
      state={...defaultState,...parsed};
      saveState();
      alert('Importado com sucesso');
    }catch{
      alert('Arquivo inválido');
    }
  };
  r.readAsText(f);
};

document.getElementById('deleteAccountBtn').onclick = ()=>{
  if(!confirm('Tem certeza? Isso apagará tudo.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  renderAll();
  alert('Conta excluída.');
};

window.viewOnMap = (idx)=>{
  const h=state.history[state.history.length-1-idx];
  alert('Abrir mapa para: '+(h?h.name:'n/d'));
};

// INIT ----------------------------------------------------
renderAll();
