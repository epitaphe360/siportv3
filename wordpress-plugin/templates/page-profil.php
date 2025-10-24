<?php
/**
 * Template Name: SIPORTS - Mon Profil
 */

if (!is_user_logged_in()) {
    wp_redirect(home_url('/connexion'));
    exit;
}

get_header(); ?>

<div class="siports-page siports-profile-page">
    <div class="siports-container-narrow">
        <div class="profile-header">
            <h1>Mon Profil</h1>
            <p>Gérez vos informations personnelles et préférences</p>
        </div>

        <div class="profile-content">
            <?php echo do_shortcode('[siports_profile show_edit="true" show_avatar="true" show_qr="true"]'); ?>
        </div>
    </div>
</div>

<style>
.siports-profile-page {
    padding: 80px 0;
    background: var(--siports-gray-50);
    min-height: calc(100vh - 200px);
}

.profile-header {
    text-align: center;
    margin-bottom: 48px;
}

.profile-header h1 {
    font-size: 36px;
    font-weight: 800;
    margin: 0 0 12px 0;
}

.profile-header p {
    font-size: 18px;
    color: var(--siports-gray-600);
    margin: 0;
}

.profile-content {
    background: var(--siports-white);
    border-radius: var(--siports-radius-lg);
    box-shadow: var(--siports-shadow-lg);
    min-height: 600px;
}
</style>

<?php get_footer(); ?>
