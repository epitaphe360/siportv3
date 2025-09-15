<?php
/**
 * Template pour afficher un mini-site dans WordPress
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

// Structure de base du mini-site
?>
<div class="siports-minisite">
    <div class="minisite-header">
        <div class="minisite-logo">
            <?php if (!empty($minisite['logo'])): ?>
                <img src="<?php echo esc_url($minisite['logo']); ?>" alt="<?php echo esc_attr($minisite['name']); ?>" />
            <?php else: ?>
                <div class="minisite-logo-placeholder"><?php echo esc_html(substr($minisite['name'], 0, 1)); ?></div>
            <?php endif; ?>
        </div>
        
        <div class="minisite-info">
            <h1 class="minisite-name"><?php echo esc_html($minisite['name']); ?></h1>
            <p class="minisite-sector"><?php echo esc_html($minisite['sector']); ?></p>
            <p class="minisite-country"><?php echo esc_html($minisite['country']); ?></p>
            
            <?php if (!empty($minisite['badges'])): ?>
                <div class="minisite-badges">
                    <?php foreach ($minisite['badges'] as $badge): ?>
                        <span class="badge badge-<?php echo esc_attr($badge['type']); ?>"><?php echo esc_html($badge['label']); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            
            <div class="minisite-actions">
                <?php if (!empty($minisite['website'])): ?>
                    <a href="<?php echo esc_url($minisite['website']); ?>" target="_blank" class="siports-btn siports-btn-outline">
                        🌐 Site Web
                    </a>
                <?php endif; ?>
                
                <a href="#" class="siports-btn siports-btn-primary" onclick="siportsContact('<?php echo esc_js($minisite['id']); ?>')">
                    ✉️ Contact
                </a>
                
                <a href="#" class="siports-btn siports-btn-outline" onclick="siportsSchedule('<?php echo esc_js($minisite['id']); ?>')">
                    📅 Rendez-vous
                </a>
            </div>
        </div>
    </div>
    
    <div class="minisite-navigation">
        <ul class="minisite-nav">
            <?php foreach ($minisite['sections'] as $section): ?>
                <li class="minisite-nav-item">
                    <a href="#section-<?php echo esc_attr($section['type']); ?>" class="minisite-nav-link">
                        <?php echo $this->get_section_icon($section['type']); ?>
                        <?php echo esc_html($this->get_section_label($section['type'])); ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    
    <div class="minisite-content">
        <?php foreach ($minisite['sections'] as $section): ?>
            <section id="section-<?php echo esc_attr($section['type']); ?>" class="minisite-section minisite-section-<?php echo esc_attr($section['type']); ?>">
                <?php echo $this->render_section($section); ?>
            </section>
        <?php endforeach; ?>
    </div>
</div>
