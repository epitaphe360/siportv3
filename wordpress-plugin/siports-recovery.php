<?php
/**
 * Plugin Name: SIPORTS Debug & Recovery
 * Description: Advanced debugging and error recovery for SIPORTS integration
 * Version: 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enable error reporting for debugging
if (isset($_GET['siports_debug'])) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// Capture and log all PHP errors
function siports_error_handler($errno, $errstr, $errfile, $errline) {
    $error_message = "SIPORTS Error [$errno]: $errstr in $errfile on line $errline";
    error_log($error_message);

    // Don't display errors unless in debug mode
    if (!isset($_GET['siports_debug'])) {
        return true;
    }

    return false;
}
set_error_handler('siports_error_handler');

// Capture fatal errors
function siports_fatal_error_handler() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $error_message = "SIPORTS Fatal Error: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line'];
        error_log($error_message);

        if (isset($_GET['siports_debug'])) {
            echo "<div style='background: #ffcccc; border: 1px solid #ff0000; padding: 10px; margin: 10px;'>";
            echo "<h3>Fatal Error Detected</h3>";
            echo "<p><strong>Error:</strong> " . htmlspecialchars($error['message']) . "</p>";
            echo "<p><strong>File:</strong> " . htmlspecialchars($error['file']) . "</p>";
            echo "<p><strong>Line:</strong> " . $error['line'] . "</p>";
            echo "</div>";
        }
    }
}
register_shutdown_function('siports_fatal_error_handler');

// Safe wrapper for potentially problematic functions
function siports_safe_call($function, $args = array(), $fallback = null) {
    try {
        return call_user_func_array($function, $args);
    } catch (Exception $e) {
        error_log("SIPORTS Exception in $function: " . $e->getMessage());
        return $fallback;
    }
}

// Enhanced asset loading with error handling
function siports_safe_find_asset($pattern) {
    try {
        $assets_dir = trailingslashit(plugin_dir_path(__FILE__)) . '../siports-integration/dist/assets/';

        if (!is_dir($assets_dir)) {
            error_log("SIPORTS: Assets directory not found: $assets_dir");
            return null;
        }

        $files = glob($assets_dir . $pattern);
        if (!$files || count($files) === 0) {
            error_log("SIPORTS: No files found matching pattern: $pattern in $assets_dir");
            return null;
        }

        $file_path = $files[0];
        if (!file_exists($file_path)) {
            error_log("SIPORTS: Asset file does not exist: $file_path");
            return null;
        }

        $file_url = trailingslashit(plugin_dir_url(__FILE__)) . '../siports-integration/dist/assets/' . basename($file_path);
        $version = @filemtime($file_path) ?: '1.0.0';

        return array('url' => $file_url, 'ver' => $version);
    } catch (Exception $e) {
        error_log("SIPORTS: Exception in siports_safe_find_asset: " . $e->getMessage());
        return null;
    }
}

// System information display
function siports_system_info() {
    if (!isset($_GET['siports_debug'])) {
        return;
    }

    echo '<div style="background: #f0f0f0; border: 1px solid #ccc; padding: 20px; margin: 20px; font-family: monospace;">';
    echo '<h3>SIPORTS System Information</h3>';

    echo '<h4>PHP Information</h4>';
    echo '<p>PHP Version: ' . PHP_VERSION . '</p>';
    echo '<p>Memory Limit: ' . ini_get('memory_limit') . '</p>';
    echo '<p>Max Execution Time: ' . ini_get('max_execution_time') . 's</p>';

    echo '<h4>WordPress Information</h4>';
    echo '<p>WP Version: ' . get_bloginfo('version') . '</p>';
    echo '<p>WP Debug: ' . (WP_DEBUG ? 'Enabled' : 'Disabled') . '</p>';
    echo '<p>WP Debug Log: ' . (WP_DEBUG_LOG ? 'Enabled' : 'Disabled') . '</p>';

    echo '<h4>Plugin Information</h4>';
    $plugin_file = plugin_dir_path(__FILE__) . '../siports-integration/siports-integration.php';
    echo '<p>Plugin File Exists: ' . (file_exists($plugin_file) ? 'Yes' : 'No') . '</p>';

    $assets_dir = plugin_dir_path(__FILE__) . '../siports-integration/dist/assets/';
    echo '<p>Assets Directory Exists: ' . (is_dir($assets_dir) ? 'Yes' : 'No') . '</p>';

    if (is_dir($assets_dir)) {
        $js_files = glob($assets_dir . 'index-*.js');
        echo '<p>JS Files Found: ' . count($js_files) . '</p>';
        $css_files = glob($assets_dir . 'index-*.css');
        echo '<p>CSS Files Found: ' . count($css_files) . '</p>';
    }

    echo '<h4>Constants</h4>';
    echo '<p>SIPORTS_SUPABASE_URL: ' . (defined('SIPORTS_SUPABASE_URL') ? 'Defined' : 'Not defined') . '</p>';
    echo '<p>SIPORTS_SUPABASE_ANON_KEY: ' . (defined('SIPORTS_SUPABASE_ANON_KEY') ? 'Defined' : 'Not defined') . '</p>';

    echo '</div>';
}
add_action('wp_footer', 'siports_system_info');

// Recovery mode - disable SIPORTS if there are critical errors
function siports_recovery_mode() {
    if (isset($_GET['siports_recovery'])) {
        // Temporarily disable SIPORTS plugin
        update_option('siports_disabled', '1');
        echo '<div style="background: #ffffcc; border: 1px solid #ffcc00; padding: 10px; margin: 10px;">';
        echo '<h3>SIPORTS Recovery Mode Activated</h3>';
        echo '<p>The SIPORTS plugin has been temporarily disabled. Remove the ?siports_recovery parameter from the URL to re-enable it.</p>';
        echo '</div>';
    } elseif (get_option('siports_disabled') === '1') {
        // Plugin is disabled
        remove_shortcode('siports_networking');
        remove_shortcode('siports_exhibitor_dashboard');
        remove_action('wp_enqueue_scripts', 'siports_detect_and_load');
        remove_action('wp_enqueue_scripts', 'siports_elementor_detection');

        if (isset($_GET['siports_debug'])) {
            echo '<div style="background: #ffffcc; border: 1px solid #ffcc00; padding: 10px; margin: 10px;">';
            echo '<p><strong>SIPORTS Plugin is DISABLED</strong> (Recovery Mode)</p>';
            echo '<p>Add ?siports_recovery to the URL to re-enable it.</p>';
            echo '</div>';
        }
    } else {
        // Plugin is enabled, clear the disabled flag
        delete_option('siports_disabled');
    }
}
add_action('init', 'siports_recovery_mode');

// Add debug links to admin bar
function siports_debug_admin_bar($wp_admin_bar) {
    if (current_user_can('administrator')) {
        $wp_admin_bar->add_node(array(
            'id' => 'siports-debug',
            'title' => 'SIPORTS Debug',
            'href' => add_query_arg('siports_debug', '1')
        ));

        $wp_admin_bar->add_node(array(
            'id' => 'siports-recovery',
            'title' => 'SIPORTS Recovery',
            'href' => add_query_arg('siports_recovery', '1')
        ));
    }
}
add_action('admin_bar_menu', 'siports_debug_admin_bar', 100);
