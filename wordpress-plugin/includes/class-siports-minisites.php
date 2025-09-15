<?php
/**
 * Fonctions pour gérer les mini-sites dans le plugin SIPORTS
 * Ce fichier étend les fonctionnalités du plugin principal
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe pour gérer les mini-sites
 */
class SiportsMinisites {
    
    /**
     * Initialisation de la classe
     */
    public function __construct() {
        add_shortcode('siports_minisites', array($this, 'minisites_shortcode'));
        add_shortcode('siports_minisite', array($this, 'minisite_shortcode'));
        
        // Action pour récupérer un mini-site par AJAX
        add_action('wp_ajax_siports_get_minisite', array($this, 'ajax_get_minisite'));
        add_action('wp_ajax_nopriv_siports_get_minisite', array($this, 'ajax_get_minisite'));
        
        // Ajout d'une action pour les assets CSS et JS
        add_action('wp_enqueue_scripts', array($this, 'enqueue_minisite_assets'));
    }
    
    /**
     * Enqueue les assets CSS et JS pour les mini-sites
     */
    public function enqueue_minisite_assets() {
        wp_enqueue_style(
            'siports-minisites',
            SIPORTS_PLUGIN_URL . 'assets/minisites.css',
            array('siports-styles'),
            SIPORTS_VERSION
        );
        
        wp_enqueue_script(
            'siports-minisites',
            SIPORTS_PLUGIN_URL . 'assets/minisites.js',
            array('jquery', 'siports-script'),
            SIPORTS_VERSION,
            true
        );
        
        // Ajouter des variables pour l'AJAX
        wp_localize_script('siports-minisites', 'siports_minisites', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('siports_minisite_nonce')
        ));
    }
    
    /**
     * Shortcode pour afficher la liste des mini-sites
     */
    public function minisites_shortcode($atts) {
        $atts = shortcode_atts(array(
            'sector' => '',
            'country' => '',
            'limit' => 12,
            'layout' => 'grid',
            'featured' => 'false',
            'orderby' => 'name'
        ), $atts);
        
        $minisites = $this->get_minisites_data($atts);
        
        ob_start();
        ?>
        <div class="siports-minisites siports-layout-<?php echo esc_attr($atts['layout']); ?>">
            <?php if (empty($minisites)): ?>
                <div class="siports-no-results">
                    <p>Aucun mini-site trouvé pour les critères sélectionnés.</p>
                </div>
            <?php else: ?>
                <div class="siports-minisites-grid">
                    <?php foreach ($minisites as $minisite): ?>
                        <div class="siports-minisite-card siports-item" 
                             data-sector="<?php echo esc_attr($minisite['sector']); ?>"
                             data-country="<?php echo esc_attr($minisite['country']); ?>">
                            
                            <div class="minisite-header">
                                <?php if (!empty($minisite['logo'])): ?>
                                    <img src="<?php echo esc_url($minisite['logo']); ?>" 
                                         alt="<?php echo esc_attr($minisite['name']); ?>" 
                                         class="minisite-logo">
                                <?php else: ?>
                                    <div class="minisite-logo-placeholder">
                                        <?php echo esc_html(substr($minisite['name'], 0, 1)); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="minisite-info">
                                    <h3><?php echo esc_html($minisite['name']); ?></h3>
                                    <p class="minisite-sector"><?php echo esc_html($minisite['sector']); ?></p>
                                    <p class="minisite-country"><?php echo esc_html($minisite['country']); ?></p>
                                </div>
                                
                                <?php if ($minisite['featured']): ?>
                                    <span class="featured-badge">⭐ Premium</span>
                                <?php endif; ?>
                            </div>
                            
                            <div class="minisite-preview">
                                <?php if (!empty($minisite['sections'])): ?>
                                    <div class="minisite-sections">
                                        <ul>
                                            <?php foreach ($minisite['sections'] as $section): ?>
                                                <li>
                                                    <span class="section-icon"><?php echo $this->get_section_icon($section['type']); ?></span>
                                                    <span class="section-name"><?php echo esc_html($this->get_section_label($section['type'])); ?></span>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($minisite['description'])): ?>
                                    <p class="minisite-description"><?php echo esc_html(wp_trim_words($minisite['description'], 20)); ?></p>
                                <?php endif; ?>
                            </div>
                            
                            <div class="minisite-actions">
                                <a href="<?php echo esc_url($minisite['url']); ?>" class="siports-btn siports-btn-primary">
                                    Voir le Mini-Site
                                </a>
                                
                                <a href="#" class="siports-btn siports-btn-outline" 
                                   onclick="siportsContact('<?php echo esc_js($minisite['id']); ?>')">
                                    📧 Contact
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Shortcode pour afficher un mini-site individuel
     */
    public function minisite_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'slug' => ''
        ), $atts);
        
        if (empty($atts['id']) && empty($atts['slug'])) {
            return '<p class="siports-error">Erreur: ID ou slug du mini-site manquant.</p>';
        }
        
        $minisite_id = !empty($atts['id']) ? $atts['id'] : $atts['slug'];
        $minisite = $this->get_minisite_data($minisite_id);
        
        if (empty($minisite)) {
            return '<p class="siports-error">Mini-site non trouvé.</p>';
        }
        
        ob_start();
        
        // Inclure le template du mini-site
        include SIPORTS_PLUGIN_PATH . 'templates/minisite.php';
        
        return ob_get_clean();
    }
    
    /**
     * Récupère les données des mini-sites depuis l'API
     */
    public function get_minisites_data($params = array()) {
        // En production, cette fonction ferait un appel à l'API ou à la base de données
        // Pour l'exemple, nous retournons des données statiques
        
        return array(
            array(
                'id' => 'port-solutions',
                'name' => 'Port Solutions Inc.',
                'sector' => 'Gestion Portuaire',
                'country' => 'Maroc',
                'logo' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
                'description' => 'Solutions intégrées de gestion portuaire, spécialisées dans la transformation digitale.',
                'featured' => true,
                'url' => home_url('/exposants/mini-sites/port-solutions/'),
                'sections' => array(
                    array('type' => 'about'),
                    array('type' => 'products'),
                    array('type' => 'services'),
                    array('type' => 'gallery'),
                    array('type' => 'testimonials'),
                    array('type' => 'certifications'),
                    array('type' => 'contact')
                )
            ),
            array(
                'id' => 'maritime-tech',
                'name' => 'Maritime Tech Solutions',
                'sector' => 'Équipement',
                'country' => 'Pays-Bas',
                'logo' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
                'description' => 'Fabricant innovant d\'équipements portuaires et de systèmes d\'automatisation.',
                'featured' => false,
                'url' => home_url('/exposants/mini-sites/maritime-tech/'),
                'sections' => array(
                    array('type' => 'about'),
                    array('type' => 'products'),
                    array('type' => 'team'),
                    array('type' => 'gallery'),
                    array('type' => 'contact')
                )
            ),
            array(
                'id' => 'global-port',
                'name' => 'Global Port Authority',
                'sector' => 'Institutionnel',
                'country' => 'International',
                'logo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                'description' => 'Organisation internationale promouvant le développement portuaire durable.',
                'featured' => true,
                'url' => home_url('/exposants/mini-sites/global-port/'),
                'sections' => array(
                    array('type' => 'about'),
                    array('type' => 'services'),
                    array('type' => 'team'),
                    array('type' => 'certifications'),
                    array('type' => 'contact')
                )
            ),
            array(
                'id' => 'eco-maritime',
                'name' => 'Eco Maritime Systems',
                'sector' => 'Développement Durable',
                'country' => 'Allemagne',
                'logo' => 'https://images.unsplash.com/photo-1602133187081-4874fdbd555c?w=200',
                'description' => 'Solutions écologiques pour les ports et le transport maritime.',
                'featured' => false,
                'url' => home_url('/exposants/mini-sites/eco-maritime/'),
                'sections' => array(
                    array('type' => 'about'),
                    array('type' => 'services'),
                    array('type' => 'gallery'),
                    array('type' => 'testimonials'),
                    array('type' => 'contact')
                )
            ),
            array(
                'id' => 'digital-harbor',
                'name' => 'Digital Harbor',
                'sector' => 'Digital & Technologie',
                'country' => 'Singapour',
                'logo' => 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
                'description' => 'Plateforme digitale pour l\'optimisation des opérations portuaires.',
                'featured' => true,
                'url' => home_url('/exposants/mini-sites/digital-harbor/'),
                'sections' => array(
                    array('type' => 'about'),
                    array('type' => 'products'),
                    array('type' => 'services'),
                    array('type' => 'certifications'),
                    array('type' => 'contact')
                )
            )
        );
    }
    
    /**
     * Récupère les données d'un mini-site spécifique
     */
    public function get_minisite_data($minisite_id) {
        // En production, cette fonction ferait un appel à l'API ou à la base de données
        // Pour l'exemple, nous simulons une recherche
        
        $minisites = $this->get_minisites_data();
        
        foreach ($minisites as $minisite) {
            if ($minisite['id'] === $minisite_id) {
                // Ajouter des données supplémentaires pour un mini-site spécifique
                $minisite['website'] = 'https://www.' . $minisite_id . '.com';
                $minisite['badges'] = array(
                    array('type' => 'verified', 'label' => 'Vérifié'),
                    array('type' => 'exhibitor', 'label' => 'Exposant')
                );
                
                // Enrichir les sections avec leurs contenus
                foreach ($minisite['sections'] as $key => $section) {
                    $minisite['sections'][$key]['content'] = $this->get_section_content($section['type'], $minisite['id']);
                }
                
                return $minisite;
            }
        }
        
        return null;
    }
    
    /**
     * Récupère le contenu d'une section de mini-site
     */
    public function get_section_content($section_type, $minisite_id) {
        // Dans une vraie implémentation, ces données viendraient de l'API ou de la base de données
        // Ici nous simulons des contenus statiques pour chaque type de section
        
        switch ($section_type) {
            case 'about':
                return array(
                    'title' => 'À Propos de Nous',
                    'subtitle' => 'Excellence et Innovation dans le Secteur Maritime',
                    'description' => 'Notre entreprise est à l\'avant-garde des solutions portuaires depuis plus de 20 ans. Nous combinons expertise, innovation et engagement pour offrir des services de classe mondiale. Notre équipe internationale travaille avec des ports du monde entier pour optimiser leurs opérations et favoriser un développement durable.',
                    'image' => 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343',
                    'highlights' => array(
                        'Présence dans plus de 15 pays',
                        'Plus de 200 projets portuaires réalisés',
                        'Certifications ISO 9001, 14001 et 27001',
                        'Équipe de 150 experts internationaux'
                    )
                );
                
            case 'products':
                return array(
                    'title' => 'Nos Produits',
                    'description' => 'Découvrez notre gamme de solutions innovantes pour le secteur portuaire',
                    'items' => array(
                        array(
                            'name' => 'PortControl Pro',
                            'category' => 'Logiciel de Gestion',
                            'description' => 'Système intégré de gestion portuaire avec modules pour les opérations, la planification et la sécurité.',
                            'image' => 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400',
                            'features' => array(
                                'Interface utilisateur intuitive',
                                'Modules personnalisables',
                                'Intégration avec les systèmes existants',
                                'Analyse prédictive des flux'
                            )
                        ),
                        array(
                            'name' => 'SmartDock',
                            'category' => 'Équipement',
                            'description' => 'Système d\'amarrage automatisé permettant des opérations plus sûres et plus efficaces.',
                            'image' => 'https://images.unsplash.com/photo-1571150715311-bba22ccdbe7d?w=400',
                            'features' => array(
                                'Réduction du temps d\'amarrage de 40%',
                                'Système de sécurité avancé',
                                'Surveillance en temps réel',
                                'Économies d\'énergie significatives'
                            )
                        ),
                        array(
                            'name' => 'EcoFuel',
                            'category' => 'Énergie',
                            'description' => 'Solution d\'approvisionnement en carburants alternatifs pour navires de nouvelle génération.',
                            'image' => 'https://images.unsplash.com/photo-1620294121891-bb6a81eac7f8?w=400',
                            'features' => array(
                                'Compatible avec LNG, biofuels et hydrogène',
                                'Système de monitoring environnemental',
                                'Infrastructure modulaire',
                                'Certification écologique'
                            )
                        )
                    )
                );
                
            case 'services':
                return array(
                    'title' => 'Nos Services',
                    'description' => 'Une gamme complète de services pour optimiser vos opérations portuaires',
                    'items' => array(
                        array(
                            'name' => 'Conseil Stratégique',
                            'description' => 'Accompagnement des autorités portuaires dans l\'élaboration de leur vision stratégique et plans de développement.',
                            'icon' => '📋',
                            'benefits' => array(
                                'Analyse de marché approfondie',
                                'Benchmarking international',
                                'Planification à long terme',
                                'Stratégies d\'investissement optimisées'
                            )
                        ),
                        array(
                            'name' => 'Optimisation Opérationnelle',
                            'description' => 'Analyse et amélioration des processus opérationnels pour maximiser l\'efficacité et réduire les coûts.',
                            'icon' => '⚙️',
                            'benefits' => array(
                                'Réduction des temps d\'attente',
                                'Amélioration de la productivité',
                                'Gestion optimisée des ressources',
                                'Automatisation des processus clés'
                            )
                        ),
                        array(
                            'name' => 'Formation Spécialisée',
                            'description' => 'Programmes de formation sur mesure pour le personnel portuaire à tous les niveaux hiérarchiques.',
                            'icon' => '🎓',
                            'benefits' => array(
                                'Modules adaptés aux besoins spécifiques',
                                'Formateurs experts internationaux',
                                'Méthodes pédagogiques innovantes',
                                'Certification reconnue mondialement'
                            )
                        ),
                        array(
                            'name' => 'Transition Écologique',
                            'description' => 'Accompagnement des ports dans leur démarche de développement durable et transition énergétique.',
                            'icon' => '🌱',
                            'benefits' => array(
                                'Audit environnemental complet',
                                'Solutions bas-carbone',
                                'Gestion durable des ressources',
                                'Conformité aux normes internationales'
                            )
                        )
                    )
                );
                
            case 'team':
                return array(
                    'title' => 'Notre Équipe',
                    'description' => 'Des experts passionnés au service de l\'excellence portuaire',
                    'members' => array(
                        array(
                            'name' => 'Jean Dupont',
                            'position' => 'Directeur Général',
                            'photo' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
                            'bio' => 'Plus de 25 ans d\'expérience dans le secteur maritime et portuaire. Ancien directeur de l\'Autorité Portuaire de Rotterdam.',
                            'contacts' => array(
                                'email' => 'jean.dupont@example.com',
                                'linkedin' => 'https://linkedin.com/in/jeandupont'
                            )
                        ),
                        array(
                            'name' => 'Maria Garcia',
                            'position' => 'Directrice Technique',
                            'photo' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
                            'bio' => 'Ingénieure en génie maritime avec une spécialisation en automatisation portuaire. A dirigé de nombreux projets d\'innovation technologique.',
                            'contacts' => array(
                                'email' => 'maria.garcia@example.com',
                                'linkedin' => 'https://linkedin.com/in/mariagarcia'
                            )
                        ),
                        array(
                            'name' => 'Mohammed Al-Farsi',
                            'position' => 'Directeur Commercial',
                            'photo' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
                            'bio' => 'Expert en développement commercial international avec une connaissance approfondie des marchés émergents, particulièrement au Moyen-Orient et en Afrique.',
                            'contacts' => array(
                                'email' => 'mohammed.alfarsi@example.com',
                                'linkedin' => 'https://linkedin.com/in/mohammedalfarsi'
                            )
                        ),
                        array(
                            'name' => 'Sophia Chen',
                            'position' => 'Responsable R&D',
                            'photo' => 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300',
                            'bio' => 'Docteure en informatique spécialisée dans l\'intelligence artificielle appliquée à la logistique maritime. Auteure de nombreuses publications scientifiques.',
                            'contacts' => array(
                                'email' => 'sophia.chen@example.com',
                                'linkedin' => 'https://linkedin.com/in/sophiachen'
                            )
                        )
                    )
                );
                
            case 'gallery':
                return array(
                    'title' => 'Galerie & Réalisations',
                    'description' => 'Découvrez nos projets et réalisations en images',
                    'images' => array(
                        array(
                            'url' => 'https://images.unsplash.com/photo-1520363147827-3f2a8da130e1',
                            'caption' => 'Installation de systèmes de navigation dans le port de Rotterdam'
                        ),
                        array(
                            'url' => 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7',
                            'caption' => 'Centre de contrôle du trafic maritime à Singapour'
                        ),
                        array(
                            'url' => 'https://images.unsplash.com/photo-1602193290354-b5df40aa39a4',
                            'caption' => 'Système d\'automatisation portuaire à Dubai'
                        ),
                        array(
                            'url' => 'https://images.unsplash.com/photo-1574100004036-f0807f2d2ee6',
                            'caption' => 'Installation de notre système EcoFuel à Hambourg'
                        ),
                        array(
                            'url' => 'https://images.unsplash.com/photo-1577538094727-cf3a5afa1fca',
                            'caption' => 'Formation du personnel portuaire au Maroc'
                        ),
                        array(
                            'url' => 'https://images.unsplash.com/photo-1606159010008-7c7dfa3e0ba8',
                            'caption' => 'Déploiement de la solution SmartDock à Barcelone'
                        )
                    )
                );
                
            case 'testimonials':
                return array(
                    'title' => 'Témoignages Clients',
                    'description' => 'Ce que disent nos partenaires de nos solutions',
                    'items' => array(
                        array(
                            'name' => 'Jean Dupont',
                            'position' => 'Directeur des Opérations, Port de Marseille',
                            'text' => 'Depuis l\'installation de leurs systèmes, nous avons constaté une amélioration de 30% de notre efficacité opérationnelle. Un investissement qui a rapidement porté ses fruits.',
                            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                        ),
                        array(
                            'name' => 'Marie Lambert',
                            'position' => 'Responsable Logistique, Compagnie Maritime Internationale',
                            'text' => 'Leur service client est exceptionnel. Même face à des défis techniques complexes, leur équipe a toujours su trouver des solutions adaptées à nos besoins spécifiques.',
                            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
                        ),
                        array(
                            'name' => 'Ahmed Khalil',
                            'position' => 'CEO, Dubai Port Authority',
                            'text' => 'Une collaboration fructueuse qui dure depuis plus de 5 ans. Leur capacité d\'innovation et leur compréhension des enjeux portuaires en font un partenaire stratégique incontournable.',
                            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                        )
                    )
                );
                
            case 'certifications':
                return array(
                    'title' => 'Certifications & Accréditations',
                    'description' => 'Nos compétences reconnues par les meilleurs organismes du secteur',
                    'items' => array(
                        array(
                            'name' => 'ISO 9001',
                            'description' => 'Certification de management de la qualité',
                            'image' => 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200',
                            'year' => '2022'
                        ),
                        array(
                            'name' => 'ISO 14001',
                            'description' => 'Système de management environnemental',
                            'image' => 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=200',
                            'year' => '2021'
                        ),
                        array(
                            'name' => 'OHSAS 18001',
                            'description' => 'Système de management de la santé et de la sécurité au travail',
                            'image' => 'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b01?w=200',
                            'year' => '2023'
                        ),
                        array(
                            'name' => 'ISO 27001',
                            'description' => 'Management de la sécurité de l\'information',
                            'image' => 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200',
                            'year' => '2022'
                        )
                    )
                );
                
            case 'contact':
                return array(
                    'title' => 'Contactez-Nous',
                    'subtitle' => 'Notre équipe est à votre disposition pour répondre à vos questions',
                    'address' => "123 Port Avenue\nTech Park, Building C\n20250 Casablanca\nMaroc",
                    'phone' => '+212 522 123 456',
                    'email' => 'contact@' . $minisite_id . '.com',
                    'hours' => "Lundi - Vendredi: 9h00 - 18h00\nSamedi: 9h00 - 12h00\nDimanche: Fermé",
                    'exhibitor_id' => $minisite_id
                );
                
            default:
                return array(
                    'title' => 'Section',
                    'description' => 'Contenu non disponible pour cette section.'
                );
        }
    }
    
    /**
     * Récupère l'icône pour un type de section
     */
    public function get_section_icon($section_type) {
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
    
    /**
     * Récupère le label pour un type de section
     */
    public function get_section_label($section_type) {
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
    
    /**
     * Gestion de la requête AJAX pour récupérer un mini-site
     */
    public function ajax_get_minisite() {
        check_ajax_referer('siports_minisite_nonce', 'nonce');
        
        $minisite_id = sanitize_text_field($_POST['minisite_id']);
        $minisite = $this->get_minisite_data($minisite_id);
        
        if (empty($minisite)) {
            wp_send_json_error(array('message' => 'Mini-site non trouvé'));
        } else {
            wp_send_json_success($minisite);
        }
    }
}

// Initialiser la classe des mini-sites
$siports_minisites = new SiportsMinisites();
