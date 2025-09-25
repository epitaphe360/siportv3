<?php
/**
 * Plugin Name: SIPORTS Minimal Static
 * Description: Version statique sans dépendances
 * Version: 1.0
 * Author: SIPORTS Team
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Simple shortcode that just returns HTML
function siports_static_shortcode() {
    return '<div style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; text-align: center;">
        <h2>SIPORTS Application</h2>
        <p>L\'application SIPORTS devrait s\'afficher ici.</p>
        <p><small>Ce message est un espace réservé statique.</small></p>
    </div>';
}

// Register shortcode
add_shortcode('siports_static', 'siports_static_shortcode');
