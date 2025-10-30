<?php
if (!defined('ABSPATH')) exit;

class SIPORTS_Settings {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_settings_page() {
        add_submenu_page(
            'siports',
            'Paramètres SIPORTS',
            'Paramètres',
            'manage_options',
            'siports-settings',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('siports_settings_group', 'siports_settings');
    }

    public function settings_page() {
        $settings = get_option('siports_settings', array());
        ?>
        <div class="wrap">
            <h1>Paramètres SIPORTS</h1>
            <form method="post" action="options.php">
                <?php settings_fields('siports_settings_group'); ?>
                <table class="form-table">
                    <tr>
                        <th>URL Application</th>
                        <td><input type="text" name="siports_settings[app_url]" value="<?php echo esc_attr($settings['app_url'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th>URL Supabase</th>
                        <td><input type="text" name="siports_settings[supabase_url]" value="<?php echo esc_attr($settings['supabase_url'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th>Clé Supabase</th>
                        <td><input type="text" name="siports_settings[supabase_anon_key]" value="<?php echo esc_attr($settings['supabase_anon_key'] ?? ''); ?>" class="regular-text" /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
