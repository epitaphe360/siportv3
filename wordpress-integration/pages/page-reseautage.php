<?php
/**
 * Template Name: Page Réseautage SIPORTS
 */

get_header(); ?>

<div class="siports-networking-wrapper">
    <div class="container">
        <!-- Hero section -->
        <section class="networking-hero">
            <div class="hero-content">
                <h1>Réseautage Professionnel SIPORTS 2026</h1>
                <p class="hero-subtitle">
                    Connectez-vous avec plus de 6 000 professionnels de l'écosystème portuaire mondial.
                    L'IA de SIPORTS vous recommande les meilleurs contacts selon vos intérêts.
                </p>
            </div>
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-number">6000+</span>
                    <span class="stat-label">Professionnels</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">40</span>
                    <span class="stat-label">Pays</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">200+</span>
                    <span class="stat-label">Entreprises</span>
                </div>
            </div>
        </section>

        <!-- Application de réseautage intégrée -->
        <section class="networking-app">
            <?php if (is_user_logged_in()): ?>
                <div class="app-header">
                    <h2>Votre espace réseautage</h2>
                    <p>Découvrez vos recommandations personnalisées et commencez à échanger</p>
                </div>
                
                <?php echo do_shortcode('[siports-networking height="1000px" width="100%"]'); ?>
                
            <?php else: ?>
                <div class="auth-required">
                    <div class="auth-content">
                        <h3>Connectez-vous pour accéder au réseautage</h3>
                        <p>Créez votre profil professionnel et commencez à développer votre réseau dès aujourd'hui</p>
                        
                        <!-- Formulaire de connexion intégré -->
                        <?php echo do_shortcode('[siports-login height="600px" redirect="/reseautage"]'); ?>
                    </div>
                </div>
            <?php endif; ?>
        </section>

        <!-- Chat rapide -->
        <?php if (is_user_logged_in()): ?>
        <section class="quick-chat">
            <h3>Messages récents</h3>
            <?php echo do_shortcode('[siports-chat height="500px"]'); ?>
        </section>
        <?php endif; ?>

        <!-- Fonctionnalités du réseautage -->
        <section class="networking-features">
            <h2>Fonctionnalités de réseautage</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">🤝</div>
                    <h4>Recommandations IA</h4>
                    <p>Notre intelligence artificielle analyse vos intérêts et vous recommande les meilleurs contacts</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">💬</div>
                    <h4>Chat en temps réel</h4>
                    <p>Échangez instantanément avec les autres participants via notre système de messagerie</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📅</div>
                    <h4>Rendez-vous facilités</h4>
                    <p>Planifiez vos rencontres directement depuis la plateforme avec calendrier intégré</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <h4>Recherche avancée</h4>
                    <p>Trouvez exactement les profils qui vous intéressent avec nos filtres intelligents</p>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
.siports-networking-wrapper {
    margin: 20px 0;
}

.networking-hero {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
    border-radius: 16px;
    margin-bottom: 50px;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 20px;
    font-weight: 700;
}

.hero-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    max-width: 700px;
    margin: 0 auto 40px;
    line-height: 1.6;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-top: 50px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #fbbf24;
}

.stat-label {
    font-size: 1rem;
    opacity: 0.8;
}

.networking-app {
    margin: 50px 0;
}

.app-header {
    text-align: center;
    margin-bottom: 30px;
}

.app-header h2 {
    color: #1e40af;
    font-size: 2rem;
    margin-bottom: 10px;
}

.auth-required {
    background: #f8fafc;
    border-radius: 12px;
    padding: 50px;
    text-align: center;
}

.auth-content h3 {
    color: #1e40af;
    margin-bottom: 15px;
    font-size: 1.8rem;
}

.quick-chat {
    margin: 50px 0;
    background: #f1f5f9;
    padding: 30px;
    border-radius: 12px;
}

.quick-chat h3 {
    color: #1e40af;
    margin-bottom: 20px;
}

.networking-features {
    margin: 60px 0;
    text-align: center;
}

.networking-features h2 {
    color: #1e40af;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-top: 40px;
}

.feature-item {
    background: white;
    padding: 40px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.feature-item:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.feature-item h4 {
    color: #1e40af;
    margin-bottom: 15px;
    font-size: 1.3rem;
}

.feature-item p {
    color: #64748b;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .hero-stats {
        flex-direction: column;
        gap: 30px;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<?php get_footer(); ?>