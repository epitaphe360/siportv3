<?php
/**
 * Template Name: SIPORTS - Page Exposants
 * Description: Template pour afficher la liste des exposants du salon SIPORTS
 */

get_header();
?>

<div class="siports-page siports-exhibitors-page">
    <div class="siports-page-header">
        <div class="container">
            <h1 class="page-title"><?php the_title(); ?></h1>
            
            <?php if (get_field('page_subtitle')): ?>
                <p class="page-subtitle"><?php the_field('page_subtitle'); ?></p>
            <?php endif; ?>
            
            <!-- Statistiques -->
            <?php echo do_shortcode('[siports_stats show="exhibitors,countries" animated="true" layout="horizontal"]'); ?>
        </div>
    </div>
    
    <div class="siports-page-content">
        <div class="container">
            <?php if (have_posts()): while (have_posts()): the_post(); ?>
                <div class="page-intro">
                    <?php the_content(); ?>
                </div>
            <?php endwhile; endif; ?>
            
            <!-- Filtres des exposants -->
            <div class="exhibitors-filters">
                <div class="filter-group">
                    <label for="category-filter">Catégorie</label>
                    <select id="category-filter" class="filter-select">
                        <option value="">Toutes les catégories</option>
                        <option value="institutional">Institutionnel</option>
                        <option value="port-industry">Industrie Portuaire</option>
                        <option value="port-operations">Opérations Portuaires</option>
                        <option value="academic">Académique</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="country-filter">Pays</label>
                    <select id="country-filter" class="filter-select">
                        <option value="">Tous les pays</option>
                        <!-- Options générées dynamiquement par JavaScript -->
                    </select>
                </div>
                
                <div class="filter-group filter-featured">
                    <label class="checkbox-label">
                        <input type="checkbox" id="featured-filter">
                        Exposants à la une
                    </label>
                </div>
                
                <button id="reset-filters" class="siports-btn siports-btn-outline">Réinitialiser</button>
            </div>
            
            <!-- Pavillon Institutionnel -->
            <section class="exhibitor-section">
                <h2 class="section-title">Pavillon Institutionnel</h2>
                <p class="section-description">Autorités portuaires, organisations gouvernementales et internationales</p>
                <?php echo do_shortcode('[siports_exhibitors category="institutional" limit="12" layout="grid"]'); ?>
            </section>
            
            <!-- Pavillon Industrie Portuaire -->
            <section class="exhibitor-section">
                <h2 class="section-title">Pavillon Industrie Portuaire</h2>
                <p class="section-description">Fabricants d'équipements, solutions technologiques et innovation</p>
                <?php echo do_shortcode('[siports_exhibitors category="port-industry" limit="12" layout="grid"]'); ?>
            </section>
            
            <!-- Pavillon Opérations Portuaires -->
            <section class="exhibitor-section">
                <h2 class="section-title">Pavillon Opérations Portuaires</h2>
                <p class="section-description">Gestion portuaire, logistique, opérateurs et services</p>
                <?php echo do_shortcode('[siports_exhibitors category="port-operations" limit="12" layout="grid"]'); ?>
            </section>
            
            <!-- Pavillon Académique -->
            <section class="exhibitor-section">
                <h2 class="section-title">Pavillon Académique</h2>
                <p class="section-description">Universités, centres de recherche et formation</p>
                <?php echo do_shortcode('[siports_exhibitors category="academic" limit="12" layout="grid"]'); ?>
            </section>
            
            <!-- Devenez exposant -->
            <div class="become-exhibitor">
                <div class="become-exhibitor-content">
                    <h2>Devenez Exposant à SIPORTS 2026</h2>
                    <p>Rejoignez plus de 300 exposants internationaux et présentez vos solutions portuaires innovantes lors du plus grand salon maritime d'Afrique.</p>
                    
                    <a href="#" class="siports-btn siports-btn-primary">Télécharger la brochure</a>
                    <a href="#" class="siports-btn siports-btn-outline">Demander un devis</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// JavaScript pour les filtres d'exposants
document.addEventListener('DOMContentLoaded', function() {
    // Code pour filtrer les exposants et générer les options de pays
    // Ce code sera remplacé par le vrai JavaScript du plugin
});
</script>

<?php get_footer(); ?>
