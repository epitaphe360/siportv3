<?php
/**
 * Template Name: SIPORTS - Liste des Exposants
 * Description: Page élégante affichant la liste complète des exposants SIPORT 2026
 */

get_header(); ?>

<div id="primary" class="content-area siports-exposants-page">

    <!-- Hero Section -->
    <section class="siports-hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="container">
                <span class="hero-badge">SIPORT 2026 - MAROC</span>
                <h1 class="hero-title">Nos Exposants</h1>
                <p class="hero-subtitle">
                    Découvrez les leaders de l'industrie portuaire et maritime qui participent à SIPORT 2026.
                    <br>Plus de 200 exposants internationaux présents à Casablanca.
                </p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number"><?php echo do_shortcode('[siports_stats show="exhibitors" format="number"]'); ?></span>
                        <span class="stat-label">Exposants</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number"><?php echo do_shortcode('[siports_stats show="countries" format="number"]'); ?></span>
                        <span class="stat-label">Pays</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">10+</span>
                        <span class="stat-label">Secteurs</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Filtres Section -->
    <section class="siports-filters-section">
        <div class="container">
            <div class="filters-wrapper">
                <div class="filter-group">
                    <label for="sector-filter" class="filter-label">
                        <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M3 12h18M3 18h18"/>
                        </svg>
                        Secteur d'activité
                    </label>
                    <select id="sector-filter" class="filter-select">
                        <option value="">Tous les secteurs</option>
                        <option value="port-operations">Opérations Portuaires</option>
                        <option value="logistics">Logistique & Transport</option>
                        <option value="maritime-services">Services Maritimes</option>
                        <option value="equipment">Équipements & Technologies</option>
                        <option value="consulting">Conseil & Formation</option>
                        <option value="digital">Digital & Innovation</option>
                        <option value="security">Sécurité & Sûreté</option>
                        <option value="environment">Environnement & Durabilité</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="country-filter" class="filter-label">
                        <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        Pays
                    </label>
                    <select id="country-filter" class="filter-select">
                        <option value="">Tous les pays</option>
                        <option value="maroc">Maroc</option>
                        <option value="france">France</option>
                        <option value="espagne">Espagne</option>
                        <option value="allemagne">Allemagne</option>
                        <option value="chine">Chine</option>
                        <option value="emirats">Émirats Arabes Unis</option>
                    </select>
                </div>

                <div class="filter-group filter-search-group">
                    <label for="search-filter" class="filter-label">
                        <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        Rechercher
                    </label>
                    <input
                        type="text"
                        id="search-filter"
                        class="filter-input"
                        placeholder="Nom de l'entreprise..."
                    >
                </div>

                <div class="filter-group filter-toggle-group">
                    <label class="filter-checkbox">
                        <input type="checkbox" id="featured-filter">
                        <span class="checkbox-label">
                            <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Exposants vedettes
                        </span>
                    </label>
                </div>

                <button id="reset-filters" class="btn-reset-filters">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 4v6h6M23 20v-6h-6"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                    Réinitialiser
                </button>
            </div>
        </div>
    </section>

    <!-- Liste des Exposants -->
    <section class="siports-exhibitors-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Explorez nos Exposants</h2>
                <div class="view-toggles">
                    <button class="view-toggle active" data-view="grid" title="Vue grille">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                        </svg>
                    </button>
                    <button class="view-toggle" data-view="list" title="Vue liste">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"/>
                            <line x1="8" y1="12" x2="21" y2="12"/>
                            <line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Shortcode Integration -->
            <div id="exhibitors-container" class="exhibitors-container">
                <?php echo do_shortcode('[siports_exhibitors layout="grid" limit="100" show_search="false"]'); ?>
            </div>

            <!-- Loading State -->
            <div id="loading-state" class="loading-state" style="display: none;">
                <div class="loading-spinner"></div>
                <p>Chargement des exposants...</p>
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="empty-state" style="display: none;">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>Aucun exposant trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
                <button onclick="document.getElementById('reset-filters').click()" class="btn-primary">
                    Réinitialiser les filtres
                </button>
            </div>
        </div>
    </section>

    <!-- Call to Action -->
    <section class="siports-cta-section">
        <div class="container">
            <div class="cta-content">
                <div class="cta-text">
                    <h2 class="cta-title">Vous souhaitez devenir exposant ?</h2>
                    <p class="cta-description">
                        Rejoignez les leaders de l'industrie portuaire et maritime au SIPORT 2026.
                        Profitez d'une visibilité exceptionnelle auprès de milliers de professionnels.
                    </p>
                </div>
                <div class="cta-actions">
                    <a href="/devenir-exposant" class="btn-primary btn-large">
                        Devenir Exposant
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                    <a href="/contact" class="btn-secondary btn-large">
                        Nous Contacter
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Partners Section -->
    <section class="siports-partners-section">
        <div class="container">
            <h2 class="section-title-center">Nos Partenaires</h2>
            <div class="partners-grid">
                <?php echo do_shortcode('[siports_partners layout="grid" limit="8" featured="true"]'); ?>
            </div>
        </div>
    </section>

</div>

<?php get_footer(); ?>
