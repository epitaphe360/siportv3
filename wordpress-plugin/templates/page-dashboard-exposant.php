<?php
/**
 * Template Name: SIPORTS - Dashboard Exposant
 * Description: Tableau de bord pour les exposants
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
                <div class="sidebar-header">
                    <h3>Espace Exposant</h3>
                </div>
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Tableau de bord
                    </a>
                    <a href="#minisite" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Mon Mini-site
                    </a>
                    <a href="#products" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h6v11a2 2 0 0 1-2 2h-1"/></svg>
                        Mes Produits
                    </a>
                    <a href="#appointments" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                        Rendez-vous
                    </a>
                    <a href="#analytics" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        Statistiques
                    </a>
                    <a href="#profile" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Mon Profil
                    </a>
                </nav>
            </aside>

            <main class="dashboard-content">
                <div class="dashboard-header">
                    <div>
                        <h1>Dashboard Exposant</h1>
                        <p>Gérez votre présence à SIPORT 2026</p>
                    </div>
                    <div class="header-actions">
                        <a href="/mon-minisite" class="siports-btn siports-btn-outline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Éditer Mini-site
                        </a>
                        <a href="/ajouter-produit" class="siports-btn siports-btn-primary">
                            Ajouter Produit
                        </a>
                    </div>
                </div>

                <div class="dashboard-app">
                    <?php echo do_shortcode('[siports_exhibitor_dashboard show_stats="true" show_minisite="true" show_products="true"]'); ?>
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
}

.dashboard-header p {
    font-size: 16px;
    color: var(--siports-gray-600);
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 12px;
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

    .header-actions {
        flex-direction: column;
        width: 100%;
    }

    .header-actions .siports-btn {
        width: 100%;
    }
}
</style>

<?php get_footer(); ?>
