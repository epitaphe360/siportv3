<?php
/**
 * Template pour les sections de mini-site
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Rendu des différents types de sections de mini-site
 * @param array $section Données de la section
 * @return string HTML de la section
 */
function siports_render_section($section) {
    ob_start();
    
    switch ($section['type']) {
        case 'about':
            siports_render_about_section($section);
            break;
        case 'products':
            siports_render_products_section($section);
            break;
        case 'services':
            siports_render_services_section($section);
            break;
        case 'team':
            siports_render_team_section($section);
            break;
        case 'gallery':
            siports_render_gallery_section($section);
            break;
        case 'testimonials':
            siports_render_testimonials_section($section);
            break;
        case 'certifications':
            siports_render_certifications_section($section);
            break;
        case 'contact':
            siports_render_contact_section($section);
            break;
        default:
            echo '<div class="minisite-section-unknown">';
            echo '<h3>Section non reconnue</h3>';
            echo '</div>';
    }
    
    return ob_get_clean();
}

/**
 * Section À propos
 */
function siports_render_about_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-about">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'À Propos'); ?></h2>
            <?php if (!empty($content['subtitle'])): ?>
                <p class="section-subtitle"><?php echo esc_html($content['subtitle']); ?></p>
            <?php endif; ?>
        </div>
        
        <div class="about-content">
            <?php if (!empty($content['image'])): ?>
                <div class="about-image">
                    <img src="<?php echo esc_url($content['image']); ?>" alt="<?php echo esc_attr($content['title'] ?? 'À Propos'); ?>" />
                </div>
            <?php endif; ?>
            
            <div class="about-text">
                <?php if (!empty($content['description'])): ?>
                    <div class="about-description">
                        <?php echo wpautop(esc_html($content['description'])); ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($content['highlights'])): ?>
                    <div class="about-highlights">
                        <ul>
                            <?php foreach ($content['highlights'] as $highlight): ?>
                                <li><?php echo esc_html($highlight); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Section Produits
 */
function siports_render_products_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-products">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Nos Produits'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['items'])): ?>
            <div class="products-grid">
                <?php foreach ($content['items'] as $product): ?>
                    <div class="product-card">
                        <?php if (!empty($product['image'])): ?>
                            <div class="product-image">
                                <img src="<?php echo esc_url($product['image']); ?>" alt="<?php echo esc_attr($product['name']); ?>" />
                            </div>
                        <?php endif; ?>
                        
                        <div class="product-info">
                            <h3 class="product-name"><?php echo esc_html($product['name']); ?></h3>
                            
                            <?php if (!empty($product['category'])): ?>
                                <p class="product-category"><?php echo esc_html($product['category']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($product['description'])): ?>
                                <p class="product-description"><?php echo esc_html($product['description']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($product['features'])): ?>
                                <div class="product-features">
                                    <ul>
                                        <?php foreach ($product['features'] as $feature): ?>
                                            <li><?php echo esc_html($feature); ?></li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Services
 */
function siports_render_services_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-services">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Nos Services'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['items'])): ?>
            <div class="services-grid">
                <?php foreach ($content['items'] as $service): ?>
                    <div class="service-card">
                        <?php if (!empty($service['icon'])): ?>
                            <div class="service-icon"><?php echo esc_html($service['icon']); ?></div>
                        <?php endif; ?>
                        
                        <h3 class="service-name"><?php echo esc_html($service['name']); ?></h3>
                        
                        <?php if (!empty($service['description'])): ?>
                            <p class="service-description"><?php echo esc_html($service['description']); ?></p>
                        <?php endif; ?>
                        
                        <?php if (!empty($service['benefits'])): ?>
                            <ul class="service-benefits">
                                <?php foreach ($service['benefits'] as $benefit): ?>
                                    <li><?php echo esc_html($benefit); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Équipe
 */
function siports_render_team_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-team">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Notre Équipe'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['members'])): ?>
            <div class="team-grid">
                <?php foreach ($content['members'] as $member): ?>
                    <div class="team-member">
                        <?php if (!empty($member['photo'])): ?>
                            <div class="member-photo">
                                <img src="<?php echo esc_url($member['photo']); ?>" alt="<?php echo esc_attr($member['name']); ?>" />
                            </div>
                        <?php else: ?>
                            <div class="member-photo-placeholder">
                                <?php echo esc_html(substr($member['name'], 0, 1)); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="member-info">
                            <h3 class="member-name"><?php echo esc_html($member['name']); ?></h3>
                            
                            <?php if (!empty($member['position'])): ?>
                                <p class="member-position"><?php echo esc_html($member['position']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($member['bio'])): ?>
                                <p class="member-bio"><?php echo esc_html($member['bio']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($member['contacts'])): ?>
                                <div class="member-contacts">
                                    <?php foreach ($member['contacts'] as $type => $value): ?>
                                        <a href="<?php echo $type === 'email' ? 'mailto:' . esc_attr($value) : esc_url($value); ?>" 
                                           class="member-contact member-contact-<?php echo esc_attr($type); ?>">
                                            <?php echo $type === 'email' ? '✉️' : '🔗'; ?>
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Galerie
 */
function siports_render_gallery_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-gallery">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Galerie & Réalisations'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['images'])): ?>
            <div class="gallery-grid">
                <?php foreach ($content['images'] as $image): ?>
                    <div class="gallery-item">
                        <a href="<?php echo esc_url($image['url']); ?>" class="gallery-link" data-lightbox="minisite-gallery">
                            <img src="<?php echo esc_url($image['url']); ?>" alt="<?php echo esc_attr($image['caption'] ?? ''); ?>" class="gallery-image" />
                            
                            <?php if (!empty($image['caption'])): ?>
                                <div class="gallery-caption">
                                    <span><?php echo esc_html($image['caption']); ?></span>
                                </div>
                            <?php endif; ?>
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Témoignages
 */
function siports_render_testimonials_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-testimonials">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Témoignages Clients'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['items'])): ?>
            <div class="testimonials-slider">
                <?php foreach ($content['items'] as $testimonial): ?>
                    <div class="testimonial-item">
                        <div class="testimonial-content">
                            <blockquote>
                                <?php echo esc_html($testimonial['text']); ?>
                            </blockquote>
                        </div>
                        
                        <div class="testimonial-author">
                            <?php if (!empty($testimonial['avatar'])): ?>
                                <div class="author-avatar">
                                    <img src="<?php echo esc_url($testimonial['avatar']); ?>" alt="<?php echo esc_attr($testimonial['name']); ?>" />
                                </div>
                            <?php endif; ?>
                            
                            <div class="author-info">
                                <p class="author-name"><?php echo esc_html($testimonial['name']); ?></p>
                                
                                <?php if (!empty($testimonial['position'])): ?>
                                    <p class="author-position"><?php echo esc_html($testimonial['position']); ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Certifications
 */
function siports_render_certifications_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-certifications">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Certifications & Accréditations'); ?></h2>
            <?php if (!empty($content['description'])): ?>
                <p class="section-description"><?php echo esc_html($content['description']); ?></p>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($content['items'])): ?>
            <div class="certifications-grid">
                <?php foreach ($content['items'] as $certification): ?>
                    <div class="certification-item">
                        <?php if (!empty($certification['image'])): ?>
                            <div class="certification-image">
                                <img src="<?php echo esc_url($certification['image']); ?>" alt="<?php echo esc_attr($certification['name']); ?>" />
                            </div>
                        <?php endif; ?>
                        
                        <div class="certification-info">
                            <h3 class="certification-name"><?php echo esc_html($certification['name']); ?></h3>
                            
                            <?php if (!empty($certification['description'])): ?>
                                <p class="certification-description"><?php echo esc_html($certification['description']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($certification['year'])): ?>
                                <p class="certification-year">Depuis <?php echo esc_html($certification['year']); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Section Contact
 */
function siports_render_contact_section($section) {
    $content = $section['content'];
    ?>
    <div class="minisite-contact">
        <div class="section-header">
            <h2><?php echo esc_html($content['title'] ?? 'Contact'); ?></h2>
            <?php if (!empty($content['subtitle'])): ?>
                <p class="section-subtitle"><?php echo esc_html($content['subtitle']); ?></p>
            <?php endif; ?>
        </div>
        
        <div class="contact-container">
            <div class="contact-info">
                <?php if (!empty($content['address'])): ?>
                    <div class="contact-item contact-address">
                        <div class="contact-icon">📍</div>
                        <div class="contact-detail">
                            <h3>Adresse</h3>
                            <p><?php echo nl2br(esc_html($content['address'])); ?></p>
                        </div>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($content['phone'])): ?>
                    <div class="contact-item contact-phone">
                        <div class="contact-icon">📞</div>
                        <div class="contact-detail">
                            <h3>Téléphone</h3>
                            <p><?php echo esc_html($content['phone']); ?></p>
                        </div>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($content['email'])): ?>
                    <div class="contact-item contact-email">
                        <div class="contact-icon">✉️</div>
                        <div class="contact-detail">
                            <h3>Email</h3>
                            <p><a href="mailto:<?php echo esc_attr($content['email']); ?>"><?php echo esc_html($content['email']); ?></a></p>
                        </div>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($content['hours'])): ?>
                    <div class="contact-item contact-hours">
                        <div class="contact-icon">🕒</div>
                        <div class="contact-detail">
                            <h3>Heures d'ouverture</h3>
                            <p><?php echo nl2br(esc_html($content['hours'])); ?></p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="contact-form">
                <h3>Envoyez-nous un message</h3>
                
                <form class="siports-contact-form" onsubmit="return siportsSubmitContact(this, '<?php echo esc_js($section['exhibitor_id'] ?? ''); ?>')">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contact-name">Nom</label>
                            <input type="text" id="contact-name" name="contact-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contact-email">Email</label>
                            <input type="email" id="contact-email" name="contact-email" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-subject">Sujet</label>
                        <input type="text" id="contact-subject" name="contact-subject" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" name="contact-message" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="siports-btn siports-btn-primary">Envoyer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <?php
}
