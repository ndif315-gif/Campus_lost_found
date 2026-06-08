/**
 * INTERNATIONALIZATION (i18n) MODULE
 * Handles English and French language support
 * Usage: i18n.t('key') or i18n.t('section.key')
 */

const i18n = {
    currentLanguage: localStorage.getItem('language') || 'en',
    
    translations: {
        en: {
            app: {
                title: 'Campus Lost & Found',
                subtitle: 'Find your lost items and return found items'
            },
            nav: {
                home: 'Home',
                dashboard: 'Dashboard',
                reportLost: 'Report Lost',
                reportFound: 'Report Found',
                notifications: 'Notifications',
                myItems: 'My Items',
                profile: 'Profile',
                logout: 'Logout'
            },
            auth: {
                login: 'Login',
                register: 'Register',
                email: 'Email Address',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                fullName: 'Full Name',
                studentId: 'Student ID',
                signUp: 'Sign Up',
                noAccount: 'No account yet?',
                alreadyHave: 'Already have an account?',
                forgotPassword: 'Forgot Password?',
                loginSuccess: 'Logged in successfully',
                registerSuccess: 'Account created successfully',
                loginError: 'Invalid email or password',
                registerError: 'Failed to create account'
            },
            report: {
                reportLost: 'Report Lost Item',
                reportFound: 'Report Found Item',
                itemName: 'Item Name',
                category: 'Category',
                brand: 'Brand (Optional)',
                color: 'Color',
                description: 'Detailed Description',
                descriptionHint: 'Include details like: condition, visible marks, missing parts, etc.',
                location: 'Last Seen Location',
                foundLocation: 'Found Location',
                uploadPhoto: 'Upload Photo',
                uploadPhotoHint: 'Clear photos help others identify your item',
                submit: 'Submit Report',
                success: 'Item reported successfully',
                error: 'Failed to report item'
            },
            dashboard: {
                welcome: 'Welcome',
                myLostItems: 'My Lost Items',
                myFoundItems: 'My Found Items',
                recentMatches: 'Recent Matches',
                noItems: 'No items found',
                status: 'Status',
                searching: 'Searching',
                found: 'Found',
                collected: 'Collected'
            },
            notifications: {
                notifications: 'Notifications',
                noNotifications: 'No new notifications',
                potentialMatch: 'Potential Match Found',
                itemCollected: 'Item Collected',
                itemFound: 'Your item was found',
                viewDetails: 'View Details'
            },
            match: {
                matchScore: 'Match Score',
                viewMatch: 'View Match',
                contact: 'Contact Owner',
                collect: 'Mark as Collected'
            },
            common: {
                search: 'Search',
                filter: 'Filter',
                sort: 'Sort',
                delete: 'Delete',
                edit: 'Edit',
                cancel: 'Cancel',
                save: 'Save',
                confirm: 'Confirm',
                close: 'Close',
                loading: 'Loading...',
                error: 'An error occurred',
                success: 'Success',
                warning: 'Warning',
                info: 'Information'
            }
        },
        fr: {
            app: {
                title: 'Campus Objets Trouvés',
                subtitle: 'Trouvez vos objets perdus et rendez les objets trouvés'
            },
            nav: {
                home: 'Accueil',
                dashboard: 'Tableau de Bord',
                reportLost: 'Signaler une Perte',
                reportFound: 'Signaler une Trouvaille',
                notifications: 'Notifications',
                myItems: 'Mes Objets',
                profile: 'Profil',
                logout: 'Déconnexion'
            },
            auth: {
                login: 'Connexion',
                register: 'Inscription',
                email: 'Adresse Email',
                password: 'Mot de passe',
                confirmPassword: 'Confirmer le mot de passe',
                fullName: 'Nom Complet',
                studentId: 'Numéro Étudiant',
                signUp: 'S\'inscrire',
                noAccount: 'Pas encore de compte?',
                alreadyHave: 'Vous avez déjà un compte?',
                forgotPassword: 'Mot de passe oublié?',
                loginSuccess: 'Connecté avec succès',
                registerSuccess: 'Compte créé avec succès',
                loginError: 'Email ou mot de passe invalide',
                registerError: 'Échec de la création du compte'
            },
            report: {
                reportLost: 'Signaler un Objet Perdu',
                reportFound: 'Signaler un Objet Trouvé',
                itemName: 'Nom de l\'objet',
                category: 'Catégorie',
                brand: 'Marque (Optionnel)',
                color: 'Couleur',
                description: 'Description Détaillée',
                descriptionHint: 'Incluez des détails comme: état, marques visibles, pièces manquantes, etc.',
                location: 'Dernier Lieu Vu',
                foundLocation: 'Lieu de Trouvaille',
                uploadPhoto: 'Télécharger une Photo',
                uploadPhotoHint: 'Des photos claires aident les autres à identifier votre objet',
                submit: 'Soumettre le Rapport',
                success: 'Objet signalé avec succès',
                error: 'Échec du signalement de l\'objet'
            },
            dashboard: {
                welcome: 'Bienvenue',
                myLostItems: 'Mes Objets Perdus',
                myFoundItems: 'Mes Objets Trouvés',
                recentMatches: 'Correspondances Récentes',
                noItems: 'Aucun objet trouvé',
                status: 'Statut',
                searching: 'En Recherche',
                found: 'Trouvé',
                collected: 'Collecté'
            },
            notifications: {
                notifications: 'Notifications',
                noNotifications: 'Aucune nouvelle notification',
                potentialMatch: 'Correspondance Potentielle Trouvée',
                itemCollected: 'Objet Collecté',
                itemFound: 'Votre objet a été trouvé',
                viewDetails: 'Voir les Détails'
            },
            match: {
                matchScore: 'Score de Correspondance',
                viewMatch: 'Voir la Correspondance',
                contact: 'Contacter le Propriétaire',
                collect: 'Marquer comme Collecté'
            },
            common: {
                search: 'Rechercher',
                filter: 'Filtrer',
                sort: 'Trier',
                delete: 'Supprimer',
                edit: 'Modifier',
                cancel: 'Annuler',
                save: 'Enregistrer',
                confirm: 'Confirmer',
                close: 'Fermer',
                loading: 'Chargement...',
                error: 'Une erreur s\'est produite',
                success: 'Succès',
                warning: 'Avertissement',
                info: 'Information'
            }
        }
    },

    /**
     * Get translation by key
     * @param {string} key - Key path like 'section.key'
     * @param {string} lang - Optional language code
     * @returns {string} Translated string
     */
    t(key, lang = null) {
        const language = lang || this.currentLanguage;
        const keys = key.split('.');
        let translation = this.translations[language] || this.translations.en;
        
        for (let k of keys) {
            translation = translation[k];
            if (!translation) return key;
        }
        
        return translation;
    },

    /**
     * Switch language
     * @param {string} lang - Language code ('en' or 'fr')
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePageLanguage();
        }
    },

    /**
     * Update all elements with data-i18n attribute
     */
    updatePageLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    },

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.updatePageLanguage();
});
