<?php
/**
 * Widget Elementor pour SIPORTS
 */
class Elementor_SIPORTS_Widget extends \Elementor\Widget_Base {

    /**
     * Obtenir le nom du widget
     */
    public function get_name() {
        return 'siports_networking';
    }

    /**
     * Obtenir le titre du widget
     */
    public function get_title() {
        return __('SIPORTS Networking', 'siports-elementor');
    }

    /**
     * Obtenir l'icône du widget
     */
    public function get_icon() {
        return 'eicon-apps';
    }

    /**
     * Obtenir les catégories du widget
     */
    public function get_categories() {
        return ['general'];
    }

    /**
     * Obtenir les mots-clés du widget
     */
    public function get_keywords() {
        return ['siports', 'networking', 'app', 'react'];
    }

    /**
     * Enregistrer les styles et scripts du widget
     */
    public function get_script_depends() {
        return ['siports-elementor-js'];
    }

    public function get_style_depends() {
        return ['siports-elementor-css'];
    }

    /**
     * Enregistrer les contrôles du widget
     */
    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Paramètres', 'siports-elementor'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'title',
            [
                'label' => __('Titre', 'siports-elementor'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __('SIPORTS Networking', 'siports-elementor'),
                'placeholder' => __('Entrez un titre', 'siports-elementor'),
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Rendu du widget
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Enqueue les scripts et styles (pour s'assurer qu'ils sont chargés)
        wp_enqueue_style('siports-elementor-css');
        wp_enqueue_script('siports-elementor-js');
        
        echo '<div class="siports-elementor-widget">';
        if (!empty($settings['title'])) {
            echo '<h2>' . esc_html($settings['title']) . '</h2>';
        }
        echo '<div id="siports-networking-app"></div>';
        echo '</div>';
    }

    /**
     * Rendu du contenu dans l'éditeur
     */
    protected function content_template() {
        ?>
        <div class="siports-elementor-widget">
            <# if ( settings.title ) { #>
                <h2>{{{ settings.title }}}</h2>
            <# } #>
            <div id="siports-networking-app">
                <div style="padding: 20px; background: #f0f0f0; text-align: center;">
                    SIPORTS Networking App (visible en front-end)
                </div>
            </div>
        </div>
        <?php
    }
}
