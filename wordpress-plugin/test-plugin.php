<?php
/**
 * Plugin Name: SIPORTS Test Shortcode
 * Plugin URI: https://siportevent.com
 * Description: Version de test simplifiée pour vérifier le fonctionnement de base
 * Version: 1.0.0
 * Author: SIPORTS Team
 * License: GPL v2 or later
 * Text Domain: siports-test
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Shortcode minimal pour tester
function siports_test_shortcode() {
    return '<div id="siports-test">Le shortcode SIPORTS fonctionne!</div>';
}

// Enregistrement du shortcode de test
add_shortcode('siports_test', 'siports_test_shortcode');
