<?php
/**
 * SIPORTS Enqueue Class
 *
 * Gère le chargement des scripts et styles React
 */

if (!defined('ABSPATH')) {
    exit;
}

class SIPORTS_Enqueue {

    /**
     * Enqueue frontend scripts and styles
     */
    public static function enqueue_scripts() {
        // Get settings
        $settings = get_option('siports_settings', array());
        $app_url = isset($settings['app_url']) ? trailingslashit($settings['app_url']) : '';
        $debug_mode = isset($settings['enable_debug']) ? $settings['enable_debug'] : false;

        if (empty($app_url)) {
            if ($debug_mode && current_user_can('manage_options')) {
                echo '<div class="notice notice-error"><p>' .
                     __('SIPORTS: Veuillez configurer l\'URL de l\'application dans les paramètres.', 'siports-integration') .
                     '</p></div>';
            }
            return;
        }

        // Check if we're on a page with SIPORTS shortcode
        if (!self::has_siports_content()) {
            return;
        }

        // Enqueue React app manifest (for Vite build)
        $manifest_path = $app_url . '.vite/manifest.json';

        // Load main React app bundle
        wp_enqueue_script(
            'siports-react-app',
            $app_url . 'assets/index.js',
            array(),
            SIPORTS_VERSION,
            true
        );

        // Load React app styles
        wp_enqueue_style(
            'siports-react-styles',
            $app_url . 'assets/index.css',
            array(),
            SIPORTS_VERSION
        );

        // Enqueue WordPress integration script
        wp_enqueue_script(
            'siports-wp-integration',
            SIPORTS_PLUGIN_URL . 'assets/js/integration.js',
            array('siports-react-app'),
            SIPORTS_VERSION,
            true
        );

        // Enqueue WordPress specific styles
        wp_enqueue_style(
            'siports-wp-styles',
            SIPORTS_PLUGIN_URL . 'assets/css/wordpress.css',
            array('siports-react-styles'),
            SIPORTS_VERSION
        );

        // Localize script with WordPress data
        wp_localize_script('siports-wp-integration', 'siportsWP', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('siports/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'appUrl' => $app_url,
            'currentUser' => self::get_current_user_data(),
            'settings' => array(
                'supabaseUrl' => isset($settings['supabase_url']) ? $settings['supabase_url'] : '',
                'supabaseKey' => isset($settings['supabase_anon_key']) ? $settings['supabase_anon_key'] : '',
                'debugMode' => $debug_mode
            ),
            'i18n' => array(
                'loading' => __('Chargement...', 'siports-integration'),
                'error' => __('Une erreur est survenue', 'siports-integration'),
                'noData' => __('Aucune donnée disponible', 'siports-integration')
            )
        ));
    }

    /**
     * Enqueue admin scripts and styles
     */
    public static function admin_enqueue_scripts($hook) {
        // Only load on SIPORTS admin pages
        if (strpos($hook, 'siports') === false) {
            return;
        }

        wp_enqueue_style(
            'siports-admin',
            SIPORTS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            SIPORTS_VERSION
        );

        wp_enqueue_script(
            'siports-admin',
            SIPORTS_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            SIPORTS_VERSION,
            true
        );

        wp_localize_script('siports-admin', 'siportsAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('siports_admin_nonce')
        ));
    }

    /**
     * Check if current page has SIPORTS content
     */
    private static function has_siports_content() {
        global $post;

        if (!$post) {
            return false;
        }

        // Check for shortcodes
        if (has_shortcode($post->post_content, 'siports_app') ||
            has_shortcode($post->post_content, 'siports_dashboard') ||
            has_shortcode($post->post_content, 'siports_events') ||
            has_shortcode($post->post_content, 'siports_exhibitors') ||
            has_shortcode($post->post_content, 'siports_appointments') ||
            has_shortcode($post->post_content, 'siports_chat') ||
            has_shortcode($post->post_content, 'siports_login') ||
            has_shortcode($post->post_content, 'siports_register') ||
            has_shortcode($post->post_content, 'siports_profile') ||
            has_shortcode($post->post_content, 'siports_networking') ||
            has_shortcode($post->post_content, 'siports_products') ||
            has_shortcode($post->post_content, 'siports_minisite')) {
            return true;
        }

        // Check if it's a SIPORTS page
        $siports_pages = array(
            'siports_page_dashboard',
            'siports_page_events',
            'siports_page_exhibitors',
            'siports_page_appointments',
            'siports_page_chat',
            'siports_page_login',
            'siports_page_register'
        );

        foreach ($siports_pages as $option) {
            $page_id = get_option($option);
            if ($page_id && $post->ID == $page_id) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get current WordPress user data for React app
     */
    private static function get_current_user_data() {
        if (!is_user_logged_in()) {
            return null;
        }

        $current_user = wp_get_current_user();

        return array(
            'id' => $current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'role' => implode(',', $current_user->roles),
            'avatar' => get_avatar_url($current_user->ID),
            'meta' => array(
                'first_name' => get_user_meta($current_user->ID, 'first_name', true),
                'last_name' => get_user_meta($current_user->ID, 'last_name', true),
                'siports_user_type' => get_user_meta($current_user->ID, 'siports_user_type', true),
                'siports_visitor_level' => get_user_meta($current_user->ID, 'siports_visitor_level', true)
            )
        );
    }
}

return new SIPORTS_Enqueue();
