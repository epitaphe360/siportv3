<?php
/**
 * Template Name: SIPORTS - Partenaires
 * Description: Liste des partenaires et sponsors
 */

get_header(); ?>

<div class="siports-page siports-partners-page">

    <!-- Hero Section -->
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">Nos Partenaires</span>
                <h1 class="siports-hero-title">Partenaires & Sponsors</h1>
                <p class="siports-hero-subtitle">
                    Ils font confiance à SIPORT et contribuent au succès de l'événement.
                    <br>Découvrez nos partenaires stratégiques et sponsors officiels.
                </p>
            </div>
        </div>
        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Main Sponsors -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Platinum</span>
                <h2 class="siports-section-title">Sponsors Principaux</h2>
            </div>
            <?php echo do_shortcode('[siports_sponsors level="platinum" layout="featured"]'); ?>
        </div>
    </section>

    <!-- Gold Sponsors -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Gold</span>
                <h2 class="siports-section-title">Sponsors Gold</h2>
            </div>
            <?php echo do_shortcode('[siports_sponsors level="gold" layout="grid"]'); ?>
        </div>
    </section>

    <!-- Silver Sponsors -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Silver</span>
                <h2 class="siports-section-title">Sponsors Silver</h2>
            </div>
            <?php echo do_shortcode('[siports_sponsors level="silver" layout="grid"]'); ?>
        </div>
    </section>

    <!-- All Partners -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container">
            <div class="siports-section-header">
                <h2 class="siports-section-title">Tous les Partenaires</h2>
            </div>
            <?php echo do_shortcode('[siports_partners layout="grid" show_description="true"]'); ?>
        </div>
    </section>

    <!-- Become Partner CTA -->
    <section class="siports-section siports-section-dark">
        <div class="siports-container siports-text-center">
            <h2 class="siports-section-title">Devenez Partenaire</h2>
            <p class="siports-section-subtitle" style="color: rgba(255,255,255,0.9);">
                Profitez d'une visibilité exceptionnelle auprès de milliers de professionnels du secteur portuaire
            </p>
            <div class="partner-benefits">
                <div class="benefit-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    <span>Visibilité Maximale</span>
                </div>
                <div class="benefit-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Accès VIP</span>
                </div>
                <div class="benefit-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Networking Privilégié</span>
                </div>
            </div>
            <div class="cta-actions">
                <a href="/devenir-partenaire" class="siports-btn siports-btn-secondary siports-btn-large">
                    Dossier de Partenariat
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </a>
                <a href="/contact" class="siports-btn siports-btn-outline siports-btn-large" style="border-color: white; color: white;">
                    Nous Contacter
                </a>
            </div>
        </div>
    </section>

</div>

<style>
.section-label {
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--siports-primary);
    margin-bottom: 16px;
}

.partner-benefits {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin: 48px 0;
    flex-wrap: wrap;
}

.benefit-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--siports-white);
}

.benefit-item svg {
    width: 48px;
    height: 48px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--siports-radius);
}

.benefit-item span {
    font-weight: 600;
    font-size: 16px;
}

.cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .partner-benefits {
        flex-direction: column;
        gap: 24px;
    }

    .cta-actions {
        flex-direction: column;
    }

    .cta-actions .siports-btn {
        width: 100%;
    }
}
</style>

<?php get_footer(); ?>
