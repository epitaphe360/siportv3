<?php
/**
 * SIPORTS Shortcodes Class
 *
 * Gère tous les shortcodes pour intégrer les composants React SIPORTS dans WordPress
 */

if (!defined('ABSPATH')) {
    exit;
}

class SIPORTS_Shortcodes {

    /**
     * Constructor
     */
    public function __construct() {
        $this->init_shortcodes();
    }

    /**
     * Initialize all shortcodes
     */
    private function init_shortcodes() {
        add_shortcode('siports_app', array($this, 'render_app'));
        add_shortcode('siports_dashboard', array($this, 'render_dashboard'));
        add_shortcode('siports_events', array($this, 'render_events'));
        add_shortcode('siports_event', array($this, 'render_event_single'));
        add_shortcode('siports_exhibitors', array($this, 'render_exhibitors'));
        add_shortcode('siports_exhibitor', array($this, 'render_exhibitor_single'));
        add_shortcode('siports_appointments', array($this, 'render_appointments'));
        add_shortcode('siports_chat', array($this, 'render_chat'));
        add_shortcode('siports_login', array($this, 'render_login'));
        add_shortcode('siports_register', array($this, 'render_register'));
        add_shortcode('siports_profile', array($this, 'render_profile'));
        add_shortcode('siports_networking', array($this, 'render_networking'));
        add_shortcode('siports_products', array($this, 'render_products'));
        add_shortcode('siports_minisite', array($this, 'render_minisite'));
    }

    /**
     * Base render method
     */
    private function render_component($component_id, $atts = array()) {
        $default_atts = array(
            'class' => '',
            'style' => '',
            'theme' => 'default'
        );

        $atts = shortcode_atts($default_atts, $atts);

        // Get settings
        $settings = get_option('siports_settings', array());
        $app_url = isset($settings['app_url']) ? $settings['app_url'] : '';

        // Build data attributes for React
        $data_attrs = '';
        foreach ($atts as $key => $value) {
            if ($key !== 'class' && $key !== 'style') {
                $data_attrs .= ' data-' . esc_attr($key) . '="' . esc_attr($value) . '"';
            }
        }

        // Generate unique ID
        $unique_id = 'siports-' . $component_id . '-' . uniqid();

        // Output container
        $output = sprintf(
            '<div id="%s" class="siports-component siports-%s %s" style="%s"%s data-component="%s" data-app-url="%s"></div>',
            esc_attr($unique_id),
            esc_attr($component_id),
            esc_attr($atts['class']),
            esc_attr($atts['style']),
            $data_attrs,
            esc_attr($component_id),
            esc_attr($app_url)
        );

        return $output;
    }

    /**
     * Full App Shortcode
     * Usage: [siports_app]
     */
    public function render_app($atts) {
        return $this->render_component('app', $atts);
    }

    /**
     * Dashboard Shortcode
     * Usage: [siports_dashboard]
     */
    public function render_dashboard($atts) {
        return $this->render_component('dashboard', $atts);
    }

    /**
     * Events List Shortcode
     * Usage: [siports_events category="conference" featured="true" limit="12"]
     */
    public function render_events($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'featured' => '',
            'limit' => '12',
            'view' => 'grid', // grid, list, calendar
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('events', $atts);
    }

    /**
     * Single Event Shortcode
     * Usage: [siports_event id="123"]
     */
    public function render_event_single($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('event-single', $atts);
    }

    /**
     * Exhibitors List Shortcode
     * Usage: [siports_exhibitors sector="tech" country="FR" limit="20"]
     */
    public function render_exhibitors($atts) {
        $atts = shortcode_atts(array(
            'sector' => '',
            'country' => '',
            'featured' => '',
            'limit' => '20',
            'view' => 'grid', // grid, list, map
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('exhibitors', $atts);
    }

    /**
     * Single Exhibitor/Mini-site Shortcode
     * Usage: [siports_exhibitor id="123"]
     */
    public function render_exhibitor_single($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('exhibitor-single', $atts);
    }

    /**
     * Appointments Calendar Shortcode
     * Usage: [siports_appointments exhibitor="123"]
     */
    public function render_appointments($atts) {
        $atts = shortcode_atts(array(
            'exhibitor' => '',
            'view' => 'calendar', // calendar, list
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('appointments', $atts);
    }

    /**
     * Chat/Messaging Shortcode
     * Usage: [siports_chat conversation="123"]
     */
    public function render_chat($atts) {
        $atts = shortcode_atts(array(
            'conversation' => '',
            'compact' => 'false',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('chat', $atts);
    }

    /**
     * Login Form Shortcode
     * Usage: [siports_login redirect="/dashboard"]
     */
    public function render_login($atts) {
        $atts = shortcode_atts(array(
            'redirect' => '',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('login', $atts);
    }

    /**
     * Registration Form Shortcode
     * Usage: [siports_register type="visitor" redirect="/dashboard"]
     */
    public function render_register($atts) {
        $atts = shortcode_atts(array(
            'type' => '', // visitor, exhibitor, partner
            'redirect' => '',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('register', $atts);
    }

    /**
     * User Profile Shortcode
     * Usage: [siports_profile user="123" edit="true"]
     */
    public function render_profile($atts) {
        $atts = shortcode_atts(array(
            'user' => '',
            'edit' => 'false',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('profile', $atts);
    }

    /**
     * Networking Page Shortcode
     * Usage: [siports_networking]
     */
    public function render_networking($atts) {
        return $this->render_component('networking', $atts);
    }

    /**
     * Products Catalog Shortcode
     * Usage: [siports_products exhibitor="123" category="tech"]
     */
    public function render_products($atts) {
        $atts = shortcode_atts(array(
            'exhibitor' => '',
            'category' => '',
            'featured' => '',
            'limit' => '12',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('products', $atts);
    }

    /**
     * Mini-site Builder Shortcode
     * Usage: [siports_minisite exhibitor="123"]
     */
    public function render_minisite($atts) {
        $atts = shortcode_atts(array(
            'exhibitor' => '',
            'preview' => 'false',
            'class' => '',
            'style' => ''
        ), $atts);

        return $this->render_component('minisite', $atts);
    }
}

return new SIPORTS_Shortcodes();
