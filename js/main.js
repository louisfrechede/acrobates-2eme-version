/* ============================================================================
   LES ACROBATES — V2
   Animations & interactions · Motion One via CDN
   ============================================================================ */

import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@10.18.0/+esm';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------------------------
       Footer year
       ------------------------------------------------------------------------ */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ------------------------------------------------------------------------
       Nav scroll behavior + burger
       ------------------------------------------------------------------------ */
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');

    const handleScroll = () => {
        if (window.scrollY > 80) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (burger) {
        burger.addEventListener('click', () => nav.classList.toggle('is-open'));
    }

    document.querySelectorAll('.nav__menu a, .nav__cta').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('is-open'));
    });

    /* ------------------------------------------------------------------------
       Smooth scroll with offset for fixed nav
       ------------------------------------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navHeight = 90;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        });
    });

    if (prefersReduced) {
        document.querySelectorAll('[data-reveal-text]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    /* ------------------------------------------------------------------------
       Reveal text on scroll (Motion One)
       Each [data-reveal-text] block animates in when entering viewport.
       ------------------------------------------------------------------------ */
    document.querySelectorAll('[data-reveal-text]').forEach(el => {
        inView(el, () => {
            animate(el,
                { opacity: [0, 1], transform: ['translateY(40px)', 'translateY(0px)'] },
                { duration: 0.9, easing: [0.16, 1, 0.3, 1] }
            );
        }, { margin: '0px 0px -10% 0px' });
    });

    /* ------------------------------------------------------------------------
       Stagger reveals for grouped elements
       ------------------------------------------------------------------------ */
    const staggerGroups = [
        { selector: '.dish', delay: 0.06 },
        { selector: '.chip', delay: 0.04 },
        { selector: '.galerie__item', delay: 0.08 },
        { selector: '.moment', delay: 0.1 },
        { selector: '.stats__item', delay: 0.08 },
        { selector: '.formula__col', delay: 0.1 },
        { selector: '.reservation__detail', delay: 0.1 },
        { selector: '.infos__block', delay: 0.06 }
    ];

    staggerGroups.forEach(({ selector, delay }) => {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        // Set initial state
        items.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });

        // Use the first item to detect when group enters view, then animate together
        inView(items[0], () => {
            animate(
                items,
                { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
                { duration: 0.7, delay: stagger(delay), easing: [0.16, 1, 0.3, 1] }
            );
        }, { margin: '0px 0px -10% 0px' });
    });

    /* ------------------------------------------------------------------------
       Stat counters (animate numeric values)
       ------------------------------------------------------------------------ */
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(el => {
        const target = parseFloat(el.dataset.counter);
        const decimals = parseInt(el.dataset.decimals || '0', 10);

        inView(el, () => {
            const obj = { val: 0 };
            animate(
                obj,
                { val: target },
                {
                    duration: 1.6,
                    easing: [0.16, 1, 0.3, 1],
                    onUpdate: (latest) => {
                        el.textContent = latest.toFixed(decimals).replace('.', ',');
                    }
                }
            );
        }, { margin: '0px 0px -15% 0px' });
    });

    /* ------------------------------------------------------------------------
       Magnetic buttons - subtle pull toward cursor
       ------------------------------------------------------------------------ */
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        const strength = 0.25;
        let raf = null;

        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * strength;
            const y = (e.clientY - rect.top - rect.height / 2) * strength;
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
        };

        const onLeave = () => {
            if (raf) cancelAnimationFrame(raf);
            animate(el, { transform: 'translate(0px, 0px)' }, {
                duration: 0.5,
                easing: [0.34, 1.56, 0.64, 1]
            });
        };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });

    /* ------------------------------------------------------------------------
       Tabs (carte)
       ------------------------------------------------------------------------ */
    const tabsRoot = document.getElementById('carteTabs');
    if (tabsRoot) {
        const buttons = tabsRoot.querySelectorAll('.tabs__btn');
        const panels = tabsRoot.querySelectorAll('.tabs__panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;

                buttons.forEach(b => b.classList.toggle('is-active', b === btn));
                panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));

                const activePanel = tabsRoot.querySelector(`[data-panel="${target}"]`);
                if (activePanel) {
                    const items = activePanel.querySelectorAll('li');
                    if (items.length) {
                        animate(
                            items,
                            { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
                            { duration: 0.4, delay: stagger(0.025), easing: [0.16, 1, 0.3, 1] }
                        );
                    }
                }
            });
        });
    }

    /* ------------------------------------------------------------------------
       Signatures rail - drag to scroll on desktop
       ------------------------------------------------------------------------ */
    const rail = document.getElementById('signaturesRail');
    if (rail) {
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

    /* ------------------------------------------------------------------------
       Galerie items - subtle parallax on hover
       ------------------------------------------------------------------------ */
    document.querySelectorAll('.galerie__item').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
            img.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
        });

        item.addEventListener('mouseleave', () => {
            img.style.transform = '';
        });
    });

    /* ------------------------------------------------------------------------
       Section heads fade-in
       ------------------------------------------------------------------------ */
    document.querySelectorAll('.section__label').forEach(el => {
        el.style.opacity = '0';
        inView(el, () => {
            animate(el,
                { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
                { duration: 0.6, easing: [0.16, 1, 0.3, 1] }
            );
        }, { margin: '0px 0px -10% 0px' });
    });
});
