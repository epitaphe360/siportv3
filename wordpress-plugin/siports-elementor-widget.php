<?php
/**
 * Plugin Name: SIPORTS Elementor Widget
 * Description: Widget Elementor dédié pour SIPORTS
 * Version: 1.0
 * Author: SIPORTS Team
 */

// Sortir si accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Vérifier si Elementor est installé et activé
function siports_elementor_widget_check() {
    // Vérifier si Elementor est activé
    if (!did_action('elementor/loaded')) {
        add_action('admin_notices', 'siports_elementor_widget_fail_load');
        return;
    }
    
    // Charger le widget quand Elementor est prêt
    add_action('elementor/widgets/register', 'register_siports_widget');
}
add_action('plugins_loaded', 'siports_elementor_widget_check');

// Message d'erreur si Elementor n'est pas installé
function siports_elementor_widget_fail_load() {
    $message = sprintf(
        esc_html__('"%1$s" requires "%2$s" to be installed and activated.', 'siports-elementor'),
        '<strong>SIPORTS Elementor Widget</strong>',
        '<strong>Elementor</strong>'
    );
    
    echo '<div class="notice notice-error"><p>' . $message . '</p></div>';
}

// Enregistrer le widget SIPORTS avec Elementor
function register_siports_widget($widgets_manager) {
    require_once(__DIR__ . '/widget-siports.php');
    $widgets_manager->register(new \Elementor_SIPORTS_Widget());
}

// Script supplémentaire pour gérer les scripts et styles
function siports_widget_scripts() {
    $plugin_url = plugin_dir_url(__FILE__);
    
    // CSS
    wp_register_style(
        'siports-elementor-css',
        $plugin_url . 'dist/assets/index-DBujpWtt.css',
        [],
        '1.0.0'
    );
    
    // JS
    wp_register_script(
        'siports-elementor-js',
        $plugin_url . 'dist/assets/index-DlPcSq1K.js',
        [],
        '1.0.0',
        true
    );
    
    // Type module
    wp_script_add_data('siports-elementor-js', 'type', 'module');
}
add_action('wp_enqueue_scripts', 'siports_widget_scripts');
