/**
 * SIPORTS Integration - JavaScript
 */

(function($) {
    'use strict';
    
    // Variables globales
    var siportsApp = {
        init: function() {
            this.handleIframeLoading();
            this.setupPostMessage();
            this.handleAuthentication();
            this.setupResponsive();
        },
        
        /**
         * Gestion du chargement des iframes
         */
        handleIframeLoading: function() {
            $('.siports-iframe-container iframe').on('load', function() {
                var $container = $(this).closest('.siports-iframe-container');
                $container.addClass('loaded');
                
                // Masquer le spinner après un délai
                setTimeout(function() {
                    $container.find('.siports-loading').fadeOut();
                }, 500);
            });
        },
        
        /**
         * Configuration de la communication PostMessage
         */
        setupPostMessage: function() {
            window.addEventListener('message', function(event) {
                // Vérifier l'origine pour la sécurité
                if (!event.origin.includes(siports_vars.app_url.replace(/https?:\/\//, ''))) {
                    return;
                }
                
                var data = event.data;
                
                switch(data.type) {
                    case 'siports_resize':
                        siportsApp.resizeIframe(data.frameId, data.height);
                        break;
                        
                    case 'siports_navigation':
                        siportsApp.handleNavigation(data.url);
                        break;
                        
                    case 'siports_auth_success':
                        siportsApp.handleAuthSuccess(data.user);
                        break;
                        
                    case 'siports_notification':
                        siportsApp.showNotification(data.message, data.type);
                        break;
                }
            });
        },
        
        /**
         * Redimensionnement dynamique des iframes
         */
        resizeIframe: function(frameId, height) {
            var $iframe = $('#' + frameId);
            if ($iframe.length) {
                $iframe.animate({
                    height: height + 'px'
                }, 300);
            }
        },
        
        /**
         * Navigation dans l'application
         */
        handleNavigation: function(url) {
            // Mettre à jour l'URL WordPress si nécessaire
            if (history.pushState) {
                var newUrl = window.location.pathname + '?siports_page=' + encodeURIComponent(url);
                history.pushState({siports: true}, '', newUrl);
            }
        },
        
        /**
         * Gestion de l'authentification
         */
        handleAuthentication: function() {
            // Envoyer les informations utilisateur WordPress aux iframes
            var userInfo = {
                type: 'wp_user_info',
                user_id: siports_vars.wp_user_id,
                user_email: siports_vars.wp_user_email,
                nonce: siports_vars.nonce
            };
            
            $('.siports-iframe-container iframe').on('load', function() {
                this.contentWindow.postMessage(userInfo, siports_vars.app_url);
            });
        },
        
        /**
         * Succès de l'authentification
         */
        handleAuthSuccess: function(user) {
            // Actualiser la page WordPress ou rediriger
            if (user.redirect_url) {
                window.location.href = user.redirect_url;
            } else {
                // Actualiser les autres iframes si nécessaire
                $('.siports-iframe-container iframe').each(function() {
                    var src = this.src;
                    if (src.includes('auth') || src.includes('login')) {
                        return; // Ne pas recharger la frame de connexion
                    }
                    
                    // Recharger les autres frames pour mettre à jour l'état d'authentification
                    this.src = src + (src.includes('?') ? '&' : '?') + '_refresh=' + Date.now();
                });
            }
        },
        
        /**
         * Affichage des notifications
         */
        showNotification: function(message, type) {
            type = type || 'info';
            
            var $notification = $('<div class="siports-notification siports-notification-' + type + '">')
                .html('<span class="siports-notification-message">' + message + '</span>')
                .append('<button class="siports-notification-close">&times;</button>');
                
            $('body').append($notification);
            
            // Animation d'entrée
            setTimeout(function() {
                $notification.addClass('show');
            }, 100);
            
            // Fermeture automatique
            setTimeout(function() {
                $notification.removeClass('show');
                setTimeout(function() {
                    $notification.remove();
                }, 300);
            }, 5000);
            
            // Fermeture manuelle
            $notification.find('.siports-notification-close').on('click', function() {
                $notification.removeClass('show');
                setTimeout(function() {
                    $notification.remove();
                }, 300);
            });
        },
        
        /**
         * Configuration responsive
         */
        setupResponsive: function() {
            $(window).on('resize', function() {
                $('.siports-iframe-container').each(function() {
                    var $container = $(this);
                    var $iframe = $container.find('iframe');
                    
                    // Ajuster la hauteur sur mobile
                    if ($(window).width() < 768) {
                        var minHeight = $iframe.data('mobile-height') || '500px';
                        $iframe.css('height', minHeight);
                    } else {
                        var normalHeight = $iframe.data('height') || '600px';
                        $iframe.css('height', normalHeight);
                    }
                });
            });
        }
    };
    
    /**
     * API publique pour interaction avec l'application
     */
    window.SiportsWordPress = {
        /**
         * Envoyer un message à l'application SIPORTS
         */
        sendMessage: function(type, data) {
            $('.siports-iframe-container iframe').each(function() {
                this.contentWindow.postMessage({
                    type: type,
                    data: data,
                    source: 'wordpress'
                }, siports_vars.app_url);
            });
        },
        
        /**
         * Naviguer vers une page spécifique
         */
        navigateTo: function(page) {
            this.sendMessage('navigate', {page: page});
        },
        
        /**
         * Actualiser toutes les iframes
         */
        refresh: function() {
            $('.siports-iframe-container iframe').each(function() {
                var src = this.src;
                this.src = src + (src.includes('?') ? '&' : '?') + '_refresh=' + Date.now();
            });
        },
        
        /**
         * Déconnecter l'utilisateur
         */
        logout: function() {
            this.sendMessage('logout', {});
            setTimeout(function() {
                window.location.reload();
            }, 1000);
        }
    };
    
    // Initialisation au chargement du DOM
    $(document).ready(function() {
        siportsApp.init();
    });
    
})(jQuery);

/**
 * Styles CSS pour les notifications (ajoutés dynamiquement)
 */
(function() {
    var style = document.createElement('style');
    style.textContent = `
        .siports-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            border-left: 4px solid #3b82f6;
        }
        
        .siports-notification.show {
            transform: translateX(0);
        }
        
        .siports-notification-success {
            border-left-color: #10b981;
        }
        
        .siports-notification-error {
            border-left-color: #ef4444;
        }
        
        .siports-notification-warning {
            border-left-color: #f59e0b;
        }
        
        .siports-notification-message {
            display: block;
            margin-right: 30px;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .siports-notification-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .siports-notification-close:hover {
            color: #333;
        }
    `;
    document.head.appendChild(style);
})();