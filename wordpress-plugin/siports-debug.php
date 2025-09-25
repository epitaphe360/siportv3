<?php
/**
 * Plugin Name: SIPORTS Debug Helper
 * Description: Debug helper for SIPORTS integration
 */

// Debug function to check if assets are loaded and config is injected
function siports_debug_info() {
    if (isset($_GET['siports_debug'])) {
        echo '<h2>SIPORTS Debug Info</h2>';
        echo '<pre>';

        // Check if plugin is active
        echo "Plugin active: " . (function_exists('siports_load_assets') ? 'YES' : 'NO') . "\n";

        // Check assets directory
        $assets_dir = plugin_dir_path(__FILE__) . '../siports-integration/dist/assets/';
        echo "Assets directory exists: " . (is_dir($assets_dir) ? 'YES' : 'NO') . "\n";
        if (is_dir($assets_dir)) {
            $files = glob($assets_dir . 'index-*.js');
            echo "JS files found: " . count($files) . "\n";
            foreach ($files as $file) {
                echo "  - " . basename($file) . "\n";
            }
        }

        // Check constants
        echo "SIPORTS_SUPABASE_URL defined: " . (defined('SIPORTS_SUPABASE_URL') ? 'YES' : 'NO') . "\n";
        echo "SIPORTS_SUPABASE_ANON_KEY defined: " . (defined('SIPORTS_SUPABASE_ANON_KEY') ? 'YES' : 'NO') . "\n";

        echo '</pre>';

        echo '<script>
            setTimeout(function() {
                console.log("SIPORTS_CONFIG:", window.SIPORTS_CONFIG);
                if (window.SIPORTS_CONFIG) {
                    alert("Config found: " + JSON.stringify(window.SIPORTS_CONFIG));
                } else {
                    alert("No SIPORTS_CONFIG found!");
                }
            }, 1000);
        </script>';
    }
}
add_action('wp_footer', 'siports_debug_info');

// Add debug link to admin bar
function siports_debug_admin_bar($wp_admin_bar) {
    $wp_admin_bar->add_node(array(
        'id' => 'siports-debug',
        'title' => 'SIPORTS Debug',
        'href' => add_query_arg('siports_debug', '1')
    ));
}
add_action('admin_bar_menu', 'siports_debug_admin_bar', 100);
