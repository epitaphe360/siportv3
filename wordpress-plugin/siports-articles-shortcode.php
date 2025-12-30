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
define('SIPORTS_MEDIA_API_URL', 'https://siportv3.up.railway.app/api/media');
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
        // Enregistrer les shortcodes
        add_shortcode('siports_article', array($this, 'render_article_shortcode'));
        add_shortcode('article', array($this, 'render_article_shortcode'));
        add_shortcode('siports_media', array($this, 'render_media_shortcode'));
        add_shortcode('media', array($this, 'render_media_shortcode'));
        add_shortcode('siports_media_list', array($this, 'render_media_list_shortcode'));
        add_shortcode('media_list', array($this, 'render_media_list_shortcode'));
        
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
     * Récupérer un média depuis l'API avec cache
     */
    private function fetch_media($media_id) {
        // Clé de cache unique
        $cache_key = 'siports_media_' . $media_id;
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Appel API
        $api_url = SIPORTS_MEDIA_API_URL . '/' . $media_id;
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
                'error' => 'Média non trouvé',
            );
        }
        
        // Mettre en cache
        set_transient($cache_key, $data, SIPORTS_CACHE_TIME);
        
        return $data;
    }
    
    /**
     * Rendu du shortcode média
     * Usage: [media id="uuid"] ou [siports_media id="uuid"]
     */
    public function render_media_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'id' => '',
            'layout' => 'full', // full, compact, minimal
            'show_thumbnail' => 'yes',
            'show_description' => 'yes',
            'show_tags' => 'yes',
            'show_stats' => 'yes',
            'autoplay' => 'no',
        ), $atts);
        
        // Validation
        if (empty($atts['id'])) {
            return '<div class="siports-media-error">⚠️ ID de média requis</div>';
        }
        
        // Récupérer le média
        $result = $this->fetch_media($atts['id']);
        
        if (!$result['success']) {
            return '<div class="siports-media-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $media = $result['data'];
        
        // Générer le HTML
        return $this->render_media_html($media, $atts);
    }
    
    /**
     * Générer le HTML du média
     */
    private function render_media_html($media, $atts) {
        ob_start();
        
        // Déterminer les icônes selon le type
        $type_icons = array(
            'webinar' => '🎥',
            'podcast' => '🎙️',
            'capsule_inside' => '📹',
            'live_studio' => '🔴',
            'best_moments' => '⭐',
            'testimonial' => '💬',
        );
        
        $type_labels = array(
            'webinar' => 'Webinaire',
            'podcast' => 'Podcast',
            'capsule_inside' => 'Capsule Inside',
            'live_studio' => 'Live Studio',
            'best_moments' => 'Best Moments',
            'testimonial' => 'Témoignage',
        );
        
        $icon = $type_icons[$media['type']] ?? '📺';
        $type_label = $type_labels[$media['type']] ?? 'Média';
        ?>
        
        <article class="siports-media siports-media-<?php echo esc_attr($atts['layout']); ?> siports-media-type-<?php echo esc_attr($media['type']); ?>">
            <?php if ($atts['show_thumbnail'] === 'yes'): ?>
                <div class="siports-media-thumbnail">
                    <?php if (!empty($media['thumbnail_url'])): ?>
                        <img src="<?php echo esc_url($media['thumbnail_url']); ?>" 
                             alt="<?php echo esc_attr($media['title']); ?>"
                             loading="lazy">
                    <?php endif; ?>
                    
                    <!-- Badge type de média -->
                    <div class="siports-media-type-badge">
                        <?php echo $icon; ?> <?php echo esc_html($type_label); ?>
                    </div>
                    
                    <?php if ($media['duration']): ?>
                        <div class="siports-media-duration">
                            ⏱️ <?php echo esc_html($this->format_duration($media['duration'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
            
            <div class="siports-media-content">
                <!-- Catégorie et statut -->
                <div class="siports-media-badges">
                    <?php if (!empty($media['category'])): ?>
                        <span class="siports-badge siports-badge-category">
                            📁 <?php echo esc_html($media['category']); ?>
                        </span>
                    <?php endif; ?>
                    <span class="siports-badge siports-badge-published">
                        ✅ Publié
                    </span>
                </div>
                
                <!-- Titre -->
                <h2 class="siports-media-title">
                    <?php echo esc_html($media['title']); ?>
                </h2>
                
                <!-- Description -->
                <?php if ($atts['show_description'] === 'yes' && !empty($media['description'])): ?>
                    <div class="siports-media-description">
                        <?php echo wp_kses_post(nl2br($media['description'])); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Player Vidéo/Audio -->
                <?php if (!empty($media['video_url'])): ?>
                    <div class="siports-media-player">
                        <video controls <?php echo ($atts['autoplay'] === 'yes') ? 'autoplay' : ''; ?>>
                            <source src="<?php echo esc_url($media['video_url']); ?>" type="video/mp4">
                            Votre navigateur ne supporte pas la vidéo.
                        </video>
                    </div>
                <?php elseif (!empty($media['audio_url'])): ?>
                    <div class="siports-media-player">
                        <audio controls <?php echo ($atts['autoplay'] === 'yes') ? 'autoplay' : ''; ?>>
                            <source src="<?php echo esc_url($media['audio_url']); ?>" type="audio/mpeg">
                            Votre navigateur ne supporte pas l'audio.
                        </audio>
                    </div>
                <?php endif; ?>
                
                <!-- Tags -->
                <?php if ($atts['show_tags'] === 'yes' && !empty($media['tags'])): ?>
                    <div class="siports-media-tags">
                        <span class="siports-tags-icon">🏷️</span>
                        <?php foreach ($media['tags'] as $tag): ?>
                            <span class="siports-tag"><?php echo esc_html($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Statistiques -->
                <?php if ($atts['show_stats'] === 'yes'): ?>
                    <div class="siports-media-stats">
                        <span class="siports-stat">
                            👁️ <?php echo number_format($media['views_count']); ?> vues
                        </span>
                        <span class="siports-stat">
                            ❤️ <?php echo number_format($media['likes_count']); ?> likes
                        </span>
                        <span class="siports-stat">
                            📤 <?php echo number_format($media['shares_count']); ?> partages
                        </span>
                    </div>
                <?php endif; ?>
                
                <!-- Date -->
                <div class="siports-media-meta">
                    <span class="siports-meta-date">
                        📅 <?php echo date_i18n(get_option('date_format'), strtotime($media['created_at'])); ?>
                    </span>
                </div>
            </div>
        </article>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Formater la durée en minutes:secondes
     */
    private function format_duration($seconds) {
        if (!$seconds) return '0:00';
        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;
        return sprintf('%d:%02d', $minutes, $secs);
    }
    
    /**
     * Récupérer une liste de médias depuis l'API avec cache
     */
    private function fetch_media_list($type = '', $category = '', $limit = 10) {
        // Clé de cache unique
        $cache_key = 'siports_media_list_' . md5($type . '_' . $category . '_' . $limit);
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Construire l'URL avec paramètres
        $api_url = SIPORTS_MEDIA_API_URL;
        $params = array('limit' => $limit);
        
        if (!empty($type)) {
            $params['type'] = $type;
        }
        
        if (!empty($category)) {
            $params['category'] = $category;
        }
        
        $api_url .= '?' . http_build_query($params);
        
        // Appel API
        $response = wp_remote_get($api_url, array(
            'timeout' => 15,
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
                'error' => 'Aucun média trouvé',
            );
        }
        
        // Mettre en cache
        set_transient($cache_key, $data, SIPORTS_CACHE_TIME);
        
        return $data;
    }
    
    /**
     * Rendu du shortcode liste de médias
     * Usage: [media_list type="webinar" limit="6" layout="grid"]
     */
    public function render_media_list_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'type' => '', // webinar, podcast, capsule_inside, live_studio, best_moments, testimonial
            'category' => '',
            'limit' => '10',
            'layout' => 'grid', // grid, list
            'columns' => '3', // 2, 3, 4
            'show_thumbnail' => 'yes',
            'show_description' => 'yes',
            'show_stats' => 'no',
        ), $atts);
        
        // Récupérer la liste des médias
        $result = $this->fetch_media_list($atts['type'], $atts['category'], intval($atts['limit']));
        
        if (!$result['success']) {
            return '<div class="siports-media-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $media_list = $result['data'];
        
        if (empty($media_list)) {
            return '<div class="siports-media-list-empty">📭 Aucun média disponible pour le moment</div>';
        }
        
        // Générer le HTML
        return $this->render_media_list_html($media_list, $atts);
    }
    
    /**
     * Générer le HTML de la liste de médias
     */
    private function render_media_list_html($media_list, $atts) {
        ob_start();
        
        $type_icons = array(
            'webinar' => '🎥',
            'podcast' => '🎙️',
            'capsule_inside' => '📹',
            'live_studio' => '🔴',
            'best_moments' => '⭐',
            'testimonial' => '💬',
        );
        
        $type_labels = array(
            'webinar' => 'Webinaire',
            'podcast' => 'Podcast',
            'capsule_inside' => 'Capsule Inside',
            'live_studio' => 'Live Studio',
            'best_moments' => 'Best Moments',
            'testimonial' => 'Témoignage',
        );
        
        $columns_class = 'siports-media-list-cols-' . $atts['columns'];
        $layout_class = 'siports-media-list-' . $atts['layout'];
        
        ?>
        
        <div class="siports-media-list <?php echo esc_attr($layout_class); ?> <?php echo esc_attr($columns_class); ?>">
            <?php foreach ($media_list as $media): 
                $icon = $type_icons[$media['type']] ?? '📺';
                $type_label = $type_labels[$media['type']] ?? 'Média';
            ?>
                
                <article class="siports-media-list-item siports-media-type-<?php echo esc_attr($media['type']); ?>">
                    <?php if ($atts['show_thumbnail'] === 'yes'): ?>
                        <div class="siports-media-list-thumbnail">
                            <?php if (!empty($media['thumbnail_url'])): ?>
                                <img src="<?php echo esc_url($media['thumbnail_url']); ?>" 
                                     alt="<?php echo esc_attr($media['title']); ?>"
                                     loading="lazy">
                            <?php else: ?>
                                <div class="siports-media-list-no-thumb">
                                    <span class="siports-media-list-icon"><?php echo $icon; ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Badge type -->
                            <div class="siports-media-type-badge-small">
                                <?php echo $icon; ?> <?php echo esc_html($type_label); ?>
                            </div>
                            
                            <?php if ($media['duration']): ?>
                                <div class="siports-media-duration-small">
                                    ⏱️ <?php echo esc_html($this->format_duration($media['duration'])); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <div class="siports-media-list-content">
                        <h3 class="siports-media-list-title">
                            <?php echo esc_html($media['title']); ?>
                        </h3>
                        
                        <?php if ($atts['show_description'] === 'yes' && !empty($media['description'])): ?>
                            <p class="siports-media-list-description">
                                <?php echo esc_html(wp_trim_words($media['description'], 20)); ?>
                            </p>
                        <?php endif; ?>
                        
                        <?php if ($atts['show_stats'] === 'yes'): ?>
                            <div class="siports-media-list-stats">
                                <span>👁️ <?php echo number_format($media['views_count']); ?></span>
                                <span>❤️ <?php echo number_format($media['likes_count']); ?></span>
                            </div>
                        <?php endif; ?>
                        
                        <div class="siports-media-list-footer">
                            <span class="siports-media-list-date">
                                📅 <?php echo date_i18n(get_option('date_format'), strtotime($media['created_at'])); ?>
                            </span>
                        </div>
                    </div>
                </article>
                
            <?php endforeach; ?>
        </div>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Enregistrer le widget Elementor
     */
    public function register_elementor_widget() {
        if (defined('ELEMENTOR_VERSION')) {
            // Widget Article
            require_once plugin_dir_path(__FILE__) . 'widgets/elementor-siports-article.php';
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type(
                new \Elementor_SIPORTS_Article_Widget()
            );
            
            // Widget Media
            require_once plugin_dir_path(__FILE__) . 'widgets/elementor-siports-media.php';
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type(
                new \Elementor_SIPORTS_Media_Widget()
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
