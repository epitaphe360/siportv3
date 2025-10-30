<?php
/**
 * Template Name: SIPORTS - Connexion/Inscription
 */

get_header(); ?>

<div class="siports-page siports-auth-page">
    <section class="auth-section">
        <div class="siports-container-narrow">
            <div class="auth-container">
                <div class="auth-header">
                    <h1>Connexion / Inscription</h1>
                    <p>Accédez à votre espace SIPORT 2026</p>
                </div>

                <div class="auth-tabs">
                    <button class="tab-btn active" data-tab="login">Connexion</button>
                    <button class="tab-btn" data-tab="register">Inscription</button>
                </div>

                <div class="auth-content">
                    <div id="login-tab" class="tab-content active">
                        <?php echo do_shortcode('[siports_login redirect_url="/dashboard"]'); ?>
                    </div>

                    <div id="register-tab" class="tab-content">
                        <?php echo do_shortcode('[siports_register user_type="visitor" show_terms="true"]'); ?>
                    </div>
                </div>

                <div class="auth-footer">
                    <p>En vous connectant, vous acceptez nos <a href="/conditions">Conditions d'utilisation</a> et notre <a href="/confidentialite">Politique de confidentialité</a></p>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
.auth-section {
    padding: 80px 0;
    background: var(--siports-gray-50);
    min-height: calc(100vh - 200px);
}

.auth-container {
    background: var(--siports-white);
    border-radius: var(--siports-radius-lg);
    box-shadow: var(--siports-shadow-lg);
    padding: 48px;
    max-width: 500px;
    margin: 0 auto;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.auth-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
}

.auth-header p {
    color: var(--siports-gray-600);
    margin: 0;
}

.auth-tabs {
    display: flex;
    gap: 8px;
    background: var(--siports-gray-100);
    padding: 4px;
    border-radius: var(--siports-radius);
    margin-bottom: 32px;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--siports-transition);
}

.tab-btn.active {
    background: var(--siports-white);
    color: var(--siports-primary);
    box-shadow: var(--siports-shadow-sm);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.auth-footer {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--siports-gray-200);
    text-align: center;
    font-size: 14px;
    color: var(--siports-gray-600);
}

.auth-footer a {
    color: var(--siports-primary);
    text-decoration: none;
}

@media (max-width: 768px) {
    .auth-container {
        padding: 32px 24px;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tab + '-tab').classList.add('active');
        });
    });
});
</script>

<?php get_footer(); ?>
