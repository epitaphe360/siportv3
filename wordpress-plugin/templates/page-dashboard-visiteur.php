<?php
/**
 * Template Name: SIPORTS - Dashboard Visiteur
 * Description: Tableau de bord pour les visiteurs inscrits
 */

// Vérifier si l'utilisateur est connecté
if (!is_user_logged_in()) {
    wp_redirect(home_url('/connexion'));
    exit;
}

get_header(); ?>

<div class="siports-page siports-dashboard-page">
    <div class="siports-container-fluid">
        <div class="dashboard-wrapper">
            <!-- Sidebar Navigation -->
            <aside class="dashboard-sidebar">
                <div class="sidebar-header">
                    <h3>Mon Espace</h3>
                </div>
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Tableau de bord
                    </a>
                    <a href="#networking" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        Networking
                    </a>
                    <a href="#appointments" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                        Mes Rendez-vous
                    </a>
                    <a href="#favorites" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Favoris
                    </a>
                    <a href="#profile" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Mon Profil
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="dashboard-content">
                <div class="dashboard-header">
                    <div>
                        <h1>Bienvenue, <?php echo wp_get_current_user()->display_name; ?> !</h1>
                        <p>Votre espace personnel SIPORT 2026</p>
                    </div>
                    <a href="/evenements" class="siports-btn siports-btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>
                        Programme
                    </a>
                </div>

                <!-- Dashboard App Integration -->
                <div class="dashboard-app">
                    <?php echo do_shortcode('[siports_visitor_dashboard show_stats="true" show_upcoming="true"]'); ?>
                </div>
            </main>
        </div>
    </div>
</div>

<style>
.dashboard-wrapper {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: calc(100vh - 200px);
    gap: 0;
}

.dashboard-sidebar {
    background: var(--siports-white);
    border-right: 1px solid var(--siports-gray-200);
    padding: 32px 0;
}

.sidebar-header {
    padding: 0 24px 24px;
    border-bottom: 1px solid var(--siports-gray-200);
}

.sidebar-header h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: var(--siports-dark);
}

.sidebar-nav {
    padding: 24px 0;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 24px;
    color: var(--siports-gray-700);
    text-decoration: none;
    font-weight: 600;
    transition: var(--siports-transition);
}

.nav-item svg {
    width: 20px;
    height: 20px;
}

.nav-item:hover {
    background: var(--siports-gray-100);
    color: var(--siports-primary);
}

.nav-item.active {
    background: var(--siports-primary);
    color: var(--siports-white);
    border-left: 4px solid var(--siports-accent);
}

.dashboard-content {
    padding: 40px;
    background: var(--siports-gray-50);
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.dashboard-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
    color: var(--siports-dark);
}

.dashboard-header p {
    font-size: 16px;
    color: var(--siports-gray-600);
    margin: 0;
}

.dashboard-app {
    background: var(--siports-white);
    border-radius: var(--siports-radius-lg);
    box-shadow: var(--siports-shadow-md);
    min-height: 600px;
}

@media (max-width: 1024px) {
    .dashboard-wrapper {
        grid-template-columns: 1fr;
    }

    .dashboard-sidebar {
        border-right: none;
        border-bottom: 1px solid var(--siports-gray-200);
    }

    .sidebar-nav {
        display: flex;
        overflow-x: auto;
        padding: 16px;
    }

    .nav-item {
        white-space: nowrap;
    }
}

@media (max-width: 768px) {
    .dashboard-content {
        padding: 20px;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }

    .dashboard-header .siports-btn {
        width: 100%;
    }
}
</style>

<?php get_footer(); ?>
