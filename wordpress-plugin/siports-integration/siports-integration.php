<?php
/**
 * Plugin Name: SIPORTS Integration
 * Plugin URI: https://siports2026.com
 * Description: Plugin complet d'intégration SIPORTS 2026 - Système de gestion d'événements, exposants, rendez-vous et networking
 * Version: 1.0.0
 * Author: SIPORTS Team
 * Author URI: https://siports2026.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: siports-integration
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('SIPORTS_VERSION', '1.0.0');
define('SIPORTS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SIPORTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SIPORTS_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main SIPORTS Integration Class
 */
class SIPORTS_Integration {

    /**
     * The single instance of the class
     */
    protected static $_instance = null;

    /**
     * Main Instance
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     */
    public function __construct() {
        $this->includes();
        $this->init_hooks();
    }

    /**
     * Include required files
     */
    private function includes() {
        // Admin
        require_once SIPORTS_PLUGIN_DIR . 'admin/class-admin.php';
        require_once SIPORTS_PLUGIN_DIR . 'admin/class-settings.php';

        // Includes
        require_once SIPORTS_PLUGIN_DIR . 'includes/class-shortcodes.php';
        require_once SIPORTS_PLUGIN_DIR . 'includes/class-api.php';
        require_once SIPORTS_PLUGIN_DIR . 'includes/class-enqueue.php';
        require_once SIPORTS_PLUGIN_DIR . 'includes/class-widgets.php';
    }

    /**
     * Hook into actions and filters
     */
    private function init_hooks() {
        // Activation/Deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        // Init
        add_action('init', array($this, 'init'), 0);
        add_action('plugins_loaded', array($this, 'load_textdomain'));

        // Enqueue scripts
        add_action('wp_enqueue_scripts', array('SIPORTS_Enqueue', 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array('SIPORTS_Enqueue', 'admin_enqueue_scripts'));

        // Admin
        if (is_admin()) {
            new SIPORTS_Admin();
            new SIPORTS_Settings();
        }

        // Shortcodes
        new SIPORTS_Shortcodes();

        // REST API
        add_action('rest_api_init', array('SIPORTS_API', 'register_routes'));

        // Widgets
        add_action('widgets_init', array('SIPORTS_Widgets', 'register_widgets'));
    }

    /**
     * Init when WordPress Initialises
     */
    public function init() {
        // Set up localisation
        $this->load_textdomain();
    }

    /**
     * Load Localisation files
     */
    public function load_textdomain() {
        load_plugin_textdomain('siports-integration', false, dirname(SIPORTS_PLUGIN_BASENAME) . '/languages');
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Create default pages
        $this->create_default_pages();

        // Set default options
        $default_options = array(
            'supabase_url' => '',
            'supabase_anon_key' => '',
            'app_url' => '',
            'enable_debug' => false,
            'cache_enabled' => true,
            'cache_duration' => 3600
        );

        add_option('siports_settings', $default_options);

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create default pages on activation
     */
    private function create_default_pages() {
        $pages = array(
            'siports-dashboard' => array(
                'title' => __('Tableau de Bord', 'siports-integration'),
                'content' => '[siports_dashboard]',
                'template' => 'page-dashboard.php'
            ),
            'siports-events' => array(
                'title' => __('Événements', 'siports-integration'),
                'content' => '[siports_events]',
                'template' => 'page-events.php'
            ),
            'siports-exhibitors' => array(
                'title' => __('Exposants', 'siports-integration'),
                'content' => '[siports_exhibitors]',
                'template' => 'page-exhibitors.php'
            ),
            'siports-appointments' => array(
                'title' => __('Rendez-vous', 'siports-integration'),
                'content' => '[siports_appointments]',
                'template' => 'page-appointments.php'
            ),
            'siports-chat' => array(
                'title' => __('Messagerie', 'siports-integration'),
                'content' => '[siports_chat]',
                'template' => 'page-chat.php'
            ),
            'siports-login' => array(
                'title' => __('Connexion', 'siports-integration'),
                'content' => '[siports_login]',
                'template' => 'page-login.php'
            ),
            'siports-register' => array(
                'title' => __('Inscription', 'siports-integration'),
                'content' => '[siports_register]',
                'template' => 'page-register.php'
            )
        );

        foreach ($pages as $slug => $page) {
            // Check if page already exists
            $page_check = get_page_by_path($slug);

            if (!$page_check) {
                $page_id = wp_insert_post(array(
                    'post_title' => $page['title'],
                    'post_content' => $page['content'],
                    'post_status' => 'publish',
                    'post_type' => 'page',
                    'post_name' => $slug,
                    'comment_status' => 'closed',
                    'ping_status' => 'closed'
                ));

                if ($page_id && !is_wp_error($page_id)) {
                    // Set page template
                    update_post_meta($page_id, '_wp_page_template', $page['template']);

                    // Store page ID in options
                    update_option('siports_page_' . str_replace('siports-', '', $slug), $page_id);
                }
            }
        }
    }
}

/**
 * Main instance of SIPORTS Integration
 */
function SIPORTS() {
    return SIPORTS_Integration::instance();
}

// Global for backwards compatibility
$GLOBALS['siports'] = SIPORTS();
