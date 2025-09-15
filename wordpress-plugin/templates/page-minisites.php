<?php
/**
 * Template Name: SIPORTS - Page Mini-Sites
 * Description: Template pour afficher la liste des mini-sites des exposants
 */

get_header();
?>

<div class="siports-page siports-minisites-page">
    <div class="siports-page-header">
        <div class="container">
            <h1 class="page-title"><?php the_title(); ?></h1>
            
            <?php if (get_field('page_subtitle')): ?>
                <p class="page-subtitle"><?php the_field('page_subtitle'); ?></p>
            <?php endif; ?>
            
            <!-- Statistiques -->
            <?php echo do_shortcode('[siports_stats show="exhibitors" animated="true" layout="horizontal"]'); ?>
        </div>
    </div>
    
    <div class="siports-page-content">
        <div class="container">
            <?php if (have_posts()): while (have_posts()): the_post(); ?>
                <div class="page-intro">
                    <?php the_content(); ?>
                </div>
            <?php endwhile; endif; ?>
            
            <!-- Filtres des mini-sites -->
            <div class="minisites-filters">
                <div class="filter-group">
                    <label for="sector-filter">Secteur</label>
                    <select id="sector-filter" class="filter-select">
                        <option value="">Tous les secteurs</option>
                        <option value="port-management">Gestion Portuaire</option>
                        <option value="equipment">Équipement</option>
                        <option value="logistics">Logistique</option>
                        <option value="maritime">Maritime</option>
                        <option value="digital">Digital & Technologie</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="minisite-country-filter">Pays</label>
                    <select id="minisite-country-filter" class="filter-select">
                        <option value="">Tous les pays</option>
                        <!-- Options générées dynamiquement par JavaScript -->
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="minisite-search">Recherche</label>
                    <input type="text" id="minisite-search" placeholder="Nom d'exposant...">
                </div>
                
                <button id="reset-minisite-filters" class="siports-btn siports-btn-outline">Réinitialiser</button>
            </div>
            
            <!-- Liste des mini-sites -->
            <div class="minisites-grid">
                <?php echo do_shortcode('[siports_minisites limit="15" layout="grid"]'); ?>
            </div>
            
            <!-- Pagination -->
            <div class="siports-pagination">
                <button class="pagination-prev siports-btn siports-btn-outline">Précédent</button>
                <div class="pagination-numbers">
                    <span class="pagination-current">1</span> / <span class="pagination-total">5</span>
                </div>
                <button class="pagination-next siports-btn siports-btn-outline">Suivant</button>
            </div>
            
            <!-- Call to Action -->
            <div class="create-minisite-cta">
                <div class="cta-content">
                    <h2>Créez votre Mini-Site d'Exposant</h2>
                    <p>Présentez votre entreprise, vos produits et services aux visiteurs de SIPORTS 2026.</p>
                    <p>Chaque exposant a droit à un mini-site personnalisable inclus dans son forfait de participation.</p>
                    
                    <div class="cta-buttons">
                        <a href="#" class="siports-btn siports-btn-primary">Créer mon Mini-Site</a>
                        <a href="#" class="siports-btn siports-btn-outline">En savoir plus</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// JavaScript pour les filtres de mini-sites
document.addEventListener('DOMContentLoaded', function() {
    // Code pour filtrer les mini-sites
    // Ce code sera remplacé par le vrai JavaScript du plugin
});
</script>

<?php get_footer(); ?>
