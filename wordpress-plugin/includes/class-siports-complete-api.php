<?php
/**
 * Classe complète d'API Supabase pour WordPress
 * Gère toutes les tables et toutes les opérations
 */

class SIPORTS_Complete_API {

    private $supabase_url;
    private $supabase_anon_key;
    private $headers;

    public function __construct() {
        $this->supabase_url = get_option('siports_supabase_url', defined('SIPORTS_SUPABASE_URL') ? SIPORTS_SUPABASE_URL : '');
        $this->supabase_anon_key = get_option('siports_supabase_anon_key', defined('SIPORTS_SUPABASE_ANON_KEY') ? SIPORTS_SUPABASE_ANON_KEY : '');

        $this->headers = array(
            'apikey' => $this->supabase_anon_key,
            'Authorization' => 'Bearer ' . $this->supabase_anon_key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation'
        );
    }

    /**
     * Check if API is configured
     */
    public function is_configured() {
        return !empty($this->supabase_url) && !empty($this->supabase_anon_key);
    }

    /**
     * Generic GET request
     */
    private function get($table, $params = array()) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/' . $table . '?select=*';

        // Add filters
        foreach ($params as $key => $value) {
            if ($key === 'limit') {
                $url .= '&limit=' . intval($value);
            } elseif ($key === 'offset') {
                $url .= '&offset=' . intval($value);
            } elseif ($key === 'order') {
                $url .= '&order=' . urlencode($value);
            } elseif (!empty($value)) {
                $url .= '&' . urlencode($key) . '=eq.' . urlencode($value);
            }
        }

        $response = wp_remote_get($url, array('headers' => $this->headers));

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        return $data ?: array();
    }

    /**
     * Generic POST request
     */
    private function post($table, $data) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/' . $table;

        $response = wp_remote_post($url, array(
            'headers' => $this->headers,
            'body' => wp_json_encode($data)
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        return $result;
    }

    /**
     * Generic PATCH request
     */
    private function patch($table, $id, $data) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/' . $table . '?id=eq.' . urlencode($id);

        $response = wp_remote_request($url, array(
            'method' => 'PATCH',
            'headers' => $this->headers,
            'body' => wp_json_encode($data)
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        return $result;
    }

    /**
     * Generic DELETE request
     */
    private function delete($table, $id) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/' . $table . '?id=eq.' . urlencode($id);

        $response = wp_remote_request($url, array(
            'method' => 'DELETE',
            'headers' => $this->headers
        ));

        if (is_wp_error($response)) {
            return $response;
        }

        return true;
    }

    // ========================================
    // EXHIBITORS
    // ========================================

    public function get_exhibitors($params = array()) {
        return $this->get('exhibitors', $params);
    }

    public function get_exhibitor($id) {
        $result = $this->get('exhibitors', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_exhibitor($data) {
        return $this->post('exhibitors', $data);
    }

    public function update_exhibitor($id, $data) {
        return $this->patch('exhibitors', $id, $data);
    }

    public function delete_exhibitor($id) {
        return $this->delete('exhibitors', $id);
    }

    // ========================================
    // EVENTS
    // ========================================

    public function get_events($params = array()) {
        if (isset($params['featured']) && $params['featured']) {
            $params['featured'] = 'true';
        }
        return $this->get('events', $params);
    }

    public function get_event($id) {
        $result = $this->get('events', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_event($data) {
        return $this->post('events', $data);
    }

    public function update_event($id, $data) {
        return $this->patch('events', $id, $data);
    }

    public function delete_event($id) {
        return $this->delete('events', $id);
    }

    // ========================================
    // NEWS/ARTICLES
    // ========================================

    public function get_news_articles($params = array()) {
        if (isset($params['featured']) && $params['featured']) {
            $params['featured'] = 'true';
        }
        if (isset($params['published'])) {
            $params['published'] = 'true';
        }
        return $this->get('news_articles', $params);
    }

    public function get_news_article($id) {
        $result = $this->get('news_articles', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_news_article($data) {
        return $this->post('news_articles', $data);
    }

    public function update_news_article($id, $data) {
        return $this->patch('news_articles', $id, $data);
    }

    public function delete_news_article($id) {
        return $this->delete('news_articles', $id);
    }

    // ========================================
    // PARTNERS
    // ========================================

    public function get_partners($params = array()) {
        return $this->get('partners', $params);
    }

    public function get_partner($id) {
        $result = $this->get('partners', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_partner($data) {
        return $this->post('partners', $data);
    }

    public function update_partner($id, $data) {
        return $this->patch('partners', $id, $data);
    }

    public function delete_partner($id) {
        return $this->delete('partners', $id);
    }

    // ========================================
    // PRODUCTS
    // ========================================

    public function get_products($params = array()) {
        return $this->get('products', $params);
    }

    public function get_product($id) {
        $result = $this->get('products', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_product($data) {
        return $this->post('products', $data);
    }

    public function update_product($id, $data) {
        return $this->patch('products', $id, $data);
    }

    public function delete_product($id) {
        return $this->delete('products', $id);
    }

    // ========================================
    // APPOINTMENTS
    // ========================================

    public function get_appointments($params = array()) {
        return $this->get('appointments', $params);
    }

    public function get_appointment($id) {
        $result = $this->get('appointments', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_appointment($data) {
        return $this->post('appointments', $data);
    }

    public function update_appointment($id, $data) {
        return $this->patch('appointments', $id, $data);
    }

    public function delete_appointment($id) {
        return $this->delete('appointments', $id);
    }

    // ========================================
    // TIME SLOTS
    // ========================================

    public function get_time_slots($params = array()) {
        return $this->get('time_slots', $params);
    }

    public function get_time_slot($id) {
        $result = $this->get('time_slots', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_time_slot($data) {
        return $this->post('time_slots', $data);
    }

    public function update_time_slot($id, $data) {
        return $this->patch('time_slots', $id, $data);
    }

    public function delete_time_slot($id) {
        return $this->delete('time_slots', $id);
    }

    // ========================================
    // USERS
    // ========================================

    public function get_users($params = array()) {
        return $this->get('users', $params);
    }

    public function get_user($id) {
        $result = $this->get('users', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_user($data) {
        return $this->post('users', $data);
    }

    public function update_user($id, $data) {
        return $this->patch('users', $id, $data);
    }

    public function delete_user($id) {
        return $this->delete('users', $id);
    }

    // ========================================
    // MINI-SITES
    // ========================================

    public function get_mini_sites($params = array()) {
        return $this->get('mini_sites', $params);
    }

    public function get_mini_site($id) {
        $result = $this->get('mini_sites', array('exhibitor_id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    public function create_mini_site($data) {
        return $this->post('mini_sites', $data);
    }

    public function update_mini_site($exhibitor_id, $data) {
        return $this->patch('mini_sites', $exhibitor_id, $data);
    }

    public function delete_mini_site($id) {
        return $this->delete('mini_sites', $id);
    }

    // ========================================
    // CONVERSATIONS & MESSAGES
    // ========================================

    public function get_conversations($user_id) {
        // Cette requête nécessite une logique plus complexe
        // Pour l'instant, retourner un appel simple
        return $this->get('conversations', array('limit' => 50));
    }

    public function get_messages($conversation_id) {
        return $this->get('messages', array('conversation_id' => $conversation_id, 'order' => 'created_at.asc'));
    }

    public function send_message($data) {
        return $this->post('messages', $data);
    }

    // ========================================
    // CONNECTIONS (Networking)
    // ========================================

    public function get_connections($user_id) {
        // Récupérer les connexions pour un utilisateur
        return $this->get('connections', array('limit' => 100));
    }

    public function create_connection($data) {
        return $this->post('connections', $data);
    }

    public function update_connection($id, $data) {
        return $this->patch('connections', $id, $data);
    }

    // ========================================
    // PAVILIONS
    // ========================================

    public function get_pavilions($params = array()) {
        return $this->get('pavilions', $params);
    }

    public function get_pavilion($id) {
        $result = $this->get('pavilions', array('id' => $id));
        return !empty($result) ? $result[0] : null;
    }

    // ========================================
    // STATISTICS
    // ========================================

    public function get_statistics() {
        // Récupérer les statistiques depuis différentes tables
        $stats = array();

        $exhibitors = $this->get_exhibitors(array('limit' => 1000));
        $events = $this->get_events(array('limit' => 1000));
        $partners = $this->get_partners(array('limit' => 1000));
        $users = $this->get_users(array('limit' => 1000));

        $stats['exhibitors'] = is_array($exhibitors) ? count($exhibitors) : 0;
        $stats['events'] = is_array($events) ? count($events) : 0;
        $stats['partners'] = is_array($partners) ? count($partners) : 0;
        $stats['visitors'] = is_array($users) ? count($users) : 0;

        // Compter les pays uniques
        $countries = array();
        if (is_array($exhibitors)) {
            foreach ($exhibitors as $exhibitor) {
                if (!empty($exhibitor['contact_info']['country'])) {
                    $countries[$exhibitor['contact_info']['country']] = true;
                }
            }
        }
        $stats['countries'] = count($countries);

        return $stats;
    }

    // ========================================
    // REGISTRATION REQUESTS
    // ========================================

    public function get_registration_requests($params = array()) {
        return $this->get('registration_requests', $params);
    }

    public function update_registration_request($id, $data) {
        return $this->patch('registration_requests', $id, $data);
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================

    public function get_notifications($user_id) {
        return $this->get('notifications', array('user_id' => $user_id, 'order' => 'created_at.desc'));
    }

    public function create_notification($data) {
        return $this->post('notifications', $data);
    }

    public function mark_notification_read($id) {
        return $this->patch('notifications', $id, array('read' => true));
    }

    // ========================================
    // SEARCH
    // ========================================

    public function search($query, $types = array('exhibitors', 'events', 'products')) {
        $results = array();

        if (in_array('exhibitors', $types)) {
            $exhibitors = $this->get_exhibitors(array('limit' => 100));
            if (is_array($exhibitors)) {
                foreach ($exhibitors as $exhibitor) {
                    if (stripos($exhibitor['company_name'], $query) !== false ||
                        stripos($exhibitor['description'], $query) !== false) {
                        $results['exhibitors'][] = $exhibitor;
                    }
                }
            }
        }

        if (in_array('events', $types)) {
            $events = $this->get_events(array('limit' => 100));
            if (is_array($events)) {
                foreach ($events as $event) {
                    if (stripos($event['title'], $query) !== false ||
                        stripos($event['description'], $query) !== false) {
                        $results['events'][] = $event;
                    }
                }
            }
        }

        if (in_array('products', $types)) {
            $products = $this->get_products(array('limit' => 100));
            if (is_array($products)) {
                foreach ($products as $product) {
                    if (stripos($product['name'], $query) !== false ||
                        stripos($product['description'], $query) !== false) {
                        $results['products'][] = $product;
                    }
                }
            }
        }

        return $results;
    }
}
