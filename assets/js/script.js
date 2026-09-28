/* ==========================================================================
   Callophere BPO — Dark Theme Interactions
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Mobile menu ---------- */
    const toggle = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');

    if (toggle && drawer) {
        toggle.addEventListener('click', () => {
            const open = drawer.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open);
        });
        drawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                drawer.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Header shrink + scroll progress ---------- */
    const header = document.getElementById('siteHeader');
    const progress = document.getElementById('scrollProgress');

    function onScroll() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
        if (progress) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Scroll reveal (staggered) ---------- */
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || '0', 10);
                    setTimeout(() => entry.target.classList.add('is-visible'), delay);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    /* ---------- Animated counters ---------- */
    const counters = document.querySelectorAll('.counter');
    const counterIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            counterIO.unobserve(el);
            const target = parseInt(el.dataset.target || '0', 10);
            const duration = 1600;
            const start = performance.now();
            function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });
    counters.forEach(c => counterIO.observe(c));

    /* ---------- Service tabs with sliding indicator ---------- */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const indicator = document.getElementById('tabIndicator');

    function moveIndicator(btn) {
        if (!indicator || !btn) return;
        indicator.style.left = btn.offsetLeft + 'px';
        indicator.style.width = btn.offsetWidth + 'px';
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            moveIndicator(btn);

            tabPanels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(btn.dataset.tab);
            if (panel) panel.classList.add('active');
        });
    });

    // Init indicator position + keep on resize
    const initActive = document.querySelector('.tab-btn.active');
    if (initActive) {
        requestAnimationFrame(() => moveIndicator(initActive));
        window.addEventListener('resize', () => moveIndicator(document.querySelector('.tab-btn.active')));
        window.addEventListener('load', () => moveIndicator(document.querySelector('.tab-btn.active')));
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            const isOpen = item.classList.contains('active');
            document.querySelectorAll('.accordion-item.active').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---------- Magnetic buttons ---------- */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });

        /* ---------- 3D tilt cards ---------- */
        document.querySelectorAll('.tilt, .tilt-soft').forEach(card => {
            const strength = card.classList.contains('tilt') ? 7 : 4;
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const rx = ((e.clientY - r.top) / r.height - 0.5) * -strength;
                const ry = ((e.clientX - r.left) / r.width - 0.5) * strength;
                card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });

        /* ---------- Cursor glow ---------- */
        const glow = document.getElementById('cursorGlow');
        if (glow) {
            let gx = 0, gy = 0, tx = 0, ty = 0;
            window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
            (function follow() {
                gx += (tx - gx) * 0.08;
                gy += (ty - gy) * 0.08;
                glow.style.transform = `translate(${gx - 170}px, ${gy - 170}px)`;
                requestAnimationFrame(follow);
            })();
        }
    }

    /* ---------- Contact form ---------- */
    const form = document.getElementById('b2bContactForm');
    const statusBox = document.getElementById('formStatus');

    function showStatus(msg, type) {
        if (!statusBox) return;
        statusBox.textContent = msg;
        statusBox.className = 'form-status-box ' + type;
        statusBox.style.display = 'block';
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const required = ['fullName', 'workEmail', 'companyName', 'phone', 'orgType', 'details'];
            for (const id of required) {
                const field = document.getElementById(id);
                if (!field || !field.value.trim()) {
                    showStatus('Please complete all required fields before submitting.', 'error');
                    if (field) field.focus();
                    return;
                }
            }

            const email = document.getElementById('workEmail').value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showStatus('Please enter a valid business email address.', 'error');
                document.getElementById('workEmail').focus();
                return;
            }

            const consent = document.getElementById('consent');
            if (consent && !consent.checked) {
                showStatus('Please confirm your consent so we can contact you.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');

            // Simulated submission — replace with real endpoint (fetch POST) in production
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                showStatus('Thank you. Your inquiry has been received — our operations team will contact you within one business day.', 'success');
                form.reset();
            }, 1400);
        });
    }

    /* ---------- Legal modal ---------- */
    const modal = document.getElementById('legalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBodyText');
    const modalClose = document.getElementById('modalCloseBtn');

    const legalDocs = {
        privacy: {
            title: 'Privacy Policy',
            body: `<p><em>Last updated: 2026.</em></p>
                <h4>1. Information We Collect</h4>
                <p>Callophere collects business contact information (name, business email, phone, company, role) submitted voluntarily through our B2B consultation forms, as well as standard technical data (browser type, IP address, pages visited) for site analytics.</p>
                <h4>2. Use of Information</h4>
                <p>Information is used solely to respond to business inquiries, evaluate operational requirements, and improve our website experience. We do not sell, rent, or share your data with third parties for marketing purposes.</p>
                <h4>3. Data Protection</h4>
                <p>We apply administrative, technical, and physical safeguards consistent with industry practice. Operational data related to client programs is handled under separate contractual data-processing agreements.</p>
                <h4>4. Retention & Your Rights</h4>
                <p>Inquiry data is retained only as long as needed for the business relationship. You may request access, correction, or deletion of your data at any time by contacting <a href="mailto:contact@callophere.com">contact@callophere.com</a>.</p>
                <h4>5. Cookies</h4>
                <p>This site may use essential cookies and privacy-conscious analytics. No advertising or cross-site tracking cookies are deployed.</p>`
        },
        terms: {
            title: 'Terms of Service',
            body: `<p><em>Last updated: 2026.</em></p>
                <h4>1. Nature of Services</h4>
                <p>Callophere provides business process outsourcing services to organizations (B2B) in the healthcare and insurance sectors. Services are governed by individually executed client agreements, which take precedence over these website terms.</p>
                <h4>2. No Consumer Advice</h4>
                <p>This website is informational and directed at business entities only. Nothing on this site constitutes insurance, legal, or regulatory advice, and no consumer enrollments are solicited or accepted through this site.</p>
                <h4>3. Intellectual Property</h4>
                <p>All content, branding, and materials on this site are the property of Callophere Operations Ltd. and may not be reproduced without written permission.</p>
                <h4>4. Limitation of Liability</h4>
                <p>Callophere is not liable for indirect, incidental, or consequential damages arising from use of this website. Regulatory and compliance responsibilities for client programs are defined in applicable service agreements.</p>
                <h4>5. Governing Law</h4>
                <p>These terms are governed by the laws of the jurisdiction in which Callophere Operations Ltd. is incorporated, without regard to conflict-of-law principles.</p>`
        }
    };

    function openModal(doc) {
        if (!modal) return;
        modalTitle.textContent = doc.title;
        modalBody.innerHTML = doc.body;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }

    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');

    if (privacyLink) privacyLink.addEventListener('click', e => { e.preventDefault(); openModal(legalDocs.privacy); });
    if (termsLink) termsLink.addEventListener('click', e => { e.preventDefault(); openModal(legalDocs.terms); });
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ---------- Smooth anchor offset for sticky header ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });
})();
