<?php
/**
 * Template Name: Page Exposants SIPORTS
 */

get_header(); ?>

<div class="siports-page-wrapper">
    <div class="container">
        <!-- En-tête de page -->
        <header class="page-header">
            <h1 class="page-title">Nos Exposants SIPORTS 2026</h1>
            <p class="page-description">
                Découvrez les leaders de l'industrie portuaire mondiale présents à El Jadida.
                Plus de 200 entreprises de 40 pays vous attendent.
            </p>
        </header>

        <!-- Barre de recherche intégrée -->
        <div class="siports-search-section">
            <div class="search-header">
                <h2>Rechercher un exposant</h2>
                <p>Utilisez les filtres ci-dessous pour trouver les exposants qui vous intéressent</p>
            </div>
            
            <!-- Intégration de l'application SIPORTS pour les exposants -->
            <?php echo do_shortcode('[siports-exhibitors height="900px" width="100%"]'); ?>
        </div>

        <!-- Section promotionnelle -->
        <div class="siports-cta-section">
            <div class="cta-content">
                <h3>Vous êtes exposant ?</h3>
                <p>Créez votre profil et commencez à réseauter dès maintenant</p>
                <div class="cta-buttons">
                    <a href="/inscription" class="btn btn-primary">S'inscrire comme exposant</a>
                    <a href="/connexion" class="btn btn-secondary">Se connecter</a>
                </div>
            </div>
        </div>

        <!-- Section événements liés -->
        <div class="related-events">
            <h3>Événements pour exposants</h3>
            <?php echo do_shortcode('[siports-events type="exhibition" height="400px"]'); ?>
        </div>
    </div>
</div>

<style>
.siports-page-wrapper {
    margin: 40px 0;
}

.page-header {
    text-align: center;
    margin-bottom: 50px;
    padding: 40px 0;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    border-radius: 12px;
}

.page-title {
    font-size: 2.5rem;
    margin-bottom: 15px;
    font-weight: 700;
}

.page-description {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
}

.siports-search-section {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 12px;
    margin-bottom: 40px;
}

.search-header {
    text-align: center;
    margin-bottom: 30px;
}

.search-header h2 {
    color: #1e3a8a;
    margin-bottom: 10px;
}

.siports-cta-section {
    background: linear-gradient(45deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 50px;
    border-radius: 12px;
    text-align: center;
    margin: 40px 0;
}

.cta-buttons {
    margin-top: 25px;
}

.btn {
    padding: 12px 30px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    margin: 0 10px;
    display: inline-block;
    transition: all 0.3s;
}

.btn-primary {
    background: white;
    color: #10b981;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.related-events {
    margin-top: 50px;
}

.related-events h3 {
    color: #1e3a8a;
    margin-bottom: 25px;
    font-size: 1.8rem;
}
</style>

<?php get_footer(); ?>