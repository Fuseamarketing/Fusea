// ===================================
// NAVIGATION MOBILE
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animation du bouton hamburger
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Fermer le menu mobile lors du clic sur un lien
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
});

// ===================================
// FILTRES DE CATÉGORIES
// ===================================
const categoryButtons = document.querySelectorAll('.category-btn');
const articleCards = document.querySelectorAll('.article-card');

categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        
        // Mettre à jour les boutons actifs
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filtrer les articles avec animation
        articleCards.forEach((card, index) => {
            card.style.animation = 'none';
            
            setTimeout(() => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
                    }, 10);
                } else {
                    card.style.display = 'none';
                }
            }, 10);
        });
    });
});

// ===================================
// NEWSLETTER FORM
// ===================================
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const submitButton = this.querySelector('.btn-submit');
        const email = emailInput.value;
        
        // Validation email basique
        if (!isValidEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        // Désactiver le bouton pendant l'envoi
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        
        // Simuler l'envoi (à remplacer par votre vraie logique d'envoi)
        setTimeout(() => {
            // Succès
            showNotification('Merci ! Vous êtes maintenant inscrit à notre newsletter 🎉', 'success');
            emailInput.value = '';
            submitButton.disabled = false;
            submitButton.innerHTML = 'S\'abonner <i class="fas fa-paper-plane"></i>';
            
            // Ici, vous pourriez faire un vrai appel API :
            // fetch('/api/newsletter', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: email })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showNotification('Merci ! Vous êtes maintenant inscrit 🎉', 'success');
            // })
            // .catch(error => {
            //     showNotification('Une erreur est survenue. Réessayez plus tard.', 'error');
            // });
        }, 1500);
    });
}

// ===================================
// PAGINATION
// ===================================
const paginationNumbers = document.querySelectorAll('.pagination-number');
const paginationBtns = document.querySelectorAll('.pagination-btn');

paginationNumbers.forEach(number => {
    number.addEventListener('click', function() {
        // Mettre à jour les numéros actifs
        paginationNumbers.forEach(num => num.classList.remove('active'));
        this.classList.add('active');
        
        // Scroll vers le haut de la section articles
        const articlesSection = document.querySelector('.articles-section');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Ici vous pourriez charger de nouveaux articles via AJAX
        // loadArticles(pageNumber);
    });
});

// Boutons Précédent/Suivant
paginationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        if (!this.disabled) {
            const activeNumber = document.querySelector('.pagination-number.active');
            const currentPage = parseInt(activeNumber.textContent);
            const isNext = this.textContent.includes('Suivant');
            const newPage = isNext ? currentPage + 1 : currentPage - 1;
            
            // Mettre à jour la page active
            paginationNumbers.forEach(num => {
                if (parseInt(num.textContent) === newPage) {
                    num.click();
                }
            });
        }
    });
});

// ===================================
// SMOOTH SCROLL POUR LES ANCRES
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===================================
// LAZY LOADING DES IMAGES
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    const images = document.querySelectorAll('.article-image img');
    images.forEach(img => imageObserver.observe(img));
}

// ===================================
// FONCTIONS UTILITAIRES
// ===================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Styles inline pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        max-width: 400px;
    `;
    
    // Ajouter les styles d'animation si pas déjà présents
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-content i {
                font-size: 1.25rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Retirer la notification après 4 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 400);
    }, 4000);
}

// ===================================
// ANALYTICS (optionnel)
// ===================================
// Si vous utilisez Google Analytics ou autre
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Tracker les clics sur les articles
articleCards.forEach(card => {
    card.addEventListener('click', function(e) {
        if (e.target.closest('.btn-read-more')) {
            const articleTitle = this.querySelector('.article-title a').textContent;
            trackEvent('Blog', 'Article Click', articleTitle);
        }
    });
});

// Tracker l'inscription newsletter
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function() {
        trackEvent('Newsletter', 'Subscribe', 'Blog Page');
    });
}

// ===================================
// SCROLL TO TOP BUTTON (optionnel)
// ===================================
window.addEventListener('scroll', function() {
    // Vous pouvez ajouter un bouton "retour en haut" si souhaité
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Exemple : afficher un bouton après 500px de scroll
    let scrollButton = document.getElementById('scrollToTop');
    if (!scrollButton && scrollTop > 500) {
        scrollButton = document.createElement('button');
        scrollButton.id = 'scrollToTop';
        scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--primary-violet);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        scrollButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(scrollButton);
    } else if (scrollButton && scrollTop <= 500) {
        scrollButton.remove();
    }
});

console.log('✅ Blog Fusea chargé avec succès!');