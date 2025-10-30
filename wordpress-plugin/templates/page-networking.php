<?php
/**
 * Template Name: SIPORTS - Networking
 * Description: Plateforme de networking et messagerie entre participants
 */

get_header(); ?>

<div class="siports-page siports-networking-page">

    <!-- Hero Section -->
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Connectez-vous
                </span>
                <h1 class="siports-hero-title">Networking</h1>
                <p class="siports-hero-subtitle">
                    Connectez-vous avec plus de 5000 professionnels du secteur portuaire et maritime.
                    <br>Échangez, collaborez et développez votre réseau professionnel.
                </p>
            </div>
        </div>
        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Networking Features -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <h3>Découvrir</h3>
                    <p>Explorez les profils des participants et identifiez les contacts stratégiques pour votre business</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <h3>Échanger</h3>
                    <p>Messagerie instantanée pour communiquer directement avec les participants qui vous intéressent</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <h3>Planifier</h3>
                    <p>Prenez rendez-vous directement dans l'application pour des meetings pendant le salon</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                    </div>
                    <h3>IA Recommandations</h3>
                    <p>Notre IA vous suggère les meilleurs contacts basés sur vos intérêts et objectifs professionnels</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Networking Platform -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container-wide">
            <div class="siports-section-header">
                <h2 class="siports-section-title">Plateforme de Networking</h2>
                <p class="siports-section-subtitle">
                    Commencez à réseauter dès maintenant
                </p>
            </div>

            <!-- Full Networking App Integration -->
            <div class="networking-app-container">
                <?php echo do_shortcode('[siports_networking show_ai="true" show_appointments="true"]'); ?>
            </div>
        </div>
    </section>

    <!-- Chat Section -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <h2 class="siports-section-title">Messagerie</h2>
                <p class="siports-section-subtitle">
                    Conversations en temps réel avec les participants
                </p>
            </div>

            <div class="chat-container">
                <?php echo do_shortcode('[siports_chat show_online="true" show_typing="true"]'); ?>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="siports-section siports-section-dark">
        <div class="siports-container">
            <div class="siports-section-header">
                <h2 class="siports-section-title">Networking en Chiffres</h2>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">5000+</div>
                    <div class="stat-label">Participants Inscrits</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">30+</div>
                    <div class="stat-label">Pays Représentés</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">200+</div>
                    <div class="stat-label">Exposants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">1000+</div>
                    <div class="stat-label">Connexions par Jour</div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="siports-section">
        <div class="siports-container siports-text-center">
            <h2 class="siports-section-title">Prêt à Étendre Votre Réseau ?</h2>
            <p class="siports-section-subtitle">
                Inscrivez-vous maintenant et commencez à networker avant même le début du salon
            </p>
            <div class="cta-actions">
                <a href="/inscription-visiteur" class="siports-btn siports-btn-primary siports-btn-large">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Créer Mon Compte
                </a>
                <a href="/a-propos" class="siports-btn siports-btn-outline siports-btn-large">
                    En Savoir Plus
                </a>
            </div>
        </div>
    </section>

</div>

<style>
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 32px;
}

.feature-card {
    text-align: center;
    padding: 40px 24px;
}

.feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, var(--siports-primary), var(--siports-primary-light));
    border-radius: var(--siports-radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--siports-white);
}

.feature-icon svg {
    width: 40px;
    height: 40px;
}

.feature-card h3 {
    font-size: 22px;
    font-weight: 700;
    color: var(--siports-dark);
    margin: 0 0 12px 0;
}

.feature-card p {
    font-size: 16px;
    color: var(--siports-gray-600);
    line-height: 1.6;
    margin: 0;
}

.networking-app-container,
.chat-container {
    background: var(--siports-white);
    border-radius: var(--siports-radius-lg);
    box-shadow: var(--siports-shadow-lg);
    overflow: hidden;
    min-height: 600px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    margin-top: 48px;
}

.stat-card {
    text-align: center;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--siports-radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
    font-size: 48px;
    font-weight: 800;
    color: var(--siports-accent);
    line-height: 1;
    margin-bottom: 12px;
}

.stat-label {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
}

.cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 32px;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
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
