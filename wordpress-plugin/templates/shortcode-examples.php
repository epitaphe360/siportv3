<?php
/**
 * Exemples d'utilisation des shortcodes SIPORTS
 * Copiez-collez ces exemples dans vos pages WordPress
 */
?>

<!-- EXEMPLE 1: Page d'accueil complète -->
<div class="siports-homepage">
    <!-- Compte à rebours principal -->
    [siports_countdown show_days="true" show_hours="true" style="full"]
    
    <!-- Statistiques du salon -->
    [siports_stats show="exhibitors,visitors,countries,events" animated="true" layout="horizontal"]
    
    <!-- Exposants vedettes -->
    <h2>Exposants à la Une</h2>
    [siports_exhibitors featured="true" limit="6" layout="grid"]
    
    <!-- Événements à venir -->
    <h2>Événements Phares</h2>
    [siports_events featured_only="true" limit="4"]
    
    <!-- Partenaires officiels -->
    <h2>Nos Partenaires</h2>
    [siports_partners type="platinum" show_logos="true"]
</div>

<!-- EXEMPLE 2: Page Exposants -->
<div class="siports-exhibitors-page">
    <h1>Exposants SIPORTS 2026</h1>
    
    <!-- Filtres par pavillon -->
    <h2>Pavillon Institutionnel</h2>
    [siports_exhibitors category="institutional" limit="20" layout="grid"]
    
    <h2>Pavillon Industrie Portuaire</h2>
    [siports_exhibitors category="port-industry" limit="20" layout="grid"]
    
    <h2>Pavillon Performance & Exploitation</h2>
    [siports_exhibitors category="port-operations" limit="20" layout="grid"]
    
    <h2>Pavillon Académique</h2>
    [siports_exhibitors category="academic" limit="20" layout="grid"]
</div>

<!-- EXEMPLE 3: Page Événements -->
<div class="siports-events-page">
    <h1>Programme SIPORTS 2026</h1>
    
    <!-- Conférences -->
    <h2>Conférences Plénières</h2>
    [siports_events type="conference" limit="10"]
    
    <!-- Ateliers -->
    <h2>Ateliers Techniques</h2>
    [siports_events type="workshop" limit="8"]
    
    <!-- Sessions de réseautage -->
    <h2>Sessions de Réseautage</h2>
    [siports_events type="networking" limit="6"]
    
    <!-- Webinaires -->
    <h2>Webinaires</h2>
    [siports_events type="webinar" limit="5"]
</div>

<!-- EXEMPLE 4: Page Actualités -->
<div class="siports-news-page">
    <h1>Actualités Portuaires</h1>
    
    <!-- Articles vedettes -->
    <h2>À la Une</h2>
    [siports_news featured_only="true" limit="3" show_excerpt="true"]
    
    <!-- Par catégorie -->
    <h2>Innovation & Technologie</h2>
    [siports_news category="Innovation" limit="4"]
    
    <h2>Partenariats & Coopération</h2>
    [siports_news category="Partenariat" limit="4"]
    
    <h2>Développement Durable</h2>
    [siports_news category="Durabilité" limit="4"]
</div>

<!-- EXEMPLE 5: Sidebar/Widget -->
<div class="siports-sidebar">
    <!-- Compte à rebours compact -->
    [siports_countdown style="compact"]
    
    <!-- Stats rapides -->
    [siports_stats show="exhibitors,visitors" layout="vertical"]
    
    <!-- Prochains événements -->
    <h3>Prochains Événements</h3>
    [siports_events limit="3" featured_only="true"]
</div>

<!-- EXEMPLE 6: Page Réseautage -->
<div class="siports-networking-page">
    <h1>Réseautage Professionnel</h1>
    
    <!-- Recommandations IA -->
    [siports_networking recommendations="8" show_ai="true"]
    
    <!-- Statistiques de réseautage -->
    [siports_stats show="exhibitors,visitors,countries" animated="true"]
</div>

<!-- EXEMPLE 7: Page Partenaires -->
<div class="siports-partners-page">
    <h1>Nos Partenaires</h1>
    
    <!-- Organisateurs -->
    <h2>Organisateurs</h2>
    [siports_partners type="institutional" limit="5"]
    
    <!-- Partenaires Platine -->
    <h2>Partenaires Platine</h2>
    [siports_partners type="platinum" limit="10"]
    
    <!-- Tous les logos -->
    <h2>Tous nos Partenaires</h2>
    [siports_partners show_logos="true"]
</div>

<!-- EXEMPLE 8: Page Pavillons -->
<div class="siports-pavilions-page">
    <h1>Pavillons Thématiques</h1>
    
    <!-- Vue d'ensemble -->
    [siports_pavilions show_stats="true" layout="grid"]
    
    <!-- Statistiques globales -->
    [siports_stats show="exhibitors,visitors,events,countries" animated="true" layout="horizontal"]
</div>

<!-- EXEMPLE 9: Footer -->
<div class="siports-footer">
    <!-- Compte à rebours compact -->
    [siports_countdown style="compact" show_days="true" show_hours="false"]
    
    <!-- Liens rapides -->
    <p>
        <a href="/exposants">Exposants</a> | 
        <a href="/evenements">Événements</a> | 
        <a href="/actualites">Actualités</a> | 
        <a href="/partenaires">Partenaires</a>
    </p>
</div>

<!-- EXEMPLE 10: Page d'accueil minimaliste -->
<div class="siports-minimal-home">
    <!-- Hero avec compte à rebours -->
    [siports_countdown show_days="true" show_hours="true" style="full"]
    
    <!-- Stats principales -->
    [siports_stats show="exhibitors,visitors,countries" animated="true" layout="horizontal"]
    
    <!-- Top 3 exposants -->
    [siports_exhibitors featured="true" limit="3" layout="grid" show_contact="true"]
    
    <!-- Actualité principale -->
    [siports_news featured_only="true" limit="1" show_excerpt="true"]
</div>

<?php
/*
NOUVEAU SHORTCODE - LIENS D'AUTHENTIFICATION :

[siports_auth_links] - Boutons par défaut
[siports_auth_links style="links"] - Liens simples
[siports_auth_links style="banner"] - Bannière complète
[siports_auth_links register_text="Inscription Gratuite" login_text="Se Connecter"]
[siports_auth_links show_register="true" show_login="false"] - Inscription uniquement
[siports_auth_links register_url="https://votre-site.com/register" login_url="https://votre-site.com/login"]

NOTES D'UTILISATION :

1. Copiez le code HTML/shortcode souhaité
2. Collez-le dans l'éditeur de votre page WordPress
3. Ajustez les paramètres selon vos besoins
4. Prévisualisez et publiez

PERSONNALISATION CSS :

Ajoutez ce CSS dans votre thème pour personnaliser l'apparence :

.siports-exhibitor-card {
    border: 2px solid votre-couleur;
}

.siports-btn-primary {
    background: votre-couleur-primaire;
}

.siports-countdown {
    background: linear-gradient(135deg, votre-couleur1, votre-couleur2);
}

INTÉGRATION AVANCÉE :

Pour une intégration plus poussée, utilisez l'API REST :

fetch('/wp-json/siports/v1/exhibitors?category=port-operations&limit=10')
    .then(response => response.json())
    .then(data => console.log(data));

*/
?>