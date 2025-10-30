<?php
/**
 * SIPORTS REST API Class
 *
 * Gère les endpoints REST API pour la communication React <-> WordPress <-> Supabase
 */

if (!defined('ABSPATH')) {
    exit;
}

class SIPORTS_API {

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // User endpoints
        register_rest_route('siports/v1', '/user/sync', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'sync_user'),
            'permission_callback' => array(__CLASS__, 'check_authentication')
        ));

        register_rest_route('siports/v1', '/user/profile', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_user_profile'),
            'permission_callback' => array(__CLASS__, 'check_authentication')
        ));

        register_rest_route('siports/v1', '/user/profile', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'update_user_profile'),
            'permission_callback' => array(__CLASS__, 'check_authentication')
        ));

        // Events endpoints
        register_rest_route('siports/v1', '/events', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_events'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('siports/v1', '/events/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_event'),
            'permission_callback' => '__return_true'
        ));

        // Exhibitors endpoints
        register_rest_route('siports/v1', '/exhibitors', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_exhibitors'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('siports/v1', '/exhibitors/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_exhibitor'),
            'permission_callback' => '__return_true'
        ));

        // Appointments endpoints
        register_rest_route('siports/v1', '/appointments', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_appointments'),
            'permission_callback' => array(__CLASS__, 'check_authentication')
        ));

        register_rest_route('siports/v1', '/appointments', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_appointment'),
            'permission_callback' => array(__CLASS__, 'check_authentication')
        ));

        // Settings endpoint
        register_rest_route('siports/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_settings'),
            'permission_callback' => '__return_true'
        ));

        // Health check
        register_rest_route('siports/v1', '/health', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'health_check'),
            'permission_callback' => '__return_true'
        ));
    }

    /**
     * Check authentication
     */
    public static function check_authentication($request) {
        return is_user_logged_in();
    }

    /**
     * Sync user between WordPress and Supabase
     */
    public static function sync_user($request) {
        $params = $request->get_json_params();
        $current_user = wp_get_current_user();

        if (!$current_user->ID) {
            return new WP_Error('not_authenticated', __('Non authentifié', 'siports-integration'), array('status' => 401));
        }

        // Get Supabase user data from request
        $supabase_user = isset($params['supabase_user']) ? $params['supabase_user'] : null;

        if ($supabase_user) {
            // Update WordPress user meta with Supabase data
            update_user_meta($current_user->ID, 'siports_supabase_id', $supabase_user['id']);
            update_user_meta($current_user->ID, 'siports_user_type', $supabase_user['type']);
            update_user_meta($current_user->ID, 'siports_visitor_level', isset($supabase_user['visitor_level']) ? $supabase_user['visitor_level'] : 'free');

            // Update profile data
            if (isset($supabase_user['profile'])) {
                $profile = $supabase_user['profile'];

                if (isset($profile['company'])) {
                    update_user_meta($current_user->ID, 'siports_company', $profile['company']);
                }

                if (isset($profile['position'])) {
                    update_user_meta($current_user->ID, 'siports_position', $profile['position']);
                }

                if (isset($profile['phone'])) {
                    update_user_meta($current_user->ID, 'siports_phone', $profile['phone']);
                }
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Utilisateur synchronisé', 'siports-integration'),
            'user_id' => $current_user->ID
        ));
    }

    /**
     * Get user profile
     */
    public static function get_user_profile($request) {
        $current_user = wp_get_current_user();

        if (!$current_user->ID) {
            return new WP_Error('not_authenticated', __('Non authentifié', 'siports-integration'), array('status' => 401));
        }

        $profile = array(
            'id' => $current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'first_name' => get_user_meta($current_user->ID, 'first_name', true),
            'last_name' => get_user_meta($current_user->ID, 'last_name', true),
            'avatar' => get_avatar_url($current_user->ID),
            'siports' => array(
                'supabase_id' => get_user_meta($current_user->ID, 'siports_supabase_id', true),
                'user_type' => get_user_meta($current_user->ID, 'siports_user_type', true),
                'visitor_level' => get_user_meta($current_user->ID, 'siports_visitor_level', true),
                'company' => get_user_meta($current_user->ID, 'siports_company', true),
                'position' => get_user_meta($current_user->ID, 'siports_position', true),
                'phone' => get_user_meta($current_user->ID, 'siports_phone', true)
            )
        );

        return rest_ensure_response($profile);
    }

    /**
     * Update user profile
     */
    public static function update_user_profile($request) {
        $params = $request->get_json_params();
        $current_user = wp_get_current_user();

        if (!$current_user->ID) {
            return new WP_Error('not_authenticated', __('Non authentifié', 'siports-integration'), array('status' => 401));
        }

        // Update WordPress user data
        if (isset($params['first_name'])) {
            update_user_meta($current_user->ID, 'first_name', sanitize_text_field($params['first_name']));
        }

        if (isset($params['last_name'])) {
            update_user_meta($current_user->ID, 'last_name', sanitize_text_field($params['last_name']));
        }

        // Update SIPORTS specific data
        if (isset($params['company'])) {
            update_user_meta($current_user->ID, 'siports_company', sanitize_text_field($params['company']));
        }

        if (isset($params['position'])) {
            update_user_meta($current_user->ID, 'siports_position', sanitize_text_field($params['position']));
        }

        if (isset($params['phone'])) {
            update_user_meta($current_user->ID, 'siports_phone', sanitize_text_field($params['phone']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Profil mis à jour', 'siports-integration')
        ));
    }

    /**
     * Get events (proxy to Supabase or local cache)
     */
    public static function get_events($request) {
        $cache_key = 'siports_events_' . md5(serialize($request->get_params()));
        $settings = get_option('siports_settings', array());
        $cache_enabled = isset($settings['cache_enabled']) ? $settings['cache_enabled'] : true;

        // Try to get from cache
        if ($cache_enabled) {
            $cached = get_transient($cache_key);
            if ($cached !== false) {
                return rest_ensure_response($cached);
            }
        }

        // Forward request to Supabase (this would need actual implementation)
        $events = self::fetch_from_supabase('events', $request->get_params());

        // Cache the result
        if ($cache_enabled && !is_wp_error($events)) {
            $cache_duration = isset($settings['cache_duration']) ? $settings['cache_duration'] : 3600;
            set_transient($cache_key, $events, $cache_duration);
        }

        return rest_ensure_response($events);
    }

    /**
     * Get single event
     */
    public static function get_event($request) {
        $id = $request->get_param('id');
        $event = self::fetch_from_supabase('events/' . $id);

        return rest_ensure_response($event);
    }

    /**
     * Get exhibitors
     */
    public static function get_exhibitors($request) {
        $cache_key = 'siports_exhibitors_' . md5(serialize($request->get_params()));
        $settings = get_option('siports_settings', array());
        $cache_enabled = isset($settings['cache_enabled']) ? $settings['cache_enabled'] : true;

        if ($cache_enabled) {
            $cached = get_transient($cache_key);
            if ($cached !== false) {
                return rest_ensure_response($cached);
            }
        }

        $exhibitors = self::fetch_from_supabase('exhibitors', $request->get_params());

        if ($cache_enabled && !is_wp_error($exhibitors)) {
            $cache_duration = isset($settings['cache_duration']) ? $settings['cache_duration'] : 3600;
            set_transient($cache_key, $exhibitors, $cache_duration);
        }

        return rest_ensure_response($exhibitors);
    }

    /**
     * Get single exhibitor
     */
    public static function get_exhibitor($request) {
        $id = $request->get_param('id');
        $exhibitor = self::fetch_from_supabase('exhibitors/' . $id);

        return rest_ensure_response($exhibitor);
    }

    /**
     * Get appointments
     */
    public static function get_appointments($request) {
        $current_user = wp_get_current_user();
        $supabase_id = get_user_meta($current_user->ID, 'siports_supabase_id', true);

        if (!$supabase_id) {
            return new WP_Error('no_supabase_id', __('ID Supabase non trouvé', 'siports-integration'), array('status' => 404));
        }

        $appointments = self::fetch_from_supabase('appointments', array('user_id' => $supabase_id));

        return rest_ensure_response($appointments);
    }

    /**
     * Create appointment
     */
    public static function create_appointment($request) {
        $params = $request->get_json_params();
        $current_user = wp_get_current_user();
        $supabase_id = get_user_meta($current_user->ID, 'siports_supabase_id', true);

        if (!$supabase_id) {
            return new WP_Error('no_supabase_id', __('ID Supabase non trouvé', 'siports-integration'), array('status' => 404));
        }

        $params['user_id'] = $supabase_id;

        $result = self::post_to_supabase('appointments', $params);

        return rest_ensure_response($result);
    }

    /**
     * Get public settings
     */
    public static function get_settings($request) {
        $settings = get_option('siports_settings', array());

        // Only return public settings
        $public_settings = array(
            'app_url' => isset($settings['app_url']) ? $settings['app_url'] : '',
            'cache_enabled' => isset($settings['cache_enabled']) ? $settings['cache_enabled'] : true
        );

        return rest_ensure_response($public_settings);
    }

    /**
     * Health check endpoint
     */
    public static function health_check($request) {
        $settings = get_option('siports_settings', array());

        return rest_ensure_response(array(
            'status' => 'ok',
            'version' => SIPORTS_VERSION,
            'wordpress_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'app_configured' => !empty($settings['app_url']),
            'supabase_configured' => !empty($settings['supabase_url']) && !empty($settings['supabase_anon_key'])
        ));
    }

    /**
     * Fetch data from Supabase (helper method)
     */
    private static function fetch_from_supabase($endpoint, $params = array()) {
        $settings = get_option('siports_settings', array());
        $supabase_url = isset($settings['supabase_url']) ? $settings['supabase_url'] : '';
        $supabase_key = isset($settings['supabase_anon_key']) ? $settings['supabase_anon_key'] : '';

        if (empty($supabase_url) || empty($supabase_key)) {
            return new WP_Error('not_configured', __('Supabase non configuré', 'siports-integration'), array('status' => 500));
        }

        $url = trailingslashit($supabase_url) . 'rest/v1/' . $endpoint;

        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $response = wp_remote_get($url, array(
            'headers' => array(
                'apikey' => $supabase_key,
                'Authorization' => 'Bearer ' . $supabase_key
            )
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }

    /**
     * Post data to Supabase (helper method)
     */
    private static function post_to_supabase($endpoint, $data) {
        $settings = get_option('siports_settings', array());
        $supabase_url = isset($settings['supabase_url']) ? $settings['supabase_url'] : '';
        $supabase_key = isset($settings['supabase_anon_key']) ? $settings['supabase_anon_key'] : '';

        if (empty($supabase_url) || empty($supabase_key)) {
            return new WP_Error('not_configured', __('Supabase non configuré', 'siports-integration'), array('status' => 500));
        }

        $url = trailingslashit($supabase_url) . 'rest/v1/' . $endpoint;

        $response = wp_remote_post($url, array(
            'headers' => array(
                'apikey' => $supabase_key,
                'Authorization' => 'Bearer ' . $supabase_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data)
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
}

return new SIPORTS_API();
