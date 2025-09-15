<?php
/**
 * Widget SIPORTS pour WordPress
 */

class Siports_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'siports_widget',
            'SIPORTS 2026',
            array(
                'description' => 'Affiche les informations du salon SIPORTS 2026'
            )
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $widget_type = !empty($instance['widget_type']) ? $instance['widget_type'] : 'countdown';
        
        switch ($widget_type) {
            case 'countdown':
                echo do_shortcode('[siports_countdown style="compact"]');
                break;
                
            case 'stats':
                echo do_shortcode('[siports_stats show="exhibitors,visitors" layout="vertical"]');
                break;
                
            case 'featured_exhibitors':
                echo do_shortcode('[siports_exhibitors featured="true" limit="3" layout="list"]');
                break;
                
            case 'upcoming_events':
                echo do_shortcode('[siports_events featured_only="true" limit="2"]');
                break;
        }
        
        // Lien vers le salon
        echo '<div style="text-align: center; margin-top: 15px;">';
        echo '<a href="https://siportevent.com" target="_blank" class="siports-btn siports-btn-primary" style="font-size: 12px; padding: 8px 12px;">Découvrir SIPORTS 2026</a>';
        echo '</div>';
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'SIPORTS 2026';
        $widget_type = !empty($instance['widget_type']) ? $instance['widget_type'] : 'countdown';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Titre :</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" 
                   name="<?php echo $this->get_field_name('title'); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        
        <p>
            <label for="<?php echo $this->get_field_id('widget_type'); ?>">Type d'affichage :</label>
            <select class="widefat" id="<?php echo $this->get_field_id('widget_type'); ?>" 
                    name="<?php echo $this->get_field_name('widget_type'); ?>">
                <option value="countdown" <?php selected($widget_type, 'countdown'); ?>>Compte à rebours</option>
                <option value="stats" <?php selected($widget_type, 'stats'); ?>>Statistiques</option>
                <option value="featured_exhibitors" <?php selected($widget_type, 'featured_exhibitors'); ?>>Exposants vedettes</option>
                <option value="upcoming_events" <?php selected($widget_type, 'upcoming_events'); ?>>Événements à venir</option>
            </select>
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '';
        $instance['widget_type'] = (!empty($new_instance['widget_type'])) ? sanitize_text_field($new_instance['widget_type']) : 'countdown';
        
        return $instance;
    }
}
?>