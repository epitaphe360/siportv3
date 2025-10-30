<?php
/**
 * Template Name: SIPORTS - Événements
 * Description: Calendrier et liste des événements, conférences et ateliers
 */

get_header(); ?>

<div class="siports-page siports-events-page">

    <!-- Hero Section -->
    <section class="siports-hero">
        <div class="siports-hero-overlay"></div>
        <div class="siports-hero-content">
            <div class="siports-container">
                <span class="siports-hero-badge">Programme SIPORT 2026</span>
                <h1 class="siports-hero-title">Événements & Conférences</h1>
                <p class="siports-hero-subtitle">
                    Plus de 50 conférences, ateliers et sessions de networking répartis sur 4 jours.
                    <br>Découvrez le programme complet et réservez votre place.
                </p>
            </div>
        </div>
        <div class="siports-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>

    <!-- Calendar View Toggle -->
    <section class="events-toolbar">
        <div class="siports-container">
            <div class="toolbar-content">
                <div class="view-selector">
                    <button class="view-btn active" data-view="list">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"/>
                            <line x1="8" y1="12" x2="21" y2="12"/>
                            <line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                        Liste
                    </button>
                    <button class="view-btn" data-view="calendar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Calendrier
                    </button>
                </div>

                <div class="filter-type">
                    <select id="event-type-filter">
                        <option value="">Tous les types</option>
                        <option value="conference">Conférences</option>
                        <option value="workshop">Ateliers</option>
                        <option value="networking">Networking</option>
                        <option value="exhibition">Exposition</option>
                    </select>
                </div>
            </div>
        </div>
    </section>

    <!-- Calendar View -->
    <section class="events-calendar-section" id="calendar-view" style="display: none;">
        <div class="siports-container">
            <?php echo do_shortcode('[siports_events_calendar month="2026-05" interactive="true"]'); ?>
        </div>
    </section>

    <!-- List View -->
    <section class="events-list-section siports-section" id="list-view">
        <div class="siports-container">
            <div class="events-content">
                <?php echo do_shortcode('[siports_events layout="timeline" show_register="true" show_speakers="true"]'); ?>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="siports-section siports-section-dark">
        <div class="siports-container siports-text-center">
            <h2 class="siports-section-title">Ne manquez aucun événement</h2>
            <p class="siports-section-subtitle" style="color: rgba(255,255,255,0.9);">
                Téléchargez le programme complet ou inscrivez-vous pour recevoir des rappels
            </p>
            <div class="cta-actions">
                <a href="/programme.pdf" class="siports-btn siports-btn-secondary siports-btn-large" download>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger le Programme
                </a>
                <a href="/inscription-visiteur" class="siports-btn siports-btn-outline siports-btn-large" style="border-color: white; color: white;">
                    S'inscrire Maintenant
                </a>
            </div>
        </div>
    </section>

</div>

<style>
.events-toolbar {
    background: var(--siports-white);
    border-bottom: 1px solid var(--siports-gray-200);
    padding: 24px 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--siports-shadow-sm);
}

.toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.view-selector {
    display: flex;
    gap: 8px;
    background: var(--siports-gray-100);
    padding: 4px;
    border-radius: var(--siports-radius);
}

.view-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    color: var(--siports-gray-600);
    cursor: pointer;
    transition: var(--siports-transition);
}

.view-btn svg {
    width: 20px;
    height: 20px;
}

.view-btn:hover {
    background: var(--siports-gray-200);
    color: var(--siports-gray-800);
}

.view-btn.active {
    background: var(--siports-white);
    color: var(--siports-primary);
    box-shadow: var(--siports-shadow-sm);
}

.filter-type select {
    padding: 12px 16px;
    border: 2px solid var(--siports-gray-300);
    border-radius: var(--siports-radius);
    font-size: 15px;
    font-weight: 600;
    color: var(--siports-gray-700);
    background: var(--siports-white);
    cursor: pointer;
    transition: var(--siports-transition);
}

.filter-type select:focus {
    outline: none;
    border-color: var(--siports-primary);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 32px;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .toolbar-content {
        flex-direction: column;
    }

    .view-selector,
    .filter-type select {
        width: 100%;
    }

    .cta-actions {
        flex-direction: column;
    }

    .cta-actions .siports-btn {
        width: 100%;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const calendarView = document.getElementById('calendar-view');
    const listView = document.getElementById('list-view');

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.getAttribute('data-view');
            if (view === 'calendar') {
                calendarView.style.display = 'block';
                listView.style.display = 'none';
            } else {
                calendarView.style.display = 'none';
                listView.style.display = 'block';
            }
        });
    });
});
</script>

<?php get_footer(); ?>
