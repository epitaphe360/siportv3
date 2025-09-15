<?php
/**
 * Script d'installation pour créer les pages WordPress
 * Ce script sera exécuté lors de l'activation du plugin pour créer automatiquement
 * les pages nécessaires à l'affichage des mini-sites et des autres fonctionnalités
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fonction pour créer les pages WordPress lors de l'activation du plugin
 */
function siports_create_wordpress_pages() {
    // Liste des pages à créer avec leurs templates
    $pages = array(
        array(
            'title' => 'Exposants SIPORTS 2026',
            'slug' => 'exposants',
            'content' => '<!-- wp:paragraph -->
<p>Découvrez les exposants du Salon International des Ports 2026. Retrouvez tous les acteurs majeurs du secteur portuaire réunis à El Jadida, Maroc.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[siports_stats show="exhibitors,countries" animated="true" layout="horizontal"]
<!-- /wp:shortcode -->',
            'template' => 'page-exhibitors.php'
        ),
        array(
            'title' => 'Programme SIPORTS 2026',
            'slug' => 'programme',
            'content' => '<!-- wp:paragraph -->
<p>Consultez le programme complet de SIPORTS 2026 : conférences, ateliers techniques, sessions de réseautage et événements spéciaux du salon portuaire.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[siports_countdown show_days="true" show_hours="true" style="compact"]
<!-- /wp:shortcode -->',
            'template' => 'page-program.php'
        ),
        array(
            'title' => 'Mini-Sites Exposants',
            'slug' => 'exposants/mini-sites',
            'content' => '<!-- wp:paragraph -->
<p>Explorez les mini-sites des exposants de SIPORTS 2026. Retrouvez toutes les informations sur les entreprises participantes, leurs produits et services.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[siports_stats show="exhibitors" animated="true" layout="horizontal"]
<!-- /wp:shortcode -->',
            'template' => 'page-minisites.php',
            'parent' => 'exposants'
        ),
        array(
            'title' => 'Port Solutions Inc.',
            'slug' => 'exposants/mini-sites/port-solutions',
            'content' => '<!-- wp:shortcode -->
[siports_minisite id="port-solutions"]
<!-- /wp:shortcode -->',
            'parent' => 'exposants/mini-sites'
        ),
        array(
            'title' => 'Maritime Tech Solutions',
            'slug' => 'exposants/mini-sites/maritime-tech',
            'content' => '<!-- wp:shortcode -->
[siports_minisite id="maritime-tech"]
<!-- /wp:shortcode -->',
            'parent' => 'exposants/mini-sites'
        ),
        array(
            'title' => 'Global Port Authority',
            'slug' => 'exposants/mini-sites/global-port',
            'content' => '<!-- wp:shortcode -->
[siports_minisite id="global-port"]
<!-- /wp:shortcode -->',
            'parent' => 'exposants/mini-sites'
        ),
        array(
            'title' => 'Eco Maritime Systems',
            'slug' => 'exposants/mini-sites/eco-maritime',
            'content' => '<!-- wp:shortcode -->
[siports_minisite id="eco-maritime"]
<!-- /wp:shortcode -->',
            'parent' => 'exposants/mini-sites'
        ),
        array(
            'title' => 'Digital Harbor',
            'slug' => 'exposants/mini-sites/digital-harbor',
            'content' => '<!-- wp:shortcode -->
[siports_minisite id="digital-harbor"]
<!-- /wp:shortcode -->',
            'parent' => 'exposants/mini-sites'
        )
    );
    
    // Créer ou mettre à jour chaque page
    foreach ($pages as $page_data) {
        // Vérifier si la page existe déjà par son slug
        $existing_page = get_page_by_path($page_data['slug']);
        
        // Trouver l'ID du parent si nécessaire
        $parent_id = 0;
        if (isset($page_data['parent'])) {
            $parent = get_page_by_path($page_data['parent']);
            if ($parent) {
                $parent_id = $parent->ID;
            }
        }
        
        // Préparer les données de la page
        $page_args = array(
            'post_title' => $page_data['title'],
            'post_content' => $page_data['content'],
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => basename($page_data['slug']),
            'post_parent' => $parent_id
        );
        
        // Mettre à jour ou insérer la page
        if ($existing_page) {
            $page_args['ID'] = $existing_page->ID;
            wp_update_post($page_args);
            $page_id = $existing_page->ID;
        } else {
            $page_id = wp_insert_post($page_args);
        }
        
        // Assigner le template si spécifié
        if (isset($page_data['template']) && $page_id) {
            update_post_meta($page_id, '_wp_page_template', $page_data['template']);
        }
    }
}

// Exécuter la fonction lors de l'activation du plugin
register_activation_hook(__FILE__, 'siports_create_wordpress_pages');
