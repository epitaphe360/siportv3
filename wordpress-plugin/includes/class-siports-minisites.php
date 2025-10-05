<?php
/**
 * Fonctions pour gérer les mini-sites dans le plugin SIPORTS
 * Ce fichier étend les fonctionnalités du plugin principal
 */

// Sécurité WordPress
if (!defined("ABSPATH")) {
    exit;
}

// Inclure la classe d'API Supabase
require_once SIPORTS_PLUGIN_PATH . 'includes/class-siports-supabase-api.php';

/**
 * Classe pour gérer les mini-sites
 */
class SiportsMinisites {
    
    private $supabase_api;

    /**
     * Initialisation de la classe
     */
    public function __construct() {
        $this->supabase_api = new Siports_Supabase_API();
        add_shortcode("siports_minisites", array($this, "minisites_shortcode"));
        add_shortcode("siports_minisite", array($this, "minisite_shortcode"));
        
        // Action pour récupérer un mini-site par AJAX
        add_action("wp_ajax_siports_get_minisite", array($this, "ajax_get_minisite"));
        add_action("wp_ajax_nopriv_siports_get_minisite", array($this, "ajax_get_minisite"));
        
        // Ajout d'une action pour les assets CSS et JS
        add_action("wp_enqueue_scripts", array($this, "enqueue_minisite_assets"));
    }
    
    /**
     * Enqueue les assets CSS et JS pour les mini-sites
     */
    public function enqueue_minisite_assets() {
        wp_enqueue_style(
            "siports-minisites",
            SIPORTS_PLUGIN_URL . "assets/minisites.css",
            array("siports-styles"),
            SIPORTS_VERSION
        );
        
        wp_enqueue_script(
            "siports-minisites",
            SIPORTS_PLUGIN_URL . "assets/minisites.js",
            array("jquery", "siports-script"),
            SIPORTS_VERSION,
            true
        );
        
        // Ajouter des variables pour l'AJAX
        wp_localize_script("siports-minisites", "siports_minisites", array(
            "ajax_url" => admin_url("admin-ajax.php"),
            "nonce" => wp_create_nonce("siports_minisite_nonce")
        ));
    }
    
    /**
     * Shortcode pour afficher la liste des mini-sites
     */
    public function minisites_shortcode($atts) {
        $atts = shortcode_atts(array(
            "sector" => "",
            "country" => "",
            "limit" => 12,
            "layout" => "grid",
            "featured" => "false",
            "orderby" => "name"
        ), $atts);
        
        $minisites = $this->get_minisites_data($atts);
        
        ob_start();
        ?>
        <div class="siports-minisites siports-layout-<?php echo esc_attr($atts["layout"]); ?>">
            <?php if (empty($minisites)): ?>
                <div class="siports-no-results">
                    <p>Aucun mini-site trouvé pour les critères sélectionnés.</p>
                </div>
            <?php else: ?>
                <div class="siports-minisites-grid">
                    <?php foreach ($minisites as $minisite): ?>
                        <div class="siports-minisite-card siports-item" 
                             data-sector="<?php echo esc_attr($minisite["sector"]); ?>"
                             data-country="<?php echo esc_attr($minisite["country"]); ?>">
                            
                            <div class="minisite-header">
                                <?php if (!empty($minisite["logo"])): ?>
                                    <img src="<?php echo esc_url($minisite["logo"]); ?>" 
                                         alt="<?php echo esc_attr($minisite["name"]); ?>" 
                                         class="minisite-logo">
                                <?php else: ?>
                                    <div class="minisite-logo-placeholder">
                                        <?php echo esc_html(substr($minisite["name"], 0, 1)); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="minisite-info">
                                    <h3><?php echo esc_html($minisite["name"]); ?></h3>
                                    <p class="minisite-sector"><?php echo esc_html($minisite["sector"]); ?></p>
                                    <p class="minisite-country"><?php echo esc_html($minisite["country"]); ?></p>
                                </div>
                                
                                <?php if ($minisite["featured"]): ?>
                                    <span class="featured-badge">⭐ Premium</span>
                                <?php endif; ?>
                            </div>
                            
                            <div class="minisite-preview">
                                <?php if (!empty($minisite["sections"])): ?>
                                    <div class="minisite-sections">
                                        <ul>
                                            <?php foreach ($minisite["sections"] as $section): ?>
                                                <li>
                                                    <span class="section-icon"><?php echo $this->get_section_icon($section["type"]); ?></span>
                                                    <span class="section-name"><?php echo esc_html($this->get_section_label($section["type"])); ?></span>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($minisite["description"])): ?>
                                    <p class="minisite-description"><?php echo esc_html(wp_trim_words($minisite["description"], 20)); ?></p>
                                <?php endif; ?>
                            </div>
                            
                            <div class="minisite-actions">
                                <a href="<?php echo esc_url($minisite["url"]); ?>" class="siports-btn siports-btn-primary">
                                    Voir le Mini-Site
                                </a>
                                
                                <a href="#" class="siports-btn siports-btn-outline" 
                                   onclick="siportsContact('<?php echo esc_js($minisite["id"]); ?>')">
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
            "id" => "",
            "slug" => ""
        ), $atts);
        
        if (empty($atts["id"]) && empty($atts["slug"])) {
            return "<p class=\"siports-error\">Erreur: ID ou slug du mini-site manquant.</p>";
        }
        
        $minisite_id = !empty($atts["id"]) ? $atts["id"] : $atts["slug"];
        $minisite = $this->get_minisite_data($minisite_id);
        
        if (empty($minisite)) {
            return "<p class=\"siports-error\">Mini-site non trouvé.</p>";
        }
        
        ob_start();
        
        // Inclure le template du mini-site
        include SIPORTS_PLUGIN_PATH . "templates/minisite.php";
        
        return ob_get_clean();
    }
    
    /**
     * Récupère les données des mini-sites depuis l'API Supabase
     */
    public function get_minisites_data($params = array()) {
        if (!$this->supabase_api->is_configured()) {
            error_log("SIPORTS: Supabase API non configurée pour les mini-sites.");
            return [];
        }

        $exhibitors_data = $this->supabase_api->get_exhibitors($params);

        if (is_wp_error($exhibitors_data)) {
            error_log("SIPORTS: Erreur lors de la récupération des exposants depuis Supabase: " . $exhibitors_data->get_error_message());
            return [];
        }

        $minisites = [];
        foreach ($exhibitors_data as $exhibitor) {
            $minisites[] = $this->transform_exhibitor_to_minisite($exhibitor);
        }

        return $minisites;
    }
    
    /**
     * Récupère les données d'un mini-site spécifique depuis l'API Supabase
     */
    public function get_minisite_data($minisite_id) {
        if (!$this->supabase_api->is_configured()) {
            error_log("SIPORTS: Supabase API non configurée pour un mini-site spécifique.");
            return null;
        }

        $exhibitor_data = $this->supabase_api->get_exhibitor($minisite_id);

        if (is_wp_error($exhibitor_data)) {
            error_log("SIPORTS: Erreur lors de la récupération de l'exposant " . $minisite_id . " depuis Supabase: " . $exhibitor_data->get_error_message());
            return null;
        }

        if (empty($exhibitor_data)) {
            return null;
        }

        $minisite = $this->transform_exhibitor_to_minisite($exhibitor_data);
        
        // Enrichir les sections avec leurs contenus (peut être adapté si le contenu des sections vient aussi de Supabase)
        if (!empty($minisite["sections"])) {
            foreach ($minisite["sections"] as $key => $section) {
                $minisite["sections"][$key]["content"] = $this->get_section_content($section["type"], $minisite["id"]);
            }
        }

        return $minisite;
    }

    /**
     * Transforme les données d'un exposant Supabase en format mini-site
     */
    private function transform_exhibitor_to_minisite($exhibitor) {
        $minisite_url = home_url("/exposants/mini-sites/" . sanitize_title($exhibitor["company_name"]) . "/");
        
        // Assurez-vous que mini_site est un tableau et non un tableau de tableaux
        $mini_site_data = !empty($exhibitor["mini_site"]) ? (is_array($exhibitor["mini_site"][0]) ? $exhibitor["mini_site"][0] : $exhibitor["mini_site"]) : [];

        $sections = [];
        if (!empty($mini_site_data["sections"]) && is_array($mini_site_data["sections"])) {
            foreach ($mini_site_data["sections"] as $section) {
                $sections[] = ["type" => $section["type"] ?? ""];
            }
        }

        return [
            "id" => $exhibitor["id"],
            "name" => $exhibitor["company_name"],
            "sector" => $exhibitor["sector"],
            "country" => $exhibitor["contact_info"]["country"] ?? "", // Supposons que le pays est dans contact_info
            "logo" => $exhibitor["logo_url"],
            "description" => $exhibitor["description"],
            "featured" => $exhibitor["featured"] ?? false,
            "url" => $minisite_url,
            "sections" => $sections,
            "website" => $exhibitor["website"] ?? 
            "badges" => [
                ["type" => "verified", "label" => "Vérifié"],
                ["type" => "exhibitor", "label" => "Exposant"]
            ],
        ];
    }
    
    /**
     * Récupère le contenu d'une section de mini-site (peut encore être simulé ou venir de Supabase)
     */
    public function get_section_content($section_type, $minisite_id) {
        // Pour l'instant, nous laissons cette partie simulée, mais elle pourrait être connectée à Supabase
        // pour récupérer le contenu réel des sections du mini-site.
        
        switch ($section_type) {
            case "about":
                return array(
                    "title" => "À Propos de Nous",
                    "subtitle" => "Excellence et Innovation dans le Secteur Maritime",
                    "description" => "Notre entreprise est à l'avant-garde des solutions portuaires depuis plus de 20 ans. Nous combinons expertise, innovation et engagement pour offrir des services de classe mondiale. Notre équipe internationale travaille avec des ports du monde entier pour optimiser leurs opérations et favoriser un développement durable.",
                    "image" => "https://images.unsplash.com/photo-1590069261209-f8e9b8642343",
                    "highlights" => array(
                        "Présence dans plus de 15 pays",
                        "Plus de 200 projets portuaires réalisés",
                        "Certifications ISO 9001, 14001 et 27001",
                        "Équipe de 150 experts internationaux"
                    )
                );
                
            case "products":
                return array(
                    "title" => "Nos Produits",
                    "description" => "Découvrez notre gamme de solutions innovantes pour le secteur portuaire",
                    "items" => array(
                        array(
                            "name" => "PortControl Pro",
                            "category" => "Logiciel de Gestion",
                            "description" => "Système intégré de gestion portuaire avec modules pour les opérations, la planification et la sécurité.",
                            "image" => "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
                            "features" => array(
                                "Interface utilisateur intuitive",
                                "Modules personnalisables",
                                "Intégration avec les systèmes existants",
                                "Analyse prédictive des flux"
                            )
                        ),
                        array(
                            "name" => "SmartDock",
                            "category" => "Équipement",
                            "description" => "Système d'amarrage automatisé permettant des opérations plus sûres et plus efficaces.",
                            "image" => "https://images.unsplash.com/photo-1571150715311-bba22ccdbe7d?w=400",
                            "features" => array(
                                "Réduction du temps d'amarrage de 40%",
                                "Système de sécurité avancé",
                                "Surveillance en temps réel",
                                "Économies d'énergie significatives"
                            )
                        ),
                    )
                );
            case "services":
                return array(
                    "title" => "Nos Services",
                    "description" => "Une gamme complète de services pour optimiser vos opérations portuaires.",
                    "items" => array(
                        array(
                            "name" => "Conseil en Stratégie Portuaire",
                            "description" => "Accompagnement stratégique pour le développement et la modernisation des infrastructures portuaires.",
                            "icon" => "📊"
                        ),
                        array(
                            "name" => "Maintenance Prédictive",
                            "description" => "Utilisation de l'IA pour anticiper les pannes d'équipement et optimiser les cycles de maintenance.",
                            "icon" => "⚙️"
                        )
                    )
                );
            case "gallery":
                return array(
                    "title" => "Galerie",
                    "images" => array(
                        "https://images.unsplash.com/photo-1546069901-dcd9226f332a?w=600",
                        "https://images.unsplash.com/photo-1555939594-58d7ab87130f?w=600",
                        "https://images.unsplash.com/photo-154018954933-a1063e739542?w=600"
                    )
                );
            case "testimonials":
                return array(
                    "title" => "Témoignages",
                    "items" => array(
                        array(
                            "quote" => "Des solutions innovantes qui ont transformé notre efficacité opérationnelle.",
                            "author" => "Jean Dupont, Directeur du Port de Casablanca"
                        ),
                        array(
                            "quote" => "Un partenaire fiable et expert, nous recommandons vivement leurs services.",
                            "author" => "Marie Curie, Responsable Logistique"
                        )
                    )
                );
            case "certifications":
                return array(
                    "title" => "Certifications",
                    "items" => array(
                        array("name" => "ISO 9001", "description" => "Qualité"),
                        array("name" => "ISO 14001", "description" => "Environnement"),
                        array("name" => "ISO 27001", "description" => "Sécurité de l'information")
                    )
                );
            case "contact":
                return array(
                    "title" => "Contactez-nous",
                    "email" => "contact@portsolutions.com",
                    "phone" => "+212 522 123 456",
                    "address" => "123 Rue des Ports, Casablanca, Maroc"
                );
            case "team":
                return array(
                    "title" => "Notre Équipe",
                    "members" => array(
                        array("name" => "Ahmed Benali", "role" => "CEO", "image" => "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"),
                        array("name" => "Fatima Zahra", "role" => "CTO", "image" => "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200")
                    )
                );
            default:
                return array();
        }
    }

    /**
     * Retourne l'icône correspondant au type de section.
     */
    private function get_section_icon($type) {
        switch ($type) {
            case "about": return "ℹ️";
            case "products": return "📦";
            case "services": return "🛠️";
            case "gallery": return "📸";
            case "testimonials": return "💬";
            case "certifications": return "🏆";
            case "contact": return "📞";
            case "team": return "👥";
            default: return "📄";
        }
    }

    /**
     * Retourne le libellé correspondant au type de section.
     */
    private function get_section_label($type) {
        switch ($type) {
            case "about": return "À Propos";
            case "products": return "Produits";
            case "services": return "Services";
            case "gallery": return "Galerie";
            case "testimonials": return "Témoignages";
            case "certifications": return "Certifications";
            case "contact": return "Contact";
            case "team": return "Équipe";
            default: return ucfirst($type);
        }
    }
}

// Instancier la classe
new SiportsMinisites();

