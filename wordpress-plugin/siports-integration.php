<?php
/**
 * Plugin Name: SIPORTS 2026 Integration
 * Plugin URI: https://siportevent.com
 * Description: Intégration complète de la plateforme SIPORTS 2026 dans WordPress avec shortcodes et API
 * Version: 1.0.0
 * Author: SIPORTS Team
 * License: GPL v2 or later
 * Text Domain: siports
 * Domain Path: /languages
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

// Constantes du plugin
define('SIPORTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SIPORTS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('SIPORTS_VERSION', '1.0.0');

class SiportsIntegration {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Shortcodes
        add_shortcode('siports_exhibitors', array($this, 'exhibitors_shortcode'));
        add_shortcode('siports_events', array($this, 'events_shortcode'));
        add_shortcode('siports_networking', array($this, 'networking_shortcode'));
        add_shortcode('siports_auth_links', array($this, 'auth_links_shortcode'));
        add_shortcode('siports_news', array($this, 'news_shortcode'));
        add_shortcode('siports_partners', array($this, 'partners_shortcode'));
        add_shortcode('siports_pavilions', array($this, 'pavilions_shortcode'));
        add_shortcode('siports_stats', array($this, 'stats_shortcode'));
        add_shortcode('siports_countdown', array($this, 'countdown_shortcode'));
        
        // API AJAX
        add_action('wp_ajax_siports_api', array($this, 'handle_api_request'));
        add_action('wp_ajax_nopriv_siports_api', array($this, 'handle_api_request'));
        
        // REST API
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Widget
        add_action('widgets_init', array($this, 'register_widget'));
    }
    
    public function init() {
        // Initialisation du plugin
        $this->create_database_tables();
        $this->register_post_types();
        load_plugin_textdomain('siports', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        // Charger les styles CSS
        wp_enqueue_style(
            'siports-styles',
            SIPORTS_PLUGIN_URL . 'assets/siports.css',
            array(),
            SIPORTS_VERSION
        );
        
        // Charger le JavaScript
        wp_enqueue_script(
            'siports-script',
            SIPORTS_PLUGIN_URL . 'assets/siports.js',
            array('jquery'),
            SIPORTS_VERSION,
            true
        );
        
        // Variables JavaScript pour l'API
        wp_localize_script('siports-script', 'siports_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('siports_nonce'),
            'api_base' => get_option('siports_api_base', 'https://api.siports.com'),
            'salon_date' => '2026-02-05T09:30:00'
        ));
    }
    
    public function admin_enqueue_scripts() {
        wp_enqueue_style('siports-admin', SIPORTS_PLUGIN_URL . 'assets/admin.css', array(), SIPORTS_VERSION);
        wp_enqueue_script('siports-admin', SIPORTS_PLUGIN_URL . 'assets/admin.js', array('jquery'), SIPORTS_VERSION, true);
    }
    
    public function admin_menu() {
        add_menu_page(
            'SIPORTS 2026',
            'SIPORTS',
            'manage_options',
            'siports-dashboard',
            array($this, 'admin_dashboard'),
            'dashicons-building',
            30
        );
        
        add_submenu_page(
            'siports-dashboard',
            'Shortcodes',
            'Shortcodes',
            'manage_options',
            'siports-shortcodes',
            array($this, 'admin_shortcodes')
        );
        
        add_submenu_page(
            'siports-dashboard',
            'Paramètres',
            'Paramètres',
            'manage_options',
            'siports-settings',
            array($this, 'admin_settings')
        );
    }
    
    // Shortcode pour afficher la liste des exposants
    public function exhibitors_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => 12,
            'layout' => 'grid',
            'featured' => 'false',
            'show_contact' => 'true'
        ), $atts);
        
        $exhibitors = $this->get_exhibitors_data($atts);
        
        ob_start();
        ?>
        <div class="siports-exhibitors siports-layout-<?php echo esc_attr($atts['layout']); ?>">
            <?php if (empty($exhibitors)): ?>
                <div class="siports-no-results">
                    <p>Aucun exposant trouvé pour les critères sélectionnés.</p>
                </div>
            <?php else: ?>
                <div class="siports-exhibitors-grid">
                    <?php foreach ($exhibitors as $exhibitor): ?>
                        <div class="siports-exhibitor-card siports-item" 
                             data-category="<?php echo esc_attr($exhibitor['category']); ?>"
                             data-sector="<?php echo esc_attr($exhibitor['sector']); ?>">
                            
                            <div class="exhibitor-header">
                                <img src="<?php echo esc_url($exhibitor['logo']); ?>" 
                                     alt="<?php echo esc_attr($exhibitor['name']); ?>" 
                                     class="exhibitor-logo">
                                
                                <div class="exhibitor-info">
                                    <h3><?php echo esc_html($exhibitor['name']); ?></h3>
                                    <p class="exhibitor-sector"><?php echo esc_html($exhibitor['sector']); ?></p>
                                    <p class="exhibitor-country"><?php echo esc_html($exhibitor['country']); ?></p>
                                </div>
                                
                                <?php if ($exhibitor['featured']): ?>
                                    <span class="featured-badge">⭐ Vedette</span>
                                <?php endif; ?>
                            </div>
                            
                            <div class="exhibitor-description">
                                <p><?php echo esc_html(wp_trim_words($exhibitor['description'], 20)); ?></p>
                            </div>
                            
                            <?php if ($atts['show_contact'] === 'true'): ?>
                                <div class="exhibitor-actions">
                                    <a href="#" class="siports-btn siports-btn-primary" 
                                       onclick="siportsContact('<?php echo esc_js($exhibitor['id']); ?>')">
                                        📧 Contact
                                    </a>
                                    <a href="#" class="siports-btn siports-btn-outline"
                                       onclick="siportsSchedule('<?php echo esc_js($exhibitor['id']); ?>')">
                                        📅 RDV
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour afficher les événements
    public function events_shortcode($atts) {
        $atts = shortcode_atts(array(
            'type' => '',
            'limit' => 6,
            'featured_only' => 'false',
            'category' => ''
        ), $atts);
        
        $events = $this->get_events_data($atts);
        
        ob_start();
        ?>
        <div class="siports-events">
            <?php if (empty($events)): ?>
                <div class="siports-no-results">
                    <p>Aucun événement trouvé.</p>
                </div>
            <?php else: ?>
                <div class="siports-events-grid">
                    <?php foreach ($events as $event): ?>
                        <div class="siports-event-card">
                            <div class="event-header">
                                <span class="event-type">
                                    <?php echo $this->get_event_icon($event['type']); ?>
                                    <?php echo esc_html($this->get_event_type_label($event['type'])); ?>
                                </span>
                                <?php if ($event['virtual']): ?>
                                    <span class="event-virtual">🖥️ Virtuel</span>
                                <?php endif; ?>
                            </div>
                            
                            <h3 class="event-title"><?php echo esc_html($event['title']); ?></h3>
                            <p class="event-description"><?php echo esc_html($event['description']); ?></p>
                            
                            <div class="event-details">
                                <div>📅 <?php echo esc_html(date('d/m/Y', strtotime($event['date']))); ?></div>
                                <div>🕐 <?php echo esc_html($event['start_time'] . ' - ' . $event['end_time']); ?></div>
                                <?php if ($event['location']): ?>
                                    <div>📍 <?php echo esc_html($event['location']); ?></div>
                                <?php endif; ?>
                                <div>👥 <?php echo esc_html($event['registered'] . '/' . $event['capacity']); ?> participants</div>
                            </div>
                            
                            <div class="event-actions">
                                <a href="#" class="siports-btn siports-btn-primary" 
                                   onclick="siportsRegisterEvent('<?php echo esc_js($event['id']); ?>')">
                                    S'inscrire
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour le réseautage
    public function networking_shortcode($atts) {
        $atts = shortcode_atts(array(
            'recommendations' => 6,
            'show_ai' => 'true'
        ), $atts);
        
        $profiles = $this->get_networking_data($atts);
        
        ob_start();
        ?>
        <div class="siports-networking">
            <?php if ($atts['show_ai'] === 'true'): ?>
                <div class="siports-ai-banner">
                    <h3>🧠 Recommandations IA Personnalisées</h3>
                    <p>Découvrez les professionnels les plus pertinents grâce à notre intelligence artificielle</p>
                </div>
            <?php endif; ?>
            
            <div class="siports-networking-grid">
                <?php foreach ($profiles as $profile): ?>
                    <div class="siports-profile-card">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <?php echo esc_html(substr($profile['name'], 0, 1)); ?>
                            </div>
                            <div class="profile-info">
                                <h4><?php echo esc_html($profile['name']); ?></h4>
                                <p><?php echo esc_html($profile['position']); ?></p>
                                <p><?php echo esc_html($profile['company']); ?></p>
                            </div>
                            <div class="compatibility-score">
                                <span class="score"><?php echo esc_html($profile['compatibility']); ?>%</span>
                                <span class="label">match</span>
                            </div>
                        </div>
                        
                        <div class="profile-actions">
                            <a href="#" class="siports-btn siports-btn-primary" 
                               onclick="siportsConnect('<?php echo esc_js($profile['id']); ?>')">
                                🤝 Connecter
                            </a>
                            <a href="#" class="siports-btn siports-btn-outline"
                               onclick="siportsMessage('<?php echo esc_js($profile['id']); ?>')">
                                💬 Message
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour les actualités
    public function news_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => 4,
            'featured_only' => 'false',
            'show_excerpt' => 'true'
        ), $atts);
        
        $articles = $this->get_news_data($atts);
        
        ob_start();
        ?>
        <div class="siports-news">
            <div class="siports-news-grid">
                <?php foreach ($articles as $article): ?>
                    <div class="siports-news-card">
                        <img src="<?php echo esc_url($article['image']); ?>" 
                             alt="<?php echo esc_attr($article['title']); ?>" 
                             class="news-image">
                        
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-category"><?php echo esc_html($article['category']); ?></span>
                                <span class="news-date"><?php echo esc_html(date('d/m/Y', strtotime($article['date']))); ?></span>
                            </div>
                            
                            <h3 class="news-title"><?php echo esc_html($article['title']); ?></h3>
                            
                            <?php if ($atts['show_excerpt'] === 'true'): ?>
                                <p class="news-excerpt"><?php echo esc_html($article['excerpt']); ?></p>
                            <?php endif; ?>
                            
                            <a href="<?php echo esc_url($article['url']); ?>" class="siports-btn siports-btn-primary">
                                📖 Lire l'article
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour les partenaires
    public function partners_shortcode($atts) {
        $atts = shortcode_atts(array(
            'type' => '',
            'limit' => 8,
            'show_logos' => 'false'
        ), $atts);
        
        $partners = $this->get_partners_data($atts);
        
        ob_start();
        ?>
        <div class="siports-partners">
            <?php if ($atts['show_logos'] === 'true'): ?>
                <div class="siports-partners-logos">
                    <?php foreach ($partners as $partner): ?>
                        <div class="partner-logo">
                            <img src="<?php echo esc_url($partner['logo']); ?>" 
                                 alt="<?php echo esc_attr($partner['name']); ?>">
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="siports-partners-grid">
                    <?php foreach ($partners as $partner): ?>
                        <div class="siports-partner-card">
                            <div class="partner-header">
                                <img src="<?php echo esc_url($partner['logo']); ?>" 
                                     alt="<?php echo esc_attr($partner['name']); ?>" 
                                     class="partner-logo">
                                <div class="partner-info">
                                    <h3><?php echo esc_html($partner['name']); ?></h3>
                                    <p class="partner-type"><?php echo esc_html($partner['type']); ?></p>
                                    <p class="partner-country"><?php echo esc_html($partner['country']); ?></p>
                                </div>
                            </div>
                            
                            <p class="partner-description"><?php echo esc_html($partner['description']); ?></p>
                            
                            <?php if ($partner['website']): ?>
                                <a href="<?php echo esc_url($partner['website']); ?>" 
                                   target="_blank" class="siports-btn siports-btn-outline">
                                    🌐 Site web
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour les pavillons
    public function pavilions_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show_stats' => 'true',
            'layout' => 'grid'
        ), $atts);
        
        $pavilions = $this->get_pavilions_data();
        
        ob_start();
        ?>
        <div class="siports-pavilions siports-layout-<?php echo esc_attr($atts['layout']); ?>">
            <div class="siports-pavilions-grid">
                <?php foreach ($pavilions as $pavilion): ?>
                    <div class="siports-pavilion-card">
                        <div class="pavilion-header">
                            <div class="pavilion-icon"><?php echo $pavilion['icon']; ?></div>
                            <h3><?php echo esc_html($pavilion['name']); ?></h3>
                            <p class="pavilion-description"><?php echo esc_html($pavilion['description']); ?></p>
                        </div>
                        
                        <?php if ($atts['show_stats'] === 'true'): ?>
                            <div class="pavilion-stats">
                                <div class="stat">
                                    <span class="stat-number"><?php echo esc_html($pavilion['exhibitors']); ?></span>
                                    <span class="stat-label">Exposants</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number"><?php echo esc_html($pavilion['visitors']); ?></span>
                                    <span class="stat-label">Visiteurs</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number"><?php echo esc_html($pavilion['conferences']); ?></span>
                                    <span class="stat-label">Conférences</span>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour les statistiques
    public function stats_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show' => 'exhibitors,visitors,countries,events',
            'animated' => 'false',
            'layout' => 'horizontal'
        ), $atts);
        
        $stats_to_show = explode(',', $atts['show']);
        $stats = $this->get_salon_stats();
        
        ob_start();
        ?>
        <div class="siports-stats siports-layout-<?php echo esc_attr($atts['layout']); ?>">
            <div class="siports-stats-grid">
                <?php foreach ($stats_to_show as $stat_key): ?>
                    <?php $stat_key = trim($stat_key); ?>
                    <?php if (isset($stats[$stat_key])): ?>
                        <div class="siports-stat-item <?php echo $atts['animated'] === 'true' ? 'animated' : ''; ?>">
                            <div class="stat-icon"><?php echo $stats[$stat_key]['icon']; ?></div>
                            <span class="stat-number" data-target="<?php echo esc_attr($stats[$stat_key]['value']); ?>">
                                <?php echo esc_html($stats[$stat_key]['value']); ?>
                            </span>
                            <span class="stat-label"><?php echo esc_html($stats[$stat_key]['label']); ?></span>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour le compte à rebours
    public function countdown_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show_days' => 'true',
            'show_hours' => 'true',
            'style' => 'full'
        ), $atts);
        
        ob_start();
        ?>
        <div class="siports-countdown siports-style-<?php echo esc_attr($atts['style']); ?>">
            <div class="countdown-header">
                <h3>⏰ SIPORTS 2026 commence dans :</h3>
            </div>
            
            <div class="countdown-timer" data-target="2026-02-05T09:30:00" 
                 data-show-days="<?php echo esc_attr($atts['show_days']); ?>"
                 data-show-hours="<?php echo esc_attr($atts['show_hours']); ?>">
                
                <?php if ($atts['show_days'] === 'true'): ?>
                    <div class="countdown-unit">
                        <span class="countdown-number" id="days">--</span>
                        <span class="countdown-label">Jours</span>
                    </div>
                <?php endif; ?>
                
                <?php if ($atts['show_hours'] === 'true'): ?>
                    <div class="countdown-unit">
                        <span class="countdown-number" id="hours">--</span>
                        <span class="countdown-label">Heures</span>
                    </div>
                <?php endif; ?>
                
                <div class="countdown-unit">
                    <span class="countdown-number" id="minutes">--</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                
                <div class="countdown-unit">
                    <span class="countdown-number" id="seconds">--</span>
                    <span class="countdown-label">Secondes</span>
                </div>
            </div>
            
            <div class="countdown-info">
                <p>📍 Mohammed VI Exhibition Center - El Jadida, Maroc</p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour les liens d'inscription et connexion
    public function auth_links_shortcode($atts) {
        $atts = shortcode_atts(array(
            'style' => 'buttons', // buttons, links, banner
            'show_register' => 'true',
            'show_login' => 'true',
            'register_text' => 'Devenir Exposant',
            'login_text' => 'Connexion',
            'register_url' => 'https://siports.com/register',
            'login_url' => 'https://siports.com/login',
            'target' => '_blank',
            'class' => ''
        ), $atts);
        
        ob_start();
        
        if ($atts['style'] === 'banner') {
            ?>
            <div class="siports-auth-banner <?php echo esc_attr($atts['class']); ?>">
                <div class="auth-banner-content">
                    <div class="auth-banner-text">
                        <h3>Rejoignez SIPORTS 2026</h3>
                        <p>Connectez-vous avec plus de 6,000 professionnels portuaires</p>
                    </div>
                    <div class="auth-banner-actions">
                        <?php if ($atts['show_register'] === 'true'): ?>
                            <a href="<?php echo esc_url($atts['register_url']); ?>" 
                               target="<?php echo esc_attr($atts['target']); ?>"
                               class="siports-btn siports-btn-primary">
                                <?php echo esc_html($atts['register_text']); ?>
                            </a>
                        <?php endif; ?>
                        
                        <?php if ($atts['show_login'] === 'true'): ?>
                            <a href="<?php echo esc_url($atts['login_url']); ?>" 
                               target="<?php echo esc_attr($atts['target']); ?>"
                               class="siports-btn siports-btn-outline">
                                <?php echo esc_html($atts['login_text']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php
        } elseif ($atts['style'] === 'links') {
            ?>
            <div class="siports-auth-links <?php echo esc_attr($atts['class']); ?>">
                <?php if ($atts['show_register'] === 'true'): ?>
                    <a href="<?php echo esc_url($atts['register_url']); ?>" 
                       target="<?php echo esc_attr($atts['target']); ?>"
                       class="siports-auth-link register-link">
                        <?php echo esc_html($atts['register_text']); ?>
                    </a>
                <?php endif; ?>
                
                <?php if ($atts['show_login'] === 'true' && $atts['show_register'] === 'true'): ?>
                    <span class="auth-separator">|</span>
                <?php endif; ?>
                
                <?php if ($atts['show_login'] === 'true'): ?>
                    <a href="<?php echo esc_url($atts['login_url']); ?>" 
                       target="<?php echo esc_attr($atts['target']); ?>"
                       class="siports-auth-link login-link">
                        <?php echo esc_html($atts['login_text']); ?>
                    </a>
                <?php endif; ?>
            </div>
            <?php
        } else {
            // Style buttons par défaut
            ?>
            <div class="siports-auth-buttons <?php echo esc_attr($atts['class']); ?>">
                <?php if ($atts['show_register'] === 'true'): ?>
                    <a href="<?php echo esc_url($atts['register_url']); ?>" 
                       target="<?php echo esc_attr($atts['target']); ?>"
                       class="siports-btn siports-btn-primary">
                        <?php echo esc_html($atts['register_text']); ?>
                    </a>
                <?php endif; ?>
                
                <?php if ($atts['show_login'] === 'true'): ?>
                    <a href="<?php echo esc_url($atts['login_url']); ?>" 
                       target="<?php echo esc_attr($atts['target']); ?>"
                       class="siports-btn siports-btn-outline">
                        <?php echo esc_html($atts['login_text']); ?>
                    </a>
                <?php endif; ?>
            </div>
            <?php
        }
        
        return ob_get_clean();
    }
    
    // Gestionnaire des requêtes API
    public function handle_api_request() {
        check_ajax_referer('siports_nonce', 'nonce');
        
        $action = sanitize_text_field($_POST['siports_action']);
        $response = array();
        
        switch ($action) {
            case 'contact_exhibitor':
                $exhibitor_id = sanitize_text_field($_POST['exhibitor_id']);
                $response = array('success' => true, 'message' => 'Message envoyé à l\'exposant');
                break;
                
            case 'register_event':
                $event_id = sanitize_text_field($_POST['event_id']);
                $response = array('success' => true, 'message' => 'Inscription réussie');
                break;
                
            case 'sync_data':
                $this->sync_siports_data();
                $response = array('success' => true, 'message' => 'Données synchronisées');
                break;
                
            default:
                $response = array('error' => 'Action non reconnue');
        }
        
        wp_send_json($response);
    }
    
    // Routes REST API
    public function register_rest_routes() {
        register_rest_route('siports/v1', '/exhibitors', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_exhibitors'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('siports/v1', '/events', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_events'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('siports/v1', '/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_stats'),
            'permission_callback' => '__return_true'
        ));
    }
    
    public function rest_get_exhibitors($request) {
        $params = $request->get_params();
        return rest_ensure_response($this->get_exhibitors_data($params));
    }
    
    public function rest_get_events($request) {
        $params = $request->get_params();
        return rest_ensure_response($this->get_events_data($params));
    }
    
    public function rest_get_stats($request) {
        return rest_ensure_response($this->get_salon_stats());
    }
    
    // Données des exposants
    private function get_exhibitors_data($params = array()) {
        return array(
            array(
                'id' => '1',
                'name' => 'Port Solutions Inc.',
                'sector' => 'Port Management',
                'country' => 'Morocco',
                'category' => 'port-operations',
                'description' => 'Leading provider of integrated port management solutions, specializing in digital transformation and operational efficiency.',
                'logo' => 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
                'website' => 'https://portsolutions.com',
                'featured' => true,
                'verified' => true
            ),
            array(
                'id' => '2',
                'name' => 'Maritime Tech Solutions',
                'sector' => 'Equipment Manufacturing',
                'country' => 'Netherlands',
                'category' => 'port-industry',
                'description' => 'Innovative manufacturer of port equipment and automation systems for modern maritime facilities.',
                'logo' => 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
                'website' => 'https://maritimetech.com',
                'featured' => false,
                'verified' => true
            ),
            array(
                'id' => '3',
                'name' => 'Global Port Authority',
                'sector' => 'Government',
                'country' => 'International',
                'category' => 'institutional',
                'description' => 'International organization promoting sustainable port development and maritime cooperation.',
                'logo' => 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
                'website' => 'https://globalportauthority.org',
                'featured' => true,
                'verified' => true
            )
        );
    }
    
    // Données des événements
    private function get_events_data($params = array()) {
        return array(
            array(
                'id' => '1',
                'title' => 'Digitalisation des Ports : Enjeux et Opportunités',
                'description' => 'Table ronde sur les technologies émergentes dans le secteur portuaire',
                'type' => 'roundtable',
                'date' => '2026-02-05',
                'start_time' => '14:00',
                'end_time' => '15:30',
                'capacity' => 50,
                'registered' => 32,
                'location' => 'Salle de conférence A',
                'virtual' => false,
                'featured' => true,
                'category' => 'Digital Transformation'
            ),
            array(
                'id' => '2',
                'title' => 'Speed Networking : Opérateurs Portuaires',
                'description' => 'Session de réseautage rapide dédiée aux opérateurs portuaires',
                'type' => 'networking',
                'date' => '2026-02-06',
                'start_time' => '10:30',
                'end_time' => '12:00',
                'capacity' => 80,
                'registered' => 65,
                'location' => 'Espace networking B',
                'virtual' => false,
                'featured' => true,
                'category' => 'Networking'
            ),
            array(
                'id' => '3',
                'title' => 'Ports Durables : Transition Énergétique',
                'description' => 'Webinaire sur les stratégies de transition énergétique dans les ports',
                'type' => 'webinar',
                'date' => '2026-02-07',
                'start_time' => '16:00',
                'end_time' => '17:00',
                'capacity' => 200,
                'registered' => 145,
                'location' => '',
                'virtual' => true,
                'featured' => false,
                'category' => 'Sustainability'
            )
        );
    }
    
    // Données de réseautage
    private function get_networking_data($params = array()) {
        return array(
            array(
                'id' => '1',
                'name' => 'Sarah Johnson',
                'position' => 'CEO',
                'company' => 'Global Port Solutions',
                'compatibility' => 95,
                'type' => 'exhibitor'
            ),
            array(
                'id' => '2',
                'name' => 'Ahmed El Mansouri',
                'position' => 'Directeur Technique',
                'company' => 'Autorité Portuaire Casablanca',
                'compatibility' => 88,
                'type' => 'partner'
            ),
            array(
                'id' => '3',
                'name' => 'Dr. Maria Santos',
                'position' => 'Research Director',
                'company' => 'Maritime University Barcelona',
                'compatibility' => 82,
                'type' => 'visitor'
            )
        );
    }
    
    // Données des actualités
    private function get_news_data($params = array()) {
        return array(
            array(
                'id' => '1',
                'title' => 'SIPORTS 2026 : El Jadida se prépare à accueillir le plus grand salon portuaire d\'Afrique',
                'excerpt' => 'La ville d\'El Jadida se mobilise pour accueillir SIPORTS 2026, événement majeur qui réunira plus de 6000 professionnels.',
                'category' => 'Événement',
                'date' => '2024-01-20',
                'image' => 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
                'url' => 'https://siportevent.com/actualite-portuaire/',
                'featured' => true
            ),
            array(
                'id' => '2',
                'title' => 'Innovation portuaire : Les technologies qui transforment les ports africains',
                'excerpt' => 'Découvrez les dernières innovations technologiques qui révolutionnent les opérations portuaires en Afrique.',
                'category' => 'Innovation',
                'date' => '2024-01-18',
                'image' => 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
                'url' => 'https://siportevent.com/actualite-portuaire/',
                'featured' => true
            )
        );
    }
    
    // Données des partenaires
    private function get_partners_data($params = array()) {
        return array(
            array(
                'id' => '1',
                'name' => 'Ministère de l\'Équipement et de l\'Eau',
                'type' => 'Organisateur Principal',
                'country' => 'Maroc',
                'description' => 'Ministère organisateur du salon SIPORTS 2026',
                'logo' => 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
                'website' => 'https://www.equipement.gov.ma'
            ),
            array(
                'id' => '2',
                'name' => 'Autorité Portuaire de Casablanca',
                'type' => 'Partenaire Platine',
                'country' => 'Maroc',
                'description' => 'Premier port du Maroc et partenaire stratégique majeur',
                'logo' => 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
                'website' => 'https://www.portcasablanca.ma'
            )
        );
    }
    
    // Données des pavillons
    private function get_pavilions_data() {
        return array(
            array(
                'name' => 'Pavillon Institutionnel',
                'description' => 'Networking B2B & Coopération Internationale',
                'icon' => '🏛️',
                'exhibitors' => 85,
                'visitors' => 1800,
                'conferences' => 12
            ),
            array(
                'name' => 'Pavillon Industrie Portuaire',
                'description' => 'Échange d\'Expertise & Innovation Technologique',
                'icon' => '⚙️',
                'exhibitors' => 120,
                'visitors' => 2200,
                'conferences' => 8
            ),
            array(
                'name' => 'Pavillon Performance',
                'description' => 'Excellence Opérationnelle & Optimisation',
                'icon' => '📈',
                'exhibitors' => 65,
                'visitors' => 1500,
                'conferences' => 6
            ),
            array(
                'name' => 'Pavillon Académique',
                'description' => 'Formation, Innovation & Durabilité',
                'icon' => '🎓',
                'exhibitors' => 45,
                'visitors' => 800,
                'conferences' => 10
            )
        );
    }
    
    // Statistiques du salon
    private function get_salon_stats() {
        return array(
            'exhibitors' => array(
                'value' => '330',
                'label' => 'Exposants',
                'icon' => '🏢'
            ),
            'visitors' => array(
                'value' => '6300',
                'label' => 'Visiteurs Professionnels',
                'icon' => '👥'
            ),
            'countries' => array(
                'value' => '42',
                'label' => 'Pays Représentés',
                'icon' => '🌍'
            ),
            'events' => array(
                'value' => '40',
                'label' => 'Conférences & Ateliers',
                'icon' => '📅'
            ),
            'partners' => array(
                'value' => '25',
                'label' => 'Partenaires Officiels',
                'icon' => '🤝'
            )
        );
    }
    
    // Utilitaires
    private function get_event_type_label($type) {
        $labels = array(
            'conference' => 'Conférence',
            'webinar' => 'Webinaire',
            'roundtable' => 'Table Ronde',
            'networking' => 'Réseautage',
            'workshop' => 'Atelier'
        );
        return isset($labels[$type]) ? $labels[$type] : $type;
    }
    
    private function get_event_icon($type) {
        $icons = array(
            'conference' => '🎤',
            'webinar' => '💻',
            'roundtable' => '🔄',
            'networking' => '🤝',
            'workshop' => '🛠️'
        );
        return isset($icons[$type]) ? $icons[$type] : '📅';
    }
    
    // Pages d'administration
    public function admin_dashboard() {
        ?>
        <div class="wrap">
            <h1>SIPORTS 2026 - Tableau de Bord</h1>
            
            <div class="siports-admin-dashboard">
                <div class="siports-admin-cards">
                    <div class="siports-admin-card">
                        <h3>📊 Statistiques</h3>
                        <p>330 Exposants • 6,300 Visiteurs • 42 Pays</p>
                        <button onclick="siportsSync()" class="button button-primary">Synchroniser</button>
                    </div>
                    
                    <div class="siports-admin-card">
                        <h3>🔧 Shortcodes</h3>
                        <p>8 shortcodes disponibles pour votre site</p>
                        <a href="<?php echo admin_url('admin.php?page=siports-shortcodes'); ?>" class="button">Voir les shortcodes</a>
                    </div>
                    
                    <div class="siports-admin-card">
                        <h3>⚙️ Configuration</h3>
                        <p>Paramètres API et personnalisation</p>
                        <a href="<?php echo admin_url('admin.php?page=siports-settings'); ?>" class="button">Paramètres</a>
                    </div>
                </div>
                
                <div class="siports-admin-preview">
                    <h2>Aperçu des Shortcodes</h2>
                    <div class="shortcode-preview">
                        <?php echo do_shortcode('[siports_countdown style="compact"]'); ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function admin_shortcodes() {
        ?>
        <div class="wrap">
            <h1>SIPORTS 2026 - Guide des Shortcodes</h1>
            
            <div class="siports-shortcodes-guide">
                <div class="shortcode-section">
                    <h2>📋 Liste des Shortcodes Disponibles</h2>
                    
                    <div class="shortcode-item">
                        <h3>1. [siports_exhibitors] - Exposants</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>category</code> - Catégorie (institutional, port-industry, port-operations, academic)</li>
                            <li><code>limit</code> - Nombre d'exposants (défaut: 12)</li>
                            <li><code>layout</code> - Mise en page (grid, list)</li>
                            <li><code>featured</code> - Exposants vedettes uniquement (true/false)</li>
                        </ul>
                        <p><strong>Exemples :</strong></p>
                        <code>[siports_exhibitors category="port-operations" limit="6" layout="grid"]</code><br>
                        <code>[siports_exhibitors featured="true" limit="3"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>2. [siports_events] - Événements</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>type</code> - Type d'événement (conference, webinar, workshop, networking)</li>
                            <li><code>limit</code> - Nombre d'événements (défaut: 6)</li>
                            <li><code>featured_only</code> - Événements vedettes uniquement (true/false)</li>
                        </ul>
                        <code>[siports_events type="conference" limit="4" featured_only="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>3. [siports_networking] - Réseautage</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>recommendations</code> - Nombre de recommandations (défaut: 6)</li>
                            <li><code>show_ai</code> - Afficher bannière IA (true/false)</li>
                        </ul>
                        <code>[siports_networking recommendations="8" show_ai="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>4. [siports_news] - Actualités</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>category</code> - Catégorie d'actualité</li>
                            <li><code>limit</code> - Nombre d'articles (défaut: 4)</li>
                            <li><code>featured_only</code> - Articles vedettes uniquement (true/false)</li>
                        </ul>
                        <code>[siports_news category="Innovation" limit="3" featured_only="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>5. [siports_partners] - Partenaires</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>type</code> - Type de partenaire (platinum, gold, silver)</li>
                            <li><code>show_logos</code> - Affichage logos uniquement (true/false)</li>
                        </ul>
                        <code>[siports_partners type="platinum" show_logos="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>6. [siports_pavilions] - Pavillons</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>show_stats</code> - Afficher statistiques (true/false)</li>
                        </ul>
                        <code>[siports_pavilions show_stats="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>7. [siports_stats] - Statistiques</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>show</code> - Statistiques à afficher (exhibitors,visitors,countries,events)</li>
                            <li><code>animated</code> - Animation des chiffres (true/false)</li>
                            <li><code>layout</code> - Disposition (horizontal, vertical)</li>
                        </ul>
                        <code>[siports_stats show="exhibitors,visitors,countries" animated="true"]</code>
                    </div>
                    
                    <div class="shortcode-item">
                        <h3>8. [siports_countdown] - Compte à Rebours</h3>
                        <p><strong>Paramètres :</strong></p>
                        <ul>
                            <li><code>show_days</code> - Afficher les jours (true/false)</li>
                            <li><code>show_hours</code> - Afficher les heures (true/false)</li>
                            <li><code>style</code> - Style d'affichage (full, compact)</li>
                        </ul>
                        <code>[siports_countdown show_days="true" style="full"]</code>
                    </div>
                </div>
                
                <div class="shortcode-examples">
                    <h2>💡 Exemples d'Utilisation</h2>
                    
                    <h3>Page d'accueil complète :</h3>
                    <textarea readonly rows="8" style="width: 100%; font-family: monospace;">
[siports_countdown show_days="true" show_hours="true" style="full"]

[siports_stats show="exhibitors,visitors,countries,events" animated="true" layout="horizontal"]

<h2>Exposants à la Une</h2>
[siports_exhibitors featured="true" limit="6" layout="grid"]

<h2>Événements Phares</h2>
[siports_events featured_only="true" limit="4"]
                    </textarea>
                    
                    <h3>Sidebar/Widget :</h3>
                    <textarea readonly rows="4" style="width: 100%; font-family: monospace;">
[siports_countdown style="compact"]
[siports_stats show="exhibitors,visitors" layout="vertical"]
[siports_events limit="3" featured_only="true"]
                    </textarea>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function admin_settings() {
        if (isset($_POST['submit'])) {
            update_option('siports_api_base', sanitize_text_field($_POST['api_base']));
            update_option('siports_api_key', sanitize_text_field($_POST['api_key']));
            update_option('siports_cache_duration', intval($_POST['cache_duration']));
            echo '<div class="notice notice-success"><p>Paramètres sauvegardés !</p></div>';
        }
        
        $api_base = get_option('siports_api_base', 'https://api.siports.com');
        $api_key = get_option('siports_api_key', '');
        $cache_duration = get_option('siports_cache_duration', 3600);
        ?>
        <div class="wrap">
            <h1>SIPORTS 2026 - Paramètres</h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">URL de l'API SIPORTS</th>
                        <td>
                            <input type="url" name="api_base" value="<?php echo esc_attr($api_base); ?>" class="regular-text" />
                            <p class="description">URL de base de l'API SIPORTS</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Clé API</th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Clé d'authentification API (contactez SIPORTS)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Durée du cache (secondes)</th>
                        <td>
                            <input type="number" name="cache_duration" value="<?php echo esc_attr($cache_duration); ?>" min="300" max="86400" />
                            <p class="description">Durée de mise en cache des données (défaut: 3600 = 1 heure)</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Sauvegarder les paramètres'); ?>
            </form>
            
            <div class="siports-admin-actions">
                <h2>Actions</h2>
                <p>
                    <button onclick="siportsSync()" class="button button-secondary">🔄 Synchroniser les données</button>
                    <button onclick="siportsClearCache()" class="button button-secondary">🗑️ Vider le cache</button>
                </p>
            </div>
        </div>
        <?php
    }
    
    // Création des tables de base de données
    private function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Table pour les exposants
        $table_exhibitors = $wpdb->prefix . 'siports_exhibitors';
        $sql_exhibitors = "CREATE TABLE $table_exhibitors (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            company_name varchar(255) NOT NULL,
            sector varchar(100) NOT NULL,
            country varchar(100) NOT NULL,
            category varchar(50) NOT NULL,
            description text,
            logo_url varchar(255),
            website varchar(255),
            verified boolean DEFAULT false,
            featured boolean DEFAULT false,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Table pour les événements
        $table_events = $wpdb->prefix . 'siports_events';
        $sql_events = "CREATE TABLE $table_events (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            event_type varchar(50) NOT NULL,
            event_date datetime NOT NULL,
            start_time time NOT NULL,
            end_time time NOT NULL,
            capacity int DEFAULT 0,
            registered int DEFAULT 0,
            location varchar(255),
            virtual boolean DEFAULT false,
            featured boolean DEFAULT false,
            category varchar(100),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_exhibitors);
        dbDelta($sql_events);
    }
    
    // Types de posts personnalisés
    private function register_post_types() {
        // Type de post pour les actualités SIPORTS
        register_post_type('siports_news', array(
            'labels' => array(
                'name' => 'Actualités SIPORTS',
                'singular_name' => 'Actualité SIPORTS'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
            'menu_icon' => 'dashicons-megaphone',
            'show_in_rest' => true
        ));
    }
    
    // Synchronisation des données
    private function sync_siports_data() {
        // En production, ici on ferait des appels à l'API SIPORTS
        // Pour la démo, on utilise des données statiques
        
        global $wpdb;
        
        // Vider les tables existantes
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}siports_exhibitors");
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}siports_events");
        
        // Insérer les données des exposants
        $exhibitors = $this->get_exhibitors_data();
        foreach ($exhibitors as $exhibitor) {
            $wpdb->insert(
                $wpdb->prefix . 'siports_exhibitors',
                array(
                    'company_name' => $exhibitor['name'],
                    'sector' => $exhibitor['sector'],
                    'country' => $exhibitor['country'],
                    'category' => $exhibitor['category'],
                    'description' => $exhibitor['description'],
                    'logo_url' => $exhibitor['logo'],
                    'website' => $exhibitor['website'],
                    'verified' => $exhibitor['verified'],
                    'featured' => $exhibitor['featured']
                )
            );
        }
        
        // Insérer les données des événements
        $events = $this->get_events_data();
        foreach ($events as $event) {
            $wpdb->insert(
                $wpdb->prefix . 'siports_events',
                array(
                    'title' => $event['title'],
                    'description' => $event['description'],
                    'event_type' => $event['type'],
                    'event_date' => $event['date'],
                    'start_time' => $event['start_time'],
                    'end_time' => $event['end_time'],
                    'capacity' => $event['capacity'],
                    'registered' => $event['registered'],
                    'location' => $event['location'],
                    'virtual' => $event['virtual'],
                    'featured' => $event['featured'],
                    'category' => $event['category']
                )
            );
        }
    }
    
    // Enregistrement du widget
    public function register_widget() {
        require_once SIPORTS_PLUGIN_PATH . 'includes/class-siports-widget.php';
        register_widget('Siports_Widget');
    }
}

// Initialisation du plugin
new SiportsIntegration();

// Activation du plugin
register_activation_hook(__FILE__, 'siports_activate');
function siports_activate() {
    // Actions lors de l'activation
    $siports = new SiportsIntegration();
    $siports->sync_siports_data();
    flush_rewrite_rules();
}

// Désactivation du plugin
register_deactivation_hook(__FILE__, 'siports_deactivate');
function siports_deactivate() {
    // Actions lors de la désactivation
    flush_rewrite_rules();
}
?>