<?php
/**
 * Template Name: SIPORTS - Page Programme
 * Description: Template pour afficher le programme des événements du salon SIPORTS
 */

get_header();
?>

<div class="siports-page siports-program-page">
    <div class="siports-page-header">
        <div class="container">
            <h1 class="page-title"><?php the_title(); ?></h1>
            
            <?php if (get_field('page_subtitle')): ?>
                <p class="page-subtitle"><?php the_field('page_subtitle'); ?></p>
            <?php endif; ?>
            
            <!-- Compte à rebours -->
            <?php echo do_shortcode('[siports_countdown show_days="true" show_hours="true" style="compact"]'); ?>
        </div>
    </div>
    
    <div class="siports-page-content">
        <div class="container">
            <?php if (have_posts()): while (have_posts()): the_post(); ?>
                <div class="page-intro">
                    <?php the_content(); ?>
                </div>
            <?php endwhile; endif; ?>
            
            <!-- Calendrier -->
            <div class="program-calendar">
                <div class="calendar-tabs">
                    <button class="calendar-tab active" data-day="all">Tous les jours</button>
                    <button class="calendar-tab" data-day="2026-02-05">Jour 1 (5 Fév)</button>
                    <button class="calendar-tab" data-day="2026-02-06">Jour 2 (6 Fév)</button>
                    <button class="calendar-tab" data-day="2026-02-07">Jour 3 (7 Fév)</button>
                </div>
                
                <div class="calendar-filters">
                    <div class="filter-group">
                        <label for="event-type-filter">Type d'événement</label>
                        <select id="event-type-filter" class="filter-select">
                            <option value="">Tous les types</option>
                            <option value="conference">Conférences</option>
                            <option value="workshop">Ateliers</option>
                            <option value="networking">Réseautage</option>
                            <option value="webinar">Webinaires</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="event-category-filter">Thématique</label>
                        <select id="event-category-filter" class="filter-select">
                            <option value="">Toutes les thématiques</option>
                            <option value="Digital Transformation">Transformation Digitale</option>
                            <option value="Sustainability">Durabilité</option>
                            <option value="Networking">Réseautage</option>
                            <option value="Innovation">Innovation</option>
                        </select>
                    </div>
                    
                    <div class="filter-group filter-virtual">
                        <label class="checkbox-label">
                            <input type="checkbox" id="virtual-filter">
                            Événements virtuels
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Conférences Plénières -->
            <section class="program-section">
                <h2 class="section-title">Conférences Plénières</h2>
                <p class="section-description">Les grands enjeux du secteur portuaire discutés par des experts internationaux</p>
                <?php echo do_shortcode('[siports_events type="conference" limit="6"]'); ?>
            </section>
            
            <!-- Ateliers Techniques -->
            <section class="program-section">
                <h2 class="section-title">Ateliers Techniques</h2>
                <p class="section-description">Sessions pratiques pour approfondir vos connaissances et compétences</p>
                <?php echo do_shortcode('[siports_events type="workshop" limit="6"]'); ?>
            </section>
            
            <!-- Sessions de Réseautage -->
            <section class="program-section">
                <h2 class="section-title">Sessions de Réseautage</h2>
                <p class="section-description">Créez des connexions stratégiques avec les acteurs clés du secteur</p>
                <?php echo do_shortcode('[siports_events type="networking" limit="4"]'); ?>
            </section>
            
            <!-- Webinaires -->
            <section class="program-section">
                <h2 class="section-title">Webinaires</h2>
                <p class="section-description">Participez à distance à nos sessions digitales interactives</p>
                <?php echo do_shortcode('[siports_events type="webinar" limit="4"]'); ?>
            </section>
            
            <!-- Orateurs principaux -->
            <section class="program-section speakers-section">
                <h2 class="section-title">Orateurs Principaux</h2>
                <p class="section-description">Découvrez les experts qui partageront leur vision lors de SIPORTS 2026</p>
                
                <div class="speakers-grid">
                    <div class="speaker-card">
                        <div class="speaker-photo">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a" alt="David Rodriguez">
                        </div>
                        <div class="speaker-info">
                            <h3>David Rodriguez</h3>
                            <p class="speaker-position">Directeur Général</p>
                            <p class="speaker-company">Association Internationale des Ports</p>
                        </div>
                    </div>
                    
                    <div class="speaker-card">
                        <div class="speaker-photo">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" alt="Sarah Chen">
                        </div>
                        <div class="speaker-info">
                            <h3>Sarah Chen</h3>
                            <p class="speaker-position">Directrice Innovation</p>
                            <p class="speaker-company">Port Technology Solutions</p>
                        </div>
                    </div>
                    
                    <div class="speaker-card">
                        <div class="speaker-photo">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" alt="Mohammed Al-Faisal">
                        </div>
                        <div class="speaker-info">
                            <h3>Mohammed Al-Faisal</h3>
                            <p class="speaker-position">PDG</p>
                            <p class="speaker-company">Gulf Maritime Authority</p>
                        </div>
                    </div>
                    
                    <div class="speaker-card">
                        <div class="speaker-photo">
                            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e" alt="Elena Kowalski">
                        </div>
                        <div class="speaker-info">
                            <h3>Elena Kowalski</h3>
                            <p class="speaker-position">Experte Développement Durable</p>
                            <p class="speaker-company">Sustainable Ports Initiative</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Télécharger le programme -->
            <div class="download-program">
                <h2>Téléchargez le Programme Complet</h2>
                <p>Obtenez le programme détaillé avec tous les événements, horaires et lieux.</p>
                <a href="#" class="siports-btn siports-btn-primary">Télécharger le PDF</a>
            </div>
        </div>
    </div>
</div>

<script>
// JavaScript pour les filtres d'événements et onglets du calendrier
document.addEventListener('DOMContentLoaded', function() {
    // Code pour filtrer les événements et gérer les onglets du calendrier
    // Ce code sera remplacé par le vrai JavaScript du plugin
});
</script>

<?php get_footer(); ?>
