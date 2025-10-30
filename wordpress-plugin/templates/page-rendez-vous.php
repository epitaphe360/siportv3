<?php
/**
 * Template Name: SIPORTS - Rendez-vous
 */

if (!is_user_logged_in()) {
    wp_redirect(home_url('/connexion'));
    exit;
}

get_header(); ?>

<div class="siports-page siports-appointments-page">
    <section class="siports-section">
        <div class="siports-container-narrow">
            <div class="page-header">
                <h1>Mes Rendez-vous</h1>
                <p>Planifiez et gérez vos rendez-vous pendant SIPORT 2026</p>
            </div>

            <div class="appointments-content">
                <?php echo do_shortcode('[siports_appointments show_calendar="true" show_upcoming="true" allow_booking="true"]'); ?>
            </div>
        </div>
    </section>
</div>

<style>
.siports-appointments-page {
    padding: 80px 0;
    background: var(--siports-gray-50);
}

.page-header {
    text-align: center;
    margin-bottom: 48px;
}

.page-header h1 {
    font-size: 36px;
    font-weight: 800;
    margin: 0 0 12px 0;
}

.page-header p {
    font-size: 18px;
    color: var(--siports-gray-600);
    margin: 0;
}

.appointments-content {
    background: var(--siports-white);
    border-radius: var(--siports-radius-lg);
    box-shadow: var(--siports-shadow-lg);
    min-height: 600px;
}
</style>

<?php get_footer(); ?>
