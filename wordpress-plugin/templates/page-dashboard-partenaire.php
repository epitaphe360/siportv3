<?php
/**
 * Template Name: SIPORTS - Dashboard Partenaire
 */

if (!is_user_logged_in()) {
    wp_redirect(home_url('/connexion'));
    exit;
}

get_header(); ?>

<div class="siports-page siports-dashboard-page">
    <div class="siports-container-fluid">
        <div class="dashboard-wrapper">
            <aside class="dashboard-sidebar">
                <div class="sidebar-header"><h3>Espace Partenaire</h3></div>
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/></svg>
                        Tableau de bord
                    </a>
                    <a href="#visibility" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>
                        Ma Visibilité
                    </a>
                    <a href="#analytics" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/></svg>
                        Statistiques
                    </a>
                </nav>
            </aside>

            <main class="dashboard-content">
                <div class="dashboard-header">
                    <div>
                        <h1>Dashboard Partenaire</h1>
                        <p>Suivez l'impact de votre partenariat</p>
                    </div>
                </div>

                <div class="dashboard-app">
                    <?php echo do_shortcode('[siports_partner_dashboard show_stats="true" show_visibility="true"]'); ?>
                </div>
            </main>
        </div>
    </div>
</div>

<style>
.dashboard-wrapper { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 200px); }
.dashboard-sidebar { background: var(--siports-white); border-right: 1px solid var(--siports-gray-200); padding: 32px 0; }
.sidebar-header { padding: 0 24px 24px; border-bottom: 1px solid var(--siports-gray-200); }
.sidebar-header h3 { font-size: 20px; font-weight: 700; margin: 0; }
.sidebar-nav { padding: 24px 0; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 24px; color: var(--siports-gray-700); text-decoration: none; font-weight: 600; transition: var(--siports-transition); }
.nav-item svg { width: 20px; height: 20px; }
.nav-item:hover { background: var(--siports-gray-100); color: var(--siports-primary); }
.nav-item.active { background: var(--siports-primary); color: var(--siports-white); }
.dashboard-content { padding: 40px; background: var(--siports-gray-50); }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.dashboard-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px 0; }
.dashboard-header p { font-size: 16px; color: var(--siports-gray-600); margin: 0; }
.dashboard-app { background: var(--siports-white); border-radius: var(--siports-radius-lg); box-shadow: var(--siports-shadow-md); min-height: 600px; }
</style>

<?php get_footer(); ?>
