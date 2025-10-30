<?php
/**
 * Template Name: SIPORTS - Produits & Services
 */

get_header(); ?>

<div class="siports-page siports-products-page">
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">Catalogue</span>
                <h1 class="siports-hero-title">Produits & Services</h1>
                <p class="siports-hero-subtitle">
                    Découvrez l'ensemble des produits et services présentés par nos exposants
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
        <div class="siports-container">
            <?php echo do_shortcode('[siports_products layout="grid" show_filter="true" show_search="true" limit="24"]'); ?>
        </div>
    </section>
</div>

<?php get_footer(); ?>
