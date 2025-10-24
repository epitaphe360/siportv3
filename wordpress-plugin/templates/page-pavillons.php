<?php
/**
 * Template Name: SIPORTS - Pavillons
 */

get_header(); ?>

<div class="siports-page siports-pavilions-page">
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">Plan du Salon</span>
                <h1 class="siports-hero-title">Pavillons d'Exposition</h1>
                <p class="siports-hero-subtitle">
                    Explorez les différents pavillons thématiques et trouvez votre chemin
                </p>
            </div>
        </div>
        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <section class="siports-section">
        <div class="siports-container-wide">
            <?php echo do_shortcode('[siports_pavilions layout="map" interactive="true" show_exhibitors="true"]'); ?>
        </div>
    </section>
</div>

<?php get_footer(); ?>
