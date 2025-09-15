// SIPORTS WordPress Plugin - Admin JavaScript

(function($) {
    'use strict';
    
    $(document).ready(function() {
        initAdminInterface();
    });
    
    function initAdminInterface() {
        // Copier les shortcodes au clic
        $('.shortcode-item code').on('click', function() {
            const text = $(this).text();
            navigator.clipboard.writeText(text).then(function() {
                showNotice('Shortcode copié dans le presse-papiers !', 'success');
            });
        });
        
        // Prévisualisation des shortcodes
        $('.preview-shortcode').on('click', function() {
            const shortcode = $(this).data('shortcode');
            previewShortcode(shortcode);
        });
    }
    
    function showNotice(message, type) {
        const notice = $('<div class="notice notice-' + type + ' is-dismissible"><p>' + message + '</p></div>');
        $('.wrap h1').after(notice);
        
        setTimeout(function() {
            notice.fadeOut();
        }, 3000);
    }
    
    function previewShortcode(shortcode) {
        $.post(ajaxurl, {
            action: 'siports_preview_shortcode',
            shortcode: shortcode,
            nonce: siports_ajax.nonce
        }, function(response) {
            if (response.success) {
                showShortcodePreview(response.data);
            }
        });
    }
    
    function showShortcodePreview(html) {
        const modal = $(`
            <div class="siports-preview-modal">
                <div class="siports-preview-content">
                    <div class="siports-preview-header">
                        <h3>Aperçu du Shortcode</h3>
                        <button class="siports-preview-close">&times;</button>
                    </div>
                    <div class="siports-preview-body">
                        ${html}
                    </div>
                </div>
            </div>
        `);
        
        $('body').append(modal);
        
        modal.find('.siports-preview-close').on('click', function() {
            modal.remove();
        });
        
        modal.on('click', function(e) {
            if (e.target === this) {
                modal.remove();
            }
        });
    }
    
})(jQuery);

// Fonctions globales pour l'administration
window.siportsSync = function() {
    if (confirm('Synchroniser les données SIPORTS ? Cette opération peut prendre quelques minutes.')) {
        jQuery.post(ajaxurl, {
            action: 'siports_api',
            siports_action: 'sync_data',
            nonce: siports_ajax.nonce
        }, function(response) {
            if (response.success) {
                alert('✅ Synchronisation terminée avec succès !');
                location.reload();
            } else {
                alert('❌ Erreur lors de la synchronisation.');
            }
        });
    }
};

window.siportsClearCache = function() {
    jQuery.post(ajaxurl, {
        action: 'siports_clear_cache',
        nonce: siports_ajax.nonce
    }, function(response) {
        alert('✅ Cache vidé avec succès !');
    });
};