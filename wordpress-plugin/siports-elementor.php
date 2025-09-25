<?php
/**
 * Plugin Name: SIPORTS Elementor Shortcode
 * Description: Intégration optimisée pour Elementor
 * Version: 1.0
 * Author: SIPORTS Team
 */

// Assurons-nous que le fichier est appelé directement par WordPress
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcodes pour SIPORTS, optimisés pour Elementor
 * Pour utiliser:
 * 1. Ajoutez un widget Shortcode dans Elementor
 * 2. Insérez [siports_networking] ou [siports_exhibitor_dashboard]
 */

// Shortcode pour l'application Networking
function siports_networking_shortcode() {
    // Assurons-nous que les assets sont chargés
    siports_enqueue_frontend_assets();
    
    // Retourne le conteneur pour l'application React
    return '<div id="siports-networking-app" class="siports-app"></div>';
}

// Shortcode pour le tableau de bord exposant
function siports_exhibitor_dashboard_shortcode() {
    // Assurons-nous que les assets sont chargés
    siports_enqueue_frontend_assets();
    
    // Retourne le conteneur pour l'application React
    return '<div id="siports-exhibitor-dashboard-app" class="siports-app"></div>';
}

// Fonction commune pour charger les assets (scripts et styles)
function siports_enqueue_frontend_assets() {
    // Vérifier si les assets sont déjà enregistrés
    if (wp_script_is('siports-js', 'enqueued')) {
        return; // Déjà chargé
    }
    
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Enqueue CSS
    wp_enqueue_style(
        'siports-css',
        $plugin_url . 'dist/assets/index-DBujpWtt.css',
        array(),
        '1.0.0'
    );
    
    // Enqueue JS
    wp_enqueue_script(
        'siports-js',
        $plugin_url . 'dist/assets/index-DlPcSq1K.js',
        array(),
        '1.0.0',
        true // En pied de page pour performance
    );
    
    // Type module pour ES modules
    wp_script_add_data('siports-js', 'type', 'module');
}

// Enregistrement des shortcodes
add_shortcode('siports_networking', 'siports_networking_shortcode');
add_shortcode('siports_exhibitor_dashboard', 'siports_exhibitor_dashboard_shortcode');

/**
 * Hook pour détecter les shortcodes dans Elementor
 * et s'assurer que les assets sont toujours chargés
 */
function siports_detect_shortcodes_in_elementor() {
    // Ne rien faire si on est dans l'admin
    if (is_admin()) {
        return;
    }
    
    // Si Elementor est actif
    if (did_action('elementor/loaded')) {
        global $post;
        if (!$post) {
            return;
        }
        
        // Vérifier si le contenu contient nos shortcodes
        $post_content = $post->post_content;
        if (
            strpos($post_content, '[siports_networking') !== false || 
            strpos($post_content, '[siports_exhibitor_dashboard') !== false
        ) {
            // Charger les assets
            siports_enqueue_frontend_assets();
        }
        
        // Vérifier aussi dans les données Elementor
        $elementor_data = get_post_meta($post->ID, '_elementor_data', true);
        if (!empty($elementor_data)) {
            if (
                strpos($elementor_data, 'siports_networking') !== false || 
                strpos($elementor_data, 'siports_exhibitor_dashboard') !== false
            ) {
                // Charger les assets
                siports_enqueue_frontend_assets();
            }
        }
    }
}
// Exécuter tard pour être sûr que tout est chargé
add_action('wp_enqueue_scripts', 'siports_detect_shortcodes_in_elementor', 999);

// Message d'administration
function siports_admin_notice() {
    ?>
    <div class="notice notice-info is-dismissible">
        <p><strong>SIPORTS Elementor Integration:</strong> Utilisez les widgets Shortcode d'Elementor pour insérer <code>[siports_networking]</code> ou <code>[siports_exhibitor_dashboard]</code>.</p>
    </div>
    <?php
}
add_action('admin_notices', 'siports_admin_notice');
