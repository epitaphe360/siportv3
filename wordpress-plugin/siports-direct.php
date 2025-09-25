<?php
/**
 * Plugin Name: SIPORTS Test Direct HTML
 * Description: Version test qui évite les shortcodes
 * Version: 1.0
 * Author: SIPORTS Team
 */

// Sortir si accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Fonction pour ajouter directement l'app React dans le footer
function siports_add_app_to_footer() {
    // Ne pas afficher dans l'admin
    if (is_admin()) {
        return;
    }
    
    // Charger les assets
    $plugin_url = plugin_dir_url(__FILE__);
    
    // CSS
    wp_enqueue_style(
        'siports-direct-css',
        $plugin_url . 'dist/assets/index-DBujpWtt.css',
        array(),
        '1.0.0'
    );
    
    // JS
    wp_enqueue_script(
        'siports-direct-js',
        $plugin_url . 'dist/assets/index-DlPcSq1K.js',
        array(),
        '1.0.0',
        true
    );
    
    // Type module
    wp_script_add_data('siports-direct-js', 'type', 'module');
    
    // Ajouter le conteneur directement dans le footer
    echo '<div id="siports-networking-app" style="width: 100%; max-width: 1200px; margin: 0 auto;"></div>';
}

// Ajouter au hook wp_footer pour afficher en bas de page
add_action('wp_footer', 'siports_add_app_to_footer');
