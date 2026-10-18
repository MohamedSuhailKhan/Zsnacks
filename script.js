(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Footer year ---------- */
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    /* ---------- Mobile navigation ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');

    function setNav(open) {
        if (!toggle || !nav) return;
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            setNav(toggle.getAttribute('aria-expanded') !== 'true');
        });
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) setNav(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setNav(false);
        });
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.site-header')) setNav(false);
        });
        window.matchMedia('(min-width: 861px)').addEventListener('change', function () { setNav(false); });
    }

    /* ---------- Header state + back-to-top ---------- */
    var header = document.querySelector('.site-header');
    var topBtn = document.getElementById('myBtn');

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (header) header.classList.toggle('scrolled', y > 10);
        if (topBtn) topBtn.classList.toggle('show', y > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (topBtn) {
        topBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Menu category filters (home page) ---------- */
    var chips = document.querySelectorAll('.chip[data-filter]');
    var cards = document.querySelectorAll('.product-card[data-category]');
    var status = document.getElementById('filter-status');

    if (chips.length && cards.length) {
        chips.forEach(function (chip) {
            var f = chip.getAttribute('data-filter');
            var n = f === 'all' ? cards.length : document.querySelectorAll('.product-card[data-category="' + f + '"]').length;
            var count = chip.querySelector('.count');
            if (count) count.textContent = n;

            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                var shown = 0;
                cards.forEach(function (card) {
                    var match = f === 'all' || card.getAttribute('data-category') === f;
                    card.hidden = !match;
                    card.classList.remove('is-entering');
                    if (match) {
                        shown++;
                        void card.offsetWidth; // restart animation
                        card.classList.add('is-entering');
                    }
                });
                if (status) status.textContent = 'Showing ' + shown + (shown === 1 ? ' product' : ' products');
            });
        });
    }

    /* ---------- Scroll-spy for in-page nav (home page) ---------- */
    var spyLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    if (spyLinks.length && 'IntersectionObserver' in window) {
        var map = {};
        spyLinks.forEach(function (a) {
            var target = document.getElementById(a.getAttribute('href').slice(1));
            if (target) map[target.id] = a;
        });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    spyLinks.forEach(function (a) { a.classList.remove('active'); });
                    if (map[entry.target.id]) map[entry.target.id].classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
    }

    /* ======================================================================
       Order basket + email checkout
       ----------------------------------------------------------------------
       Orders are emailed through Web3Forms (https://web3forms.com).
       1. Enter the email address that should receive orders on their site.
       2. They email you an "Access Key". Paste it below.
       Until a key is set, the form falls back to opening the customer's
       email app with the order pre-filled (addressed to ORDER_EMAIL).
       ====================================================================== */
    var WEB3FORMS_ACCESS_KEY = '77433dc7-a12d-4fb2-91b4-b36a5f23fa9b';
    var ORDER_EMAIL = 'Sallim7866@gmail.com';
    var STORAGE_KEY = 'zsnacks-order-v1';

    var drawer = document.getElementById('order-drawer');
    if (!drawer) return;

    var els = {
        empty: document.getElementById('drawer-empty'),
        form: document.getElementById('order-form'),
        success: document.getElementById('drawer-success'),
        list: document.getElementById('order-items'),
        total: document.getElementById('order-total'),
        error: document.getElementById('form-error'),
        submit: document.getElementById('order-submit'),
        toast: document.getElementById('toast'),
        toastText: document.getElementById('toast-text')
    };

    var cart = load();
    var lastTrigger = null;
    var toastTimer;

    function load() {
        try {
            var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }
    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
    }
    function money(n) { return 'R' + n.toFixed(2); }
    function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
    function total() { return cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }

    function updateBadge(bump) {
        var n = count();
        document.querySelectorAll('[data-cart-count]').forEach(function (b) {
            b.textContent = n;
            b.hidden = n === 0;
            if (bump) {
                b.classList.remove('bump');
                void b.offsetWidth;
                b.classList.add('bump');
            }
        });
    }

    function textNode(tag, cls, text) {
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        el.textContent = text;
        return el;
    }

    function render() {
        updateBadge(false);
        var has = cart.length > 0;
        els.empty.hidden = has || !els.success.hidden;
        els.form.hidden = !has;
        els.list.textContent = '';

        cart.forEach(function (item, idx) {
            var li = document.createElement('li');
            li.className = 'order-item';

            var info = document.createElement('div');
            info.className = 'oi-info';
            info.appendChild(textNode('strong', '', item.product + ' · ' + item.flavour));
            info.appendChild(textNode('span', '', money(item.price) + ' ' + item.unit));

            var qty = document.createElement('div');
            qty.className = 'qty';
            var minus = textNode('button', '', '−');
            minus.type = 'button';
            minus.setAttribute('aria-label', 'Decrease quantity of ' + item.product + ' ' + item.flavour);
            minus.dataset.act = 'dec'; minus.dataset.idx = idx;
            var val = textNode('span', 'qty-val', String(item.qty));
            val.setAttribute('aria-live', 'polite');
            var plus = textNode('button', '', '+');
            plus.type = 'button';
            plus.setAttribute('aria-label', 'Increase quantity of ' + item.product + ' ' + item.flavour);
            plus.dataset.act = 'inc'; plus.dataset.idx = idx;
            qty.appendChild(minus); qty.appendChild(val); qty.appendChild(plus);

            var rm = textNode('button', 'oi-remove', 'Remove');
            rm.type = 'button';
            rm.setAttribute('aria-label', 'Remove ' + item.product + ' ' + item.flavour + ' from your order');
            rm.dataset.act = 'rm'; rm.dataset.idx = idx;

            li.appendChild(info); li.appendChild(qty); li.appendChild(rm);
            els.list.appendChild(li);
        });
        els.total.textContent = money(total());
    }

    function openDrawer(trigger) {
        lastTrigger = trigger || null;
        els.error.hidden = true;
        render();
        if (!drawer.open) drawer.showModal();
        document.documentElement.classList.add('no-scroll');
    }
    function closeDrawer() {
        if (drawer.open) drawer.close();
    }
    drawer.addEventListener('close', function () {
        document.documentElement.classList.remove('no-scroll');
        if (!els.success.hidden) { els.success.hidden = true; render(); }
        if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });
    drawer.addEventListener('click', function (e) {
        if (e.target === drawer) closeDrawer(); // click on backdrop
    });

    function showToast(msg) {
        els.toastText.textContent = msg;
        els.toast.hidden = false;
        void els.toast.offsetWidth;
        els.toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            els.toast.classList.remove('show');
            setTimeout(function () { els.toast.hidden = true; }, 300);
        }, 3500);
    }

    /* Global click handling: open/close drawer, add to order */
    document.addEventListener('click', function (e) {
        var openBtn = e.target.closest('[data-open-order]');
        if (openBtn) { els.toast.classList.remove('show'); els.toast.hidden = true; openDrawer(openBtn); return; }

        var closeBtn = e.target.closest('[data-close-order]');
        if (closeBtn) { closeDrawer(); return; }

        var add = e.target.closest('[data-add]');
        if (add) {
            var key = add.dataset.product + '|' + add.dataset.flavour;
            var existing = cart.filter(function (i) { return i.key === key; })[0];
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    key: key,
                    product: add.dataset.product,
                    flavour: add.dataset.flavour,
                    price: parseFloat(add.dataset.price),
                    unit: add.dataset.unit,
                    qty: 1
                });
            }
            save();
            updateBadge(true);
            add.classList.add('added');
            var label = add.querySelector('span');
            if (label) label.textContent = 'Added';
            setTimeout(function () {
                add.classList.remove('added');
                if (label) label.textContent = 'Add to order';
            }, 1400);
            showToast(add.dataset.product + ' · ' + add.dataset.flavour + ' added');
        }
    });

    /* Quantity controls inside the drawer */
    els.list.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-act]');
        if (!btn) return;
        var idx = parseInt(btn.dataset.idx, 10);
        var item = cart[idx];
        if (!item) return;
        if (btn.dataset.act === 'inc') item.qty = Math.min(item.qty + 1, 99);
        if (btn.dataset.act === 'dec') item.qty -= 1;
        if (btn.dataset.act === 'rm' || item.qty < 1) cart.splice(idx, 1);
        save();
        render();
        var again = els.list.querySelector('button[data-idx="' + idx + '"][data-act="' + btn.dataset.act + '"]');
        if (again) again.focus();
    });

    document.getElementById('order-clear').addEventListener('click', function () {
        cart = [];
        save();
        render();
    });

    /* Keep multiple tabs in sync */
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) { cart = load(); render(); }
    });

    /* ---------- Submit ---------- */
    function orderText() {
        var lines = cart.map(function (i) {
            return i.qty + ' x ' + i.product + ' - ' + i.flavour + ' (' + money(i.price) + ' ' + i.unit + ') = ' + money(i.qty * i.price);
        });
        return lines.join('\n') + '\n\nEstimated total: ' + money(total());
    }

    function setError(msg) {
        els.error.textContent = msg;
        els.error.hidden = !msg;
    }

    function finish() {
        cart = [];
        save();
        els.form.reset();
        els.form.hidden = true;
        els.empty.hidden = true;
        els.success.hidden = false;
        updateBadge(false);
    }

    els.form.addEventListener('submit', function (e) {
        e.preventDefault();
        setError('');
        var f = els.form.elements;
        if (!cart.length) { setError('Your order is empty. Add something from the menu first.'); return; }
        if (f.botcheck && f.botcheck.value) return; // bot
        if (!f.name.value.trim()) { setError('Please enter your name.'); f.name.focus(); return; }
        if (!f.phone.value.trim()) { setError('Please enter a phone number so we can reach you.'); f.phone.focus(); return; }
        if (!f.email.validity.valid || !f.email.value.trim()) { setError('Please enter a valid email address.'); f.email.focus(); return; }

        var details = {
            name: f.name.value.trim(),
            phone: f.phone.value.trim(),
            email: f.email.value.trim(),
            notes: f.notes.value.trim()
        };
        var message = 'ORDER\n-----\n' + orderText() +
            '\n\nCUSTOMER\n--------\nName: ' + details.name +
            '\nPhone: ' + details.phone +
            '\nEmail: ' + details.email +
            '\nNotes: ' + (details.notes || '-');

        /* Not configured yet: open the customer's email app instead */
        if (WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
            window.location.href = 'mailto:' + ORDER_EMAIL +
                '?subject=' + encodeURIComponent('New Z Snacks order from ' + details.name) +
                '&body=' + encodeURIComponent(message);
            return;
        }

        els.submit.disabled = true;
        els.submit.classList.add('loading');
        var original = els.submit.innerHTML;
        els.submit.textContent = 'Sending…';

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: 'New Z Snacks order from ' + details.name,
                from_name: 'Z Snacks Website',
                name: details.name,
                email: details.email,
                phone: details.phone,
                message: message
            })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data && data.success) {
                    if (window.gtag) gtag('event', 'order_submitted', { value: total(), currency: 'ZAR' });
                    finish();
                } else {
                    throw new Error((data && data.message) || 'Request failed');
                }
            })
            .catch(function () {
                setError('Sorry, we could not send your order. Please try again, or call us on 076 345 4692.');
            })
            .then(function () {
                els.submit.disabled = false;
                els.submit.classList.remove('loading');
                els.submit.innerHTML = original;
            });
    });

    updateBadge(false);
})();
