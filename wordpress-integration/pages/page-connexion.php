<?php
/**
 * Template Name: Page Connexion SIPORTS
 */

get_header(); ?>

<div class="siports-auth-wrapper">
    <div class="container">
        <!-- Hero section -->
        <section class="auth-hero">
            <div class="hero-content">
                <h1>Espace Membre SIPORTS 2026</h1>
                <p class="hero-subtitle">
                    Accédez à votre espace personnalisé pour réseauter, 
                    consulter les exposants et gérer vos rendez-vous.
                </p>
            </div>
        </section>

        <?php if (is_user_logged_in()): ?>
            <!-- Utilisateur déjà connecté -->
            <section class="user-dashboard-preview">
                <div class="dashboard-header">
                    <h2>Bon retour, <?php echo wp_get_current_user()->display_name; ?> !</h2>
                    <p>Accédez à votre tableau de bord SIPORTS complet</p>
                </div>
                
                <!-- Dashboard intégré -->
                <?php echo do_shortcode('[siports-dashboard height="900px"]'); ?>
                
                <!-- Liens rapides -->
                <div class="quick-links">
                    <h3>Accès rapide</h3>
                    <div class="links-grid">
                        <a href="/reseautage" class="quick-link">
                            <span class="link-icon">🤝</span>
                            <span class="link-text">Réseautage</span>
                        </a>
                        <a href="/exposants" class="quick-link">
                            <span class="link-icon">🏢</span>
                            <span class="link-text">Exposants</span>
                        </a>
                        <a href="/evenements" class="quick-link">
                            <span class="link-icon">📅</span>
                            <span class="link-text">Événements</span>
                        </a>
                        <a href="/chat" class="quick-link">
                            <span class="link-icon">💬</span>
                            <span class="link-text">Messages</span>
                        </a>
                    </div>
                </div>
            </section>

        <?php else: ?>
            <!-- Formulaire de connexion/inscription -->
            <section class="auth-forms">
                <div class="forms-container">
                    <!-- Connexion SIPORTS intégrée -->
                    <div class="auth-form-wrapper">
                        <div class="form-header">
                            <h2>Connexion / Inscription</h2>
                            <p>Utilisez votre compte SIPORTS pour accéder à toutes les fonctionnalités</p>
                        </div>
                        
                        <!-- Application d'authentification intégrée -->
                        <?php echo do_shortcode('[siports-login height="700px" redirect="/mon-espace"]'); ?>
                    </div>
                    
                    <!-- Avantages de l'inscription -->
                    <div class="benefits-sidebar">
                        <h3>Avantages de l'inscription</h3>
                        <div class="benefits-list">
                            <div class="benefit-item">
                                <span class="benefit-icon">🎯</span>
                                <div class="benefit-content">
                                    <h4>Recommandations personnalisées</h4>
                                    <p>Notre IA vous recommande les meilleurs contacts selon vos intérêts</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <span class="benefit-icon">💬</span>
                                <div class="benefit-content">
                                    <h4>Chat en temps réel</h4>
                                    <p>Échangez directement avec les autres participants</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <span class="benefit-icon">📅</span>
                                <div class="benefit-content">
                                    <h4>Gestion des rendez-vous</h4>
                                    <p>Planifiez et organisez vos rencontres professionnelles</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <span class="benefit-icon">🎫</span>
                                <div class="benefit-content">
                                    <h4>QR codes événements</h4>
                                    <p>Accès simplifié à tous les événements du salon</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <span class="benefit-icon">📊</span>
                                <div class="benefit-content">
                                    <h4>Tableau de bord personnalisé</h4>
                                    <p>Suivez vos activités et optimisez votre participation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Types de comptes -->
            <section class="account-types">
                <h2>Types de comptes disponibles</h2>
                <div class="types-grid">
                    <div class="account-type">
                        <div class="type-header">
                            <span class="type-icon">🏢</span>
                            <h3>Exposant</h3>
                        </div>
                        <div class="type-features">
                            <ul>
                                <li>Mini-site personnalisé</li>
                                <li>Gestion des produits</li>
                                <li>Calendrier de rendez-vous</li>
                                <li>Analytics détaillés</li>
                                <li>Support prioritaire</li>
                            </ul>
                        </div>
                        <div class="type-price">
                            <span class="price">Selon package</span>
                        </div>
                    </div>
                    
                    <div class="account-type">
                        <div class="type-header">
                            <span class="type-icon">🤝</span>
                            <h3>Partenaire</h3>
                        </div>
                        <div class="type-features">
                            <ul>
                                <li>Branding premium</li>
                                <li>Espaces dédiés</li>
                                <li>Accès VIP événements</li>
                                <li>Networking prioritaire</li>
                                <li>Supports marketing</li>
                            </ul>
                        </div>
                        <div class="type-price">
                            <span class="price">Contactez-nous</span>
                        </div>
                    </div>
                    
                    <div class="account-type featured">
                        <div class="type-header">
                            <span class="type-icon">👤</span>
                            <h3>Visiteur</h3>
                        </div>
                        <div class="type-features">
                            <ul>
                                <li>Accès aux exposants</li>
                                <li>Réseautage de base</li>
                                <li>Événements publics</li>
                                <li>Messagerie limitée</li>
                                <li>Support standard</li>
                            </ul>
                        </div>
                        <div class="type-price">
                            <span class="price">Gratuit</span>
                        </div>
                    </div>
                </div>
            </section>
        <?php endif; ?>
    </div>
</div>

<style>
.siports-auth-wrapper {
    margin: 20px 0;
}

.auth-hero {
    background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
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
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.user-dashboard-preview {
    margin: 50px 0;
}

.dashboard-header {
    text-align: center;
    margin-bottom: 40px;
}

.dashboard-header h2 {
    color: #059669;
    font-size: 2.2rem;
    margin-bottom: 15px;
}

.quick-links {
    margin: 50px 0;
    text-align: center;
}

.quick-links h3 {
    color: #059669;
    margin-bottom: 30px;
    font-size: 1.8rem;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.quick-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    transition: all 0.3s;
    border: 2px solid transparent;
}

.quick-link:hover {
    transform: translateY(-5px);
    border-color: #10b981;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.link-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
}

.link-text {
    color: #374151;
    font-weight: 600;
    font-size: 1.1rem;
}

.auth-forms {
    margin: 50px 0;
}

.forms-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 50px;
    align-items: start;
}

.auth-form-wrapper {
    background: #f8fafc;
    padding: 40px;
    border-radius: 16px;
}

.form-header {
    text-align: center;
    margin-bottom: 30px;
}

.form-header h2 {
    color: #059669;
    margin-bottom: 10px;
}

.benefits-sidebar {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 20px;
}

.benefits-sidebar h3 {
    color: #059669;
    margin-bottom: 30px;
    font-size: 1.5rem;
}

.benefits-list {
    space-y: 25px;
}

.benefit-item {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
}

.benefit-icon {
    font-size: 1.8rem;
    flex-shrink: 0;
    margin-top: 5px;
}

.benefit-content h4 {
    color: #374151;
    margin-bottom: 8px;
    font-size: 1.1rem;
}

.benefit-content p {
    color: #6b7280;
    line-height: 1.5;
    font-size: 0.95rem;
}

.account-types {
    margin: 60px 0;
    text-align: center;
}

.account-types h2 {
    color: #059669;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;
}

.account-type {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s;
    border: 2px solid transparent;
}

.account-type:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.account-type.featured {
    border-color: #10b981;
    transform: scale(1.05);
}

.type-header {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    padding: 30px;
    text-align: center;
}

.account-type.featured .type-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.type-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 15px;
}

.type-header h3 {
    font-size: 1.5rem;
    margin: 0;
}

.type-features {
    padding: 30px;
}

.type-features ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.type-features li {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
}

.type-features li:before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
    margin-right: 10px;
}

.type-price {
    background: #f9fafb;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
}

.price {
    font-size: 1.3rem;
    font-weight: 700;
    color: #059669;
}

@media (max-width: 768px) {
    .forms-container {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .types-grid {
        grid-template-columns: 1fr;
    }
    
    .account-type.featured {
        transform: none;
    }
    
    .links-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

<?php get_footer(); ?>