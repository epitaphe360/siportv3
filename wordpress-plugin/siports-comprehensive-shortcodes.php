<?php
/**
 * Plugin Name: SIPORTS Comprehensive Shortcodes
 * Description: Tous les shortcodes SIPORTS pour WordPress - Intégration complète avec l'application React
 * Version: 2.0.0
 * Author: SIPORTS Team
 * Text Domain: siports
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SIPORTS_SHORTCODES_VERSION', '2.0.0');
define('SIPORTS_SHORTCODES_PATH', plugin_dir_path(__FILE__));
define('SIPORTS_SHORTCODES_URL', plugin_dir_url(__FILE__));

// Include API class
require_once SIPORTS_SHORTCODES_PATH . 'includes/class-siports-supabase-api.php';
require_once SIPORTS_SHORTCODES_PATH . 'includes/class-siports-complete-api.php';

/**
 * Main Shortcodes Class
 */
class SIPORTS_Comprehensive_Shortcodes {

    private $api;

    public function __construct() {
        $this->api = new SIPORTS_Complete_API();
        $this->register_all_shortcodes();
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    /**
     * Register all shortcodes
     */
    public function register_all_shortcodes() {
        // DASHBOARDS
        add_shortcode('siports_admin_dashboard', array($this, 'admin_dashboard'));
        add_shortcode('siports_exhibitor_dashboard', array($this, 'exhibitor_dashboard'));
        add_shortcode('siports_partner_dashboard', array($this, 'partner_dashboard'));
        add_shortcode('siports_visitor_dashboard', array($this, 'visitor_dashboard'));

        // NETWORKING
        add_shortcode('siports_networking', array($this, 'networking'));
        add_shortcode('siports_networking_page', array($this, 'networking_page'));
        add_shortcode('siports_chat', array($this, 'chat'));

        // EXHIBITORS
        add_shortcode('siports_exhibitors', array($this, 'exhibitors_list'));
        add_shortcode('siports_exhibitor', array($this, 'exhibitor_detail'));
        add_shortcode('siports_exhibitors_grid', array($this, 'exhibitors_grid'));
        add_shortcode('siports_exhibitors_search', array($this, 'exhibitors_search'));

        // EVENTS
        add_shortcode('siports_events', array($this, 'events_list'));
        add_shortcode('siports_event', array($this, 'event_detail'));
        add_shortcode('siports_events_calendar', array($this, 'events_calendar'));
        add_shortcode('siports_upcoming_events', array($this, 'upcoming_events'));

        // NEWS/ARTICLES
        add_shortcode('siports_news', array($this, 'news_list'));
        add_shortcode('siports_article', array($this, 'article_detail'));
        add_shortcode('siports_featured_news', array($this, 'featured_news'));

        // PARTNERS
        add_shortcode('siports_partners', array($this, 'partners_list'));
        add_shortcode('siports_partner', array($this, 'partner_detail'));
        add_shortcode('siports_sponsors', array($this, 'sponsors'));

        // APPOINTMENTS
        add_shortcode('siports_appointments', array($this, 'appointments'));
        add_shortcode('siports_appointment_calendar', array($this, 'appointment_calendar'));
        add_shortcode('siports_book_appointment', array($this, 'book_appointment'));

        // MINI-SITES
        add_shortcode('siports_minisites', array($this, 'minisites_list'));
        add_shortcode('siports_minisite', array($this, 'minisite_detail'));
        add_shortcode('siports_minisite_editor', array($this, 'minisite_editor'));

        // AUTHENTICATION
        add_shortcode('siports_login', array($this, 'login_form'));
        add_shortcode('siports_register', array($this, 'register_form'));
        add_shortcode('siports_auth_links', array($this, 'auth_links'));
        add_shortcode('siports_profile', array($this, 'profile'));

        // STATISTICS & METRICS
        add_shortcode('siports_stats', array($this, 'statistics'));
        add_shortcode('siports_countdown', array($this, 'countdown'));
        add_shortcode('siports_metrics', array($this, 'metrics'));

        // VISITOR SUBSCRIPTION
        add_shortcode('siports_subscription', array($this, 'visitor_subscription'));
        add_shortcode('siports_upgrade', array($this, 'visitor_upgrade'));

        // PRODUCTS
        add_shortcode('siports_products', array($this, 'products_list'));
        add_shortcode('siports_product', array($this, 'product_detail'));

        // PAVILIONS
        add_shortcode('siports_pavilions', array($this, 'pavilions'));
        add_shortcode('siports_pavilion', array($this, 'pavilion_detail'));

        // QR CODE
        add_shortcode('siports_qr_code', array($this, 'qr_code'));

        // SEARCH
        add_shortcode('siports_search', array($this, 'global_search'));
    }

    /**
     * Enqueue all necessary assets
     */
    public function enqueue_assets() {
        // Check if any SIPORTS shortcode is being used
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'siports_')) {
            $this->load_react_app_assets();
        }

        // Load page-specific assets for custom templates
        $this->load_template_assets();
    }

    /**
     * Load React app assets
     */
    private function load_react_app_assets() {
        // Find and enqueue React build files
        $css = $this->find_asset('index-*.css');
        if ($css) {
            wp_enqueue_style('siports-app', $css['url'], array(), $css['ver']);
        }

        $js = $this->find_asset('index-*.js');
        if ($js) {
            wp_enqueue_script('siports-app', $js['url'], array(), $js['ver'], true);
            wp_script_add_data('siports-app', 'type', 'module');

            // Inject Supabase config
            $runtime_config = array(
                'VITE_SUPABASE_URL' => get_option('siports_supabase_url', defined('SIPORTS_SUPABASE_URL') ? SIPORTS_SUPABASE_URL : ''),
                'VITE_SUPABASE_ANON_KEY' => get_option('siports_supabase_anon_key', defined('SIPORTS_SUPABASE_ANON_KEY') ? SIPORTS_SUPABASE_ANON_KEY : ''),
                'isWordPress' => true,
                'wpRestUrl' => rest_url('siports/v1/'),
                'wpNonce' => wp_create_nonce('wp_rest')
            );

            $config_script = 'window.SIPORTS_CONFIG = ' . wp_json_encode($runtime_config) . ';';
            wp_add_inline_script('siports-app', $config_script, 'before');
        }
    }

    /**
     * Find hashed asset file
     */
    private function find_asset($pattern) {
        $assets_dir = SIPORTS_SHORTCODES_PATH . 'dist/assets/';
        $files = glob($assets_dir . $pattern);
        if ($files && count($files) > 0) {
            $file_path = $files[0];
            $file_url = SIPORTS_SHORTCODES_URL . 'dist/assets/' . basename($file_path);
            $version = @filemtime($file_path) ?: SIPORTS_SHORTCODES_VERSION;
            return array('url' => $file_url, 'ver' => $version);
        }
        return null;
    }

    /**
     * Load template-specific assets
     */
    private function load_template_assets() {
        global $post;

        // Déterminer le template utilisé
        $template = get_page_template_slug($post);

        // Charger le CSS global pour toutes les pages SIPORTS
        if (strpos($template, 'page-') !== false || strpos($template, 'siports') !== false) {
            $global_css = SIPORTS_SHORTCODES_PATH . 'assets/css/siports-global.css';
            if (file_exists($global_css)) {
                wp_enqueue_style(
                    'siports-global',
                    SIPORTS_SHORTCODES_URL . 'assets/css/siports-global.css',
                    array(),
                    filemtime($global_css)
                );
            }
        }

        // Assets spécifiques à chaque page
        $page_specific = array(
            'templates/page-exposants.php' => array(
                'css' => 'page-exposants.css',
                'js' => 'page-exposants.js'
            ),
            // Ajouter d'autres pages spécifiques si nécessaire
        );

        foreach ($page_specific as $tpl => $assets) {
            if ($template === $tpl || is_page_template($tpl)) {
                // CSS spécifique
                if (isset($assets['css'])) {
                    $css_file = SIPORTS_SHORTCODES_PATH . 'assets/css/' . $assets['css'];
                    if (file_exists($css_file)) {
                        wp_enqueue_style(
                            'siports-' . str_replace('.css', '', $assets['css']),
                            SIPORTS_SHORTCODES_URL . 'assets/css/' . $assets['css'],
                            array('siports-global'),
                            filemtime($css_file)
                        );
                    }
                }

                // JavaScript spécifique
                if (isset($assets['js'])) {
                    $js_file = SIPORTS_SHORTCODES_PATH . 'assets/js/' . $assets['js'];
                    if (file_exists($js_file)) {
                        wp_enqueue_script(
                            'siports-' . str_replace('.js', '', $assets['js']),
                            SIPORTS_SHORTCODES_URL . 'assets/js/' . $assets['js'],
                            array(),
                            filemtime($js_file),
                            true
                        );
                    }
                }

                // Charger aussi l'app React pour les shortcodes
                $this->load_react_app_assets();
                break;
            }
        }
    }

    // ========================================
    // SHORTCODE IMPLEMENTATIONS
    // ========================================

    /**
     * [siports_admin_dashboard]
     */
    public function admin_dashboard($atts) {
        return '<div id="siports-admin-dashboard-root" class="siports-app" data-component="AdminDashboard"></div>';
    }

    /**
     * [siports_exhibitor_dashboard]
     */
    public function exhibitor_dashboard($atts) {
        return '<div id="siports-exhibitor-dashboard-root" class="siports-app" data-component="ExhibitorDashboard"></div>';
    }

    /**
     * [siports_partner_dashboard]
     */
    public function partner_dashboard($atts) {
        return '<div id="siports-partner-dashboard-root" class="siports-app" data-component="PartnerDashboard"></div>';
    }

    /**
     * [siports_visitor_dashboard]
     */
    public function visitor_dashboard($atts) {
        return '<div id="siports-visitor-dashboard-root" class="siports-app" data-component="VisitorDashboard"></div>';
    }

    /**
     * [siports_networking]
     * Affiche la page de réseautage complète
     */
    public function networking($atts) {
        $atts = shortcode_atts(array(
            'show_ai' => 'true',
            'show_recommendations' => 'true',
            'limit' => '20'
        ), $atts);

        return '<div id="siports-networking-root" class="siports-app" data-component="NetworkingPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_networking_page]
     */
    public function networking_page($atts) {
        return $this->networking($atts);
    }

    /**
     * [siports_chat]
     * Interface de chat/messagerie
     */
    public function chat($atts) {
        $atts = shortcode_atts(array(
            'conversation_id' => '',
            'user_id' => ''
        ), $atts);

        return '<div id="siports-chat-root" class="siports-app" data-component="ChatInterface" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_exhibitors layout="grid" limit="12" sector="port-operations"]
     */
    public function exhibitors_list($atts) {
        $atts = shortcode_atts(array(
            'layout' => 'grid',
            'limit' => '12',
            'sector' => '',
            'category' => '',
            'featured' => 'false',
            'show_search' => 'true'
        ), $atts);

        $exhibitors = $this->api->get_exhibitors(array(
            'sector' => $atts['sector'],
            'limit' => intval($atts['limit']),
            'featured' => $atts['featured'] === 'true'
        ));

        if (is_wp_error($exhibitors)) {
            return '<div class="siports-error">Erreur : ' . $exhibitors->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/exhibitors-list.php';
        return ob_get_clean();
    }

    /**
     * [siports_exhibitor id="123"]
     */
    public function exhibitor_detail($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'slug' => ''
        ), $atts);

        if (empty($atts['id']) && empty($atts['slug'])) {
            return '<div class="siports-error">ID ou slug requis</div>';
        }

        return '<div id="siports-exhibitor-detail-root" class="siports-app" data-component="ExhibitorDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_exhibitors_grid cols="3" featured="true"]
     */
    public function exhibitors_grid($atts) {
        $atts['layout'] = 'grid';
        return $this->exhibitors_list($atts);
    }

    /**
     * [siports_exhibitors_search]
     */
    public function exhibitors_search($atts) {
        return '<div id="siports-exhibitors-search-root" class="siports-app" data-component="ExhibitorsSearch"></div>';
    }

    /**
     * [siports_events type="conference" limit="10"]
     */
    public function events_list($atts) {
        $atts = shortcode_atts(array(
            'type' => '',
            'limit' => '10',
            'featured_only' => 'false',
            'show_calendar' => 'false'
        ), $atts);

        $events = $this->api->get_events(array(
            'type' => $atts['type'],
            'limit' => intval($atts['limit']),
            'featured' => $atts['featured_only'] === 'true'
        ));

        if (is_wp_error($events)) {
            return '<div class="siports-error">Erreur : ' . $events->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/events-list.php';
        return ob_get_clean();
    }

    /**
     * [siports_event id="456"]
     */
    public function event_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-event-detail-root" class="siports-app" data-component="EventDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_events_calendar]
     */
    public function events_calendar($atts) {
        return '<div id="siports-events-calendar-root" class="siports-app" data-component="EventsCalendar"></div>';
    }

    /**
     * [siports_upcoming_events limit="5"]
     */
    public function upcoming_events($atts) {
        $atts = shortcode_atts(array('limit' => '5'), $atts);
        $atts['upcoming'] = 'true';
        return $this->events_list($atts);
    }

    /**
     * [siports_news category="Innovation" limit="6"]
     */
    public function news_list($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => '6',
            'featured_only' => 'false',
            'show_excerpt' => 'true'
        ), $atts);

        $articles = $this->api->get_news_articles(array(
            'category' => $atts['category'],
            'limit' => intval($atts['limit']),
            'featured' => $atts['featured_only'] === 'true'
        ));

        if (is_wp_error($articles)) {
            return '<div class="siports-error">Erreur : ' . $articles->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/news-list.php';
        return ob_get_clean();
    }

    /**
     * [siports_article id="789"]
     */
    public function article_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-article-detail-root" class="siports-app" data-component="ArticleDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_featured_news limit="3"]
     */
    public function featured_news($atts) {
        $atts['featured_only'] = 'true';
        return $this->news_list($atts);
    }

    /**
     * [siports_partners type="platinum"]
     */
    public function partners_list($atts) {
        $atts = shortcode_atts(array(
            'type' => '',
            'limit' => '12',
            'show_logos' => 'false'
        ), $atts);

        $partners = $this->api->get_partners(array(
            'partner_type' => $atts['type'],
            'limit' => intval($atts['limit'])
        ));

        if (is_wp_error($partners)) {
            return '<div class="siports-error">Erreur : ' . $partners->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/partners-list.php';
        return ob_get_clean();
    }

    /**
     * [siports_partner id="111"]
     */
    public function partner_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-partner-detail-root" class="siports-app" data-component="PartnerDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_sponsors]
     */
    public function sponsors($atts) {
        return $this->partners_list($atts);
    }

    /**
     * [siports_appointments]
     */
    public function appointments($atts) {
        return '<div id="siports-appointments-root" class="siports-app" data-component="AppointmentsPage"></div>';
    }

    /**
     * [siports_appointment_calendar exhibitor_id="123"]
     */
    public function appointment_calendar($atts) {
        $atts = shortcode_atts(array('exhibitor_id' => ''), $atts);
        return '<div id="siports-appointment-calendar-root" class="siports-app" data-component="AppointmentCalendar" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_book_appointment]
     */
    public function book_appointment($atts) {
        return $this->appointment_calendar($atts);
    }

    /**
     * [siports_minisites]
     */
    public function minisites_list($atts) {
        $atts = shortcode_atts(array(
            'limit' => '12',
            'layout' => 'grid'
        ), $atts);

        return '<div id="siports-minisites-list-root" class="siports-app" data-component="MiniSitesPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_minisite id="222"]
     */
    public function minisite_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-minisite-detail-root" class="siports-app" data-component="MiniSitePreview" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_minisite_editor]
     */
    public function minisite_editor($atts) {
        return '<div id="siports-minisite-editor-root" class="siports-app" data-component="MiniSiteEditor"></div>';
    }

    /**
     * [siports_login]
     */
    public function login_form($atts) {
        return '<div id="siports-login-root" class="siports-app" data-component="LoginPage"></div>';
    }

    /**
     * [siports_register]
     */
    public function register_form($atts) {
        return '<div id="siports-register-root" class="siports-app" data-component="RegisterPage"></div>';
    }

    /**
     * [siports_auth_links style="buttons"]
     */
    public function auth_links($atts) {
        $atts = shortcode_atts(array(
            'style' => 'buttons',
            'register_text' => 'S\'inscrire',
            'login_text' => 'Se connecter',
            'show_register' => 'true',
            'show_login' => 'true',
            'register_url' => '/register',
            'login_url' => '/login'
        ), $atts);

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/auth-links.php';
        return ob_get_clean();
    }

    /**
     * [siports_profile]
     */
    public function profile($atts) {
        return '<div id="siports-profile-root" class="siports-app" data-component="ProfilePage"></div>';
    }

    /**
     * [siports_stats show="exhibitors,visitors,events" animated="true"]
     */
    public function statistics($atts) {
        $atts = shortcode_atts(array(
            'show' => 'exhibitors,visitors,countries,events',
            'animated' => 'true',
            'layout' => 'horizontal'
        ), $atts);

        $stats = $this->api->get_statistics();

        if (is_wp_error($stats)) {
            return '<div class="siports-error">Erreur : ' . $stats->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/statistics.php';
        return ob_get_clean();
    }

    /**
     * [siports_countdown show_days="true" show_hours="true" style="full"]
     */
    public function countdown($atts) {
        $atts = shortcode_atts(array(
            'show_days' => 'true',
            'show_hours' => 'true',
            'style' => 'full',
            'event_date' => '2026-06-01'
        ), $atts);

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/countdown.php';
        return ob_get_clean();
    }

    /**
     * [siports_metrics]
     */
    public function metrics($atts) {
        return '<div id="siports-metrics-root" class="siports-app" data-component="MetricsPage"></div>';
    }

    /**
     * [siports_subscription]
     */
    public function visitor_subscription($atts) {
        return '<div id="siports-subscription-root" class="siports-app" data-component="VisitorSubscriptionPage"></div>';
    }

    /**
     * [siports_upgrade]
     */
    public function visitor_upgrade($atts) {
        return '<div id="siports-upgrade-root" class="siports-app" data-component="VisitorUpgrade"></div>';
    }

    /**
     * [siports_products exhibitor_id="123"]
     */
    public function products_list($atts) {
        $atts = shortcode_atts(array(
            'exhibitor_id' => '',
            'limit' => '12',
            'category' => ''
        ), $atts);

        $products = $this->api->get_products(array(
            'exhibitor_id' => $atts['exhibitor_id'],
            'category' => $atts['category'],
            'limit' => intval($atts['limit'])
        ));

        if (is_wp_error($products)) {
            return '<div class="siports-error">Erreur : ' . $products->get_error_message() . '</div>';
        }

        ob_start();
        include SIPORTS_SHORTCODES_PATH . 'templates/products-list.php';
        return ob_get_clean();
    }

    /**
     * [siports_product id="333"]
     */
    public function product_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-product-detail-root" class="siports-app" data-component="ProductDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_pavilions]
     */
    public function pavilions($atts) {
        return '<div id="siports-pavilions-root" class="siports-app" data-component="PavillonsPage"></div>';
    }

    /**
     * [siports_pavilion id="444"]
     */
    public function pavilion_detail($atts) {
        $atts = shortcode_atts(array('id' => ''), $atts);
        return '<div id="siports-pavilion-detail-root" class="siports-app" data-component="PavillonDetailPage" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_qr_code user_id="555"]
     */
    public function qr_code($atts) {
        $atts = shortcode_atts(array(
            'user_id' => '',
            'size' => '200'
        ), $atts);

        return '<div id="siports-qr-code-root" class="siports-app" data-component="QRCodeGenerator" data-atts="' . esc_attr(wp_json_encode($atts)) . '"></div>';
    }

    /**
     * [siports_search]
     */
    public function global_search($atts) {
        return '<div id="siports-search-root" class="siports-app" data-component="GlobalSearch"></div>';
    }
}

// Initialize the plugin
new SIPORTS_Comprehensive_Shortcodes();
