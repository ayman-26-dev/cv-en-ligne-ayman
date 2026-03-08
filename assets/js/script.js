/* ============================================================
   Custom JavaScript — Ayman Portfolio CV
   Features: 3D Carousel, scroll animations, navbar effects,
             back-to-top, skill bar animation, form handling
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== 1. Navbar Scroll Effect ==========
    const navbar = document.getElementById('mainNav');

    const handleNavbarScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);


    // ========== 2. Close Mobile Menu on Link Click ==========
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.getElementById('navbarContent');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });


    // ========== 3. 3D Projects Carousel ==========
    const carousel = document.getElementById('projectsCarousel');
    const slides = carousel ? Array.from(carousel.querySelectorAll('.carousel-3d-slide')) : [];
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    const activeTitle = document.getElementById('carouselActiveTitle');
    const activeTags = document.getElementById('carouselActiveTags');
    let currentIndex = 0;
    let isAnimating = false;

    if (slides.length > 0) {
        // Create dot indicators
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-3d-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        // Position all slides
        const updateCarousel = () => {
            const total = slides.length;

            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'hidden');

                let diff = i - currentIndex;
                if (diff > total / 2) diff -= total;
                if (diff < -total / 2) diff += total;

                if (diff === 0) {
                    slide.classList.add('active');
                } else if (diff === -1) {
                    slide.classList.add('prev');
                } else if (diff === 1) {
                    slide.classList.add('next');
                } else if (diff === -2) {
                    slide.classList.add('far-prev');
                } else if (diff === 2) {
                    slide.classList.add('far-next');
                } else {
                    slide.classList.add('hidden');
                }
            });

            // Update dots
            const dots = dotsContainer.querySelectorAll('.carousel-3d-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update active project info
            const activeSlide = slides[currentIndex];
            if (activeTitle) {
                activeTitle.style.opacity = '0';
                setTimeout(() => {
                    activeTitle.textContent = activeSlide.dataset.title;
                    activeTitle.style.opacity = '1';
                }, 200);
            }
            if (activeTags) {
                activeTags.style.opacity = '0';
                setTimeout(() => {
                    const tags = activeSlide.dataset.tags.split(', ');
                    activeTags.innerHTML = tags.map(t => `<span class="badge">${t}</span>`).join('');
                    activeTags.style.opacity = '1';
                }, 200);
            }
        };

        const goToSlide = (index) => {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = index;
            updateCarousel();
            setTimeout(() => { isAnimating = false; }, 600);
        };

        const nextSlide = () => {
            goToSlide((currentIndex + 1) % slides.length);
        };

        const prevSlide = () => {
            goToSlide((currentIndex - 1 + slides.length) % slides.length);
        };

        // Button events
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Click on side slides to navigate
        slides.forEach((slide, i) => {
            slide.addEventListener('click', () => {
                if (i !== currentIndex) goToSlide(i);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const rect = carousel.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;

            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // Touch/swipe support
        let touchStartX = 0;
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });

        // Auto-play
        let autoPlay = setInterval(nextSlide, 5000);

        carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
        carousel.addEventListener('mouseleave', () => {
            autoPlay = setInterval(nextSlide, 5000);
        });

        // Initialize
        updateCarousel();
    }


    // ========== 4. Scroll Reveal Animation ==========
    const revealElements = () => {
        const targets = document.querySelectorAll(
            '.about-card, .about-img, .skill-card, .timeline-item, .contact-info-card, .contact-form, .hero-text, .profile-img-wrapper'
        );

        targets.forEach((el, index) => {
            el.classList.add('reveal');
            const siblings = el.parentElement.parentElement.children;
            const siblingIndex = Array.from(siblings).indexOf(el.parentElement);
            if (siblingIndex >= 0 && siblingIndex < 6) {
                el.classList.add(`reveal-delay-${siblingIndex + 1}`);
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    if (entry.target.classList.contains('skill-card')) {
                        animateSkillBar(entry.target);
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        targets.forEach(el => observer.observe(el));
    };

    revealElements();


    // ========== 5. Skill Bar Animation ==========
    const animateSkillBar = (card) => {
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) {
            const targetWidth = progressBar.getAttribute('aria-valuenow') + '%';
            progressBar.style.setProperty('--skill-width', targetWidth);
            card.classList.add('animated');
            setTimeout(() => {
                progressBar.style.width = targetWidth;
            }, 200);
        }
    };


    // ========== 6. Back to Top Button ==========
    const backToTop = document.getElementById('backToTop');

    const handleBackToTop = () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', handleBackToTop);


    // ========== 7. Contact Form Handling ==========
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (name && email && message) {
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Message Sent!';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-primary');
                    btn.disabled = false;
                    contactForm.reset();
                }, 3000);
            }
        });
    }


    // ========== 8. Typing Effect for Hero Title ==========
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '3px solid var(--accent-light)';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        };

        setTimeout(typeWriter, 800);
    }


    // ========== 9. Active Nav Highlight on Scroll ==========
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav);
    highlightNav();

});
