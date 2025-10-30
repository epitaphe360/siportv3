/**
 * SIPORTS - Page Exposants JavaScript
 * Gestion des filtres et interactions
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        selectors: {
            container: '#exhibitors-container',
            cards: '.siports-exhibitor-card',
            sectorFilter: '#sector-filter',
            countryFilter: '#country-filter',
            searchFilter: '#search-filter',
            featuredFilter: '#featured-filter',
            resetButton: '#reset-filters',
            viewToggles: '.view-toggle',
            loadingState: '#loading-state',
            emptyState: '#empty-state'
        },
        classes: {
            hidden: 'hidden',
            active: 'active',
            gridView: 'siports-exhibitors-grid',
            listView: 'siports-exhibitors-list'
        },
        debounceDelay: 300
    };

    // État de l'application
    let state = {
        filters: {
            sector: '',
            country: '',
            search: '',
            featured: false
        },
        currentView: 'grid',
        allCards: [],
        debounceTimer: null
    };

    /**
     * Initialisation
     */
    function init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    /**
     * Configuration des événements et du state initial
     */
    function setup() {
        // Récupérer toutes les cartes d'exposants
        state.allCards = Array.from(document.querySelectorAll(CONFIG.selectors.cards));

        // Ajouter les data attributes pour le filtrage
        enhanceCards();

        // Attacher les événements
        attachEventListeners();

        // Log de confirmation
        console.log('SIPORTS Exposants: Initialized with', state.allCards.length, 'exhibitors');
    }

    /**
     * Enrichir les cartes avec des data attributes pour faciliter le filtrage
     */
    function enhanceCards() {
        state.allCards.forEach(card => {
            // Extraire les informations de la carte
            const companyName = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent?.toLowerCase() || '';

            // Ajouter les data attributes
            card.setAttribute('data-company', companyName);
            card.setAttribute('data-description', description);

            // Déterminer si c'est un exposant vedette (exemple: basé sur une classe CSS)
            const isFeatured = card.classList.contains('featured') ||
                              card.querySelector('.featured-badge') !== null;
            card.setAttribute('data-featured', isFeatured ? 'true' : 'false');
        });
    }

    /**
     * Attacher tous les événements
     */
    function attachEventListeners() {
        // Filtres
        const sectorFilter = document.querySelector(CONFIG.selectors.sectorFilter);
        const countryFilter = document.querySelector(CONFIG.selectors.countryFilter);
        const searchFilter = document.querySelector(CONFIG.selectors.searchFilter);
        const featuredFilter = document.querySelector(CONFIG.selectors.featuredFilter);
        const resetButton = document.querySelector(CONFIG.selectors.resetButton);

        if (sectorFilter) {
            sectorFilter.addEventListener('change', handleSectorChange);
        }

        if (countryFilter) {
            countryFilter.addEventListener('change', handleCountryChange);
        }

        if (searchFilter) {
            searchFilter.addEventListener('input', handleSearchInput);
        }

        if (featuredFilter) {
            featuredFilter.addEventListener('change', handleFeaturedChange);
        }

        if (resetButton) {
            resetButton.addEventListener('click', handleReset);
        }

        // Toggles de vue
        const viewToggles = document.querySelectorAll(CONFIG.selectors.viewToggles);
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', handleViewToggle);
        });

        // Raccourcis clavier
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Gestionnaire: Changement de secteur
     */
    function handleSectorChange(e) {
        state.filters.sector = e.target.value.toLowerCase();
        applyFilters();
    }

    /**
     * Gestionnaire: Changement de pays
     */
    function handleCountryChange(e) {
        state.filters.country = e.target.value.toLowerCase();
        applyFilters();
    }

    /**
     * Gestionnaire: Recherche (avec debounce)
     */
    function handleSearchInput(e) {
        const searchValue = e.target.value.toLowerCase().trim();

        // Debounce pour éviter trop d'appels
        if (state.debounceTimer) {
            clearTimeout(state.debounceTimer);
        }

        state.debounceTimer = setTimeout(() => {
            state.filters.search = searchValue;
            applyFilters();
        }, CONFIG.debounceDelay);
    }

    /**
     * Gestionnaire: Exposants vedettes
     */
    function handleFeaturedChange(e) {
        state.filters.featured = e.target.checked;
        applyFilters();
    }

    /**
     * Gestionnaire: Réinitialiser les filtres
     */
    function handleReset() {
        // Réinitialiser le state
        state.filters = {
            sector: '',
            country: '',
            search: '',
            featured: false
        };

        // Réinitialiser les inputs
        const sectorFilter = document.querySelector(CONFIG.selectors.sectorFilter);
        const countryFilter = document.querySelector(CONFIG.selectors.countryFilter);
        const searchFilter = document.querySelector(CONFIG.selectors.searchFilter);
        const featuredFilter = document.querySelector(CONFIG.selectors.featuredFilter);

        if (sectorFilter) sectorFilter.value = '';
        if (countryFilter) countryFilter.value = '';
        if (searchFilter) searchFilter.value = '';
        if (featuredFilter) featuredFilter.checked = false;

        // Appliquer les filtres (afficher tout)
        applyFilters();

        // Animation du bouton
        const resetButton = document.querySelector(CONFIG.selectors.resetButton);
        if (resetButton) {
            resetButton.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                resetButton.style.transform = '';
            }, 300);
        }
    }

    /**
     * Gestionnaire: Toggle de vue (grille/liste)
     */
    function handleViewToggle(e) {
        const toggle = e.currentTarget;
        const view = toggle.getAttribute('data-view');

        if (view === state.currentView) return;

        // Mettre à jour le state
        state.currentView = view;

        // Mettre à jour les toggles actifs
        document.querySelectorAll(CONFIG.selectors.viewToggles).forEach(t => {
            t.classList.remove(CONFIG.classes.active);
        });
        toggle.classList.add(CONFIG.classes.active);

        // Mettre à jour la vue du container
        const container = document.querySelector(CONFIG.selectors.container);
        if (container) {
            const gridContainer = container.querySelector('.siports-exhibitors-grid');
            if (gridContainer) {
                if (view === 'list') {
                    gridContainer.classList.remove('siports-exhibitors-grid');
                    gridContainer.classList.add('siports-exhibitors-list');
                    gridContainer.style.display = 'flex';
                    gridContainer.style.flexDirection = 'column';
                    gridContainer.style.gap = '16px';
                } else {
                    gridContainer.classList.remove('siports-exhibitors-list');
                    gridContainer.classList.add('siports-exhibitors-grid');
                    gridContainer.style.display = '';
                    gridContainer.style.flexDirection = '';
                }
            }
        }
    }

    /**
     * Gestionnaire: Raccourcis clavier
     */
    function handleKeyboardShortcuts(e) {
        // Ctrl+K ou Cmd+K: Focus sur la recherche
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchFilter = document.querySelector(CONFIG.selectors.searchFilter);
            if (searchFilter) {
                searchFilter.focus();
                searchFilter.select();
            }
        }

        // Escape: Réinitialiser les filtres
        if (e.key === 'Escape') {
            const searchFilter = document.querySelector(CONFIG.selectors.searchFilter);
            if (document.activeElement === searchFilter) {
                searchFilter.blur();
            } else {
                handleReset();
            }
        }
    }

    /**
     * Appliquer tous les filtres
     */
    function applyFilters() {
        showLoading();

        // Filtrer les cartes
        let visibleCount = 0;

        state.allCards.forEach(card => {
            const shouldShow = matchesFilters(card);

            if (shouldShow) {
                card.style.display = '';
                card.style.animation = 'slideInUp 0.4s ease-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Afficher l'état approprié
        setTimeout(() => {
            hideLoading();

            if (visibleCount === 0) {
                showEmptyState();
            } else {
                hideEmptyState();
            }

            // Log pour debug
            console.log('Filters applied:', state.filters, '| Visible:', visibleCount);
        }, 100);
    }

    /**
     * Vérifier si une carte correspond aux filtres
     */
    function matchesFilters(card) {
        const { sector, country, search, featured } = state.filters;

        // Filtre secteur
        if (sector) {
            const cardSector = card.getAttribute('data-sector') || '';
            if (!cardSector.toLowerCase().includes(sector)) {
                return false;
            }
        }

        // Filtre pays
        if (country) {
            const cardCountry = card.getAttribute('data-country') || '';
            if (!cardCountry.toLowerCase().includes(country)) {
                return false;
            }
        }

        // Filtre recherche
        if (search) {
            const companyName = card.getAttribute('data-company') || '';
            const description = card.getAttribute('data-description') || '';

            if (!companyName.includes(search) && !description.includes(search)) {
                return false;
            }
        }

        // Filtre vedette
        if (featured) {
            const isFeatured = card.getAttribute('data-featured') === 'true';
            if (!isFeatured) {
                return false;
            }
        }

        return true;
    }

    /**
     * Afficher l'état de chargement
     */
    function showLoading() {
        const loadingState = document.querySelector(CONFIG.selectors.loadingState);
        if (loadingState) {
            loadingState.style.display = 'block';
        }

        const container = document.querySelector(CONFIG.selectors.container);
        if (container) {
            container.style.opacity = '0.5';
        }
    }

    /**
     * Masquer l'état de chargement
     */
    function hideLoading() {
        const loadingState = document.querySelector(CONFIG.selectors.loadingState);
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        const container = document.querySelector(CONFIG.selectors.container);
        if (container) {
            container.style.opacity = '1';
        }
    }

    /**
     * Afficher l'état vide
     */
    function showEmptyState() {
        const emptyState = document.querySelector(CONFIG.selectors.emptyState);
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    /**
     * Masquer l'état vide
     */
    function hideEmptyState() {
        const emptyState = document.querySelector(CONFIG.selectors.emptyState);
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    /**
     * Utilitaires
     */

    // Smooth scroll vers une section
    function scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Exporter pour utilisation externe si nécessaire
    window.SIPORTSExhibitors = {
        resetFilters: handleReset,
        applyCustomFilter: function(filterFn) {
            state.allCards.forEach(card => {
                card.style.display = filterFn(card) ? '' : 'none';
            });
        },
        getState: function() {
            return { ...state };
        }
    };

    // Démarrer l'application
    init();

})();
