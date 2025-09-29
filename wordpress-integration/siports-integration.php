<?php
/**
 * Plugin Name: SIPORTS 2026 Integration
 * Description: Intégration de l'application SIPORTS 2026 dans WordPress via shortcodes
 * Version: 1.0.0
 * Author: SIPORTS Team
 */

// Sécurité : Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

class SiportsIntegration {
    
    private $app_base_url;
    
    public function __construct() {
        // URL de base de l'application (à modifier selon votre déploiement)
        $this->app_base_url = get_option('siports_app_url', 'https://votre-app-siports.replit.app');
        
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function init() {
        // Enregistrer tous les shortcodes
        add_shortcode('siports-login', array($this, 'shortcode_login'));
        add_shortcode('siports-exhibitors', array($this, 'shortcode_exhibitors'));
        add_shortcode('siports-chat', array($this, 'shortcode_chat'));
        add_shortcode('siports-networking', array($this, 'shortcode_networking'));
        add_shortcode('siports-events', array($this, 'shortcode_events'));
        add_shortcode('siports-calendar', array($this, 'shortcode_calendar'));
        add_shortcode('siports-dashboard', array($this, 'shortcode_dashboard'));
        add_shortcode('siports-qr-scanner', array($this, 'shortcode_qr_scanner'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('siports-integration', plugin_dir_url(__FILE__) . 'assets/siports-integration.css');
        wp_enqueue_script('siports-integration', plugin_dir_url(__FILE__) . 'assets/siports-integration.js', array('jquery'), '1.0.0', true);
        
        // Variables JavaScript pour l'intégration
        wp_localize_script('siports-integration', 'siports_vars', array(
            'app_url' => $this->app_base_url,
            'wp_user_id' => get_current_user_id(),
            'wp_user_email' => wp_get_current_user()->user_email,
            'nonce' => wp_create_nonce('siports_nonce')
        ));
    }
    
    /**
     * Shortcode pour le formulaire de connexion/inscription
     */
    public function shortcode_login($atts) {
        $atts = shortcode_atts(array(
            'height' => '600px',
            'width' => '100%',
            'redirect' => ''
        ), $atts);
        
        $iframe_url = $this->app_base_url . '/auth/login';
        if (!empty($atts['redirect'])) {
            $iframe_url .= '?redirect=' . urlencode($atts['redirect']);
        }
        
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-login');
    }
    
    /**
     * Shortcode pour la liste des exposants
     */
    public function shortcode_exhibitors($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
            'width' => '100%',
            'category' => '',
            'featured' => ''
        ), $atts);
        
        $iframe_url = $this->app_base_url . '/exhibitors';
        $params = array();
        
        if (!empty($atts['category'])) {
            $params['category'] = $atts['category'];
        }
        if (!empty($atts['featured'])) {
            $params['featured'] = $atts['featured'];
        }
        
        if (!empty($params)) {
            $iframe_url .= '?' . http_build_query($params);
        }
        
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-exhibitors');
    }
    
    /**
     * Shortcode pour l'interface de chat
     */
    public function shortcode_chat($atts) {
        $atts = shortcode_atts(array(
            'height' => '600px',
            'width' => '100%'
        ), $atts);
        
        // Vérifier si l'utilisateur est connecté
        if (!is_user_logged_in()) {
            return '<div class="siports-auth-required">
                <p>Vous devez être connecté pour accéder au chat.</p>
                <a href="' . wp_login_url() . '" class="button">Se connecter</a>
            </div>';
        }
        
        $iframe_url = $this->app_base_url . '/chat';
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-chat');
    }
    
    /**
     * Shortcode pour le réseautage
     */
    public function shortcode_networking($atts) {
        $atts = shortcode_atts(array(
            'height' => '900px',
            'width' => '100%'
        ), $atts);
        
        if (!is_user_logged_in()) {
            return '<div class="siports-auth-required">
                <p>Vous devez être connecté pour accéder au réseautage.</p>
                <a href="' . wp_login_url() . '" class="button">Se connecter</a>
            </div>';
        }
        
        $iframe_url = $this->app_base_url . '/networking';
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-networking');
    }
    
    /**
     * Shortcode pour les événements
     */
    public function shortcode_events($atts) {
        $atts = shortcode_atts(array(
            'height' => '700px',
            'width' => '100%',
            'type' => ''
        ), $atts);
        
        $iframe_url = $this->app_base_url . '/events';
        if (!empty($atts['type'])) {
            $iframe_url .= '?type=' . urlencode($atts['type']);
        }
        
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-events');
    }
    
    /**
     * Shortcode pour le calendrier
     */
    public function shortcode_calendar($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
            'width' => '100%'
        ), $atts);
        
        if (!is_user_logged_in()) {
            return '<div class="siports-auth-required">
                <p>Vous devez être connecté pour accéder au calendrier.</p>
                <a href="' . wp_login_url() . '" class="button">Se connecter</a>
            </div>';
        }
        
        $iframe_url = $this->app_base_url . '/calendar';
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-calendar');
    }
    
    /**
     * Shortcode pour le tableau de bord utilisateur
     */
    public function shortcode_dashboard($atts) {
        $atts = shortcode_atts(array(
            'height' => '900px',
            'width' => '100%'
        ), $atts);
        
        if (!is_user_logged_in()) {
            return '<div class="siports-auth-required">
                <p>Vous devez être connecté pour accéder au tableau de bord.</p>
                <a href="' . wp_login_url() . '" class="button">Se connecter</a>
            </div>';
        }
        
        $iframe_url = $this->app_base_url . '/dashboard';
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-dashboard');
    }
    
    /**
     * Shortcode pour le scanner QR
     */
    public function shortcode_qr_scanner($atts) {
        $atts = shortcode_atts(array(
            'height' => '500px',
            'width' => '100%'
        ), $atts);
        
        $iframe_url = $this->app_base_url . '/qr-scanner';
        return $this->generate_iframe($iframe_url, $atts['height'], $atts['width'], 'siports-qr-scanner');
    }
    
    /**
     * Générer une iframe sécurisée
     */
    private function generate_iframe($url, $height, $width, $class) {
        // Passer les informations utilisateur WordPress si connecté
        if (is_user_logged_in()) {
            $user = wp_get_current_user();
            $params = array(
                'wp_user_id' => $user->ID,
                'wp_user_email' => $user->user_email,
                'wp_user_name' => $user->display_name,
                'wp_token' => wp_create_nonce('siports_' . $user->ID)
            );
            
            $url .= (strpos($url, '?') !== false ? '&' : '?') . http_build_query($params);
        }
        
        return sprintf(
            '<div class="siports-iframe-container %s">
                <iframe 
                    src="%s" 
                    width="%s" 
                    height="%s" 
                    frameborder="0"
                    scrolling="auto"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                    loading="lazy">
                </iframe>
                <div class="siports-loading">
                    <div class="siports-spinner"></div>
                    <p>Chargement de l\'application SIPORTS...</p>
                </div>
            </div>',
            esc_attr($class),
            esc_url($url),
            esc_attr($width),
            esc_attr($height)
        );
    }
    
    /**
     * Menu d'administration
     */
    public function admin_menu() {
        add_options_page(
            'SIPORTS Integration Settings',
            'SIPORTS Integration',
            'manage_options',
            'siports-integration',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Page d'administration
     */
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('siports_app_url', sanitize_url($_POST['app_url']));
            update_option('siports_api_key', sanitize_text_field($_POST['api_key']));
            echo '<div class="notice notice-success"><p>Paramètres sauvegardés!</p></div>';
        }
        
        $app_url = get_option('siports_app_url', '');
        $api_key = get_option('siports_api_key', '');
        ?>
        <div class="wrap">
            <h1>SIPORTS Integration Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">URL de l'application</th>
                        <td>
                            <input type="url" name="app_url" value="<?php echo esc_attr($app_url); ?>" class="regular-text" />
                            <p class="description">URL de base de l'application SIPORTS (ex: https://siports-2026.replit.app)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Clé API (optionnel)</th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Clé API pour l'authentification avancée</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Shortcodes disponibles</h2>
            <table class="widefat">
                <thead>
                    <tr>
                        <th>Shortcode</th>
                        <th>Description</th>
                        <th>Paramètres</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>[siports-login]</code></td>
                        <td>Formulaire de connexion/inscription</td>
                        <td>height, width, redirect</td>
                    </tr>
                    <tr>
                        <td><code>[siports-exhibitors]</code></td>
                        <td>Liste des exposants</td>
                        <td>height, width, category, featured</td>
                    </tr>
                    <tr>
                        <td><code>[siports-chat]</code></td>
                        <td>Interface de chat</td>
                        <td>height, width</td>
                    </tr>
                    <tr>
                        <td><code>[siports-networking]</code></td>
                        <td>Page de réseautage</td>
                        <td>height, width</td>
                    </tr>
                    <tr>
                        <td><code>[siports-events]</code></td>
                        <td>Événements et QR codes</td>
                        <td>height, width, type</td>
                    </tr>
                    <tr>
                        <td><code>[siports-calendar]</code></td>
                        <td>Calendrier des rendez-vous</td>
                        <td>height, width</td>
                    </tr>
                    <tr>
                        <td><code>[siports-dashboard]</code></td>
                        <td>Tableau de bord utilisateur</td>
                        <td>height, width</td>
                    </tr>
                    <tr>
                        <td><code>[siports-qr-scanner]</code></td>
                        <td>Scanner de QR codes</td>
                        <td>height, width</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <?php
    }
}

// Initialiser le plugin
new SiportsIntegration();

// Hook d'activation
register_activation_hook(__FILE__, function() {
    // Actions à effectuer lors de l'activation du plugin
    update_option('siports_integration_version', '1.0.0');
});

// Hook de désactivation
register_deactivation_hook(__FILE__, function() {
    // Nettoyage si nécessaire
});