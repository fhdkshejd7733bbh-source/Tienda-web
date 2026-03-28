// =============================================
// BASE DE DATOS DE PRODUCTOS
// Agregá categoria: "ropa" | "accesorios" | "deco"
// =============================================
const productos = [
    { 
        id: 1, 
        nombre: "Soporte 'Vino Flotante'", 
        precio: 28500, 
        descripcion: "¡Efecto mágico! Una obra de arte que desafía la gravedad para tus vinos.", 
        // Reemplazá esta URL por tu imagen real, o ponela en la carpeta img/
        img: "img/soporte-vino.jpg",
        imgFallback: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
        categoria: "deco"
    },
    { 
        id: 2, 
        nombre: "Hoodie Minimalist", 
        precio: 45000, 
        descripcion: "Frisa premium abrigada y corte moderno.",
        img: "https://via.placeholder.com/400x400?text=Hoodie",
        categoria: "ropa"
    },
    { 
        id: 3, 
        nombre: "Gorra Snapback", 
        precio: 12000, 
        descripcion: "Estilo urbano con ajuste regulable.",
        img: "https://via.placeholder.com/400x400?text=Gorra",
        categoria: "accesorios"
    },
    { 
        id: 4, 
        nombre: "Pantalón Cargo", 
        precio: 38000, 
        descripcion: "Resistente, cómodo y con múltiples bolsillos.",
        img: "https://via.placeholder.com/400x400?text=Cargo",
        categoria: "ropa"
    }
];

// =============================================
// ESTADO GLOBAL
// =============================================
let carrito = [];
let categoriaActiva = "todos";
let busqueda = "";

// =============================================
// RENDER DE PRODUCTOS
// =============================================
const container = document.getElementById('product-container');

function productosFiltrados() {
    return productos.filter(p => {
        const coincideCategoria = categoriaActiva === "todos" || p.categoria === categoriaActiva;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });
}

function renderizarProductos() {
    container.innerHTML = '';
    const lista = productosFiltrados();

    if (lista.length === 0) {
        container.innerHTML = `<p class="no-results">😕 No se encontraron productos.</p>`;
        return;
    }

    lista.forEach((prod, i) => {
        const div = document.createElement('div');
        div.classList.add('product-card');
        div.style.animationDelay = `${i * 0.07}s`;

        div.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${prod.img}" alt="${prod.nombre}" loading="lazy"
                     onerror="this.onerror=null; this.src='${prod.imgFallback || 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(prod.nombre)}'">
                <button class="btn-quickview" onclick="abrirQuickView(${prod.id})">👁 Ver detalle</button>
            </div>
            <div class="product-info">
                <span class="product-badge">${prod.categoria}</span>
                <h3>${prod.nombre}</h3>
                <p class="product-desc">${prod.descripcion}</p>
                <p class="product-price">$${prod.precio.toLocaleString('es-AR')}</p>
                <button class="btn-add" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// =============================================
// CARRITO
// =============================================
function agregarAlCarrito(id) {
    const item = productos.find(p => p.id === id);
    const existente = carrito.find(c => c.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...item, cantidad: 1 });
    }

    actualizarContador();
    mostrarToast(`✅ "${item.nombre}" agregado al carrito`);
    animarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(c => c.id !== id);
    actualizarContador();
    renderizarCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(c => c.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) eliminarDelCarrito(id);
    else {
        actualizarContador();
        renderizarCarrito();
    }
}

function vaciarCarrito() {
    carrito = [];
    actualizarContador();
    renderizarCarrito();
}

function actualizarContador() {
    const total = carrito.reduce((acc, c) => acc + c.cantidad, 0);
    document.getElementById('cart-count').innerText = total;
}

function calcularTotal() {
    return carrito.reduce((acc, c) => acc + c.precio * c.cantidad, 0);
}

function renderizarCarrito() {
    const cartDiv = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');

    if (carrito.length === 0) {
        cartDiv.innerHTML = `<p class="cart-empty">Tu carrito está vacío 🛍️</p>`;
        totalSpan.innerText = '0';
        return;
    }

    cartDiv.innerHTML = carrito.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.nombre}" class="cart-item-img">
            <div class="cart-item-info">
                <p class="cart-item-name">${item.nombre}</p>
                <p class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                <div class="qty-controls">
                    <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="btn-remove" onclick="eliminarDelCarrito(${item.id})">🗑</button>
        </div>
    `).join('');

    totalSpan.innerText = calcularTotal().toLocaleString('es-AR');
}

// =============================================
// CHECKOUT POR WHATSAPP
// =============================================
function checkoutWhatsApp() {
    if (carrito.length === 0) {
        mostrarToast("⚠️ Tu carrito está vacío.");
        return;
    }

    let mensaje = "🛒 *Hola! Quiero hacer este pedido:*\n\n";
    carrito.forEach(item => {
        mensaje += `• ${item.nombre} x${item.cantidad} = $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n`;
    });
    mensaje += `\n💰 *Total: $${calcularTotal().toLocaleString('es-AR')}*`;

    const url = `https://wa.me/542966734238?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// =============================================
// QUICK VIEW MODAL
// =============================================
function abrirQuickView(id) {
    const prod = productos.find(p => p.id === id);
    document.getElementById('quickview-body').innerHTML = `
        <div class="quickview-inner">
            <img src="${prod.img}" alt="${prod.nombre}">
            <div class="quickview-text">
                <span class="product-badge">${prod.categoria}</span>
                <h2>${prod.nombre}</h2>
                <p>${prod.descripcion}</p>
                <p class="product-price">$${prod.precio.toLocaleString('es-AR')}</p>
                <button class="btn-main" onclick="agregarAlCarrito(${prod.id}); cerrarModal('quick-view-modal')">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    abrirModal('quick-view-modal');
}

// =============================================
// MODALES
// =============================================
function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('modal-visible'), 10);
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('modal-visible');
    setTimeout(() => modal.style.display = 'none', 300);
}

// =============================================
// TOAST NOTIFICATION
// =============================================
let toastTimeout;
function mostrarToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('toast-show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('toast-show'), 2800);
}

// =============================================
// ANIMACIÓN CARRITO — fuerza reflow para reiniciar siempre
// =============================================
function animarCarrito() {
    const btn = document.getElementById('cart-btn');
    btn.classList.remove('cart-bump');
    void btn.offsetWidth; // fuerza reflow: el navegador "olvida" la animación anterior
    btn.classList.add('cart-bump');
    clearTimeout(btn._bumpTimeout);
    btn._bumpTimeout = setTimeout(() => btn.classList.remove('cart-bump'), 450);
}

// =============================================
// MENÚ HAMBURGUESA
// =============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-open');
    hamburger.classList.toggle('ham-active');
});

// =============================================
// BÚSQUEDA EN TIEMPO REAL
// =============================================
document.getElementById('search-input').addEventListener('input', (e) => {
    busqueda = e.target.value;
    renderizarProductos();
    if (busqueda) {
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }
});

// =============================================
// FILTROS DE CATEGORÍA
// =============================================
document.getElementById('filter-bar').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    categoriaActiva = e.target.dataset.cat;
    renderizarProductos();
});

// =============================================
// EVENTOS CARRITO
// =============================================
document.getElementById('cart-btn').addEventListener('click', () => {
    renderizarCarrito();
    abrirModal('cart-modal');
});

document.getElementById('close-cart').addEventListener('click', () => cerrarModal('cart-modal'));
document.getElementById('close-quickview').addEventListener('click', () => cerrarModal('quick-view-modal'));
document.getElementById('checkout-btn').addEventListener('click', checkoutWhatsApp);
document.getElementById('clear-cart-btn').addEventListener('click', vaciarCarrito);

// Cerrar modal al hacer click afuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        cerrarModal(e.target.id);
    }
});

// =============================================
// ARRANCAR LA TIENDA
// =============================================
renderizarProductos();
