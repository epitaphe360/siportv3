<?php
/**
 * Extension pour le plugin SIPORTS Integration
 * Ce fichier ajoute la prise en charge des mini-sites et des nouvelles pages WordPress
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

// Inclure les fichiers de classe pour les mini-sites
require_once SIPORTS_PLUGIN_PATH . 'includes/class-siports-minisites.php';

// Charger les templates de page personnalisés
add_filter('theme_page_templates', 'siports_add_page_templates');
function siports_add_page_templates($templates) {
    $templates['page-exhibitors.php'] = 'SIPORTS - Page Exposants';
    $templates['page-program.php'] = 'SIPORTS - Page Programme';
    $templates['page-minisites.php'] = 'SIPORTS - Page Mini-Sites';
    return $templates;
}

// Gestion des templates personnalisés
add_filter('template_include', 'siports_load_page_templates');
function siports_load_page_templates($template) {
    if (is_page()) {
        $page_template = get_post_meta(get_the_ID(), '_wp_page_template', true);
        
        if ($page_template === 'page-exhibitors.php') {
            $new_template = SIPORTS_PLUGIN_PATH . 'templates/page-exhibitors.php';
            if (file_exists($new_template)) {
                return $new_template;
            }
        }
        
        if ($page_template === 'page-program.php') {
            $new_template = SIPORTS_PLUGIN_PATH . 'templates/page-program.php';
            if (file_exists($new_template)) {
                return $new_template;
            }
        }
        
        if ($page_template === 'page-minisites.php') {
            $new_template = SIPORTS_PLUGIN_PATH . 'templates/page-minisites.php';
            if (file_exists($new_template)) {
                return $new_template;
            }
        }
    }
    
    return $template;
}

// Ajouter des options au menu d'administration
add_action('admin_menu', 'siports_add_admin_menu_items', 20);
function siports_add_admin_menu_items() {
    add_submenu_page(
        'siports-dashboard',
        'Mini-Sites',
        'Mini-Sites',
        'manage_options',
        'siports-minisites',
        'siports_admin_minisites'
    );
}

// Page d'administration des mini-sites
function siports_admin_minisites() {
    ?>
    <div class="wrap">
        <h1>SIPORTS 2026 - Gestion des Mini-Sites</h1>
        
        <div class="siports-admin-minisites">
            <div class="siports-admin-cards">
                <div class="siports-admin-card">
                    <h3>📊 Statistiques Mini-Sites</h3>
                    <p>5 Mini-sites actifs • 3 En attente de validation</p>
                    <button onclick="siportsSyncMinisites()" class="button button-primary">Synchroniser</button>
                </div>
                
                <div class="siports-admin-card">
                    <h3>📝 Modèles de Section</h3>
                    <p>8 types de sections disponibles</p>
                    <a href="<?php echo admin_url('admin.php?page=siports-sections'); ?>" class="button">Gérer les sections</a>
                </div>
                
                <div class="siports-admin-card">
                    <h3>📄 Créer des Pages</h3>
                    <p>Pages pour afficher les mini-sites</p>
                    <a href="<?php echo admin_url('post-new.php?post_type=page'); ?>" class="button">Nouvelle page</a>
                </div>
            </div>
            
            <div class="minisites-table-container">
                <h2>Liste des Mini-Sites</h2>
                
                <div class="tablenav top">
                    <div class="alignleft actions">
                        <select name="filter-status">
                            <option value="">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="pending">En attente</option>
                            <option value="draft">Brouillons</option>
                        </select>
                        
                        <select name="filter-sector">
                            <option value="">Tous les secteurs</option>
                            <option value="port-management">Gestion Portuaire</option>
                            <option value="equipment">Équipement</option>
                            <option value="logistics">Logistique</option>
                            <option value="maritime">Maritime</option>
                            <option value="digital">Digital & Technologie</option>
                        </select>
                        
                        <input type="submit" class="button" value="Filtrer">
                    </div>
                </div>
                
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Exposant</th>
                            <th>Secteur</th>
                            <th>Pays</th>
                            <th>Sections</th>
                            <th>Statut</th>
                            <th>Dernière Mise à Jour</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Port Solutions Inc.</strong></td>
                            <td>Gestion Portuaire</td>
                            <td>Maroc</td>
                            <td>7 sections</td>
                            <td><span class="status-active">Actif</span></td>
                            <td>2025-09-10</td>
                            <td>
                                <a href="#" class="button button-small">Modifier</a>
                                <a href="#" class="button button-small">Aperçu</a>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Maritime Tech Solutions</strong></td>
                            <td>Équipement</td>
                            <td>Pays-Bas</td>
                            <td>5 sections</td>
                            <td><span class="status-active">Actif</span></td>
                            <td>2025-09-08</td>
                            <td>
                                <a href="#" class="button button-small">Modifier</a>
                                <a href="#" class="button button-small">Aperçu</a>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Global Port Authority</strong></td>
                            <td>Institutionnel</td>
                            <td>International</td>
                            <td>5 sections</td>
                            <td><span class="status-active">Actif</span></td>
                            <td>2025-09-05</td>
                            <td>
                                <a href="#" class="button button-small">Modifier</a>
                                <a href="#" class="button button-small">Aperçu</a>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Eco Maritime Systems</strong></td>
                            <td>Développement Durable</td>
                            <td>Allemagne</td>
                            <td>5 sections</td>
                            <td><span class="status-pending">En attente</span></td>
                            <td>2025-09-02</td>
                            <td>
                                <a href="#" class="button button-small">Modifier</a>
                                <a href="#" class="button button-small">Aperçu</a>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Digital Harbor</strong></td>
                            <td>Digital & Technologie</td>
                            <td>Singapour</td>
                            <td>5 sections</td>
                            <td><span class="status-active">Actif</span></td>
                            <td>2025-08-28</td>
                            <td>
                                <a href="#" class="button button-small">Modifier</a>
                                <a href="#" class="button button-small">Aperçu</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="siports-admin-guide">
                <h2>Guide d'Utilisation</h2>
                
                <div class="guide-content">
                    <p>Les mini-sites sont des espaces web personnalisés pour chaque exposant de SIPORTS 2026. Vous pouvez les intégrer à votre site WordPress de plusieurs façons :</p>
                    
                    <h3>Utiliser les shortcodes</h3>
                    <ul>
                        <li><code>[siports_minisites]</code> - Affiche une liste de mini-sites</li>
                        <li><code>[siports_minisite id="port-solutions"]</code> - Affiche un mini-site spécifique</li>
                    </ul>
                    
                    <h3>Utiliser les templates de page</h3>
                    <p>Créez une nouvelle page et sélectionnez l'un des templates suivants :</p>
                    <ul>
                        <li>"SIPORTS - Page Mini-Sites" - Pour afficher une liste de mini-sites avec filtres</li>
                        <li>"SIPORTS - Page Exposants" - Pour afficher tous les exposants par pavillon</li>
                    </ul>
                    
                    <p><a href="<?php echo SIPORTS_PLUGIN_URL; ?>docs/MINISITES-GUIDE.html" target="_blank" class="button button-primary">Consulter le guide complet</a></p>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        .siports-admin-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .siports-admin-card {
            background: #fff;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .minisites-table-container {
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 30px;
        }
        
        .status-active {
            background: #d4edda;
            color: #155724;
            padding: 3px 8px;
            border-radius: 3px;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
            padding: 3px 8px;
            border-radius: 3px;
        }
        
        .siports-admin-guide {
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
    
    <script>
        function siportsSyncMinisites() {
            // Code JavaScript pour synchroniser les mini-sites
            alert('Synchronisation des mini-sites en cours...');
        }
    </script>
    <?php
}

// Ajouter le shortcode pour les mini-sites dans la page des shortcodes
add_action('siports_display_shortcodes', 'siports_display_minisite_shortcodes');
function siports_display_minisite_shortcodes() {
    ?>
    <div class="shortcode-item">
        <h3>9. [siports_minisites] - Liste des Mini-Sites</h3>
        <p><strong>Paramètres :</strong></p>
        <ul>
            <li><code>sector</code> - Secteur d'activité (port-management, equipment, logistics, etc.)</li>
            <li><code>country</code> - Pays d'origine</li>
            <li><code>limit</code> - Nombre de mini-sites à afficher (défaut: 12)</li>
            <li><code>layout</code> - Mise en page (grid, list)</li>
            <li><code>featured</code> - Mini-sites premium uniquement (true/false)</li>
        </ul>
        <code>[siports_minisites sector="port-management" limit="6" layout="grid"]</code>
    </div>
    
    <div class="shortcode-item">
        <h3>10. [siports_minisite] - Mini-Site Individuel</h3>
        <p><strong>Paramètres :</strong></p>
        <ul>
            <li><code>id</code> - Identifiant unique du mini-site</li>
            <li><code>slug</code> - Slug du mini-site (alternative à l'id)</li>
        </ul>
        <code>[siports_minisite id="port-solutions"]</code>
    </div>
    <?php
}

// Helpers pour le rendu des sections de mini-site
require_once SIPORTS_PLUGIN_PATH . 'templates/minisite-sections.php';

// Ajouter des styles CSS et scripts JS spécifiques aux mini-sites
add_action('wp_enqueue_scripts', 'siports_enqueue_minisite_assets');
function siports_enqueue_minisite_assets() {
    if (is_page() || is_single()) {
        // CSS pour les mini-sites
        wp_enqueue_style(
            'siports-minisites',
            SIPORTS_PLUGIN_URL . 'assets/css/minisites.css',
            array(),
            SIPORTS_VERSION
        );
        
        // JavaScript pour les mini-sites
        wp_enqueue_script(
            'siports-minisites',
            SIPORTS_PLUGIN_URL . 'assets/js/minisites.js',
            array('jquery'),
            SIPORTS_VERSION,
            true
        );
    }
}

// Fonctions utilitaires pour les mini-sites
function siports_get_section_icon($section_type) {
    $icons = array(
        'about' => '👋',
        'products' => '🛒',
        'services' => '🔧',
        'team' => '👥',
        'gallery' => '📸',
        'testimonials' => '💬',
        'certifications' => '🏆',
        'contact' => '📞'
    );
    
    return isset($icons[$section_type]) ? $icons[$section_type] : '📄';
}

function siports_get_section_label($section_type) {
    $labels = array(
        'about' => 'À Propos',
        'products' => 'Produits',
        'services' => 'Services',
        'team' => 'Équipe',
        'gallery' => 'Galerie',
        'testimonials' => 'Témoignages',
        'certifications' => 'Certifications',
        'contact' => 'Contact'
    );
    
    return isset($labels[$section_type]) ? $labels[$section_type] : 'Section';
}

function siports_render_section($section) {
    // Utiliser les fonctions du fichier minisite-sections.php
    return siports_render_section($section);
}
