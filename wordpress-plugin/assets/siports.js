// SIPORTS WordPress Plugin JavaScript

(function($) {
    'use strict';
    
    // Initialisation du plugin
    $(document).ready(function() {
        initSiportsCountdown();
        initSiportsAnimations();
        initSiportsInteractions();
    });
    
    // Compte à rebours
    function initSiportsCountdown() {
        $('.countdown-timer').each(function() {
            const $timer = $(this);
            const targetDate = new Date($timer.data('target')).getTime();
            const showDays = $timer.data('show-days') !== false;
            const showHours = $timer.data('show-hours') !== false;
            
            function updateCountdown() {
                const now = new Date().getTime();
                const distance = targetDate - now;
                
                if (distance < 0) {
                    $timer.html('<div class="countdown-expired">🎉 Le salon a commencé !</div>');
                    return;
                }
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                if (showDays) $timer.find('#days').text(days.toString().padStart(2, '0'));
                if (showHours) $timer.find('#hours').text(hours.toString().padStart(2, '0'));
                $timer.find('#minutes').text(minutes.toString().padStart(2, '0'));
                $timer.find('#seconds').text(seconds.toString().padStart(2, '0'));
            }
            
            updateCountdown();
            setInterval(updateCountdown, 1000);
        });
    }
    
    // Animations des statistiques
    function initSiportsAnimations() {
        // Animation des chiffres
        $('.siports-stat-item.animated').each(function() {
            const $item = $(this);
            const $number = $item.find('.stat-number');
            const target = parseInt($number.data('target')) || parseInt($number.text().replace(/[^\d]/g, ''));
            
            if (target && !isNaN(target)) {
                animateNumber($number, 0, target, 2000);
            }
        });
        
        // Observer pour déclencher les animations au scroll
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        $(entry.target).addClass('animate-in');
                    }
                });
            });
            
            $('.siports-exhibitor-card, .siports-event-card, .siports-news-card').each(function() {
                observer.observe(this);
            });
        }
    }
    
    // Animation des chiffres
    function animateNumber($element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * easeOutQuart(progress));
            $element.text(current.toLocaleString());
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    // Interactions utilisateur
    function initSiportsInteractions() {
        // Gestion des favoris
        $(document).on('click', '.siports-favorite-btn', function(e) {
            e.preventDefault();
            const $btn = $(this);
            const exhibitorId = $btn.data('exhibitor-id');
            
            $btn.toggleClass('favorited');
            
            // Animation du cœur
            $btn.find('.heart-icon').addClass('animate-heart');
            setTimeout(() => {
                $btn.find('.heart-icon').removeClass('animate-heart');
            }, 300);
        });
        
        // Filtres dynamiques
        $(document).on('change', '.siports-filter', function() {
            const $container = $(this).closest('.siports-container');
            applyFilters($container);
        });
        
        // Recherche en temps réel
        let searchTimeout;
        $(document).on('input', '.siports-search', function() {
            const $input = $(this);
            const $container = $input.closest('.siports-container');
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters($container);
            }, 300);
        });
    }
    
    // Application des filtres
    function applyFilters($container) {
        const filters = {};
        
        $container.find('.siports-filter').each(function() {
            const $filter = $(this);
            const key = $filter.data('filter');
            const value = $filter.val();
            
            if (value) {
                filters[key] = value;
            }
        });
        
        const searchTerm = $container.find('.siports-search').val();
        if (searchTerm) {
            filters.search = searchTerm;
        }
        
        // Appliquer les filtres visuellement
        $container.find('.siports-item').each(function() {
            const $item = $(this);
            let visible = true;
            
            // Logique de filtrage
            Object.keys(filters).forEach(key => {
                const filterValue = filters[key].toLowerCase();
                const itemValue = ($item.data(key) || '').toString().toLowerCase();
                
                if (key === 'search') {
                    const searchableText = $item.text().toLowerCase();
                    if (!searchableText.includes(filterValue)) {
                        visible = false;
                    }
                } else if (itemValue && itemValue !== filterValue) {
                    visible = false;
                }
            });
            
            $item.toggle(visible);
        });
    }
    
    // Fonctions globales pour les shortcodes
    window.siportsContact = function(exhibitorId) {
        if (typeof siports_ajax !== 'undefined') {
            $.post(siports_ajax.ajax_url, {
                action: 'siports_api',
                siports_action: 'contact_exhibitor',
                exhibitor_id: exhibitorId,
                nonce: siports_ajax.nonce
            }, function(response) {
                if (response.success) {
                    alert('Message envoyé avec succès !');
                } else {
                    alert('Erreur lors de l\'envoi du message.');
                }
            });
        }
    };
    
    window.siportsRegisterEvent = function(eventId) {
        if (typeof siports_ajax !== 'undefined') {
            $.post(siports_ajax.ajax_url, {
                action: 'siports_api',
                siports_action: 'register_event',
                event_id: eventId,
                nonce: siports_ajax.nonce
            }, function(response) {
                if (response.success) {
                    alert('Inscription réussie !');
                    location.reload();
                } else {
                    alert('Erreur lors de l\'inscription.');
                }
            });
        }
    };
    
    window.siportsConnect = function(userId) {
        alert('Demande de connexion envoyée à l\'utilisateur ' + userId);
    };
    
    window.siportsMessage = function(userId) {
        alert('Ouverture de la messagerie avec l\'utilisateur ' + userId);
    };
    
    // Fonctions d'administration
    window.siportsSync = function() {
        if (confirm('Synchroniser les données SIPORTS ? Cette opération peut prendre quelques minutes.')) {
            $.post(ajaxurl, {
                action: 'siports_api',
                siports_action: 'sync_data',
                nonce: siports_ajax.nonce
            }, function(response) {
                alert('Synchronisation terminée !');
                location.reload();
            });
        }
    };
    
    window.siportsClearCache = function() {
        $.post(ajaxurl, {
            action: 'siports_clear_cache',
            nonce: siports_ajax.nonce
        }, function(response) {
            alert('Cache vidé !');
        });
    };
    
    // Utilitaires
    function showSiportsModal(title, content) {
        const modal = $(`
            <div class="siports-modal-overlay">
                <div class="siports-modal">
                    <div class="siports-modal-header">
                        <h3>${title}</h3>
                        <button class="siports-modal-close">&times;</button>
                    </div>
                    <div class="siports-modal-content">
                        ${content}
                    </div>
                </div>
            </div>
        `);
        
        $('body').append(modal);
        
        modal.find('.siports-modal-close, .siports-modal-overlay').on('click', function(e) {
            if (e.target === this) {
                modal.remove();
            }
        });
    }
    
    // Gestion des erreurs AJAX
    $(document).ajaxError(function(event, xhr, settings, thrownError) {
        if (settings.url.includes('siports')) {
            console.error('Erreur SIPORTS:', thrownError);
        }
    });
    
})(jQuery);

// CSS pour les modales (injecté dynamiquement)
const modalCSS = `
<style>
.siports-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.siports-modal {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.siports-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.siports-modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.siports-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.siports-modal-close:hover {
    color: #1f2937;
}

.siports-modal-content {
    padding: 20px;
}

@keyframes animate-heart {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

.animate-heart {
    animation: animate-heart 0.3s ease-in-out;
}
</style>
`;

// Injecter le CSS des modales
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', modalCSS);
}