<?php
/**
 * Template Name: Page Chat SIPORTS
 */

get_header(); ?>

<div class="siports-chat-wrapper">
    <div class="container">
        <?php if (is_user_logged_in()): ?>
            <!-- Interface de chat pour utilisateur connecté -->
            <section class="chat-header">
                <div class="header-content">
                    <h1>Messagerie SIPORTS 2026</h1>
                    <p class="header-subtitle">
                        Échangez en temps réel avec les participants, exposants et partenaires du salon.
                    </p>
                </div>
                
                <div class="chat-stats">
                    <div class="stat-item">
                        <span class="stat-icon">👥</span>
                        <span class="stat-text">6000+ Participants connectés</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💬</span>
                        <span class="stat-text">Messagerie temps réel</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🔒</span>
                        <span class="stat-text">Communications sécurisées</span>
                    </div>
                </div>
            </section>

            <!-- Application de chat intégrée -->
            <section class="chat-application">
                <div class="chat-container">
                    <?php echo do_shortcode('[siports-chat height="700px" width="100%"]'); ?>
                </div>
            </section>

            <!-- Fonctionnalités du chat -->
            <section class="chat-features">
                <h2>Fonctionnalités de messagerie</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3>Temps réel</h3>
                        <p>Messages instantanés avec notifications push pour ne rien rater</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📎</div>
                        <h3>Pièces jointes</h3>
                        <p>Partagez documents, images et présentations facilement</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">👥</div>
                        <h3>Groupes</h3>
                        <p>Créez des conversations de groupe pour vos projets</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h3>Recherche</h3>
                        <p>Retrouvez rapidement vos conversations et messages</p>
                    </div>
                </div>
            </section>

            <!-- Conseils d'utilisation -->
            <section class="chat-tips">
                <h2>Conseils pour bien réseauter</h2>
                <div class="tips-grid">
                    <div class="tip-card">
                        <h4>🎯 Personnalisez vos messages</h4>
                        <p>Mentionnez des éléments spécifiques du profil de votre interlocuteur pour créer une connexion authentique.</p>
                    </div>
                    
                    <div class="tip-card">
                        <h4>📅 Proposez des rendez-vous</h4>
                        <p>Utilisez le système de calendrier intégré pour planifier vos rencontres durant le salon.</p>
                    </div>
                    
                    <div class="tip-card">
                        <h4>🌍 Pensez international</h4>
                        <p>Le salon accueille des participants de 40 pays. Adaptez votre communication selon les cultures.</p>
                    </div>
                    
                    <div class="tip-card">
                        <h4>🤝 Suivez vos contacts</h4>
                        <p>Ajoutez vos nouveaux contacts à votre réseau pour maintenir la relation après le salon.</p>
                    </div>
                </div>
            </section>

        <?php else: ?>
            <!-- Page pour utilisateur non connecté -->
            <section class="chat-auth-required">
                <div class="auth-content">
                    <div class="auth-header">
                        <h1>Messagerie SIPORTS 2026</h1>
                        <p class="auth-subtitle">
                            Connectez-vous pour accéder à la messagerie et commencer à échanger 
                            avec les participants du salon.
                        </p>
                    </div>
                    
                    <!-- Aperçu des fonctionnalités -->
                    <div class="preview-features">
                        <h2>Ce qui vous attend</h2>
                        <div class="preview-grid">
                            <div class="preview-item">
                                <span class="preview-icon">💬</span>
                                <h3>Messages instantanés</h3>
                                <p>Échangez en temps réel avec 6000+ professionnels du secteur portuaire</p>
                            </div>
                            
                            <div class="preview-item">
                                <span class="preview-icon">🎯</span>
                                <h3>Contacts recommandés</h3>
                                <p>Notre IA vous suggère les meilleurs contacts selon vos intérêts</p>
                            </div>
                            
                            <div class="preview-item">
                                <span class="preview-icon">📱</span>
                                <h3>Interface mobile</h3>
                                <p>Chattez depuis votre smartphone pendant le salon</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Formulaire de connexion -->
                    <div class="auth-form-section">
                        <h2>Accédez à la messagerie</h2>
                        <?php echo do_shortcode('[siports-login height="600px" redirect="/chat"]'); ?>
                    </div>
                    
                    <!-- Témoignages -->
                    <div class="testimonials">
                        <h2>Ce qu'en disent les participants</h2>
                        <div class="testimonials-grid">
                            <div class="testimonial">
                                <p>"La messagerie SIPORTS m'a permis de prendre 15 rendez-vous qualifiés en 2 jours !"</p>
                                <cite>— Marie Dubois, Directrice Export, Port Autonome de Marseille</cite>
                            </div>
                            
                            <div class="testimonial">
                                <p>"L'interface est intuitive et les recommandations IA sont très pertinentes."</p>
                                <cite>— Ahmed El Mansouri, PDG, Atlantic Logistics</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        <?php endif; ?>
    </div>
</div>

<style>
.siports-chat-wrapper {
    margin: 20px 0;
}

.chat-header {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
    color: white;
    padding: 60px 0;
    text-align: center;
    border-radius: 16px;
    margin-bottom: 40px;
}

.header-content h1 {
    font-size: 3rem;
    margin-bottom: 20px;
    font-weight: 700;
}

.header-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.6;
}

.chat-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.1);
    padding: 15px 25px;
    border-radius: 25px;
    backdrop-filter: blur(10px);
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-text {
    font-weight: 600;
}

.chat-application {
    margin: 40px 0;
}

.chat-container {
    background: #f8fafc;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chat-features {
    margin: 60px 0;
    text-align: center;
}

.chat-features h2 {
    color: #1e40af;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.feature-card {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.feature-card h3 {
    color: #1e40af;
    margin-bottom: 15px;
    font-size: 1.4rem;
}

.feature-card p {
    color: #64748b;
    line-height: 1.6;
}

.chat-tips {
    margin: 60px 0;
    text-align: center;
}

.chat-tips h2 {
    color: #1e40af;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
}

.tip-card {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    padding: 30px;
    border-radius: 12px;
    text-align: left;
    border-left: 4px solid #3b82f6;
}

.tip-card h4 {
    color: #1e40af;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.tip-card p {
    color: #475569;
    line-height: 1.6;
}

/* Styles pour utilisateur non connecté */
.chat-auth-required {
    text-align: center;
}

.auth-header {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    padding: 80px 0;
    border-radius: 16px;
    margin-bottom: 60px;
}

.auth-header h1 {
    font-size: 3rem;
    margin-bottom: 20px;
    font-weight: 700;
}

.auth-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.preview-features {
    margin: 60px 0;
}

.preview-features h2 {
    color: #1e40af;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
}

.preview-item {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.preview-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
    display: block;
}

.preview-item h3 {
    color: #1e40af;
    margin-bottom: 15px;
    font-size: 1.5rem;
}

.preview-item p {
    color: #64748b;
    line-height: 1.6;
}

.auth-form-section {
    margin: 60px 0;
    background: #f8fafc;
    padding: 50px;
    border-radius: 16px;
}

.auth-form-section h2 {
    color: #1e40af;
    margin-bottom: 30px;
    font-size: 2rem;
}

.testimonials {
    margin: 60px 0;
}

.testimonials h2 {
    color: #1e40af;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.testimonial {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    text-align: left;
}

.testimonial p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 20px;
    font-style: italic;
}

.testimonial cite {
    color: #6b7280;
    font-size: 0.9rem;
    font-style: normal;
}

@media (max-width: 768px) {
    .chat-stats {
        flex-direction: column;
        gap: 20px;
    }
    
    .stat-item {
        justify-content: center;
    }
    
    .auth-header h1 {
        font-size: 2.2rem;
    }
    
    .preview-grid {
        grid-template-columns: 1fr;
    }
    
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<?php get_footer(); ?>