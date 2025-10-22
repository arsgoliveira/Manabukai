// ===== Utilitários =====
const fmtBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ===== Splash → Site =====
const intro = document.getElementById('intro');
const enterBtn = document.getElementById('enterSite');
const siteHeader = document.getElementById('siteHeader');
const app = document.getElementById('app');

enterBtn.addEventListener('click', () => {
  intro.style.opacity = 0;
  intro.style.transition = 'opacity .9s ease';
  setTimeout(() => {
    intro.remove();
    siteHeader.classList.remove('hidden');
    app.classList.remove('hidden');
    window.scrollTo(0,0);
  }, 900);
});

// ===== Catálogo (pode trocar/expandir à vontade) =====
const PRODUCTS = [
  { id: 'incenso',   name: 'Incenso Japonês',  img: 'assets/img/p-incenso.jpg', price: 29.9,  stock: 20 },
  { id: 'buda',      name: 'Estátua de Buda',  img: 'assets/img/p-buda.jpg',    price: 89.9,  stock: 8  },
  { id: 'maneki',    name: 'Maneki-neko',      img: 'assets/img/p-maneki.jpg',  price: 69.9,  stock: 12 },
  { id: 'sino',      name: 'Sino dos Ventos',  img: 'assets/img/p-sino.jpg',    price: 49.9,  stock: 15 },
  { id: 'omamori',   name: 'Omamori (Amuleto)',img: 'assets/img/p-omamori.jpg', price: 24.9,  stock: 30 },
];

// Render de produtos
const grid = document.getElementById('productGrid');
function renderProducts(){
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="stock">Estoque: ${p.stock}</div>
      <div class="price">${fmtBRL(p.price)}</div>
      <div class="actions">
        <button class="btn" data-view="${p.id}">Ver</button>
        <button class="btn primary" data-add="${p.id}">Adicionar</button>
      </div>
    </article>
  `).join('');
}
renderProducts();

// ===== Carrinho =====
const CART_KEY = 'portal_jisso_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); // [{id, qty}]

const cartBtn = document.getElementById('openCart');
const cartQty = document.getElementById('cartQty');
const drawer = document.getElementById('cartDrawer');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const sumSubtotal = document.getElementById('sumSubtotal');
const sumShipping = document.getElementById('sumShipping');
const sumTotal = document.getElementById('sumTotal');

function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function countCart(){ return cart.reduce((a,i)=>a+i.qty,0); }
function findProd(id){ return PRODUCTS.find(p=>p.id===id); }

function openDrawer(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }

function addToCart(id, qty=1){
  const p = findProd(id); if(!p) return;
  const row = cart.find(i=>i.id===id);
  if(row){ row.qty = Math.min(row.qty + qty, p.stock); }
  else cart.push({id, qty: Math.min(qty, p.stock)});
  refreshCart();
}

function changeQty(id, delta){
  const row = cart.find(i=>i.id===id); if(!row) return;
  row.qty += delta;
  if(row.qty <= 0) cart = cart.filter(i=>i.id!==id);
  const p = findProd(id); if(p) row.qty = Math.min(row.qty, p.stock);
  refreshCart();
}

function removeItem(id){ cart = cart.filter(i=>i.id!==id); refreshCart(); }

function totals(){
  const subtotal = cart.reduce((acc, i)=> acc + findProd(i.id).price * i.qty, 0);
  // Frete simulado: R$ 0 para subtotal >= 150; caso contrário R$ 19,90
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 19.9;
  return { subtotal, shipping, total: subtotal + shipping };
}

function refreshCart(){
  saveCart();
  cartQty.textContent = countCart();

  cartItems.innerHTML = cart.map(i=>{
    const p = findProd(i.id);
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <div><strong>${p.name}</strong></div>
          <div class="price">${fmtBRL(p.price)}</div>
          <div class="qty">
            <button data-qminus="${i.id}">-</button>
            <span>${i.qty}</span>
            <button data-qplus="${i.id}">+</button>
            <button data-remove="${i.id}" style="margin-left:auto">remover</button>
          </div>
        </div>
        <div style="align-self:center; font-weight:700">${fmtBRL(p.price * i.qty)}</div>
      </div>
    `;
  }).join('') || `<p>Seu carrinho está vazio.</p>`;

  const t = totals();
  sumSubtotal.textContent = fmtBRL(t.subtotal);
  sumShipping.textContent = fmtBRL(t.shipping);
  sumTotal.textContent = fmtBRL(t.total);
  ckTotal.textContent = fmtBRL(t.total);
}

cartBtn.addEventListener('click', openDrawer);
closeCart.addEventListener('click', closeDrawer);
document.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-add]');
  if(add){ addToCart(add.getAttribute('data-add')); }

  const qminus = e.target.closest('[data-qminus]');
  if(qminus){ changeQty(qminus.getAttribute('data-qminus'), -1); }

  const qplus = e.target.closest('[data-qplus]');
  if(qplus){ changeQty(qplus.getAttribute('data-qplus'), +1); }

  const rm = e.target.closest('[data-remove]');
  if(rm){ removeItem(rm.getAttribute('data-remove')); }
});

refreshCart();

// ===== Checkout simulado =====
const goCheckout = document.getElementById('goCheckout');
const modal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const form = document.getElementById('checkoutForm');
const payCard = document.getElementById('payCard');
const payPix = document.getElementById('payPix');
const ckTotal = document.getElementById('ckTotal');
const done = document.getElementById('orderDone');
const msg = document.getElementById('orderMsg');
const finishBack = document.getElementById('finishBack');

goCheckout.addEventListener('click', ()=>{
  if(cart.length === 0){ alert('Seu carrinho está vazio.'); return; }
  closeDrawer();
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
});

closeCheckout.addEventListener('click', ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); });

form.addEventListener('change', (e)=>{
  if(e.target.name === 'pay'){
    if(e.target.value === 'card'){
      payCard.classList.remove('hidden'); payPix.classList.add('hidden');
    }else{
      payPix.classList.remove('hidden'); payCard.classList.add('hidden');
    }
  }
});

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const t = totals();
  if(t.total <= 0){ alert('Carrinho vazio.'); return; }

  // Simulação de “aprovação”
  const data = new FormData(form);
  const name = data.get('name') || 'Cliente';
  const pay = data.get('pay');

  // gera um "número de pedido"
  const orderId = 'JSSO-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  // “finaliza”
  done.classList.remove('hidden');
  form.classList.add('hidden');
  msg.textContent = `Obrigado, ${name}! Pagamento via ${pay === 'pix' ? 'PIX' : 'Cartão'} aprovado (simulado). Número do pedido: ${orderId}.`;
  // limpar carrinho
  cart = [];
  refreshCart();
});

finishBack.addEventListener('click', ()=>{
  modal.classList.remove('show'); modal.setAttribute('aria-hidden','true');
  done.classList.add('hidden'); form.reset(); form.classList.remove('hidden');
});

// ===== Interações da grade (exibir detalhes simples) =====
grid.addEventListener('click', (e)=>{
  const viewBtn = e.target.closest('[data-view]');
  if(!viewBtn) return;
  const p = findProd(viewBtn.getAttribute('data-view'));
  alert(`${p.name}\n\nPreço: ${fmtBRL(p.price)}\nEstoque: ${p.stock}\n\n(Exiba aqui uma página de detalhes se quiser expandir).`);
});

.click-area{
  --top: 12.5%;
  --left: 50%;
  --width: 14%;
  --height: 28%;
}
