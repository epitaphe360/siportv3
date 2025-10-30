<?php
/**
 * Template Name: SIPORTS - Recherche Globale
 */

get_header(); ?>

<div class="siports-page siports-search-page">
    <section class="search-hero">
        <div class="siports-container">
            <h1>Recherche</h1>
            <p>Trouvez des exposants, événements, produits et plus encore</p>
            
            <div class="search-form-hero">
                <input type="text" id="global-search" placeholder="Que recherchez-vous ?" autofocus>
                <button class="siports-btn siports-btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Rechercher
                </button>
            </div>
        </div>
    </section>

    <section class="siports-section">
        <div class="siports-container">
            <div class="search-results">
                <?php echo do_shortcode('[siports_search show_filters="true" show_categories="true" results_per_page="20"]'); ?>
            </div>
        </div>
    </section>
</div>

<style>
.search-hero {
    background: linear-gradient(135deg, var(--siports-primary) 0%, var(--siports-primary-dark) 100%);
    padding: 80px 0;
    color: var(--siports-white);
    text-align: center;
}

.search-hero h1 {
    font-size: 48px;
    font-weight: 800;
    margin: 0 0 16px 0;
}

.search-hero p {
    font-size: 20px;
    margin: 0 0 40px 0;
    opacity: 0.9;
}

.search-form-hero {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    gap: 12px;
    background: var(--siports-white);
    padding: 8px;
    border-radius: var(--siports-radius-lg);
}

.search-form-hero input {
    flex: 1;
    padding: 16px 20px;
    border: none;
    border-radius: var(--siports-radius);
    font-size: 16px;
}

.search-form-hero input:focus {
    outline: none;
}

@media (max-width: 768px) {
    .search-form-hero {
        flex-direction: column;
    }
}
</style>

<?php get_footer(); ?>
