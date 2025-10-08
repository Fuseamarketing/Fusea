// ===================================
// PARTAGE SOCIAL
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Boutons de partage dans le header
    const shareButtons = document.querySelectorAll('.share-btn');
    const shareLargeButtons = document.querySelectorAll('.share-btn-large');
    
    const articleTitle = document.querySelector('.article-main-title').textContent;
    const articleUrl = window.location.href;
    const articleDescription = document.querySelector('meta[name="description"]')?.content || '';

    // Fonction de partage
    function shareArticle(platform) {
        let shareUrl = '';
        
        switch(platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent('Je pense que cet article pourrait t\'intéresser : ' + articleUrl)}`;
                break;
            case 'copy':
                // Copier le lien
                navigator.clipboard.writeText(articleUrl).then(() => {
                    showNotification('Lien copié dans le presse-papier ! 📋', 'success');
                }).catch(() => {
                    showNotification('Erreur lors de la copie du lien', 'error');
                });
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    // Attacher les événements aux petits boutons
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            shareArticle(platform);
        });
    });

    // Attacher les événements aux grands boutons
    shareLargeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.classList.contains('linkedin') ? 'linkedin' :
                           this.classList.contains('twitter') ? 'twitter' :
                           this.classList.contains('facebook') ? 'facebook' :
                           this.classList.contains('email') ? 'email' : '';
            if (platform) shareArticle(platform);
        });
    });
});

// ===================================
// STICKY TABLE OF CONTENTS
// ===================================
const toc = document.querySelector('.table-of-contents');
const articleBody = document.querySelector('.article-body');

if (toc && articleBody) {
    window.addEventListener('scroll', function() {
        const tocRect = toc.getBoundingClientRect();
        const bodyRect = articleBody.getBoundingClientRect();
        
        // Vérifier si on doit rendre la TOC sticky
        if (window.innerWidth > 768) {
            if (tocRect.top <= 100 && bodyRect.bottom > window.innerHeight) {
                toc.style.position = 'sticky';
                toc.style.top = '100px';
            } else {
                toc.style.position = 'relative';
                toc.style.top = 'auto';
            }
        }
    });
}

// ===================================
// HIGHLIGHT SECTION EN COURS DE LECTURE
// ===================================
const sections = document.querySelectorAll('.content-section');
const tocLinks = document.querySelectorAll('.table-of-contents a');

if (sections.length > 0 && tocLinks.length > 0) {
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.style.fontWeight = '400';
            link.style.color = 'var(--text-gray)';
            
            if (link.getAttribute('href') === '#' + current) {
                link.style.fontWeight = '600';
                link.style.color = 'var(--primary-violet)';
            }
        });
    });
}

// ===================================
// BARRE DE PROGRESSION DE LECTURE
// ===================================
const progressBar = document.createElement('div');
progressBar.id = 'reading-progress';
progressBar.style.cssText = `
    position: fixed;
    top: 73px;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-violet), var(--primary-violet-light));
    z-index: 9999;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', function() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.pageYOffset;
    const progress = (scrolled / documentHeight) * 100;
    
    progressBar.style.width = progress + '%';
});

// ===================================
// SMOOTH SCROLL POUR TABLE DES MATIÈRES
// ===================================
tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const offset = 100; // Offset pour le header sticky
            const targetPosition = targetSection.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// NEWSLETTER DANS ARTICLE
// ===================================
const articleNewsletterForm = document.getElementById('articleNewsletterForm');

if (articleNewsletterForm) {
    articleNewsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const submitButton = this.querySelector('button[type="submit"]');
        const email = emailInput.value;
        
        if (!isValidEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        
        // Simuler l'envoi
        setTimeout(() => {
            showNotification('Merci ! Vous êtes maintenant inscrit à notre newsletter 🎉', 'success');
            emailInput.value = '';
            submitButton.disabled = false;
            submitButton.innerHTML = 'Je m\'abonne';
            
            // Tracking (optionnel)
            trackEvent('Newsletter', 'Subscribe', 'Article Page');
        }, 1500);
    });
}

// ===================================
// TEMPS DE LECTURE DYNAMIQUE
// ===================================
function calculateReadingTime() {
    const articleText = document.querySelector('.article-body').innerText;
    const words = articleText.trim().split(/\s+/).length;
    const readingSpeed = 200; // mots par minute
    const minutes = Math.ceil(words / readingSpeed);
    
    const readTimeElements = document.querySelectorAll('.article-read-time, .publish-date');
    readTimeElements.forEach(element => {
        if (element.querySelector('i.fa-clock')) {
            const timeText = element.querySelector('i.fa-clock').nextSibling;
            if (timeText && timeText.nodeType === Node.TEXT_NODE) {
                timeText.textContent = ` ${minutes} min de lecture`;
            }
        }
    });
}

// Calculer au chargement
calculateReadingTime();

// ===================================
// CODE SYNTAX HIGHLIGHTING (si vous avez du code)
// ===================================
// Si vous utilisez des blocs de code, vous pouvez ajouter Prism.js ou highlight.js
// Pour l'instant, on ajoute juste un style basique pour les <code> et <pre>

const codeBlocks = document.querySelectorAll('pre code');
codeBlocks.forEach(block => {
    block.style.cssText = `
        display: block;
        background-color: #1e293b;
        color: #e2e8f0;
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
    `;
    
    // Ajouter un bouton copier
    const copyButton = document.createElement('button');
    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copier';
    copyButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: var(--primary-violet);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: var(--transition);
    `;
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
    
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(block.textContent).then(() => {
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copié !';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Copier';
            }, 2000);
        });
    });
});

// ===================================
// LAZY LOADING IMAGES
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===================================
// ANIMATION AU SCROLL
// ===================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.content-section, .tip-box, .warning-box, .highlight-quote, .content-image');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => observer.observe(element));
};

animateOnScroll();

// ===================================
// IMPRESSION DE L'ARTICLE
// ===================================
function printArticle() {
    window.print();
}

// Ajouter un bouton d'impression (optionnel)
const printButton = document.createElement('button');
printButton.innerHTML = '<i class="fas fa-print"></i>';
printButton.title = 'Imprimer l\'article';
printButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--bg-white);
    color: var(--primary-violet);
    border: 2px solid var(--primary-violet);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
`;

printButton.addEventListener('click', printArticle);
printButton.addEventListener('mouseenter', function() {
    this.style.backgroundColor = 'var(--primary-violet)';
    this.style.color = 'white';
    this.style.transform = 'scale(1.1)';
});
printButton.addEventListener('mouseleave', function() {
    this.style.backgroundColor = 'var(--bg-white)';
    this.style.color = 'var(--primary-violet)';
    this.style.transform = 'scale(1)';
});

document.body.appendChild(printButton);

// ===================================
// TRACKING DE L'ENGAGEMENT
// ===================================
let scrollDepth = 0;
let hasScrolled25 = false;
let hasScrolled50 = false;
let hasScrolled75 = false;
let hasScrolled100 = false;

window.addEventListener('scroll', function() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.pageYOffset;
    const progress = (scrolled / documentHeight) * 100;

    if (progress >= 25 && !hasScrolled25) {
        hasScrolled25 = true;
        trackEvent('Article Engagement', 'Scroll Depth', '25%');
    } else if (progress >= 50 && !hasScrolled50) {
        hasScrolled50 = true;
        trackEvent('Article Engagement', 'Scroll Depth', '50%');
    } else if (progress >= 75 && !hasScrolled75) {
        hasScrolled75 = true;
        trackEvent('Article Engagement', 'Scroll Depth', '75%');
    } else if (progress >= 95 && !hasScrolled100) {
        hasScrolled100 = true;
        trackEvent('Article Engagement', 'Scroll Depth', '100%');
    }
});

// Tracker le temps passé sur la page
let startTime = Date.now();

window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // en secondes
    trackEvent('Article Engagement', 'Time Spent', `${timeSpent}s`);
});

// ===================================
// FONCTIONS UTILITAIRES
// ===================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

console.log('✅ Article scripts loaded successfully!');
