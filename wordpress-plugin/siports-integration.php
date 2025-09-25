<?php
/**
 * Plugin Name: SIPORTS React Integration
 * Plugin URI: https://siportevent.com
 * Description: Intègre l'application React SIPORTS 2026 dans WordPress (shortcodes & Elementor).
 * Version: 1.0.0
 * Author: SIPORTS Team
 * License: GPL v2 or later
 * Text Domain: siports
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Version ultra simplifiée pour éviter tout conflit et problème de compatibilité.
 * Utilise un shortcode basic et des fonctions de bas niveau pour l'intégration.
 * OPTIMISÉE POUR ELEMENTOR.
 */

/**
 * Résout dynamiquement les actifs Vite (hashés) et charge les styles/scripts React.
 */
function siports_find_asset($pattern) {
    $assets_dir = trailingslashit(plugin_dir_path(__FILE__)) . 'dist/assets/';
    $files = glob($assets_dir . $pattern);
    if ($files && count($files) > 0) {
        $file_path = $files[0];
        $file_url  = trailingslashit(plugin_dir_url(__FILE__)) . 'dist/assets/' . basename($file_path);
        $version   = @filemtime($file_path) ?: '1.0.0';
        return array('url' => $file_url, 'ver' => $version);
    }
    return null;
}

function siports_load_assets() {
    static $loaded = false;
    if ($loaded || is_admin()) {
        return;
    }

    // CSS (index-*.css)
    $css = siports_find_asset('index-*.css');
    if ($css) {
        wp_enqueue_style(
            'siports-react-style',
            $css['url'],
            array(),
            $css['ver']
        );
    }

    // Préparer la config runtime à injecter avant le JS
    $runtime = array();
    // Permettre la config via constantes WP (à définir dans wp-config.php)
    if (defined('SIPORTS_SUPABASE_URL')) {
        $runtime['VITE_SUPABASE_URL'] = constant('SIPORTS_SUPABASE_URL');
    }
    if (defined('SIPORTS_SUPABASE_ANON_KEY')) {
        $runtime['VITE_SUPABASE_ANON_KEY'] = constant('SIPORTS_SUPABASE_ANON_KEY');
    }
    // Permettre une surcharge via options WP
    $opt_url = get_option('siports_supabase_url');
    $opt_key = get_option('siports_supabase_anon_key');
    if (!empty($opt_url)) { $runtime['VITE_SUPABASE_URL'] = $opt_url; }
    if (!empty($opt_key)) { $runtime['VITE_SUPABASE_ANON_KEY'] = $opt_key; }
    // Hook pour filtres personnalisés
    $runtime = apply_filters('siports_runtime_config', $runtime);

    // SI AUCUNE CONFIG, INJECTER UNE CONFIG DE TEST POUR ÉVITER L'ERREUR
    if (empty($runtime)) {
        $runtime = array(
            'VITE_SUPABASE_URL' => 'https://demo-project.supabase.co',
            'VITE_SUPABASE_ANON_KEY' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-key-for-testing-purposes-only-12345678901234567890123456789012345678901234567890'
        );
    }

    // JS module (index-*.js)
    $js = siports_find_asset('index-*.js');
    if ($js) {
        wp_enqueue_script(
            'siports-react-script',
            $js['url'],
            array(),
            $js['ver'],
            true
        );
        // Injecter la config avant le script si disponible
        if (!empty($runtime)) {
            $conf = 'window.SIPORTS_CONFIG = Object.assign({}, window.SIPORTS_CONFIG || {}, ' . wp_json_encode($runtime) . ');';
            wp_add_inline_script('siports-react-script', $conf, 'before');
        }
        wp_script_add_data('siports-react-script', 'type', 'module');
    }

    $loaded = true;
}

/**
 * Shortcode [siports_networking]
 */
function siports_networking_shortcode() {
    siports_load_assets();
    return '<div id="siports-networking-app" class="siports-app"></div>';
}

/**
 * Shortcode [siports_exhibitor_dashboard]
 */
function siports_exhibitor_dashboard_shortcode() {
    siports_load_assets();
    return '<div id="siports-exhibitor-dashboard-app" class="siports-app"></div>';
}

// Register shortcodes
add_shortcode('siports_networking', 'siports_networking_shortcode');
add_shortcode('siports_exhibitor_dashboard', 'siports_exhibitor_dashboard_shortcode');

// Détecte les shortcodes dans le contenu (Elementor ou classique) et charge les assets
function siports_detect_and_load() {
    if (is_admin()) {
        return;
    }
    if (is_singular()) {
        global $post;
        $content = $post->post_content;
        if (has_shortcode($content, 'siports_networking') || has_shortcode($content, 'siports_exhibitor_dashboard')) {
            siports_load_assets();
        }
        // Elementor JSON data
        $edata = get_post_meta($post->ID, '_elementor_data', true);
        if (!empty($edata) && (strpos($edata, 'siports_networking') !== false || strpos($edata, 'siports_exhibitor_dashboard') !== false)) {
            siports_load_assets();
        }
    }
}
add_action('wp_enqueue_scripts', 'siports_detect_and_load', 10);

/**
 * Fonction spéciale pour Elementor 
 * Détecte si les shortcodes sont dans un widget Elementor
 */
function siports_elementor_detection() {
    // Ne rien faire si on est dans l'admin
    if (is_admin()) {
        return;
    }
    
    // Si on est sur une page/article et qu'Elementor est présent
    if (did_action('elementor/loaded') && is_singular()) {
        global $post;
        if (!$post) {
            return;
        }
        
        // Vérifier dans les données Elementor
        $elementor_data = get_post_meta($post->ID, '_elementor_data', true);
        if (!empty($elementor_data)) {
            if (
                strpos($elementor_data, 'siports_networking') !== false || 
                strpos($elementor_data, 'siports_exhibitor_dashboard') !== false
            ) {
                // Forcer le chargement des assets pour Elementor
                siports_load_assets();
            }
        }
    }
}
// Priorité élevée pour s'assurer que cela s'exécute après qu'Elementor a traité la page
add_action('wp_enqueue_scripts', 'siports_elementor_detection', 999);

// Message d'administration
function siports_admin_notice() {
    global $pagenow;
    if ($pagenow == 'plugins.php') {
        ?>
        <div class="notice notice-info is-dismissible">
            <p><strong>SIPORTS 2026 Integration:</strong> Pour utiliser avec Elementor, ajoutez un widget "Shortcode" et insérez <code>[siports_networking]</code> ou <code>[siports_exhibitor_dashboard]</code>.</p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'siports_admin_notice');

// Ensure React bundle is loaded as ES module
add_filter('script_loader_tag', 'siports_add_module_attribute', 10, 3);
function siports_add_module_attribute($tag, $handle, $src) {
    if ($handle === 'siports-react-script') {
        return '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}

// Add CORS headers for font files
add_filter('wp_headers', 'siports_cors_add_font_headers');
function siports_cors_add_font_headers( $headers ) {
    if ( isset( $_SERVER['REQUEST_URI'] ) && preg_match('/\.(woff2?|ttf|otf|eot)(\?.*)?$/i', $_SERVER['REQUEST_URI']) ) {
        $headers['Access-Control-Allow-Origin'] = '*';
    }
    return $headers;
}