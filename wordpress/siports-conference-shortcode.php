<?php
/**
 * Plugin Name: SIPORTS Programme des Conférences
 * Plugin URI: https://siportevent.com
 * Description: Affiche le programme détaillé des conférences SIPORTS 2026
 * Version: 1.0.0
 * Author: SIPORTS Team
 * Author URI: https://siportevent.com
 * License: GPL v2 or later
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcode principal pour afficher le programme complet
 * Usage: [siports_programme]
 */
function siports_programme_shortcode($atts) {
    // Attributs par défaut
    $atts = shortcode_atts(array(
        'jour' => 'all',  // 'all', '1', '2', '3'
        'style' => 'cards' // 'cards', 'list', 'timeline'
    ), $atts);

    // Inclure les styles
    wp_enqueue_style('siports-programme-styles', plugin_dir_url(__FILE__) . 'assets/css/programme.css', array(), '1.0.0');

    // Données du programme
    $programme = siports_get_programme_data();

    // Générer le HTML
    ob_start();

    if ($atts['jour'] === 'all') {
        echo siports_render_full_programme($programme, $atts['style']);
    } else {
        $jour = intval($atts['jour']);
        if (isset($programme[$jour - 1])) {
            echo siports_render_day_programme($programme[$jour - 1], $atts['style']);
        }
    }

    return ob_get_clean();
}
add_shortcode('siports_programme', 'siports_programme_shortcode');

/**
 * Shortcode pour afficher une journée spécifique
 * Usage: [siports_jour numero="1"]
 */
function siports_jour_shortcode($atts) {
    $atts = shortcode_atts(array(
        'numero' => '1'
    ), $atts);

    return siports_programme_shortcode(array('jour' => $atts['numero'], 'style' => 'cards'));
}
add_shortcode('siports_jour', 'siports_jour_shortcode');

/**
 * Shortcode pour afficher le compteur de sessions
 * Usage: [siports_stats]
 */
function siports_stats_shortcode($atts) {
    $programme = siports_get_programme_data();
    $total_sessions = 0;
    $total_heures = 0;

    foreach ($programme as $jour) {
        $total_sessions += count($jour['sessions']);
    }

    ob_start();
    ?>
    <div class="siports-stats">
        <div class="stat-item">
            <span class="stat-number"><?php echo count($programme); ?></span>
            <span class="stat-label">Jours</span>
        </div>
        <div class="stat-item">
            <span class="stat-number"><?php echo $total_sessions; ?></span>
            <span class="stat-label">Sessions</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">Intervenants</span>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('siports_stats', 'siports_stats_shortcode');

/**
 * Retourne les données structurées du programme
 */
function siports_get_programme_data() {
    return array(
        // Jour 1 - 1 Avril 2026
        array(
            'date' => '1 Avril 2026',
            'jour_numero' => 1,
            'sessions' => array(
                array(
                    'time' => '09:00 – 10:30',
                    'title' => 'Quelle stratégie pour renforcer l\'inclusion et la formation dans le maritime africain ?',
                    'type' => 'session'
                ),
                array(
                    'time' => '10:30 – 12:00',
                    'title' => 'Leadership Féminin au cœur de la transformation maritime en partenariat avec (RFPMP-AOC)',
                    'type' => 'session'
                ),
                array(
                    'time' => '12:00 – 12:30',
                    'title' => 'Cérémonie de clôture',
                    'type' => 'ceremony'
                ),
                array(
                    'time' => '12:30 – 15:00',
                    'title' => 'Déjeuner de réseautage',
                    'type' => 'lunch',
                    'premium' => true
                ),
                array(
                    'time' => '15:00',
                    'title' => 'Visite au port de Jorf Lasfar',
                    'type' => 'visit'
                )
            )
        ),
        // Jour 2 - 2 Avril 2026
        array(
            'date' => '2 Avril 2026',
            'jour_numero' => 2,
            'sessions' => array(
                array(
                    'time' => '10:00 - 12:30',
                    'title' => 'Allocutions institutionnelles (Ministres,...)',
                    'type' => 'opening'
                ),
                array(
                    'time' => '10:00 - 12:30',
                    'title' => 'Panel Ministériel : « La coopération régionale et le développement des infrastructures portuaires en Afrique »',
                    'type' => 'panel'
                ),
                array(
                    'time' => '10:00 - 12:30',
                    'title' => 'Ouverture officielle de l\'exposition',
                    'type' => 'opening'
                ),
                array(
                    'time' => '10:00 - 12:30',
                    'title' => 'Ouverture officielle du musée',
                    'type' => 'opening'
                ),
                array(
                    'time' => '12:30 – 14:00',
                    'title' => 'Déjeuner de réseautage',
                    'type' => 'lunch',
                    'premium' => true
                ),
                array(
                    'time' => '14:00 – 15:30',
                    'title' => 'Transformation Financière des Ports Africains : PPP, Climat et Blended Finance',
                    'type' => 'session'
                )
            )
        ),
        // Jour 3 - 3 Avril 2026
        array(
            'date' => '3 Avril 2026',
            'jour_numero' => 3,
            'sessions' => array(
                array(
                    'time' => '09:00 – 10:30',
                    'title' => 'Vers des ports africains durables et résilients face aux changements climatiques',
                    'type' => 'session'
                ),
                array(
                    'time' => '10:30 – 11:00',
                    'title' => 'Pause-café',
                    'type' => 'break'
                ),
                array(
                    'time' => '11:00 – 12:30',
                    'title' => 'Transition climatique et réglementaire : une nouvelle ère pour l\'industrie navale',
                    'type' => 'session'
                ),
                array(
                    'time' => '12:30 – 14:00',
                    'title' => 'Déjeuner de réseautage',
                    'type' => 'lunch',
                    'premium' => true
                ),
                array(
                    'time' => '14:00 – 15:30',
                    'title' => 'Ports du futur : entre digitalisation, cybersécurité et compétitivité',
                    'type' => 'session'
                )
            )
        )
    );
}

/**
 * Rend le programme complet
 */
function siports_render_full_programme($programme, $style) {
    ob_start();
    ?>
    <div class="siports-programme-container">
        <?php foreach ($programme as $jour): ?>
            <?php echo siports_render_day_programme($jour, $style); ?>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Rend une journée du programme
 */
function siports_render_day_programme($jour, $style) {
    ob_start();
    ?>
    <div class="day-section" id="jour-<?php echo $jour['jour_numero']; ?>">
        <div class="day-header">
            <span class="day-number">JOUR <?php echo $jour['jour_numero']; ?></span>
            <h2 class="day-date"><?php echo esc_html($jour['date']); ?></h2>
        </div>

        <div class="sessions-grid">
            <?php foreach ($jour['sessions'] as $session): ?>
                <?php echo siports_render_session($session, $style); ?>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Rend une session individuelle
 */
function siports_render_session($session, $style) {
    $type_labels = array(
        'session' => 'Session',
        'panel' => 'Panel Ministériel',
        'ceremony' => 'Cérémonie',
        'lunch' => 'Déjeuner de Réseautage',
        'visit' => 'Visite',
        'opening' => 'Ouverture Officielle',
        'break' => 'Pause'
    );

    $type_label = isset($type_labels[$session['type']]) ? $type_labels[$session['type']] : $session['type'];
    $premium_badge = isset($session['premium']) && $session['premium'] ? '<span class="premium-badge">👑 Premium</span>' : '';

    ob_start();
    ?>
    <div class="session-card <?php echo esc_attr($session['type']); ?>">
        <span class="session-type"><?php echo esc_html($type_label); ?> <?php echo $premium_badge; ?></span>
        <div class="session-time">⏰ <?php echo esc_html($session['time']); ?></div>
        <h3 class="session-title"><?php echo esc_html($session['title']); ?></h3>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Enregistre les styles du plugin
 */
function siports_enqueue_styles() {
    if (has_shortcode(get_post()->post_content, 'siports_programme') ||
        has_shortcode(get_post()->post_content, 'siports_jour') ||
        has_shortcode(get_post()->post_content, 'siports_stats')) {

        wp_enqueue_style('siports-programme', plugin_dir_url(__FILE__) . 'assets/css/programme.css', array(), '1.0.0');
    }
}
add_action('wp_enqueue_scripts', 'siports_enqueue_styles');

/**
 * Widget Gutenberg pour le programme
 */
function siports_register_gutenberg_block() {
    if (!function_exists('register_block_type')) {
        return;
    }

    wp_register_script(
        'siports-programme-block',
        plugin_dir_url(__FILE__) . 'assets/js/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor'),
        '1.0.0'
    );

    register_block_type('siports/programme', array(
        'editor_script' => 'siports-programme-block',
        'render_callback' => 'siports_programme_shortcode'
    ));
}
add_action('init', 'siports_register_gutenberg_block');
