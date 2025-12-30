<?php
/**
 * Plugin Name: SIPORTS Articles Shortcode for Elementor
 * Plugin URI: https://siportevent.com
 * Description: Affiche les articles SIPORTS via des shortcodes compatibles Elementor Pro
 * Version: 1.0.0
 * Author: SIPORTS Team
 * Author URI: https://siportevent.com
 * Text Domain: siports-articles
 * Domain Path: /languages
 */

// Sécurité: Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Configuration de l'API
define('SIPORTS_API_URL', 'https://siportv3.up.railway.app/api/articles');
define('SIPORTS_CACHE_TIME', 3600); // 1 heure en secondes

/**
 * Classe principale du plugin
 */
class SIPORTS_Articles_Shortcode {
    
    /**
     * Instance unique (Singleton)
     */
    private static $instance = null;
    
    /**
     * Obtenir l'instance du plugin
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructeur
     */
    private function __construct() {
        // Enregistrer le shortcode
        add_shortcode('siports_article', array($this, 'render_article_shortcode'));
        add_shortcode('article', array($this, 'render_article_shortcode'));
        
        // Enregistrer les styles CSS
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        
        // Ajouter le support Elementor
        add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widget'));
        
        // Ajouter une page d'options dans l'admin
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    /**
     * Enregistrer les styles CSS
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            'siports-articles',
            plugin_dir_url(__FILE__) . 'css/siports-articles.css',
            array(),
            '1.0.0'
        );
    }
    
    /**
     * Récupérer un article depuis l'API avec cache
     */
    private function fetch_article($article_id) {
        // Clé de cache unique
        $cache_key = 'siports_article_' . $article_id;
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Appel API
        $api_url = SIPORTS_API_URL . '/' . $article_id;
        $response = wp_remote_get($api_url, array(
            'timeout' => 10,
            'headers' => array(
                'Accept' => 'application/json',
            ),
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['success']) || !$data['success']) {
            return array(
                'success' => false,
                'error' => 'Article non trouvé',
            );
        }
        
        // Mettre en cache
        set_transient($cache_key, $data, SIPORTS_CACHE_TIME);
        
        return $data;
    }
    
    /**
     * Rendu du shortcode
     * Usage: [article id="uuid"] ou [siports_article id="uuid"]
     */
    public function render_article_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'id' => '',
            'layout' => 'full', // full, compact, minimal
            'show_image' => 'yes',
            'show_excerpt' => 'yes',
            'show_content' => 'yes',
            'show_tags' => 'yes',
            'show_meta' => 'yes',
        ), $atts);
        
        // Validation
        if (empty($atts['id'])) {
            return '<div class="siports-article-error">⚠️ ID d\'article requis</div>';
        }
        
        // Récupérer l'article
        $result = $this->fetch_article($atts['id']);
        
        if (!$result['success']) {
            return '<div class="siports-article-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $article = $result['data'];
        
        // Générer le HTML
        return $this->render_article_html($article, $atts);
    }
    
    /**
     * Générer le HTML de l'article
     */
    private function render_article_html($article, $atts) {
        ob_start();
        ?>
        
        <article class="siports-article siports-article-<?php echo esc_attr($atts['layout']); ?>">
            <?php if ($atts['show_image'] === 'yes' && !empty($article['image_url'])): ?>
                <div class="siports-article-image">
                    <img src="<?php echo esc_url($article['image_url']); ?>" 
                         alt="<?php echo esc_attr($article['title']); ?>"
                         loading="lazy">
                </div>
            <?php endif; ?>
            
            <div class="siports-article-content">
                <!-- Catégorie et statut -->
                <div class="siports-article-badges">
                    <?php if (!empty($article['category'])): ?>
                        <span class="siports-badge siports-badge-category">
                            📁 <?php echo esc_html($article['category']); ?>
                        </span>
                    <?php endif; ?>
                    <span class="siports-badge siports-badge-published">
                        ✅ Publié
                    </span>
                </div>
                
                <!-- Titre -->
                <h2 class="siports-article-title">
                    <?php echo esc_html($article['title']); ?>
                </h2>
                
                <!-- Extrait -->
                <?php if ($atts['show_excerpt'] === 'yes' && !empty($article['excerpt'])): ?>
                    <div class="siports-article-excerpt">
                        <?php echo wp_kses_post($article['excerpt']); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Contenu complet -->
                <?php if ($atts['show_content'] === 'yes' && !empty($article['content'])): ?>
                    <div class="siports-article-body">
                        <?php echo wp_kses_post($article['content']); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Tags -->
                <?php if ($atts['show_tags'] === 'yes' && !empty($article['tags'])): ?>
                    <div class="siports-article-tags">
                        <span class="siports-tags-icon">🏷️</span>
                        <?php foreach ($article['tags'] as $tag): ?>
                            <span class="siports-tag"><?php echo esc_html($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Meta info -->
                <?php if ($atts['show_meta'] === 'yes'): ?>
                    <div class="siports-article-meta">
                        <span class="siports-meta-author">
                            👤 <?php echo esc_html($article['author']); ?>
                        </span>
                        <span class="siports-meta-date">
                            📅 <?php 
                                $date = $article['published_at'] ?? $article['created_at'];
                                echo date_i18n(get_option('date_format'), strtotime($date)); 
                            ?>
                        </span>
                    </div>
                <?php endif; ?>
            </div>
        </article>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Enregistrer le widget Elementor
     */
    public function register_elementor_widget() {
        if (defined('ELEMENTOR_VERSION')) {
            require_once plugin_dir_path(__FILE__) . 'widgets/elementor-siports-article.php';
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type(
                new \Elementor_SIPORTS_Article_Widget()
            );
        }
    }
    
    /**
     * Ajouter le menu admin
     */
    public function add_admin_menu() {
        add_options_page(
            'SIPORTS Articles',
            'SIPORTS Articles',
            'manage_options',
            'siports-articles',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Rendu de la page admin
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>SIPORTS Articles - Configuration</h1>
            
            <div class="card">
                <h2>🎯 Comment utiliser</h2>
                <p><strong>Shortcode simple :</strong></p>
                <code>[article id="00000000-0000-0000-0000-000000000401"]</code>
                
                <p><strong>Avec options :</strong></p>
                <code>[article id="uuid" layout="compact" show_image="yes" show_tags="no"]</code>
                
                <h3>Options disponibles :</h3>
                <ul>
                    <li><strong>id</strong> : UUID de l'article (requis)</li>
                    <li><strong>layout</strong> : full, compact, minimal (défaut: full)</li>
                    <li><strong>show_image</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_excerpt</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_content</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_tags</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_meta</strong> : yes/no (défaut: yes)</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>🔗 API Configuration</h2>
                <p><strong>URL de l'API :</strong> <?php echo esc_html(SIPORTS_API_URL); ?></p>
                <p><strong>Cache :</strong> <?php echo (SIPORTS_CACHE_TIME / 60); ?> minutes</p>
                
                <form method="post" action="">
                    <?php wp_nonce_field('siports_clear_cache'); ?>
                    <button type="submit" name="clear_cache" class="button button-secondary">
                        🗑️ Vider le cache
                    </button>
                </form>
                
                <?php
                if (isset($_POST['clear_cache']) && check_admin_referer('siports_clear_cache')) {
                    global $wpdb;
                    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_siports_article_%'");
                    echo '<div class="notice notice-success"><p>✅ Cache vidé avec succès !</p></div>';
                }
                ?>
            </div>
            
            <div class="card">
                <h2>📊 Elementor Pro</h2>
                <?php if (defined('ELEMENTOR_VERSION')): ?>
                    <p class="notice notice-success">✅ Elementor détecté (v<?php echo ELEMENTOR_VERSION; ?>)</p>
                    <p>Vous pouvez utiliser le widget <strong>"SIPORTS Article"</strong> dans Elementor.</p>
                <?php else: ?>
                    <p class="notice notice-warning">⚠️ Elementor non détecté. Le widget Elementor ne sera pas disponible.</p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}

// Initialiser le plugin
SIPORTS_Articles_Shortcode::get_instance();
