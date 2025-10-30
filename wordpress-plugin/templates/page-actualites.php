<?php
/**
 * Template Name: SIPORTS - Actualités
 * Description: Blog et actualités de l'industrie portuaire
 */

get_header(); ?>

<div class="siports-page siports-news-page">

    <!-- Hero Section -->
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">Blog & Actualités</span>
                <h1 class="siports-hero-title">Actualités</h1>
                <p class="siports-hero-subtitle">
                    Restez informé des dernières nouvelles de l'industrie portuaire et maritime.
                    <br>Articles, analyses et interviews d'experts.
                </p>
            </div>
        </div>
        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Featured News -->
    <section class="siports-section">
        <div class="siports-container">
            <div class="siports-section-header">
                <span class="section-label">À la Une</span>
                <h2 class="siports-section-title">Articles Vedettes</h2>
            </div>
            <?php echo do_shortcode('[siports_featured_news limit="3" layout="hero"]'); ?>
        </div>
    </section>

    <!-- News Categories -->
    <section class="siports-section siports-section-gray">
        <div class="siports-container">
            <div class="categories-filter">
                <button class="category-btn active" data-category="">Tout</button>
                <button class="category-btn" data-category="industry">Industrie</button>
                <button class="category-btn" data-category="technology">Technologie</button>
                <button class="category-btn" data-category="sustainability">Durabilité</button>
                <button class="category-btn" data-category="regulations">Réglementation</button>
                <button class="category-btn" data-category="interviews">Interviews</button>
            </div>

            <div class="news-grid">
                <?php echo do_shortcode('[siports_news layout="grid" limit="12" show_excerpt="true" show_author="true"]'); ?>
            </div>

            <div class="section-cta">
                <button class="siports-btn siports-btn-outline" id="load-more">
                    Charger Plus d'Articles
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="siports-section siports-section-dark">
        <div class="siports-container">
            <div class="newsletter-content">
                <div class="newsletter-text">
                    <h2 class="siports-section-title">Newsletter SIPORTS</h2>
                    <p class="siports-section-subtitle" style="color: rgba(255,255,255,0.9);">
                        Recevez les dernières actualités et informations exclusives directement dans votre boîte mail
                    </p>
                </div>
                <div class="newsletter-form">
                    <form id="newsletter-subscribe">
                        <input type="email" placeholder="Votre adresse e-mail" required>
                        <button type="submit" class="siports-btn siports-btn-secondary">
                            S'abonner
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                            </svg>
                        </button>
                    </form>
                </div>
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

.categories-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-bottom: 48px;
}

.category-btn {
    padding: 12px 24px;
    background: var(--siports-white);
    border: 2px solid var(--siports-gray-300);
    border-radius: var(--siports-radius-full);
    font-weight: 600;
    font-size: 15px;
    color: var(--siports-gray-700);
    cursor: pointer;
    transition: var(--siports-transition);
}

.category-btn:hover {
    border-color: var(--siports-primary);
    color: var(--siports-primary);
}

.category-btn.active {
    background: var(--siports-primary);
    border-color: var(--siports-primary);
    color: var(--siports-white);
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 32px;
}

.section-cta {
    text-align: center;
    margin-top: 48px;
}

.newsletter-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
}

.newsletter-form form {
    display: flex;
    gap: 12px;
}

.newsletter-form input {
    flex: 1;
    padding: 16px 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--siports-radius);
    background: rgba(255, 255, 255, 0.1);
    color: var(--siports-white);
    font-size: 16px;
}

.newsletter-form input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.newsletter-form input:focus {
    outline: none;
    border-color: var(--siports-white);
    background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
    .news-grid {
        grid-template-columns: 1fr;
    }

    .newsletter-content {
        grid-template-columns: 1fr;
        gap: 32px;
        text-align: center;
    }

    .newsletter-form form {
        flex-direction: column;
    }
}
</style>

<?php get_footer(); ?>
