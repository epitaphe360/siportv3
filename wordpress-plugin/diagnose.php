<?php
/**
 * SIPORTS Quick Diagnostic Script
 * Run this from your WordPress root directory
 */

// Check PHP version
echo "PHP Version: " . PHP_VERSION . "\n";
if (version_compare(PHP_VERSION, '8.1.0', '<')) {
    echo "❌ WARNING: PHP 8.1+ is recommended for SIPORTS\n";
} else {
    echo "✅ PHP version is compatible\n";
}

// Check if WordPress is loaded
if (!defined('ABSPATH')) {
    echo "❌ WordPress not loaded. Run this from WordPress root.\n";
    exit(1);
}

echo "WordPress Version: " . get_bloginfo('version') . "\n";

// Check plugin directory
$plugin_dir = WP_PLUGIN_DIR . '/siports-integration';
if (!is_dir($plugin_dir)) {
    echo "❌ SIPORTS plugin directory not found: $plugin_dir\n";
} else {
    echo "✅ Plugin directory exists\n";
}

// Check main plugin file
$plugin_file = $plugin_dir . '/siports-integration.php';
if (!file_exists($plugin_file)) {
    echo "❌ Main plugin file not found: $plugin_file\n";
} else {
    echo "✅ Main plugin file exists\n";
}

// Check assets directory
$assets_dir = $plugin_dir . '/dist/assets';
if (!is_dir($assets_dir)) {
    echo "❌ Assets directory not found: $assets_dir\n";
    echo "   Run 'npm run build' and copy assets to wordpress-plugin/dist/\n";
} else {
    echo "✅ Assets directory exists\n";

    // Check for JS files
    $js_files = glob($assets_dir . '/index-*.js');
    if (count($js_files) === 0) {
        echo "❌ No JavaScript files found in assets directory\n";
    } else {
        echo "✅ Found " . count($js_files) . " JavaScript file(s)\n";
        foreach ($js_files as $file) {
            echo "   - " . basename($file) . "\n";
        }
    }

    // Check for CSS files
    $css_files = glob($assets_dir . '/index-*.css');
    if (count($css_files) === 0) {
        echo "❌ No CSS files found in assets directory\n";
    } else {
        echo "✅ Found " . count($css_files) . " CSS file(s)\n";
        foreach ($css_files as $file) {
            echo "   - " . basename($file) . "\n";
        }
    }
}

// Check constants
if (defined('SIPORTS_SUPABASE_URL')) {
    echo "✅ SIPORTS_SUPABASE_URL is defined\n";
} else {
    echo "⚠️  SIPORTS_SUPABASE_URL is not defined (using test config)\n";
}

if (defined('SIPORTS_SUPABASE_ANON_KEY')) {
    echo "✅ SIPORTS_SUPABASE_ANON_KEY is defined\n";
} else {
    echo "⚠️  SIPORTS_SUPABASE_ANON_KEY is not defined (using test config)\n";
}

// Check WordPress options
$opt_url = get_option('siports_supabase_url');
$opt_key = get_option('siports_supabase_anon_key');

if (!empty($opt_url)) {
    echo "✅ Supabase URL found in WordPress options\n";
}
if (!empty($opt_key)) {
    echo "✅ Supabase key found in WordPress options\n";
}

// Check memory settings
$memory_limit = ini_get('memory_limit');
echo "Memory Limit: $memory_limit\n";
if (intval($memory_limit) < 128) {
    echo "⚠️  Memory limit might be too low. Consider increasing to 256M\n";
}

// Check if plugin is active
$active_plugins = get_option('active_plugins');
$plugin_basename = 'siports-integration/siports-integration.php';
if (in_array($plugin_basename, $active_plugins)) {
    echo "✅ SIPORTS plugin is active\n";
} else {
    echo "❌ SIPORTS plugin is not active\n";
}

// Check for common issues
echo "\n=== Common Issues Check ===\n";

// Check for Elementor
if (did_action('elementor/loaded')) {
    echo "✅ Elementor is loaded\n";
} else {
    echo "ℹ️  Elementor not detected\n";
}

// Check debug settings
if (WP_DEBUG) {
    echo "✅ WP_DEBUG is enabled\n";
    if (WP_DEBUG_LOG) {
        echo "✅ Error logging is enabled\n";
    }
} else {
    echo "⚠️  WP_DEBUG is disabled. Enable for troubleshooting\n";
}

echo "\n=== Diagnostic Complete ===\n";
echo "If you see ❌ errors above, fix them before proceeding.\n";
echo "For more detailed debugging, add ?siports_debug=1 to any page URL.\n";
echo "To temporarily disable SIPORTS, add ?siports_recovery=1 to any URL.\n";
