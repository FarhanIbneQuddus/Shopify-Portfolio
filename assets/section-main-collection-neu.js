(function () {
  'use strict';

  const TAG_PARAM = 'filter.p.tag';

  class NeuCollection {
    constructor(root) {
      this.root = root;
      this.collectionUrl = (root.dataset.collectionUrl || window.location.pathname.split('?')[0]).replace(/\/+$/, '');
      this.bindAll();
      this.init();
    }

    bindAll() {
      this.gridWrap = this.root.querySelector('[data-grid-wrap]');
      this.filterToggle = this.root.querySelector('[data-filter-toggle]');
      this.filterBadge = this.root.querySelector('[data-filter-badge]');
      this.filterPanel = this.root.querySelector('[data-filter-panel]');
      this.filterOverlay = this.root.querySelector('[data-filter-overlay]');
      this.filterClose = this.root.querySelector('[data-filter-close]');
      this.filterForm = this.root.querySelector('[data-neu-filter-form]');
      this.filterHeaders = this.root.querySelectorAll('[data-filter-header]');
      this.dropdowns = this.root.querySelectorAll('[data-dropdown]');
      this.sortValue = this.root.querySelector('[data-sort-value]');
      this.sortOptions = this.root.querySelectorAll('[data-sort-option]');
      this.tagCheckboxes = this.root.querySelectorAll('[data-tag-checkbox]');
      this.tagSearch = this.root.querySelector('[data-tag-search]');
      this.tagsCountBadge = this.root.querySelector('[data-tags-count]');
      this.tagChipsContainer = this.root.querySelector('[data-tag-chips-container]');
      this.activeChipsWrap = this.root.querySelector('[data-active-chips]');
      this.clearAllLink = this.root.querySelector('[data-clear-all]');
      this.clearAllInlineLink = this.root.querySelector('[data-clear-all-inline]');

      // Product grid / tag-filtering targets
      this.productGrid = this.root.querySelector('#product-grid');
      this.gridItems = this.root.querySelectorAll('[data-product-tags]');
      this.tagEmptyState = this.root.querySelector('[data-tag-empty-state]');
      this.countNum = this.root.querySelector('[data-count-num]');
      this.countLabel = this.root.querySelector('[data-count-label]');
    }

    init() {
      this.initFilterSidebar();
      this.initFilterCollapse();
      this.initDropdowns();
      this.initSortOptions();
      this.initFilterFormSubmit();
      this.initTagSearch();
      this.initTagCheckboxes();
      this.initAddToCart();
      this.initClearAll();
      this.syncTagsFromUrl();
      this.renderTagChips();
      this.updateFilterBadge();
      this.applyTagFilters();
    }

    /* ==========================================================
       READ TAGS FROM URL
    ========================================================== */
    getSelectedTagsFromUrl() {
      const params = new URLSearchParams(window.location.search);
      return params.getAll(TAG_PARAM);
    }

    /**
     * Check the tag checkboxes based on the URL params.
     */
    syncTagsFromUrl() {
      const selected = this.getSelectedTagsFromUrl();
      const lowered = selected.map((t) => t.toLowerCase());
      this.tagCheckboxes.forEach((cb) => {
        const val = (cb.dataset.tagValue || cb.value || '').toLowerCase();
        cb.checked = lowered.includes(val);
      });

      if (this.tagsCountBadge) {
        if (selected.length > 0) {
          this.tagsCountBadge.textContent = selected.length;
          this.tagsCountBadge.removeAttribute('hidden');
        } else {
          this.tagsCountBadge.setAttribute('hidden', '');
        }
      }
    }

    /* ==========================================================
       TAG CHECKBOXES → INSTANT CLIENT-SIDE FILTERING
    ========================================================== */
    initTagCheckboxes() {
      this.tagCheckboxes.forEach((cb) => {
        cb.addEventListener('change', () => this.onTagCheckboxChange());
      });
    }

    onTagCheckboxChange() {
      this.updateUrlTags();
      this.applyTagFilters();
      this.renderTagChips();
      this.updateFilterBadge();

      if (this.tagsCountBadge) {
        const selected = this.getCheckedTags();
        if (selected.length > 0) {
          this.tagsCountBadge.textContent = selected.length;
          this.tagsCountBadge.removeAttribute('hidden');
        } else {
          this.tagsCountBadge.setAttribute('hidden', '');
        }
      }
    }

    getCheckedTags() {
      const tags = [];
      this.tagCheckboxes.forEach((cb) => {
        if (cb.checked) tags.push(cb.dataset.tagValue || cb.value);
      });
      return tags;
    }

    /**
     * Keep the URL (and browser history) in sync with checked tags
     * without triggering a page reload, so the state stays shareable/bookmarkable.
     */
    updateUrlTags() {
      const params = new URLSearchParams(window.location.search);
      params.delete(TAG_PARAM);
      this.getCheckedTags().forEach((t) => params.append(TAG_PARAM, t));
      const qs = params.toString();
      const url = this.collectionUrl + (qs ? `?${qs}` : '');
      window.history.replaceState({}, '', url);
    }

    /**
     * Show/hide already-rendered product cards based on selected tags.
     * Multiple selected tags are combined with OR logic (matches any).
     *
     * FIXED: Both the selected tags and the product tags are lowercased
     * before comparison so "Caps" matches "caps", etc.
     */
    applyTagFilters() {
      // Re-query in case the grid markup was just replaced (e.g. after a native filter fetch)
      this.gridItems = this.root.querySelectorAll('[data-product-tags]');

      const selected = this.getCheckedTags().map((t) => t.toLowerCase().trim());
      let visibleCount = 0;

      this.gridItems.forEach((item) => {
        if (selected.length === 0) {
          item.style.display = '';
          visibleCount += 1;
          return;
        }

        const itemTags = (item.dataset.productTags || '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        const matches = selected.some((tag) => itemTags.includes(tag));

        if (matches) {
          item.style.display = '';
          visibleCount += 1;
        } else {
          item.style.display = 'none';
        }
      });

      this.updateCount(visibleCount);
      this.toggleTagEmptyState(visibleCount === 0 && this.gridItems.length > 0);
    }

    updateCount(count) {
      if (this.countNum) this.countNum.textContent = count;
      if (this.countLabel) this.countLabel.textContent = count === 1 ? 'Product' : 'Products';
    }

    toggleTagEmptyState(show) {
      if (!this.tagEmptyState) return;
      if (show) {
        this.tagEmptyState.removeAttribute('hidden');
        if (this.productGrid) this.productGrid.style.display = 'none';
      } else {
        this.tagEmptyState.setAttribute('hidden', '');
        if (this.productGrid) this.productGrid.style.display = '';
      }
    }

    /* ==========================================================
       RENDER TAG CHIPS
    ========================================================== */
    renderTagChips() {
      if (!this.tagChipsContainer) return;
      const tags = this.getSelectedTagsFromUrl();
      this.tagChipsContainer.innerHTML = tags
        .map(
          (t) => `
          <button type="button" class="neu-chip" data-remove-tag data-tag-value="${this.escapeAttr(t)}">
            <span>${this.escapeHtml(t)}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        `
        )
        .join('');

      // Show/hide chips wrapper based on any active filters
      const hasChips =
        tags.length > 0 ||
        (this.activeChipsWrap && this.activeChipsWrap.querySelectorAll('.neu-chip').length > 1);

      if (this.activeChipsWrap) {
        if (hasChips) this.activeChipsWrap.removeAttribute('hidden');
        else this.activeChipsWrap.setAttribute('hidden', '');
      }

      // Attach removal handlers
      this.tagChipsContainer.querySelectorAll('[data-remove-tag]').forEach((chip) => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const val = chip.dataset.tagValue;
          this.removeTag(val);
        });
      });
    }

    escapeAttr(str) {
      return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
      );
    }

    /* ==========================================================
       FILTER BADGE COUNT (includes tags)
    ========================================================== */
    updateFilterBadge() {
      if (!this.filterBadge) return;
      const params = new URLSearchParams(window.location.search);
      let count = 0;
      for (const [key, value] of params.entries()) {
        if (key === 'sort_by' || key === 'page') continue;
        if (value === '') continue;
        count += 1;
      }
      if (count > 0) {
        this.filterBadge.textContent = count;
        this.filterBadge.removeAttribute('hidden');
      } else {
        this.filterBadge.setAttribute('hidden', '');
      }
    }

    /* ==========================================================
       REMOVE ONE TAG
    ========================================================== */
    removeTag(tagValue) {
      const cb = Array.from(this.tagCheckboxes).find(
        (c) => (c.dataset.tagValue || c.value || '').toLowerCase() === String(tagValue).toLowerCase()
      );
      if (cb) {
        cb.checked = false;
        this.onTagCheckboxChange();
        return;
      }

      // Fallback
      const params = new URLSearchParams(window.location.search);
      const all = params.getAll(TAG_PARAM);
      const filtered = all.filter((t) => t.toLowerCase() !== String(tagValue).toLowerCase());
      params.delete(TAG_PARAM);
      filtered.forEach((t) => params.append(TAG_PARAM, t));
      const qs = params.toString();
      const url = this.collectionUrl + (qs ? `?${qs}` : '');
      window.history.replaceState({}, '', url);
      this.syncTagsFromUrl();
      this.applyTagFilters();
      this.renderTagChips();
      this.updateFilterBadge();
    }

    /* ==========================================================
       CLEAR ALL
    ========================================================== */
    initClearAll() {
      if (this.clearAllLink) {
        this.clearAllLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showLoading();
          this.fetchAndReplace(this.collectionUrl);
        });
      }
      if (this.clearAllInlineLink) {
        this.clearAllInlineLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showLoading();
          this.fetchAndReplace(this.collectionUrl);
        });
      }
    }

    /* ==========================================================
       FILTER SIDEBAR
    ========================================================== */
    initFilterSidebar() {
      if (!this.filterToggle || !this.filterPanel) return;

      this.filterToggle.addEventListener('click', () => this.openSidebar());
      if (this.filterClose) this.filterClose.addEventListener('click', () => this.closeSidebar());
      if (this.filterOverlay) this.filterOverlay.addEventListener('click', () => this.closeSidebar());

      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'Escape' &&
          this.filterPanel &&
          !this.filterPanel.hasAttribute('hidden') &&
          this.filterPanel.classList.contains('is-open')
        ) {
          this.closeSidebar();
        }
      });
    }

    openSidebar() {
      if (!this.filterPanel) return;
      this.filterPanel.removeAttribute('hidden');
      requestAnimationFrame(() => this.filterPanel.classList.add('is-open'));
      this.filterToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
      if (!this.filterPanel) return;
      this.filterPanel.classList.remove('is-open');
      this.filterToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!this.filterPanel.classList.contains('is-open')) {
          this.filterPanel.setAttribute('hidden', '');
        }
      }, 400);
    }

    /* ==========================================================
       FILTER GROUP COLLAPSE
    ========================================================== */
    initFilterCollapse() {
      this.filterHeaders.forEach((header) => {
        header.addEventListener('click', () => {
          const expanded = header.getAttribute('aria-expanded') === 'true';
          header.setAttribute('aria-expanded', !expanded);
          const group = header.closest('[data-filter-group]');
          if (group) {
            if (expanded) group.setAttribute('data-collapsed', '');
            else group.removeAttribute('data-collapsed');
          }
        });
      });
    }

    /* ==========================================================
       DROPDOWNS
    ========================================================== */
    initDropdowns() {
      this.dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasOpen = dropdown.classList.contains('is-open');

          this.dropdowns.forEach((d) => {
            if (d !== dropdown) {
              d.classList.remove('is-open');
              const t = d.querySelector('[data-dropdown-trigger]');
              if (t) t.setAttribute('aria-expanded', 'false');
            }
          });

          dropdown.classList.toggle('is-open', !wasOpen);
          trigger.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
        });
      });

      document.addEventListener('click', (e) => {
        this.dropdowns.forEach((d) => {
          if (!d.contains(e.target)) {
            d.classList.remove('is-open');
            const t = d.querySelector('[data-dropdown-trigger]');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    /* ==========================================================
       SORT
    ========================================================== */
    initSortOptions() {
      this.sortOptions.forEach((opt) => {
        opt.addEventListener('click', () => {
          const value = opt.dataset.sortValueAttr;
          const label = opt.textContent.trim();

          this.sortOptions.forEach((o) => o.classList.toggle('is-selected', o === opt));
          if (this.sortValue) this.sortValue.textContent = label;

          const dropdown = opt.closest('[data-dropdown]');
          if (dropdown) {
            dropdown.classList.remove('is-open');
            const t = dropdown.querySelector('[data-dropdown-trigger]');
            if (t) t.setAttribute('aria-expanded', 'false');
          }

          const params = new URLSearchParams(window.location.search);
          params.set('sort_by', value);
          const url = this.collectionUrl + '?' + params.toString();
          this.showLoading();
          this.fetchAndReplace(url);
        });
      });
    }

    /* ==========================================================
       TAG SEARCH (inside sidebar)
    ========================================================== */
    initTagSearch() {
      if (!this.tagSearch) return;
      this.tagSearch.addEventListener('input', () => {
        const q = this.tagSearch.value.trim().toLowerCase();
        const items = this.root.querySelectorAll('[data-tag-item]');
        items.forEach((item) => {
          const name = item.dataset.tagName || '';
          if (!q || name.includes(q)) item.removeAttribute('hidden');
          else item.setAttribute('hidden', '');
        });
      });
    }

    /* ==========================================================
       FILTER FORM SUBMIT
    ========================================================== */
    initFilterFormSubmit() {
      if (!this.filterForm) return;

      this.filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitFilters();
      });
    }

    submitFilters() {
      if (!this.filterForm) return;

      const params = new URLSearchParams();

      // Preserve sort_by
      const currentParams = new URLSearchParams(window.location.search);
      const sortBy = currentParams.get('sort_by');
      if (sortBy) params.set('sort_by', sortBy);

      // Collect tag checkboxes
      this.tagCheckboxes.forEach((cb) => {
        if (cb.checked) {
          const val = cb.dataset.tagValue || cb.value;
          params.append(TAG_PARAM, val);
        }
      });

      // Collect all other named form inputs (real Shopify filters)
      const otherInputs = this.filterForm.querySelectorAll(
        'input[name]:not([data-tag-checkbox]):not([data-sort-input]), select[name]'
      );
      otherInputs.forEach((input) => {
        if (input.type === 'checkbox' && !input.checked) return;
        if (input.value === '' || input.value === null) return;
        params.append(input.name, input.value);
      });

      const url = this.collectionUrl + '?' + params.toString();
      this.showLoading();
      this.closeSidebar();
      this.fetchAndReplace(url);
    }

    /* ==========================================================
       FETCH & REPLACE
    ========================================================== */
    fetchAndReplace(url) {
      fetch(url)
        .then((res) => res.text())
        .then((html) => {
          const parsed = new DOMParser().parseFromString(html, 'text/html');
          const newRoot = parsed.querySelector('[data-neu-collection]');
          if (!newRoot) {
            window.location.href = url;
            return;
          }
          this.root.innerHTML = newRoot.innerHTML;
          window.history.pushState({}, '', url);
          this.hideLoading();
          this.rebind();
        })
        .catch(() => {
          window.location.href = url;
        });
    }

    rebind() {
      this.bindAll();
      this.init();

      if (this.gridWrap) {
        const y = this.gridWrap.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    showLoading() {
      if (this.gridWrap) this.gridWrap.classList.add('is-loading');
    }

    hideLoading() {
      if (this.gridWrap) this.gridWrap.classList.remove('is-loading');
    }

    /* ==========================================================
       ADD TO CART
    ========================================================== */
    initAddToCart() {
      const forms = this.root.querySelectorAll('[data-neu-add-form]');
      forms.forEach((form) => {
        if (form.dataset.neuBound === 'true') return;
        form.dataset.neuBound = 'true';
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
          this.openCart();
        })
        .catch((err) => {
          console.error(err);
          this.flashError(button);
        })
        .finally(() => {
          button.classList.remove('is-loading');
        });
    }

    openCart() {
      if (window.NeuCart && typeof window.NeuCart.addAndOpen === 'function') {
        window.NeuCart.addAndOpen();
      } else {
        const onReady = () => {
          document.removeEventListener('neu-cart:ready', onReady);
          if (window.NeuCart && typeof window.NeuCart.addAndOpen === 'function') {
            window.NeuCart.addAndOpen();
          }
        };
        document.addEventListener('neu-cart:ready', onReady);

        const drawer = document.querySelector('[data-cart-drawer]');
        const overlay = document.querySelector('[data-cart-overlay]');
        if (drawer) drawer.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
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

  function init() {
    document.querySelectorAll('[data-neu-collection]').forEach((root) => {
      if (root.dataset.neuInit === 'true') return;
      root.dataset.neuInit = 'true';
      new NeuCollection(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (e) => {
    if (e.target && e.target.querySelector('[data-neu-collection]')) {
      init();
    }
  });
})();