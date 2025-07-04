// script.js (versão com correção "força bruta" de scroll no mobile e melhoria no carrossel de depoimentos mobile)
document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES ---
    const allTabButtons = document.querySelectorAll('[data-tab]');
    const contentSections = document.querySelectorAll('.content-section');
    const navUnderline = document.querySelector('.nav-underline');
    const mainNav = document.getElementById('main-nav');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const flipCards = document.querySelectorAll('.flip-card');
    const faqItems = document.querySelectorAll('.faq-item');

    // --- FUNÇÕES DE NAVEGAÇÃO E ABAS ---
    const updateUnderline = (activeButton) => {
        if (activeButton && window.innerWidth >= 993) {
            navUnderline.style.width = `${activeButton.offsetWidth}px`;
            navUnderline.style.left = `${activeButton.offsetLeft}px`;
            navUnderline.style.opacity = '1';
        } else {
            navUnderline.style.opacity = '0';
        }
    };

    const setActiveTab = (tabId, isInitialLoad = false) => {
        allTabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === `${tabId}-section`);
        });

        const activeButtonForUnderline = document.querySelector(`#main-nav .nav-button[data-tab="${tabId}"]`);
        updateUnderline(activeButtonForUnderline);

        if (!isInitialLoad && mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            mobileMenuButton.querySelector('i').setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }

        // AJUSTE SCROLL TO TOP: Rolar para o topo da página sempre que uma aba for trocada
        if (!isInitialLoad) { // Não rolar para o topo no carregamento inicial da página
            window.scrollTo({ top: 0, behavior: 'auto' }); // 'auto' para um scroll instantâneo
        }
    };

    // --- LÓGICA DO CARROSSEL "SOBRE MIM" ---
    // NOTA: Esta função já está bem implementada para o carrossel JS (que não é o de depoimentos).
    // Não precisa de alteração para o problema atual.
    const initializeJsCarousel = () => {
        const carousels = document.querySelectorAll('.js-carousel');
        carousels.forEach(carousel => {
            const slides = carousel.querySelector('.carousel-slides');
            const items = slides.querySelectorAll('.carousel-slide-item');
            const prevBtn = carousel.querySelector('.carousel-arrow.prev');
            const nextBtn = carousel.querySelector('.carousel-arrow.next');
            if (items.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            };
            let currentIndex = 0;
            const totalItems = items.length;
            let slideInterval = null;
            const firstClone = items[0].cloneNode(true);
            const lastClone = items[totalItems - 1].cloneNode(true);
            slides.appendChild(firstClone);
            slides.insertBefore(lastClone, items[0]);
            slides.style.transform = `translateX(-100%)`;
            const moveToNextSlide = () => {
                if (currentIndex >= totalItems) return;
                currentIndex++;
                slides.style.transition = 'transform 0.5s ease-in-out';
                slides.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
            };
            const moveToPrevSlide = () => {
                if (currentIndex < 0) return;
                currentIndex--;
                slides.style.transition = 'transform 0.5s ease-in-out';
                slides.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
            };
            slides.addEventListener('transitionend', () => {
                if (currentIndex >= totalItems) {
                    slides.style.transition = 'none';
                    currentIndex = 0;
                    slides.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
                }
                if (currentIndex < 0) {
                    slides.style.transition = 'none';
                    currentIndex = totalItems - 1;
                    slides.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
                }
            });
            const startSlideShow = () => {
                if (slideInterval) clearInterval(slideInterval);
                slideInterval = setInterval(moveToNextSlide, 5000);
            };
            const stopSlideShow = () => {
                clearInterval(slideInterval);
            };
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    moveToNextSlide();
                    stopSlideShow();
                    startSlideShow();
                });
            }
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    moveToPrevSlide();
                    stopSlideShow();
                    startSlideShow();
                });
            }
            carousel.addEventListener('mouseenter', stopSlideShow);
            carousel.addEventListener('mouseleave', startSlideShow);
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startSlideShow();
                    } else {
                        stopSlideShow();
                    }
                });
            });
            observer.observe(carousel);
        });
    };

    // --- LÓGICA PARA MITOS E VERDADES ---
    const initializeFlipCards = () => {
        flipCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('active');
            });
        });
    };

    // --- LÓGICA PARA FAQ INTELIGENTE ---
    const initializeFaq = () => {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const icon = item.querySelector('.faq-icon');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-icon').setAttribute('data-lucide', 'plus');
                    }
                });
                if (!isActive) {
                    item.classList.add('active');
                    icon.setAttribute('data-lucide', 'minus');
                } else {
                    item.classList.remove('active');
                    icon.setAttribute('data-lucide', 'plus');
                }
                lucide.createIcons();
            });
        });
    };

    // --- LÓGICA DO FORMULÁRIO DE DEPOIMENTO ---
    const initializeTestimonialForm = () => {
        const openModalBtn = document.getElementById('open-testimonial-modal-btn');
        const modalOverlay = document.getElementById('testimonial-modal-overlay');
        const formContent = document.getElementById('testimonial-modal-content');
        const successMessage = document.getElementById('testimonial-success-message');
        const closeModalBtn = document.getElementById('testimonial-modal-close-btn');
        const closeSuccessBtn = document.getElementById('testimonial-success-close-btn');
        const form = document.getElementById('testimonial-form');
        const starsContainer = document.getElementById('testimonial-rating-stars');
        if (!starsContainer) return;
        const openModal = () => modalOverlay.classList.remove('hidden');
        const closeModal = () => modalOverlay.classList.add('hidden');
        const updateStars = (rating) => {
            const numericRating = parseInt(rating, 10) || 0;
            const currentStars = starsContainer.querySelectorAll('[data-value]');
            currentStars.forEach(s => {
                const starValue = parseInt(s.dataset.value, 10);
                s.classList.toggle('filled', starValue <= numericRating);
            });
        };
        starsContainer.addEventListener('click', (e) => {
            const starElement = e.target.closest('[data-value]');
            if (starElement) {
                const ratingValue = starElement.dataset.value;
                starsContainer.dataset.rating = ratingValue;
                updateStars(ratingValue);
            }
        });
        starsContainer.addEventListener('mouseover', (e) => {
            const starElement = e.target.closest('[data-value]');
            if (starElement) {
                updateStars(starElement.dataset.value);
            }
        });
        starsContainer.addEventListener('mouseout', () => {
            updateStars(starsContainer.dataset.rating);
        });
        const resetForm = () => {
            if (form) form.reset();
            starsContainer.dataset.rating = "0";
            updateStars(0);
        };
        if (openModalBtn) openModalBtn.addEventListener('click', openModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => {
            closeModal();
            setTimeout(() => {
                if (successMessage) successMessage.classList.add('hidden');
                if (formContent) formContent.classList.remove('hidden');
            }, 300);
        });
        if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('testimonial-name').value;
                const message = document.getElementById('testimonial-message').value;
                const rating = starsContainer.dataset.rating;
                if (name.trim() === '' || message.trim() === '' || !rating || rating === '0') {
                    alert('Por favor, preencha todos os campos e selecione uma avaliação.');
                    return;
                }
                if (formContent) formContent.classList.add('hidden');
                if (successMessage) successMessage.classList.remove('hidden');
                lucide.createIcons();
                resetForm();
            });
        }
    };

    // --- LÓGICA: Formulário de Contato para WhatsApp ---
    const initializeContactForm = () => {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function (event) {
                event.preventDefault(); 

                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;
                const numeroWhatsApp = '5548992116200';

                const mensagemTemplate = `Olá, Dra. Vanessa! Meu nome é *${name}*.\n\nEntro em contato através do seu site.\n\n*E-mail para retorno:* ${email}\n\n*Mensagem:*\n${message}`;

                const mensagemCodificada = encodeURIComponent(mensagemTemplate);
                const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;

                window.open(linkWhatsApp, '_blank');
                contactForm.reset();
            });
        }
    };

    // --- LÓGICA PARA O CARROSSEL DEPOIMENTOS (SCROLLING CAROUSEL) ---
    // Esta é a função para o carrossel que você quer controlar por toque.
    const initializeScrollingCarousel = () => {
        const scrollingCarousel = document.querySelector('.scrolling-carousel');
        if (!scrollingCarousel) return;

        const carouselSlides = scrollingCarousel.querySelector('.carousel-slides');

        // Pausar a animação
        const pauseCarousel = () => {
            carouselSlides.style.animationPlayState = 'paused';
        };

        // Retomar a animação
        const resumeCarousel = () => {
            carouselSlides.style.animationPlayState = 'running';
        };

        // Eventos para Desktop (já existiam no seu CSS, mas reforçamos aqui)
        scrollingCarousel.addEventListener('mouseenter', pauseCarousel);
        scrollingCarousel.addEventListener('mouseleave', resumeCarousel);

        // Eventos para Mobile (novidade!)
        scrollingCarousel.addEventListener('touchstart', pauseCarousel);
        scrollingCarousel.addEventListener('touchend', resumeCarousel);
        scrollingCarousel.addEventListener('touchcancel', resumeCarousel); // Para casos onde o toque é interrompido
    };


    // --- EVENT LISTENERS GERAIS ---
    allTabButtons.forEach(button => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    mobileMenuButton.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const icon = mobileMenuButton.querySelector('i');
        const isMenuOpen = mainNav.classList.contains('open');
        icon.setAttribute('data-lucide', isMenuOpen ? 'x' : 'menu');
        lucide.createIcons();
    });



    window.addEventListener('resize', () => {
        const activeNavButton = document.querySelector('#main-nav .nav-button.active');
        if (activeNavButton) {
            updateUnderline(activeNavButton);
        }
    });

    // --- INICIALIZAÇÃO DE TODAS AS FUNÇÕES ---
    setActiveTab('about', true);
    initializeJsCarousel(); // Carrossel "Sobre Mim"
    initializeScrollingCarousel(); // NOVO: Carrossel de depoimentos
    initializeFlipCards();
    initializeFaq();
    initializeTestimonialForm();
    initializeContactForm();
    lucide.createIcons();
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
