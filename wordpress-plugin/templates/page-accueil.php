<?php
/**
 * Template Name: SIPORTS - Page d'Accueil
 * Description: Page d'accueil principale avec countdown, stats et contenu vedette
 */

get_header(); ?>

<div class="siports-page siports-homepage">

    <!-- Hero Section avec Countdown -->
    <section class="siports-hero siports-hero-home">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">
                    <svg class="badge-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    Salon International des Ports
                </span>

                <h1 class="siports-hero-title">
                    SIPORT 2026
                    <span class="hero-subtitle-inline">Casablanca, Maroc</span>
                </h1>

                <p class="siports-hero-subtitle">
                    Le plus grand événement portuaire et maritime d'Afrique du Nord.
                    <br>Rejoignez les leaders de l'industrie du 15 au 18 Mai 2026.
                </p>

                <!-- Countdown -->
                <div class="hero-countdown">
                    <?php echo do_shortcode('[siports_countdown event_date="2026-05-15" show_labels="true" animated="true"]'); ?>
                </div>

                <!-- CTA Buttons -->
                <div class="hero-actions">
                    <a href="/inscription-visiteur" class="siports-btn siports-btn-secondary siports-btn-large">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        S'inscrire Gratuitement
                    </a>
                    <a href="/devenir-exposant" class="siports-btn siports-btn-outline siports-btn-large btn-outline-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        Devenir Exposant
                    </a>
                </div>

                <!-- Stats -->
                <div class="hero-stats">
                    <?php echo do_shortcode('[siports_stats show="exhibitors,visitors,countries,events" animated="true" layout="horizontal"]'); ?>
                </div>
            </div>
        </div>

        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Section À Propos -->
    <section class="siports-section siports-about-section">
        <div class="siports-container">
            <div class="about-grid">
                <div class="about-content">
                    <span class="section-label">À Propos</span>
                    <h2 class="siports-section-title siports-text-left">
                        L'événement incontournable du secteur portuaire
                    </h2>
                    <p class="about-text">
                        SIPORT 2026 est le rendez-vous privilégié des acteurs de l'industrie portuaire et maritime
                        en Afrique et dans le monde. Pendant 4 jours, découvrez les dernières innovations,
                        participez à des conférences de haut niveau et développez votre réseau professionnel.
                    </p>

                    <div class="about-features">
                        <div class="feature-item">
                            <div class="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div class="feature-text">
                                <h3>200+ Exposants</h3>
                                <p>Leaders internationaux du secteur</p>
                            </div>
                        </div>

                        <div class="feature-item">
                            <div class="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                            </div>
                            <div class="feature-text">
                                <h3>30+ Pays</h3>
                                <p>Présence internationale majeure</p>
                            </div>
                        </div>

                        <div class="feature-item">
                            <div class="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <div class="feature-text">
                                <h3>50+ Conférences</h3>
                                <p>Experts et panels de discussion</p>
                            </div>
                        </div>
                    </div>

                    <a href="/a-propos" class="siports-btn siports-btn-primary">
                        En savoir plus
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                </div>

                <div class="about-image">
                    <img src="<?php echo get_template_directory_uri(); ?>/images/siport-venue.jpg"
                         alt="SIPORT 2026 Venue"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22%3E%3Crect fill=%22%230066CC%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2236%22 font-family=%22Arial%22%3ESIPORT 2026%3C/text%3E%3C/svg%3E'">
                    <div class="image-badge">
                        <span class="badge-number">15-18</span>
                        <span class="badge-text">Mai 2026</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section Exposants Vedettes -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Nos Exposants</span>
                <h2 class="siports-section-title">Exposants Vedettes</h2>
                <p class="siports-section-subtitle">
                    Découvrez les entreprises leaders qui font confiance à SIPORT
                </p>
            </div>

            <div class="featured-exhibitors">
                <?php echo do_shortcode('[siports_exhibitors layout="grid" limit="6" featured="true"]'); ?>
            </div>

            <div class="section-cta">
                <a href="/exposants" class="siports-btn siports-btn-outline">
                    Voir tous les exposants
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <!-- Section Événements à Venir -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Programme</span>
                <h2 class="siports-section-title">Événements à Venir</h2>
                <p class="siports-section-subtitle">
                    Conférences, ateliers, et sessions de networking
                </p>
            </div>

            <?php echo do_shortcode('[siports_upcoming_events limit="4" show_register="true"]'); ?>

            <div class="section-cta">
                <a href="/evenements" class="siports-btn siports-btn-primary">
                    Programme complet
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <!-- Section Actualités -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Actualités</span>
                <h2 class="siports-section-title">Dernières Nouvelles</h2>
                <p class="siports-section-subtitle">
                    Restez informé des dernières actualités de l'industrie portuaire
                </p>
            </div>

            <?php echo do_shortcode('[siports_featured_news limit="3" layout="horizontal"]'); ?>

            <div class="section-cta">
                <a href="/actualites" class="siports-btn siports-btn-outline">
                    Toutes les actualités
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <!-- Section Partenaires -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">Partenaires</span>
                <h2 class="siports-section-title">Ils nous font confiance</h2>
            </div>

            <div class="partners-showcase">
                <?php echo do_shortcode('[siports_partners layout="grid" limit="12" featured="true"]'); ?>
            </div>
        </div>
    </section>

    <!-- Section CTA Final -->
    <section class="siports-section siports-section-dark siports-cta-final">
        <div class="siports-container">
            <div class="cta-final-content">
                <h2 class="cta-final-title">Prêt à rejoindre SIPORT 2026 ?</h2>
                <p class="cta-final-text">
                    Ne manquez pas cette opportunité unique de réseauter avec les leaders de l'industrie.
                    Inscrivez-vous dès maintenant et profitez du tarif Early Bird.
                </p>
                <div class="cta-final-actions">
                    <a href="/inscription-visiteur" class="siports-btn siports-btn-secondary siports-btn-large">
                        S'inscrire comme Visiteur
                    </a>
                    <a href="/devenir-exposant" class="siports-btn siports-btn-outline siports-btn-large btn-outline-white">
                        Devenir Exposant
                    </a>
                    <a href="/contact" class="siports-btn siports-btn-ghost siports-btn-large btn-ghost-white">
                        Nous Contacter
                    </a>
                </div>
            </div>
        </div>
    </section>

</div>

<style>
/* Styles spécifiques à la homepage */
.siports-hero-home {
    padding: 140px 0 100px;
}

.hero-subtitle-inline {
    display: block;
    font-size: 0.6em;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 12px;
}

.badge-icon {
    vertical-align: middle;
}

.hero-countdown {
    margin: 48px 0;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-bottom: 64px;
}

.btn-outline-white {
    background: transparent;
    color: var(--siports-white);
    border-color: var(--siports-white);
}

.btn-outline-white:hover {
    background: var(--siports-white);
    color: var(--siports-primary);
}

.btn-ghost-white {
    color: var(--siports-white);
}

.btn-ghost-white:hover {
    background: rgba(255, 255, 255, 0.1);
}

.hero-stats {
    max-width: 900px;
    margin: 0 auto;
}

/* About Section */
.siports-about-section {
    padding: 100px 0;
}

.section-label {
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--siports-primary);
    margin-bottom: 16px;
}

.about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
}

.about-text {
    font-size: 18px;
    line-height: 1.8;
    color: var(--siports-gray-700);
    margin: 24px 0 32px;
}

.about-features {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 40px;
}

.feature-item {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.feature-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--siports-primary), var(--siports-primary-light));
    border-radius: var(--siports-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--siports-white);
}

.feature-icon svg {
    width: 24px;
    height: 24px;
}

.feature-text h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--siports-dark);
    margin: 0 0 4px 0;
}

.feature-text p {
    font-size: 15px;
    color: var(--siports-gray-600);
    margin: 0;
}

.about-image {
    position: relative;
    border-radius: var(--siports-radius-lg);
    overflow: hidden;
    box-shadow: var(--siports-shadow-xl);
}

.about-image img {
    width: 100%;
    height: auto;
    display: block;
}

.image-badge {
    position: absolute;
    bottom: 24px;
    right: 24px;
    background: var(--siports-white);
    padding: 20px 28px;
    border-radius: var(--siports-radius);
    box-shadow: var(--siports-shadow-lg);
    text-align: center;
}

.badge-number {
    display: block;
    font-size: 32px;
    font-weight: 800;
    color: var(--siports-primary);
    line-height: 1;
}

.badge-text {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--siports-gray-700);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
}

/* Section CTA */
.section-cta {
    text-align: center;
    margin-top: 48px;
}

/* CTA Final */
.siports-cta-final {
    padding: 100px 0;
    position: relative;
    overflow: hidden;
}

.siports-cta-final::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(0, 212, 170, 0.2) 0%, transparent 60%);
}

.cta-final-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
}

.cta-final-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 800;
    color: var(--siports-white);
    margin: 0 0 24px 0;
    line-height: 1.2;
}

.cta-final-text {
    font-size: clamp(16px, 2vw, 20px);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin: 0 0 40px 0;
}

.cta-final-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
    .about-grid {
        grid-template-columns: 1fr;
        gap: 48px;
    }

    .about-image {
        order: -1;
    }

    .hero-actions,
    .cta-final-actions {
        flex-direction: column;
    }

    .hero-actions .siports-btn,
    .cta-final-actions .siports-btn {
        width: 100%;
    }
}
</style>

<?php get_footer(); ?>
