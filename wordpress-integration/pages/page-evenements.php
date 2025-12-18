<?php
/**
 * Template Name: Page Événements SIPORTS
 */

get_header(); ?>

<div class="siports-events-wrapper">
    <div class="container">
        <!-- Header événements -->
        <header class="events-header">
            <div class="header-content">
                <h1>Événements SIPORTS 2026</h1>
                <p class="header-subtitle">
                    Du 1er au 3 avril 2026 à El Jadida, Maroc.<br>
                    Conférences, ateliers, networking et innovations portuaires.
                </p>
                <div class="event-dates">
                    <span class="date-badge">📅 1-3 Avril 2026</span>
                    <span class="location-badge">📍 El Jadida, Maroc</span>
                </div>
            </div>
        </header>

        <!-- Programme complet intégré -->
        <section class="events-program">
            <div class="program-header">
                <h2>Programme Complet</h2>
                <p>Découvrez tous les événements, obtenez vos QR codes d'accès et planifiez votre visite</p>
            </div>
            
            <!-- Application événements intégrée -->
            <?php echo do_shortcode('[siports-events height="900px" width="100%"]'); ?>
        </section>

        <!-- QR Code Scanner -->
        <section class="qr-scanner-section">
            <div class="scanner-header">
                <h2>Scanner QR Code</h2>
                <p>Scannez vos QR codes d'accès aux événements ici</p>
            </div>
            
            <?php echo do_shortcode('[siports-qr-scanner height="500px"]'); ?>
        </section>

        <!-- Types d'événements -->
        <section class="event-types">
            <h2>Types d'événements</h2>
            <div class="types-grid">
                <div class="type-card">
                    <div class="type-icon">🎤</div>
                    <h3>Conférences</h3>
                    <p>Grandes conférences avec experts internationaux sur l'avenir des ports et de la logistique</p>
                    <a href="#" onclick="filterEvents('conference')" class="type-link">Voir les conférences</a>
                </div>
                
                <div class="type-card">
                    <div class="type-icon">🔧</div>
                    <h3>Ateliers</h3>
                    <p>Sessions pratiques et techniques pour approfondir vos connaissances</p>
                    <a href="#" onclick="filterEvents('workshop')" class="type-link">Voir les ateliers</a>
                </div>
                
                <div class="type-card">
                    <div class="type-icon">🤝</div>
                    <h3>Networking</h3>
                    <p>Moments privilégiés pour développer votre réseau professionnel</p>
                    <a href="#" onclick="filterEvents('networking')" class="type-link">Voir le networking</a>
                </div>
                
                <div class="type-card">
                    <div class="type-icon">🏢</div>
                    <h3>Expositions</h3>
                    <p>Découverte des innovations et solutions des exposants</p>
                    <a href="#" onclick="filterEvents('exhibition')" class="type-link">Voir les expositions</a>
                </div>
            </div>
        </section>

        <!-- Informations pratiques -->
        <section class="practical-info">
            <h2>Informations Pratiques</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h4>🎫 Inscription</h4>
                    <p>Inscription obligatoire pour tous les événements. QR codes générés automatiquement.</p>
                </div>
                
                <div class="info-card">
                    <h4>📱 Application Mobile</h4>
                    <p>Accédez à votre programme personnalisé depuis votre smartphone.</p>
                </div>
                
                <div class="info-card">
                    <h4>🌐 Traduction</h4>
                    <p>Traduction simultanée français-anglais-arabe disponible.</p>
                </div>
                
                <div class="info-card">
                    <h4>🍽️ Restauration</h4>
                    <p>Pauses café et déjeuners networking inclus dans votre inscription.</p>
                </div>
            </div>
        </section>

        <!-- Call to action -->
        <?php if (!is_user_logged_in()): ?>
        <section class="events-cta">
            <div class="cta-content">
                <h3>Prêt à participer ?</h3>
                <p>Inscrivez-vous maintenant pour réserver votre place aux événements</p>
                <div class="cta-buttons">
                    <a href="/inscription" class="btn btn-primary">S'inscrire</a>
                    <a href="/connexion" class="btn btn-secondary">Se connecter</a>
                </div>
            </div>
        </section>
        <?php endif; ?>
    </div>
</div>

<style>
.siports-events-wrapper {
    margin: 20px 0;
}

.events-header {
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
    border-radius: 16px;
    margin-bottom: 50px;
}

.header-content h1 {
    font-size: 3.2rem;
    margin-bottom: 20px;
    font-weight: 700;
}

.header-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin-bottom: 30px;
    line-height: 1.6;
}

.event-dates {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 30px;
}

.date-badge, .location-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    backdrop-filter: blur(10px);
}

.events-program {
    margin: 60px 0;
}

.program-header {
    text-align: center;
    margin-bottom: 40px;
}

.program-header h2 {
    color: #7c3aed;
    font-size: 2.2rem;
    margin-bottom: 15px;
}

.qr-scanner-section {
    background: #f8fafc;
    padding: 50px;
    border-radius: 16px;
    margin: 50px 0;
    text-align: center;
}

.scanner-header h2 {
    color: #7c3aed;
    margin-bottom: 15px;
}

.event-types {
    margin: 60px 0;
    text-align: center;
}

.event-types h2 {
    color: #7c3aed;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-top: 40px;
}

.type-card {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    border: 1px solid #e2e8f0;
}

.type-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.type-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
}

.type-card h3 {
    color: #7c3aed;
    margin-bottom: 15px;
    font-size: 1.4rem;
}

.type-card p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 20px;
}

.type-link {
    color: #7c3aed;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: border-color 0.3s;
}

.type-link:hover {
    border-bottom-color: #7c3aed;
}

.practical-info {
    margin: 60px 0;
    text-align: center;
}

.practical-info h2 {
    color: #7c3aed;
    font-size: 2.2rem;
    margin-bottom: 50px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.info-card {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    padding: 30px;
    border-radius: 12px;
    text-align: left;
}

.info-card h4 {
    color: #7c3aed;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.info-card p {
    color: #475569;
    line-height: 1.6;
}

.events-cta {
    background: linear-gradient(45deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    padding: 60px 0;
    border-radius: 16px;
    text-align: center;
    margin: 60px 0;
}

.cta-content h3 {
    font-size: 2rem;
    margin-bottom: 15px;
}

.cta-buttons {
    margin-top: 30px;
}

.btn {
    padding: 15px 35px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 0 10px;
    display: inline-block;
    transition: all 0.3s;
}

.btn-primary {
    background: white;
    color: #7c3aed;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 2.2rem;
    }
    
    .event-dates {
        flex-direction: column;
        gap: 15px;
    }
    
    .types-grid, .info-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
function filterEvents(type) {
    // Envoyer un message à l'iframe pour filtrer les événements
    const iframe = document.querySelector('.siports-events iframe');
    if (iframe) {
        iframe.contentWindow.postMessage({
            type: 'filter_events',
            eventType: type
        }, '*');
    }
}
</script>

<?php get_footer(); ?>