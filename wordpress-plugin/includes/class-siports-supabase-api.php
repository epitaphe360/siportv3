<?php
/**
 * Classe pour gérer les appels à l'API Supabase
 */
class Siports_Supabase_API {

    private $supabase_url;
    private $supabase_anon_key;

    public function __construct() {
        $this->supabase_url = get_option('siports_supabase_url', defined('SIPORTS_SUPABASE_URL') ? SIPORTS_SUPABASE_URL : '');
        $this->supabase_anon_key = get_option('siports_supabase_anon_key', defined('SIPORTS_SUPABASE_ANON_KEY') ? SIPORTS_SUPABASE_ANON_KEY : '');
    }

    public function is_configured() {
        return !empty($this->supabase_url) && !empty($this->supabase_anon_key);
    }

    public function get_exhibitors($params = []) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/exhibitors?select=*';

        if (!empty($params['sector'])) {
            $url .= '&sector=eq.' . urlencode($params['sector']);
        }
        if (!empty($params['country'])) {
            $url .= '&country=eq.' . urlencode($params['country']);
        }
        if (!empty($params['limit'])) {
            $url .= '&limit=' . intval($params['limit']);
        }
        if (!empty($params['orderby'])) {
            $url .= '&order=' . urlencode($params['orderby']);
        }

        $response = wp_remote_get($url, [
            'headers' => [
                'apikey' => $this->supabase_anon_key,
                'Authorization' => 'Bearer ' . $this->supabase_anon_key,
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        return $data;
    }

    public function get_exhibitor($id) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Supabase n\'est pas configuré.');
        }

        $url = $this->supabase_url . '/rest/v1/exhibitors?select=*,products:products(*),mini_site:mini_sites(*)&id=eq.' . urlencode($id);

        $response = wp_remote_get($url, [
            'headers' => [
                'apikey' => $this->supabase_anon_key,
                'Authorization' => 'Bearer ' . $this->supabase_anon_key,
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        return !empty($data) ? $data[0] : null;
    }
}

