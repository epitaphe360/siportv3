<?php
/**
 * Ajouts au fichier functions.php de votre thème WordPress
 * Copiez ce code dans Apparence > Éditeur de thème > functions.php
 * OU créez un plugin enfant
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Support amélioré pour SIPORTS Integration
 */
function siports_theme_support() {
    // Support des modèles de page personnalisés
    add_theme_support('custom-page-templates');
    
    // Support des widgets
    add_theme_support('widgets');
    
    // Support des menus
    add_theme_support('menus');
}
add_action('after_setup_theme', 'siports_theme_support');

/**
 * Enregistrer les templates de page SIPORTS
 */
function siports_register_page_templates($templates) {
    $templates['page-exposants.php'] = 'Page Exposants SIPORTS';
    $templates['page-reseautage.php'] = 'Page Réseautage SIPORTS';
    $templates['page-evenements.php'] = 'Page Événements SIPORTS';
    $templates['page-connexion.php'] = 'Page Connexion SIPORTS';
    $templates['page-chat.php'] = 'Page Chat SIPORTS';
    
    return $templates;
}
add_filter('theme_page_templates', 'siports_register_page_templates');

/**
 * Charger les templates depuis le plugin
 */
function siports_load_page_template($template) {
    global $post;
    
    if (!$post) {
        return $template;
    }
    
    $page_template = get_page_template_slug($post->ID);
    
    $siports_templates = array(
        'page-exposants.php',
        'page-reseautage.php', 
        'page-evenements.php',
        'page-connexion.php',
        'page-chat.php'
    );
    
    if (in_array($page_template, $siports_templates)) {
        $plugin_template = WP_PLUGIN_DIR . '/siports-integration/pages/' . $page_template;
        
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }
    }
    
    return $template;
}
add_filter('page_template', 'siports_load_page_template');

/**
 * Ajouter des classes CSS personnalisées pour SIPORTS
 */
function siports_body_classes($classes) {
    global $post;
    
    if (is_page() && $post) {
        $template = get_page_template_slug($post->ID);
        
        if (strpos($template, 'siports') !== false) {
            $classes[] = 'siports-page';
            $classes[] = 'siports-' . str_replace('.php', '', str_replace('page-', '', $template));
        }
    }
    
    return $classes;
}
add_filter('body_class', 'siports_body_classes');

/**
 * Scripts et styles personnalisés pour les pages SIPORTS
 */
function siports_custom_scripts() {
    global $post;
    
    if (is_page() && $post) {
        $template = get_page_template_slug($post->ID);
        
        if (strpos($template, 'siports') !== false) {
            // CSS personnalisé pour les pages SIPORTS
            wp_add_inline_style('wp-block-library', '
                .siports-page {
                    --siports-primary: #1e3a8a;
                    --siports-secondary: #3b82f6;
                    --siports-success: #10b981;
                    --siports-warning: #f59e0b;
                    --siports-danger: #ef4444;
                }
                
                .siports-page .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .siports-loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                }
            ');
            
            // JavaScript pour améliorer l'expérience utilisateur
            wp_add_inline_script('jquery', '
                jQuery(document).ready(function($) {
                    // Amélioration du chargement des iframes
                    $(".siports-iframe-container iframe").on("load", function() {
                        $(this).closest(".siports-iframe-container").addClass("loaded");
                        $(".siports-loading-overlay").fadeOut();
                    });
                    
                    // Gestion des erreurs de chargement
                    $(".siports-iframe-container iframe").on("error", function() {
                        $(this).closest(".siports-iframe-container")
                               .append("<div class=\"siports-error\">Erreur de chargement. Veuillez actualiser la page.</div>");
                    });
                    
                    // Responsive iframe height
                    function adjustIframeHeight() {
                        $(".siports-iframe-container iframe").each(function() {
                            if ($(window).width() < 768) {
                                $(this).css("height", "500px");
                            }
                        });
                    }
                    
                    adjustIframeHeight();
                    $(window).resize(adjustIframeHeight);
                });
            ');
        }
    }
}
add_action('wp_enqueue_scripts', 'siports_custom_scripts');

/**
 * Widget pour les shortcodes SIPORTS
 */
class SIPORTS_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'siports_widget',
            'SIPORTS Shortcode',
            array('description' => 'Affiche un shortcode SIPORTS dans votre sidebar')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        if (!empty($instance['shortcode'])) {
            echo do_shortcode($instance['shortcode']);
        }
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : '';
        $shortcode = !empty($instance['shortcode']) ? $instance['shortcode'] : '';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Titre:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" 
                   name="<?php echo $this->get_field_name('title'); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('shortcode'); ?>">Shortcode SIPORTS:</label>
            <textarea class="widefat" id="<?php echo $this->get_field_id('shortcode'); ?>" 
                      name="<?php echo $this->get_field_name('shortcode'); ?>" rows="3"><?php echo esc_attr($shortcode); ?></textarea>
            <small>Exemple: [siports-chat height="300px"]</small>
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['shortcode'] = (!empty($new_instance['shortcode'])) ? strip_tags($new_instance['shortcode']) : '';
        
        return $instance;
    }
}

// Enregistrer le widget
function siports_register_widgets() {
    register_widget('SIPORTS_Widget');
}
add_action('widgets_init', 'siports_register_widgets');

/**
 * Créer automatiquement les pages SIPORTS lors de l'activation du thème
 */
function siports_create_pages_on_activation() {
    $pages = array(
        'exposants' => array(
            'title' => 'Nos Exposants',
            'template' => 'page-exposants.php'
        ),
        'reseautage' => array(
            'title' => 'Réseautage Professionnel', 
            'template' => 'page-reseautage.php'
        ),
        'evenements' => array(
            'title' => 'Événements SIPORTS 2026',
            'template' => 'page-evenements.php'
        ),
        'chat' => array(
            'title' => 'Messagerie',
            'template' => 'page-chat.php'
        ),
        'mon-espace' => array(
            'title' => 'Mon Espace',
            'template' => 'page-connexion.php'
        )
    );
    
    foreach ($pages as $slug => $page_data) {
        // Vérifier si la page existe déjà
        $page_exists = get_page_by_path($slug);
        
        if (!$page_exists) {
            $page_id = wp_insert_post(array(
                'post_title' => $page_data['title'],
                'post_name' => $slug,
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_content' => '<!-- Page générée automatiquement par SIPORTS Integration -->'
            ));
            
            if ($page_id && !is_wp_error($page_id)) {
                update_post_meta($page_id, '_wp_page_template', $page_data['template']);
            }
        }
    }
}

// Décommenter cette ligne si vous voulez créer les pages automatiquement
// add_action('after_switch_theme', 'siports_create_pages_on_activation');

/**
 * Redirection automatique après connexion WordPress vers SIPORTS
 */
function siports_login_redirect($redirect_to, $request, $user) {
    // Rediriger vers l'espace membre SIPORTS après connexion
    if (isset($user->roles) && is_array($user->roles)) {
        return home_url('/mon-espace');
    }
    
    return $redirect_to;
}
add_filter('login_redirect', 'siports_login_redirect', 10, 3);

/**
 * Ajouter des liens dans l'admin bar
 */
function siports_admin_bar_links($wp_admin_bar) {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    $wp_admin_bar->add_node(array(
        'id' => 'siports-admin',
        'title' => 'SIPORTS Admin',
        'href' => admin_url('options-general.php?page=siports-integration')
    ));
    
    $wp_admin_bar->add_node(array(
        'parent' => 'siports-admin',
        'id' => 'siports-settings',
        'title' => 'Paramètres',
        'href' => admin_url('options-general.php?page=siports-integration')
    ));
    
    $wp_admin_bar->add_node(array(
        'parent' => 'siports-admin',
        'id' => 'siports-pages',
        'title' => 'Pages SIPORTS',
        'href' => admin_url('edit.php?post_type=page')
    ));
}
add_action('admin_bar_menu', 'siports_admin_bar_links', 100);

/**
 * Optimisation des performances pour les iframes SIPORTS
 */
function siports_optimize_loading() {
    // Précharger l'application SIPORTS
    $app_url = get_option('siports_app_url', '');
    
    if ($app_url) {
        echo '<link rel="preconnect" href="' . esc_url($app_url) . '">';
        echo '<link rel="dns-prefetch" href="' . esc_url($app_url) . '">';
    }
}
add_action('wp_head', 'siports_optimize_loading');

/**
 * Notice d'administration si l'URL SIPORTS n'est pas configurée
 */
function siports_admin_notice() {
    $app_url = get_option('siports_app_url', '');
    
    if (empty($app_url) && current_user_can('manage_options')) {
        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>SIPORTS Integration:</strong> ';
        echo 'Veuillez configurer l\'URL de l\'application dans ';
        echo '<a href="' . admin_url('options-general.php?page=siports-integration') . '">les paramètres</a>.';
        echo '</p>';
        echo '</div>';
    }
}
add_action('admin_notices', 'siports_admin_notice');