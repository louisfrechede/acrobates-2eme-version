/* ============================================================================
   LES ACROBATES — V2
   Animations & interactions · 100% natif, robuste
   ============================================================================ */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Footer year
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Nav scroll behavior
        const nav = document.getElementById('nav');
        if (nav) {
            const handleScroll = () => {
                if (window.scrollY > 80) nav.classList.add('is-scrolled');
                else nav.classList.remove('is-scrolled');
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        }

        // Burger menu
        const burger = document.getElementById('burger');
        if (burger && nav) {
            burger.addEventListener('click', () => nav.classList.toggle('is-open'));
            document.querySelectorAll('.nav__menu a, .nav__cta').forEach(link => {
                link.addEventListener('click', () => nav.classList.remove('is-open'));
            });
        }

        // Smooth scroll with offset
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const navHeight = 90;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });

        // Stat counters - animate when scrolled into view
        initCounters();

        // Tabs (carte)
        initTabs();

        // Drag-to-scroll signatures rail
        initDragRail();

        // Magnetic buttons (subtle effect on desktop)
        initMagnetic();
    }

    /* ----------------------------------------------------------------------
       Stat counters
       ---------------------------------------------------------------------- */
    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length || !('IntersectionObserver' in window)) return;

        const animateCounter = (el) => {
            const target = parseFloat(el.dataset.counter);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const duration = 1600;
            const start = performance.now();

            const tick = (now) => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
                const value = (target * eased).toFixed(decimals).replace('.', ',');
                el.textContent = value;
                if (t < 1) requestAnimationFrame(tick);
            };

            // Reset to 0 just before animating
            el.textContent = (0).toFixed(decimals).replace('.', ',');
            requestAnimationFrame(tick);
        };

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(el => obs.observe(el));
    }

    /* ----------------------------------------------------------------------
       Tabs (carte)
       ---------------------------------------------------------------------- */
    function initTabs() {
        const tabsRoot = document.getElementById('carteTabs');
        if (!tabsRoot) return;

        const buttons = tabsRoot.querySelectorAll('.tabs__btn');
        const panels = tabsRoot.querySelectorAll('.tabs__panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                buttons.forEach(b => b.classList.toggle('is-active', b === btn));
                panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
            });
        });
    }

    /* ----------------------------------------------------------------------
       Drag-to-scroll signatures rail (desktop only)
       ---------------------------------------------------------------------- */
    function initDragRail() {
        const rail = document.getElementById('signaturesRail');
        if (!rail) return;

        let isDown = false;
        let startX = 0;
        let scrollStart = 0;

        rail.addEventListener('mousedown', (e) => {
            isDown = true;
            rail.style.cursor = 'grabbing';
            startX = e.pageX - rail.offsetLeft;
            scrollStart = rail.scrollLeft;
        });

        ['mouseleave', 'mouseup'].forEach(evt => {
            rail.addEventListener(evt, () => {
                isDown = false;
                rail.style.cursor = 'grab';
            });
        });

        rail.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - rail.offsetLeft;
            rail.scrollLeft = scrollStart - (x - startX) * 1.5;
        });

        rail.style.cursor = 'grab';
    }

    /* ----------------------------------------------------------------------
       Magnetic buttons
       ---------------------------------------------------------------------- */
    function initMagnetic() {
        if (window.matchMedia('(hover: none)').matches) return;

        document.querySelectorAll('[data-magnetic]').forEach(el => {
            const strength = 0.2;
            let raf = null;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * strength;
                const y = (e.clientY - rect.top - rect.height / 2) * strength;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    el.style.transform = `translate(${x}px, ${y}px)`;
                });
            });

            el.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.transform = 'translate(0px, 0px)';
                setTimeout(() => { el.style.transition = ''; }, 400);
            });
        });
    }
})();
