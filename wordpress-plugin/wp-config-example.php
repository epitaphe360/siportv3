<?php
/**
 * Configuration example for SIPORTS WordPress integration
 * Add these lines to your wp-config.php file
 */

// SIPORTS Supabase Configuration
// Replace these with your actual Supabase project credentials
define('SIPORTS_SUPABASE_URL', 'https://your-project-id.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'your-anon-key-here');

// Alternative: Use WordPress options instead of constants
// update_option('siports_supabase_url', 'https://your-project-id.supabase.co');
// update_option('siports_supabase_anon_key', 'your-anon-key-here');

/**
 * Recommended WordPress debug settings for troubleshooting
 */
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false); // Don't show errors on frontend
define('WP_MEMORY_LIMIT', '256M'); // Increase memory limit
define('WP_MAX_MEMORY_LIMIT', '512M'); // Increase admin memory limit

/**
 * Error reporting settings
 */
@ini_set('display_errors', 0); // Don't display errors
@ini_set('log_errors', 1); // Log errors
@ini_set('error_log', WP_CONTENT_DIR . '/debug.log'); // Custom error log

/**
 * PHP settings for better compatibility
 */
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', 300);
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');

/**
 * Security settings
 */
define('DISALLOW_FILE_EDIT', true); // Disable file editor in admin
define('AUTOMATIC_UPDATER_DISABLED', false); // Enable auto updates

/**
 * Performance settings
 */
define('WP_CACHE', true); // Enable caching if you have a caching plugin
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', false); // Disable concatenation for ES modules

/**
 * Custom error handler for SIPORTS
 */
function siports_error_handler($errno, $errstr, $errfile, $errline) {
    // Log the error
    $error_message = sprintf(
        "[%s] SIPORTS Error: %s in %s on line %d",
        date('Y-m-d H:i:s'),
        $errstr,
        $errfile,
        $errline
    );

    error_log($error_message, 3, WP_CONTENT_DIR . '/siports-errors.log');

    // Don't execute PHP's internal error handler
    return true;
}
set_error_handler('siports_error_handler');

/**
 * Recovery instructions:
 * If you encounter a critical error:
 * 1. Add ?siports_debug=1 to any URL to see debug information
 * 2. Add ?siports_recovery=1 to temporarily disable the plugin
 * 3. Check the error logs in wp-content/debug.log and wp-content/siports-errors.log
 * 4. Ensure your PHP version is 8.1 or higher
 * 5. Verify that the dist/assets/ directory exists and contains the built files
 */
