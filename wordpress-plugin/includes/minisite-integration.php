<?php
/**
 * Mise à jour du plugin principal pour intégrer les mini-sites
 */

// Inclure l'extension des mini-sites
require_once SIPORTS_PLUGIN_PATH . 'includes/minisites-extension.php';

// Inclure le script d'installation pour créer les pages WordPress
require_once SIPORTS_PLUGIN_PATH . 'includes/installer.php';

// Ajouter des assets CSS pour les mini-sites
add_action('wp_enqueue_scripts', 'siports_add_minisite_styles');
function siports_add_minisite_styles() {
    wp_enqueue_style(
        'siports-minisites-styles',
        SIPORTS_PLUGIN_URL . 'assets/minisites.css',
        array('siports-styles'),
        SIPORTS_VERSION
    );
}

// Ajouter le formulaire de contact pour les mini-sites
add_action('wp_ajax_siports_minisite_contact', 'siports_handle_minisite_contact');
add_action('wp_ajax_nopriv_siports_minisite_contact', 'siports_handle_minisite_contact');
function siports_handle_minisite_contact() {
    check_ajax_referer('siports_minisite_nonce', 'nonce');
    
    $name = sanitize_text_field($_POST['name']);
    $email = sanitize_email($_POST['email']);
    $subject = sanitize_text_field($_POST['subject']);
    $message = sanitize_textarea_field($_POST['message']);
    $exhibitor_id = sanitize_text_field($_POST['exhibitor_id']);
    
    // Envoyer l'email (à personnaliser selon vos besoins)
    $to = get_option('admin_email');
    $headers = array('Content-Type: text/html; charset=UTF-8');
    $email_subject = "Contact Mini-Site SIPORTS - $subject";
    
    $email_body = "
    <h2>Nouveau message depuis un mini-site SIPORTS</h2>
    <p><strong>Exposant concerné :</strong> $exhibitor_id</p>
    <p><strong>De :</strong> $name ($email)</p>
    <p><strong>Sujet :</strong> $subject</p>
    <p><strong>Message :</strong><br>$message</p>
    ";
    
    $sent = wp_mail($to, $email_subject, $email_body, $headers);
    
    if ($sent) {
        wp_send_json_success(array('message' => 'Votre message a été envoyé avec succès.'));
    } else {
        wp_send_json_error(array('message' => 'Une erreur est survenue lors de l\'envoi du message.'));
    }
}

// Création d'un widget pour afficher les mini-sites récents
class Siports_Minisites_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'siports_minisites_widget',
            'SIPORTS - Mini-Sites Récents',
            array('description' => 'Affiche les mini-sites récemment mis à jour')
        );
    }
    
    public function widget($args, $instance) {
        $title = !empty($instance['title']) ? apply_filters('widget_title', $instance['title']) : 'Mini-Sites Récents';
        $number = !empty($instance['number']) ? intval($instance['number']) : 5;
        
        echo $args['before_widget'];
        echo $args['before_title'] . $title . $args['after_title'];
        
        // Créer une instance de la classe SiportsMinisites
        $minisites = new SiportsMinisites();
        
        // Récupérer les mini-sites récents
        $recent_minisites = $minisites->get_minisites_data(array(
            'limit' => $number,
            'orderby' => 'updated_at'
        ));
        
        if (!empty($recent_minisites)) {
            echo '<ul class="siports-widget-minisites">';
            
            foreach ($recent_minisites as $minisite) {
                echo '<li class="widget-minisite-item">';
                
                if (!empty($minisite['logo'])) {
                    echo '<img src="' . esc_url($minisite['logo']) . '" alt="' . esc_attr($minisite['name']) . '" class="minisite-logo">';
                }
                
                echo '<div class="minisite-info">';
                echo '<h4>' . esc_html($minisite['name']) . '</h4>';
                echo '<p>' . esc_html($minisite['sector']) . '</p>';
                echo '</div>';
                
                echo '<a href="' . esc_url($minisite['url']) . '" class="minisite-link">Voir</a>';
                echo '</li>';
            }
            
            echo '</ul>';
        } else {
            echo '<p>Aucun mini-site disponible pour le moment.</p>';
        }
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Mini-Sites Récents';
        $number = !empty($instance['number']) ? intval($instance['number']) : 5;
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Titre :</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('number'); ?>">Nombre à afficher :</label>
            <input class="tiny-text" id="<?php echo $this->get_field_id('number'); ?>" name="<?php echo $this->get_field_name('number'); ?>" type="number" step="1" min="1" value="<?php echo esc_attr($number); ?>" size="3">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = !empty($new_instance['title']) ? sanitize_text_field($new_instance['title']) : '';
        $instance['number'] = !empty($new_instance['number']) ? intval($new_instance['number']) : 5;
        
        return $instance;
    }
}

// Enregistrer le widget des mini-sites
add_action('widgets_init', 'siports_register_minisite_widget');
function siports_register_minisite_widget() {
    register_widget('Siports_Minisites_Widget');
}
