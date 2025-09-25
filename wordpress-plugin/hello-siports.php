<?php
/**
 * Plugin Name: Hello SIPORTS
 * Description: Test plugin ultra simple
 * Version: 1.0
 * Author: SIPORTS Team
 */

// Rien d'autre que cette déclaration
function hello_siports_shortcode() {
    return 'Hello SIPORTS';
}
add_shortcode('hello_siports', 'hello_siports_shortcode');
?>
