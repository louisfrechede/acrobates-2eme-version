/* ============================================================================
   LES ACROBATES — V2
   Animations & interactions · 100% natif (pas de lib externe)
   ============================================================================ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {

        /* --------------------------------------------------------------------
           Footer year
           -------------------------------------------------------------------- */
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        /* --------------------------------------------------------------------
           Nav scroll behavior + burger
           -------------------------------------------------------------------- */
        const nav = document.getElementById('nav');
        const burger = document.getElementById('burger');

        if (nav) {
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
        }

        /* --------------------------------------------------------------------
           Smooth scroll with offset for fixed nav
           -------------------------------------------------------------------- */
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

        /* --------------------------------------------------------------------
           Reveal helper using IntersectionObserver
           -------------------------------------------------------------------- */
        const supportsIO = 'IntersectionObserver' in window;

        const reveal = (el, opts = {}) => {
            const delay = opts.delay || 0;
            el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        };

        if (prefersReduced || !supportsIO) {
            // Fallback : tout afficher direct
            document.querySelectorAll('[data-reveal-text]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        } else {
            /* --------------------------------------------------------------------
               Reveal text on scroll
               -------------------------------------------------------------------- */
            const textObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        reveal(entry.target);
                        textObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

            document.querySelectorAll('[data-reveal-text]').forEach(el => {
                textObserver.observe(el);
            });

            /* --------------------------------------------------------------------
               Stagger reveals for grouped elements
               -------------------------------------------------------------------- */
            const staggerGroups = [
                { selector: '.dish', delay: 60 },
                { selector: '.chip', delay: 40 },
                { selector: '.galerie__item', delay: 80 },
                { selector: '.moment', delay: 100 },
                { selector: '.stats__item', delay: 80 },
                { selector: '.formula__col', delay: 100 },
                { selector: '.reservation__detail', delay: 100 },
                { selector: '.infos__block', delay: 60 }
            ];

            staggerGroups.forEach(({ selector, delay }) => {
                const items = Array.from(document.querySelectorAll(selector));
                if (!items.length) return;

                items.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                });

                const obs = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        items.forEach((el, i) => {
                            setTimeout(() => reveal(el), i * delay);
                        });
                        obs.disconnect();
                    }
                }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

                obs.observe(items[0]);
            });

            /* --------------------------------------------------------------------
               Section labels fade-in
               -------------------------------------------------------------------- */
            const labelObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        labelObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -10% 0px' });

            document.querySelectorAll('.section__label').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(12px)';
                labelObserver.observe(el);
            });
        }

        /* --------------------------------------------------------------------
           Stat counters (animate from 0 to target)
           -------------------------------------------------------------------- */
        const counters = document.querySelectorAll('[data-counter]');
        if (counters.length) {
            const animateCounter = (el) => {
                const target = parseFloat(el.dataset.counter);
                const decimals = parseInt(el.dataset.decimals || '0', 10);
                const duration = 1600;
                const start = performance.now();

                const tick = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = easeOut(progress);
                    const value = target * eased;
                    el.textContent = value.toFixed(decimals).replace('.', ',');
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            };

            if (prefersReduced || !supportsIO) {
                counters.forEach(el => {
                    const target = parseFloat(el.dataset.counter);
                    const decimals = parseInt(el.dataset.decimals || '0', 10);
                    el.textContent = target.toFixed(decimals).replace('.', ',');
                });
            } else {
                const counterObs = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateCounter(entry.target);
                            counterObs.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: '0px 0px -15% 0px', threshold: 0.3 });

                counters.forEach(el => counterObs.observe(el));
            }
        }

        /* --------------------------------------------------------------------
           Magnetic buttons - subtle pull toward cursor (desktop only)
           -------------------------------------------------------------------- */
        if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
            document.querySelectorAll('[data-magnetic]').forEach(el => {
                const strength = 0.25;
                let raf = null;

                const onMove = (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * strength;
                    const y = (e.clientY - rect.top - rect.height / 2) * strength;
                    if (raf) cancelAnimationFrame(raf);
                    raf = requestAnimationFrame(() => {
                        el.style.transition = 'transform 0.1s ease-out';
                        el.style.transform = `translate(${x}px, ${y}px)`;
                    });
                };

                const onLeave = () => {
                    if (raf) cancelAnimationFrame(raf);
                    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
                    el.style.transform = 'translate(0px, 0px)';
                };

                el.addEventListener('mousemove', onMove);
                el.addEventListener('mouseleave', onLeave);
            });
        }

        /* --------------------------------------------------------------------
           Tabs (carte)
           -------------------------------------------------------------------- */
        const tabsRoot = document.getElementById('carteTabs');
        if (tabsRoot) {
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

        /* --------------------------------------------------------------------
           Signatures rail - drag to scroll on desktop
           -------------------------------------------------------------------- */
        const rail = document.getElementById('signaturesRail');
        if (rail && window.matchMedia('(hover: hover)').matches) {
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

        /* --------------------------------------------------------------------
           Galerie items - subtle parallax on hover (desktop only)
           -------------------------------------------------------------------- */
        if (window.matchMedia('(hover: hover)').matches) {
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
        }

    });
})();
