(function () {
    "use strict";

    /* ---------------------------------------------------------------
       Sticky navigation background on scroll
    --------------------------------------------------------------- */
    var navbar = document.getElementById('navbar');
    function handleNavbarScroll() {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    /* ---------------------------------------------------------------
       Mobile hamburger menu
    --------------------------------------------------------------- */
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    function toggleMenu() {
        var isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (navLinks.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    /* ---------------------------------------------------------------
       Smooth scrolling for anchor links (native scroll-behavior handles
       most of this, but we account for the sticky header offset)
    --------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId.length < 2) return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var headerOffset = 90;
            var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - headerOffset,
                behavior: 'smooth'
            });
        });
    });

    /* ---------------------------------------------------------------
       Active navigation link highlighting on scroll
    --------------------------------------------------------------- */
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], .hero[id]'));
    var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

    function updateActiveLink() {
        var scrollPos = window.scrollY + 140;
        var currentId = '';
        sections.forEach(function (section) {
            if (scrollPos >= section.offsetTop) {
                currentId = section.getAttribute('id');
            }
        });
        navAnchors.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    /* ---------------------------------------------------------------
       Scroll reveal animations
    --------------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }

    /* ---------------------------------------------------------------
       Animated statistics counters
    --------------------------------------------------------------- */
    var counters = document.querySelectorAll('.counter');
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10) || 0;
        var duration = 1600;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
        counters.forEach(function (el) { el.textContent = el.getAttribute('data-target'); });
    }

    /* ---------------------------------------------------------------
       Testimonial carousel
    --------------------------------------------------------------- */
    var track = document.getElementById('testimonialTrack');
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    var dotsWrap = document.getElementById('carouselDots');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var carouselWrap = document.getElementById('testimonialCarousel');
    var currentSlide = 0;
    var autoTimer = null;

    if (slides.length && dotsWrap) {
        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
            dot.addEventListener('click', function () { goToSlide(i); });
            dotsWrap.appendChild(dot);
        });

        function updateCarousel() {
            track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
            Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function goToSlide(index) {
            currentSlide = (index + slides.length) % slides.length;
            updateCarousel();
        }

        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(nextSlide, 6000);
        }
        function stopAuto() {
            if (autoTimer) clearInterval(autoTimer);
        }

        nextBtn.addEventListener('click', function () { nextSlide(); startAuto(); });
        prevBtn.addEventListener('click', function () { prevSlide(); startAuto(); });

        carouselWrap.addEventListener('mouseenter', stopAuto);
        carouselWrap.addEventListener('mouseleave', startAuto);

        updateCarousel();
        startAuto();
    }

    /* ---------------------------------------------------------------
       FAQ accordion
    --------------------------------------------------------------- */
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        var answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function () {
            var isOpen = item.classList.contains('open');

            faqItems.forEach(function (other) {
                other.classList.remove('open');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                other.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* ---------------------------------------------------------------
       Form validation helpers
    --------------------------------------------------------------- */
    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    function isValidPhone(value) {
        return /^[+]?[\d\s()-]{7,}$/.test(value);
    }
    function setFieldError(group, hasError) {
        group.classList.toggle('error', hasError);
    }
    function clearFormErrors(form) {
        form.querySelectorAll('.form-group').forEach(function (g) {
            g.classList.remove('error');
        });
    }

    /* ---------------------------------------------------------------
       Consultation booking form
    --------------------------------------------------------------- */
    var bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(bookingForm);

            var name = document.getElementById('bookName');
            var phone = document.getElementById('bookPhone');
            var email = document.getElementById('bookEmail');
            var service = document.getElementById('bookService');
            var date = document.getElementById('bookDate');
            var time = document.getElementById('bookTime');

            var valid = true;

            if (!name.value.trim()) { setFieldError(name.closest('.form-group'), true); valid = false; }
            if (!isValidPhone(phone.value.trim())) { setFieldError(phone.closest('.form-group'), true); valid = false; }
            if (!isValidEmail(email.value.trim())) { setFieldError(email.closest('.form-group'), true); valid = false; }
            if (!service.value) { setFieldError(service.closest('.form-group'), true); valid = false; }

            if (!date.value) {
                setFieldError(date.closest('.form-group'), true);
                valid = false;
            } else {
                var chosen = new Date(date.value + 'T00:00:00');
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (chosen < today) { setFieldError(date.closest('.form-group'), true); valid = false; }
            }

            if (!time.value) { setFieldError(time.closest('.form-group'), true); valid = false; }

            if (!valid) {
                var firstError = bookingForm.querySelector('.form-group.error');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            /* Simulated submission — replace with a real API/email service call.
               Example:
               fetch('/api/book-consultation', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ name: name.value, phone: phone.value, email: email.value,
                       service: service.value, date: date.value, time: time.value,
                       message: document.getElementById('bookMessage').value })
               });
            */
            document.getElementById('bookingFormFields').style.display = 'none';
            var success = document.getElementById('bookingSuccess');
            success.classList.add('show');
            bookingForm.reset();
        });
    }

    /* ---------------------------------------------------------------
       Contact form
    --------------------------------------------------------------- */
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            clearFormErrors(contactForm);

            var name = document.getElementById('cName');
            var email = document.getElementById('cEmail');
            var phone = document.getElementById('cPhone');
            var subject = document.getElementById('cSubject');
            var message = document.getElementById('cMessage');

            var valid = true;
            if (!name.value.trim()) { setFieldError(name.closest('.form-group'), true); valid = false; }
            if (!isValidEmail(email.value.trim())) { setFieldError(email.closest('.form-group'), true); valid = false; }
            if (!isValidPhone(phone.value.trim())) { setFieldError(phone.closest('.form-group'), true); valid = false; }
            if (!subject.value.trim()) { setFieldError(subject.closest('.form-group'), true); valid = false; }
            if (!message.value.trim()) { setFieldError(message.closest('.form-group'), true); valid = false; }

            if (!valid) {
                var firstError = contactForm.querySelector('.form-group.error');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            /* Simulated submission — replace with a real API/email service call. */
            document.getElementById('contactFormFields').style.display = 'none';
            var success = document.getElementById('contactSuccess');
            success.classList.add('show');
            contactForm.reset();
        });
    }

    /* ---------------------------------------------------------------
       Back to top button
    --------------------------------------------------------------- */
    var backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function () {
        backToTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

})();