<?php
if (!defined('ABSPATH')) exit;

class SIPORTS_Admin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_menu'));
    }

    public function add_menu() {
        add_menu_page(
            'SIPORTS',
            'SIPORTS',
            'manage_options',
            'siports',
            array($this, 'admin_page'),
            'dashicons-networking',
            30
        );
    }

    public function admin_page() {
        echo '<div class="wrap">';
        echo '<h1>SIPORTS Integration</h1>';
        echo '<p>Configuration dans SIPORTS > Paramètres</p>';
        echo '</div>';
    }
}
