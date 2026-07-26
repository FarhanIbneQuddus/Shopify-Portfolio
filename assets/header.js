document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('[data-header]');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchOverlay = document.querySelector('[data-search-overlay]');
  const searchClose = document.querySelector('[data-search-close]');
  const searchInput = document.querySelector('.neu-search-input');

  const cartToggle = document.querySelector('[data-cart-toggle]');
  const cartClose = document.querySelector('[data-cart-close]');
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartOverlay = document.querySelector('[data-cart-overlay]');
  const cartBody = document.querySelector('[data-cart-body]');

  /* Mobile drawer elements */
  const hamburgerToggle = document.querySelector('[data-hamburger-toggle]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');
  const mobileOverlay = document.querySelector('[data-mobile-overlay]');
  const mobileClose = document.querySelector('[data-mobile-close]');

  let headerSpacer = null;
  let triggerPoint = 0;
  let originalHeaderHeight = 0;
  let ticking = false;

  /* Store original fetch before overriding */
  const _originalFetch = window.fetch.bind(window);

  /* ==========================================================
     BODY LOCK
  ========================================================== */
  function syncBodyScrollLock() {
    const searchOpen = searchOverlay && searchOverlay.classList.contains('is-open');
    const cartOpen = cartDrawer && cartDrawer.classList.contains('is-open');
    const mobileOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
    document.body.style.overflow = (searchOpen || cartOpen || mobileOpen) ? 'hidden' : '';
  }

  /* ==========================================================
     HEADER: relative by default, fixed only after it scrolls out
  ========================================================== */
  function setupStickyHeader() {
    if (!header || !header.classList.contains('neu-header--sticky')) return;

    headerSpacer = document.createElement('div');
    headerSpacer.className = 'neu-header-spacer';
    headerSpacer.setAttribute('aria-hidden', 'true');
    header.insertAdjacentElement('afterend', headerSpacer);

    function measureHeader() {
      const wasFixed = header.classList.contains('is-fixed');

      if (wasFixed) {
        header.classList.remove('is-fixed', 'is-scrolled');
      }

      if (headerSpacer) {
        headerSpacer.style.height = '0px';
      }

      const rect = header.getBoundingClientRect();
      originalHeaderHeight = rect.height;
      triggerPoint = window.scrollY + rect.top + rect.height;

      updateHeaderState();
    }

    function updateHeaderState() {
      const shouldFix = window.scrollY >= triggerPoint;

      header.classList.toggle('is-fixed', shouldFix);
      header.classList.toggle('is-scrolled', shouldFix);

      if (headerSpacer) {
        headerSpacer.style.height = shouldFix ? `${originalHeaderHeight}px` : '0px';
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateHeaderState();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureHeader, { passive: true });
    window.addEventListener('load', measureHeader);

    measureHeader();
  }

  /* ==========================================================
     SEARCH
  ========================================================== */
  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('is-open');
    if (searchToggle) searchToggle.classList.add('is-active');
    syncBodyScrollLock();

    window.setTimeout(function () {
      if (searchInput) searchInput.focus();
    }, 100);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
    if (searchToggle) searchToggle.classList.remove('is-active');
    syncBodyScrollLock();
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  /* ==========================================================
     MOBILE DRAWER
  ========================================================== */
  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    if (mobileOverlay) mobileOverlay.classList.add('is-open');
    if (hamburgerToggle) {
      hamburgerToggle.classList.add('is-active');
      hamburgerToggle.setAttribute('aria-expanded', 'true');
    }
    syncBodyScrollLock();
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (mobileOverlay) mobileOverlay.classList.remove('is-open');
    if (hamburgerToggle) {
      hamburgerToggle.classList.remove('is-active');
      hamburgerToggle.setAttribute('aria-expanded', 'false');
    }
    syncBodyScrollLock();
  }

  if (hamburgerToggle) {
    hamburgerToggle.addEventListener('click', function () {
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileDrawer);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileDrawer);
  }

  /* ==========================================================
     MOBILE ACCORDION
  ========================================================== */
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', function (e) {
      const toggleBtn = e.target.closest('[data-mobile-accordion]');
      if (!toggleBtn) return;

      e.preventDefault();
      e.stopPropagation();

      const parentItem = toggleBtn.closest('.neu-mobile-nav__item, .neu-mobile-subnav__item');
      if (!parentItem) return;

      const subnav = parentItem.querySelector(':scope > [data-mobile-subnav]');
      if (!subnav) return;

      const isOpen = subnav.classList.contains('is-open');

      /* Close sibling accordions at same level */
      const siblingContainer = parentItem.parentElement;
      if (siblingContainer) {
        const siblings = siblingContainer.querySelectorAll(':scope > .neu-mobile-nav__item, :scope > .neu-mobile-subnav__item');
        siblings.forEach(function (sibling) {
          if (sibling !== parentItem) {
            const sibSubnav = sibling.querySelector(':scope > [data-mobile-subnav]');
            const sibToggle = sibling.querySelector(':scope > .neu-mobile-nav__row > [data-mobile-accordion]');
            if (sibSubnav) {
              sibSubnav.classList.remove('is-open');
              sibling.classList.remove('is-expanded');
            }
            if (sibToggle) {
              sibToggle.setAttribute('aria-expanded', 'false');
            }
          }
        });
      }

      /* Toggle current */
      if (isOpen) {
        subnav.classList.remove('is-open');
        parentItem.classList.remove('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');

        /* Also close nested accordions */
        const nestedSubnavs = subnav.querySelectorAll('[data-mobile-subnav]');
        const nestedToggles = subnav.querySelectorAll('[data-mobile-accordion]');
        const nestedItems = subnav.querySelectorAll('.neu-mobile-subnav__item');
        nestedSubnavs.forEach(function (ns) { ns.classList.remove('is-open'); });
        nestedToggles.forEach(function (nt) { nt.setAttribute('aria-expanded', 'false'); });
        nestedItems.forEach(function (ni) { ni.classList.remove('is-expanded'); });
      } else {
        subnav.classList.add('is-open');
        parentItem.classList.add('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ==========================================================
     CART DRAWER
  ========================================================== */
  async function fetchAndRenderCart() {
    try {
      const res = await _originalFetch('/cart.js', {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      const cart = await res.json();
      refreshCart(cart);
      return cart;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }

  function showDrawer() {
    if (cartDrawer) cartDrawer.classList.add('is-open');
    if (cartOverlay) cartOverlay.classList.add('is-open');
    if (cartToggle) cartToggle.classList.add('is-active');
    syncBodyScrollLock();
  }

  async function openCart() {
    await fetchAndRenderCart();
    showDrawer();
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('is-open');
    if (cartOverlay) cartOverlay.classList.remove('is-open');
    if (cartToggle) cartToggle.classList.remove('is-active');
    syncBodyScrollLock();
  }

  if (cartToggle) {
    cartToggle.addEventListener('click', function () {
      openCart();
    });
  }

  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  /* ==========================================================
     ESC KEY
  ========================================================== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSearch();
      closeCart();
      closeMobileDrawer();
    }
  });

  /* ==========================================================
     CART AJAX
  ========================================================== */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    });
  }

  function getVariantHtml(item) {
    var title = item.variant_title || '';

    if (!title && item.options_with_values && item.options_with_values.length) {
      var parts = [];
      for (var i = 0; i < item.options_with_values.length; i++) {
        var opt = item.options_with_values[i];
        if (opt.value && opt.value !== 'Default Title') {
          parts.push(opt.value);
        }
      }
      title = parts.join(' / ');
    }

    if (!title || title === 'Default Title') return '';
    var safe = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<p class="neu-cart-item__variant">' + safe + '</p>';
  }

  async function updateCart(key, quantity) {
    try {
      const response = await _originalFetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      });

      const cart = await response.json();
      refreshCart(cart);
    } catch (error) {
      console.error('Cart update failed:', error);
    }
  }

  function refreshCart(cart) {
    const badge = document.querySelector('[data-cart-count]');
    const total = document.querySelector('[data-cart-total]');
    let footer = document.querySelector('.neu-cart-footer');

    if (badge) {
      badge.textContent = cart.item_count;
    }

    if (total) {
      total.textContent = formatMoney(cart.total_price);
    }

    if (!cartBody) return;

    if (cart.item_count === 0) {
      cartBody.innerHTML = `
        <div class="neu-cart-empty">
          <p>Your cart is empty</p>
        </div>
      `;

      if (footer) footer.remove();
      return;
    }

    const itemsHtml = cart.items.map(function (item) {
      var imgSrc = item.image || '';
      if (imgSrc && imgSrc.indexOf('no-image') === -1) {
        if (imgSrc.indexOf('_small') === -1 &&
            imgSrc.indexOf('_medium') === -1 &&
            imgSrc.indexOf('_large') === -1 &&
            imgSrc.indexOf('_grande') === -1 &&
            imgSrc.indexOf('width=') === -1) {
          imgSrc = imgSrc.indexOf('?') !== -1
            ? imgSrc + '&width=240'
            : imgSrc + '?width=240';
        }
      }

      return `
        <li class="neu-cart-item" data-key="${item.key}">
          <div class="neu-cart-item__image">
            ${imgSrc ? `<img src="${imgSrc}" alt="${(item.product_title || '').replace(/"/g, '&quot;')}" loading="lazy">` : ''}
          </div>
          <div class="neu-cart-item__info">
            <h4 class="neu-cart-item__title">${item.product_title}</h4>
            ${getVariantHtml(item)}
            <p class="neu-cart-item__price">${formatMoney(item.final_price)}</p>
            <div class="neu-qty">
              <button class="neu-qty__btn" data-qty-change="minus" data-key="${item.key}" type="button">−</button>
              <span class="neu-qty__value">${item.quantity}</span>
              <button class="neu-qty__btn" data-qty-change="plus" data-key="${item.key}" type="button">+</button>
            </div>
          </div>
          <button class="neu-cart-item__remove" data-remove data-key="${item.key}" type="button" aria-label="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
            </svg>
          </button>
        </li>
      `;
    }).join('');

    cartBody.innerHTML = `<ul class="neu-cart-items">${itemsHtml}</ul>`;

    if (!footer) {
      const aside = document.querySelector('[data-cart-drawer]');
      if (aside) {
        footer = document.createElement('div');
        footer.className = 'neu-cart-footer';
        footer.innerHTML = `
          <div class="neu-cart-subtotal">
            <span>Subtotal</span>
            <span data-cart-total>${formatMoney(cart.total_price)}</span>
          </div>
          <a href="/cart" class="neu-btn neu-btn--secondary">View Cart</a>
          <a href="/checkout" class="neu-btn neu-btn--primary">Checkout</a>
        `;
        aside.appendChild(footer);
      }
    } else {
      const footerTotal = footer.querySelector('[data-cart-total]');
      if (footerTotal) {
        footerTotal.textContent = formatMoney(cart.total_price);
      }
    }
  }

  if (cartBody) {
    cartBody.addEventListener('click', function (e) {
      const qtyBtn = e.target.closest('[data-qty-change]');
      const removeBtn = e.target.closest('[data-remove]');

      if (qtyBtn) {
        const key = qtyBtn.dataset.key;
        const item = qtyBtn.closest('.neu-cart-item');
        const qtyValue = item ? item.querySelector('.neu-qty__value') : null;
        const currentQty = qtyValue ? parseInt(qtyValue.textContent, 10) : 1;
        const nextQty = qtyBtn.dataset.qtyChange === 'plus'
          ? currentQty + 1
          : Math.max(0, currentQty - 1);

        updateCart(key, nextQty);
      }

      if (removeBtn) {
        updateCart(removeBtn.dataset.key, 0);
      }
    });
  }

  /* ==========================================================
     GLOBAL INTERCEPTORS
  ========================================================== */
  function isCartMutationUrl(url) {
    if (!url) return false;
    var u = String(url);
    return /\/cart\/(add|change|update|clear)(\.js|\.json)?(\?|$)/i.test(u);
  }

  window.fetch = function () {
    var args = arguments;
    var url = '';

    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] && args[0].url) {
      url = args[0].url;
    }

    var promise = _originalFetch.apply(window, args);

    if (isCartMutationUrl(url)) {
      promise
        .then(function (res) {
          if (res && res.ok) {
            setTimeout(fetchAndRenderCart, 50);
          }
        })
        .catch(function () { /* ignore */ });
    }

    return promise;
  };

  const _origXhrOpen = XMLHttpRequest.prototype.open;
  const _origXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._neuUrl = url;
    return _origXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    if (isCartMutationUrl(xhr._neuUrl)) {
      xhr.addEventListener('load', function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          setTimeout(fetchAndRenderCart, 50);
        }
      });
    }
    return _origXhrSend.apply(this, arguments);
  };

  /* ==========================================================
     EXPOSE GLOBAL API
  ========================================================== */
  window.NeuCart = {
    open: openCart,
    close: closeCart,
    refresh: refreshCart,

    addAndOpen: async function () {
      try {
        await fetchAndRenderCart();
        showDrawer();
      } catch (err) {
        console.error('NeuCart addAndOpen failed:', err);
        showDrawer();
      }
    },

    fetchAndRefresh: fetchAndRenderCart
  };

  document.dispatchEvent(new CustomEvent('neu-cart:ready'));

  fetchAndRenderCart();
  setupStickyHeader();
});