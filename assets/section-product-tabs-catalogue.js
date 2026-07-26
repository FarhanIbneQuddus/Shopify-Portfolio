(function () {
  'use strict';

  class CatalogueSection {
    constructor(section) {
      this.section = section;
      this.tabsWrap = section.querySelector('[data-catalogue-tabs]');
      this.tabs = Array.from(section.querySelectorAll('.catalogue-tab'));
      this.panels = Array.from(section.querySelectorAll('.catalogue-panel'));
      this.indicator = section.querySelector('[data-tab-indicator]');
      this.sliders = new Map();
      this.init();
    }

    init() {
      this.initTabs();
      this.initSliders();
      this.initAddToCart();

      this.positionIndicator(false);
      requestAnimationFrame(() => this.positionIndicator(false));
      window.addEventListener('load', () => this.positionIndicator(false));
      window.addEventListener('resize', () => this.positionIndicator(false));

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.positionIndicator(false));
      }
    }

    /* ==========================================================
       TABS
    ========================================================== */
    initTabs() {
      if (!this.tabsWrap) return;

      this.tabsWrap.addEventListener('click', (e) => {
        const tab = e.target.closest('.catalogue-tab');
        if (!tab || !this.tabsWrap.contains(tab)) return;
        e.preventDefault();
        this.activateTab(tab);
      });
    }

    activateTab(tab) {
      const id = tab.dataset.tabId;
      if (!id) return;

      this.tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      this.panels.forEach((p) => {
        p.classList.toggle('is-active', p.dataset.tabPanel === id);
      });

      this.positionIndicator(true);
      this.centerActiveTabInStrip(tab, true);

      // Refresh slider metrics for newly visible panel
      const activePanel = this.panels.find((p) => p.dataset.tabPanel === id);
      if (activePanel) {
        const track = activePanel.querySelector('[data-slider-track]');
        if (track && this.sliders.has(track)) {
          requestAnimationFrame(() => this.sliders.get(track).refresh());
        }
      }
    }

    positionIndicator(animated) {
      if (!this.indicator || !this.tabsWrap) return;
      const active = this.tabsWrap.querySelector('.catalogue-tab.is-active');
      if (!active) return;
      if (active.getBoundingClientRect().width === 0) return;

      const x = active.offsetLeft;
      const width = active.offsetWidth;

      if (!animated) {
        const prev = this.indicator.style.transition;
        this.indicator.style.transition = 'none';
        this.indicator.style.width = `${width}px`;
        this.indicator.style.transform = `translateX(${x}px)`;
        void this.indicator.offsetWidth;
        this.indicator.style.transition = prev;
      } else {
        this.indicator.style.width = `${width}px`;
        this.indicator.style.transform = `translateX(${x}px)`;
      }

      this.indicator.classList.add('is-ready');
    }

    /**
     * Scroll only within the tabs container (not the page)
     * to bring the active tab into center view.
     */
    centerActiveTabInStrip(tab, animated) {
      if (!this.tabsWrap) return;

      const isScrollable = this.tabsWrap.scrollWidth > this.tabsWrap.clientWidth;
      if (!isScrollable) return;

      const containerWidth = this.tabsWrap.clientWidth;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;

      let target = tabLeft - containerWidth / 2 + tabWidth / 2;
      const maxScroll = this.tabsWrap.scrollWidth - containerWidth;
      target = Math.max(0, Math.min(target, maxScroll));

      if (animated && typeof this.tabsWrap.scrollTo === 'function') {
        this.tabsWrap.scrollTo({ left: target, behavior: 'smooth' });
      } else {
        this.tabsWrap.scrollLeft = target;
      }
    }

    /* ==========================================================
       SLIDERS
    ========================================================== */
    initSliders() {
      const wraps = this.section.querySelectorAll('.catalogue-slider-wrap.has-slider');
      wraps.forEach((wrap) => {
        const track = wrap.querySelector('[data-slider-track]');
        const prev = wrap.querySelector('[data-arrow-prev]');
        const next = wrap.querySelector('[data-arrow-next]');
        if (!track) return;
        const slider = new CatalogueSlider(track, prev, next, wrap);
        this.sliders.set(track, slider);
      });
    }

    /* ==========================================================
       ADD TO CART
    ========================================================== */
    initAddToCart() {
      const forms = this.section.querySelectorAll('[data-neu-add-form]');
      forms.forEach((form) => {
        form.addEventListener('submit', (e) => this.onAddSubmit(e, form));
      });
    }

    onAddSubmit(e, form) {
      e.preventDefault();
      const button = form.querySelector('.neu-card__add-btn');
      if (!button || button.classList.contains('is-loading') || button.disabled) return;

      button.classList.add('is-loading');

      const formData = new FormData(form);

      fetch(`${window.routes ? window.routes.cart_add_url : '/cart/add'}.js`, {
        method: 'POST',
        headers: {
          Accept: 'application/javascript',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            console.error('[Cart error]', data.description || data.message);
            this.flashError(button);
            return;
          }
          this.flashSuccess(button);
          this.updateCartUI(data);
        })
        .catch((err) => {
          console.error(err);
          this.flashError(button);
        })
        .finally(() => {
          button.classList.remove('is-loading');
        });
    }

    updateCartUI(data) {
      // Use the global NeuCart API from custom header.js
      if (window.NeuCart && typeof window.NeuCart.addAndOpen === 'function') {
        window.NeuCart.addAndOpen();
      } else {
        // Wait for header to expose NeuCart
        const onReady = () => {
          document.removeEventListener('neu-cart:ready', onReady);
          if (window.NeuCart && typeof window.NeuCart.addAndOpen === 'function') {
            window.NeuCart.addAndOpen();
          }
        };
        document.addEventListener('neu-cart:ready', onReady);

        // Fallback: force-open by adding classes
        const drawer = document.querySelector('[data-cart-drawer]');
        const overlay = document.querySelector('[data-cart-overlay]');
        if (drawer) drawer.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }

      if (typeof window.PUB_SUB_EVENTS !== 'undefined' && typeof window.publish === 'function') {
        window.publish(window.PUB_SUB_EVENTS.cartUpdate, {
          source: 'product-tabs-catalogue',
          productVariantId: data.variant_id || data.id,
          cartData: data,
        });
      }
    }

    flashSuccess(button) {
      button.classList.add('is-success');
      setTimeout(() => button.classList.remove('is-success'), 900);
    }

    flashError(button) {
      button.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 260 }
      );
    }
  }

  /* ==========================================================
     SLIDER — dynamically scrollable per viewport
  ========================================================== */
  class CatalogueSlider {
    constructor(track, prev, next, wrap) {
      this.track = track;
      this.prev = prev;
      this.next = next;
      this.wrap = wrap;

      this.isDown = false;
      this.startX = 0;
      this.startScrollLeft = 0;
      this.currentX = 0;
      this.moved = false;
      this.dragThreshold = 6;
      this.rafId = null;

      this.init();
    }

    init() {
      if (this.prev) {
        this.prev.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollByStep(-1);
        });
      }
      if (this.next) {
        this.next.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollByStep(1);
        });
      }

      // Mouse drag (desktop only — touch uses native scrolling)
      this.track.addEventListener('mousedown', (e) => this.onPointerDown(e), { passive: false });
      window.addEventListener('mouseup', () => this.onPointerUp());
      window.addEventListener('mousemove', (e) => this.onPointerMove(e), { passive: false });

      // Touch: native scroll, only track for click-prevention
      this.track.addEventListener('touchstart', () => { this.moved = false; }, { passive: true });
      this.track.addEventListener('touchmove', () => { this.moved = true; }, { passive: true });

      // Prevent click after drag
      this.track.addEventListener(
        'click',
        (e) => {
          if (this.moved) {
            e.preventDefault();
            e.stopPropagation();
            this.moved = false;
          }
        },
        true
      );

      this.track.addEventListener('scroll', () => this.updateArrows(), { passive: true });

      this._onResize = () => this.refresh();
      window.addEventListener('resize', this._onResize);

      requestAnimationFrame(() => this.refresh());
    }

    isScrollable() {
      return this.track.scrollWidth - this.track.clientWidth > 1;
    }

    getStep() {
      const firstCard = this.track.querySelector('.neu-card');
      if (!firstCard) return this.track.clientWidth * 0.8;
      const style = getComputedStyle(this.track);
      const gap = parseInt(style.columnGap || style.gap || 24, 10) || 24;
      return firstCard.getBoundingClientRect().width + gap;
    }

    scrollByStep(dir) {
      const step = this.getStep();
      const target = this.track.scrollLeft + dir * step;
      this.track.scrollTo({ left: target, behavior: 'smooth' });
    }

    /* --- Mouse-only drag handlers --- */
    onPointerDown(e) {
      if (e.button !== 0) return;
      if (!this.isScrollable()) return;
      this.isDown = true;
      this.moved = false;
      this.startX = e.clientX;
      this.currentX = e.clientX;
      this.startScrollLeft = this.track.scrollLeft;
      this.track.classList.add('is-grabbing');
      e.preventDefault();
    }

    onPointerUp() {
      if (!this.isDown) return;
      this.isDown = false;
      this.track.classList.remove('is-grabbing');
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    onPointerMove(e) {
      if (!this.isDown) return;
      e.preventDefault();
      this.currentX = e.clientX;
      const walk = this.currentX - this.startX;
      if (Math.abs(walk) > this.dragThreshold) this.moved = true;

      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => {
        this.track.scrollLeft = this.startScrollLeft - (this.currentX - this.startX);
        this.rafId = null;
      });
    }

    updateArrows() {
      if (!this.prev || !this.next) return;

      const scrollable = this.isScrollable();

      // Hide arrows entirely when not scrollable
      this.prev.style.display = scrollable ? '' : 'none';
      this.next.style.display = scrollable ? '' : 'none';

      if (!scrollable) return;

      const maxScroll = this.track.scrollWidth - this.track.clientWidth;
      const atStart = this.track.scrollLeft <= 1;
      const atEnd = this.track.scrollLeft >= maxScroll - 1;

      if (atStart) this.prev.setAttribute('disabled', '');
      else this.prev.removeAttribute('disabled');

      if (atEnd) this.next.setAttribute('disabled', '');
      else this.next.removeAttribute('disabled');
    }

    refresh() {
      const scrollable = this.isScrollable();

      if (this.wrap) {
        this.wrap.classList.toggle('is-scrollable', scrollable);
      }

      this.updateArrows();
    }
  }

  /* ==========================================================
     INIT
  ========================================================== */
  function init() {
    document.querySelectorAll('[data-catalogue-section]').forEach((section) => {
      if (section.dataset.catalogueInit === 'true') return;
      section.dataset.catalogueInit = 'true';
      new CatalogueSection(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (e) => {
    if (e.target && e.target.querySelector('[data-catalogue-section]')) {
      init();
    }
  });
})();