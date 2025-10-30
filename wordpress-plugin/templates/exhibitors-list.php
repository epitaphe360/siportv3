<?php
/**
 * Template pour afficher la liste des exposants
 * Variables disponibles: $exhibitors, $atts
 */

if (empty($exhibitors) || !is_array($exhibitors)) {
    echo '<div class="siports-no-results">Aucun exposant trouvé.</div>';
    return;
}

$layout = isset($atts['layout']) ? $atts['layout'] : 'grid';
$show_search = isset($atts['show_search']) && $atts['show_search'] === 'true';
?>

<div class="siports-exhibitors-container" data-layout="<?php echo esc_attr($layout); ?>">

    <?php if ($show_search): ?>
    <div class="siports-search-box">
        <input type="text"
               class="siports-search-input"
               placeholder="Rechercher un exposant..."
               onkeyup="siportsFilterExhibitors(this.value)">
    </div>
    <?php endif; ?>

    <div class="siports-exhibitors-<?php echo esc_attr($layout); ?>">
        <?php foreach ($exhibitors as $exhibitor): ?>
            <div class="siports-exhibitor-card" data-sector="<?php echo esc_attr($exhibitor['sector'] ?? ''); ?>">
                <div class="exhibitor-card-header">
                    <?php if (!empty($exhibitor['logo_url'])): ?>
                        <img src="<?php echo esc_url($exhibitor['logo_url']); ?>"
                             alt="<?php echo esc_attr($exhibitor['company_name']); ?>"
                             class="exhibitor-logo">
                    <?php else: ?>
                        <div class="exhibitor-logo-placeholder">
                            <?php echo esc_html(substr($exhibitor['company_name'], 0, 1)); ?>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($exhibitor['featured'])): ?>
                        <span class="featured-badge">⭐ Featured</span>
                    <?php endif; ?>
                </div>

                <div class="exhibitor-card-body">
                    <h3 class="exhibitor-name">
                        <?php echo esc_html($exhibitor['company_name']); ?>
                    </h3>

                    <p class="exhibitor-sector">
                        <?php echo esc_html($exhibitor['sector'] ?? ''); ?>
                    </p>

                    <?php if (!empty($exhibitor['description'])): ?>
                        <p class="exhibitor-description">
                            <?php echo esc_html(wp_trim_words($exhibitor['description'], 20)); ?>
                        </p>
                    <?php endif; ?>
                </div>

                <div class="exhibitor-card-footer">
                    <a href="<?php echo esc_url(get_permalink() . '?exhibitor=' . $exhibitor['id']); ?>"
                       class="siports-btn siports-btn-primary">
                        Voir le profil
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<style>
.siports-exhibitors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.siports-exhibitor-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.siports-exhibitor-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.exhibitor-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.exhibitor-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 8px;
}

.exhibitor-logo-placeholder {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    border-radius: 8px;
}

.featured-badge {
    background: #fbbf24;
    color: #78350f;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.exhibitor-name {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.exhibitor-sector {
    color: #6b7280;
    font-size: 14px;
    margin: 0 0 12px 0;
}

.exhibitor-description {
    color: #4b5563;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 15px 0;
}

.exhibitor-card-footer {
    border-top: 1px solid #e5e7eb;
    padding-top: 15px;
}

.siports-btn {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
}

.siports-btn-primary {
    background: #3b82f6;
    color: white;
}

.siports-btn-primary:hover {
    background: #2563eb;
}

.siports-search-box {
    margin-bottom: 20px;
}

.siports-search-input {
    width: 100%;
    padding: 12px 20px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
}

.siports-search-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.siports-no-results {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
}
</style>

<script>
function siportsFilterExhibitors(query) {
    query = query.toLowerCase();
    const cards = document.querySelectorAll('.siports-exhibitor-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}
</script>
