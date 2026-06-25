// ===================================
// Le Palais Africain - JavaScript principal
// ===================================

// on attend que la page soit chargée
document.addEventListener('DOMContentLoaded', function () {

    // --- Variables ---
    var navbar = document.getElementById('navbar');
    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');
    var btnTop = document.getElementById('btnTop');
    var cartCount = document.getElementById('cartCount');

    // --- Panier stocké dans localStorage ---
    var panier = JSON.parse(localStorage.getItem('panier')) || [];

    // Mise a jour du compteur panier
    function updateCartCount() {
        var total = 0;
        for (var i = 0; i < panier.length; i++) {
            total += panier[i].quantite;
        }
        if (cartCount) {
            cartCount.textContent = total;
        }
    }

    // Sauvegarder le panier
    function sauvegarderPanier() {
        localStorage.setItem('panier', JSON.stringify(panier));
        updateCartCount();
    }

    // Initialiser le compteur
    updateCartCount();

    // --- Navbar au scroll ---
    window.addEventListener('scroll', function () {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // bouton retour en haut
        if (btnTop) {
            if (window.scrollY > 400) {
                btnTop.classList.add('visible');
            } else {
                btnTop.classList.remove('visible');
            }
        }
    });

    // --- Burger menu mobile ---
    if (burger) {
        burger.addEventListener('click', function () {
            navLinks.classList.toggle('open');

            // changer l'icone
            var icon = burger.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // fermer le menu quand on clique sur un lien
        var liens = navLinks.querySelectorAll('a');
        for (var i = 0; i < liens.length; i++) {
            liens[i].addEventListener('click', function () {
                navLinks.classList.remove('open');
                var icon = burger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        }
    }

    // --- Bouton retour en haut ---
    if (btnTop) {
        btnTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Filtrage du menu ---
    var filtres = document.querySelectorAll('.filtre-btn');
    var cartes = document.querySelectorAll('.carte');

    for (var i = 0; i < filtres.length; i++) {
        filtres[i].addEventListener('click', function () {
            // retirer active de tous
            for (var j = 0; j < filtres.length; j++) {
                filtres[j].classList.remove('active');
            }
            this.classList.add('active');

            var categorie = this.getAttribute('data-filtre');

            for (var k = 0; k < cartes.length; k++) {
                var carte = cartes[k];
                if (categorie === 'tous' || carte.getAttribute('data-categorie') === categorie) {
                    carte.style.display = 'block';
                } else {
                    carte.style.display = 'none';
                }
            }
        });
    }

    // --- Ajouter au panier ---
    var btnsAjouter = document.querySelectorAll('.btn-ajouter');

    for (var i = 0; i < btnsAjouter.length; i++) {
        btnsAjouter[i].addEventListener('click', function () {
            var nom = this.getAttribute('data-nom');
            var prix = parseInt(this.getAttribute('data-prix'));
            var btn = this;

            // verifier si l'article est deja dans le panier
            var existe = false;
            for (var j = 0; j < panier.length; j++) {
                if (panier[j].nom === nom) {
                    panier[j].quantite += 1;
                    existe = true;
                    break;
                }
            }

            // sinon on l'ajoute
            if (!existe) {
                panier.push({
                    nom: nom,
                    prix: prix,
                    quantite: 1
                });
            }

            sauvegarderPanier();

            // animation du bouton
            btn.classList.add('added');
            btn.innerHTML = '<i class="fas fa-check"></i> Ajouter';

            setTimeout(function () {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fas fa-plus"></i> Ajouter';
            }, 1500);

            // notification
            showNotification(nom + ' ajouté au panier !');
        });
    }

    // --- Notification ---
    function showNotification(message) {
        var notif = document.getElementById('notification');
        var notifMsg = document.getElementById('notifMessage');

        if (notif && notifMsg) {
            notifMsg.textContent = message;
            notif.classList.add('show');

            setTimeout(function () {
                notif.classList.remove('show');
            }, 2500);
        }
    }

    // --- Animation au scroll (les elements apparaissent) ---
    var elements = document.querySelectorAll('.carte, .avis-carte, .galerie-item, .stat-item, .info-item');

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add('apparaitre');
    }

    // observer pour faire apparaitre les elements
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('visible');
                }
            }
        }, {
            threshold: 0.1
        });

        var elementsAnim = document.querySelectorAll('.apparaitre');
        for (var i = 0; i < elementsAnim.length; i++) {
            observer.observe(elementsAnim[i]);
        }
    }

    // --- Modal Détail Produit ---
    var produitModal = document.getElementById('produitModal');
    var closeModal = document.getElementById('closeModal');
    var modalImg = document.getElementById('modalImg');
    var modalNom = document.getElementById('modalNom');
    var modalTemps = document.getElementById('modalTemps');
    var modalPortion = document.getElementById('modalPortion');
    var modalDesc = document.getElementById('modalDesc');
    var modalPrix = document.getElementById('modalPrix');
    var modalBtnAjouter = document.getElementById('modalBtnAjouter');

    // Variable temporaire pour stocker le produit ouvert dans le modal
    var produitActuel = null;

    // Clic sur une carte pour ouvrir le modal
    for (var i = 0; i < cartes.length; i++) {
        cartes[i].addEventListener('click', function () {
            var nom = this.getAttribute('data-nom');
            var prix = parseInt(this.getAttribute('data-prix'));
            var image = this.getAttribute('data-image');
            var description = this.getAttribute('data-description');
            var temps = this.getAttribute('data-temps') || '15 min';
            var portion = this.getAttribute('data-portion') || '1 personne';

            // Sauvegarder dans la variable pour l'ajout au panier
            produitActuel = {
                nom: nom,
                prix: prix
            };

            // Remplir les données du modal
            if (modalNom) modalNom.textContent = nom;
            if (modalPrix) modalPrix.textContent = prix.toLocaleString('fr-FR') + ' XAF';
            if (modalImg) {
                modalImg.src = image;
                modalImg.alt = nom;
            }
            if (modalDesc) modalDesc.textContent = description;
            if (modalTemps) modalTemps.textContent = temps;
            if (modalPortion) modalPortion.textContent = portion;

            // Ouvrir le modal
            if (produitModal) {
                produitModal.classList.add('show');
            }
        });
    }

    // Fermer le modal (bouton X)
    if (closeModal) {
        closeModal.addEventListener('click', function (e) {
            e.stopPropagation();
            if (produitModal) {
                produitModal.classList.remove('show');
            }
        });
    }

    // Fermer le modal (clic en dehors)
    if (produitModal) {
        produitModal.addEventListener('click', function (e) {
            if (e.target === produitModal) {
                produitModal.classList.remove('show');
            }
        });
    }

    // Ajouter au panier depuis le modal
    if (modalBtnAjouter) {
        modalBtnAjouter.addEventListener('click', function (e) {
            e.stopPropagation();
            if (produitActuel) {
                var nom = produitActuel.nom;
                var prix = produitActuel.prix;

                // Verifier si dejà dans le panier
                var existe = false;
                for (var j = 0; j < panier.length; j++) {
                    if (panier[j].nom === nom) {
                        panier[j].quantite += 1;
                        existe = true;
                        break;
                    }
                }

                // Sinon on l'ajoute
                if (!existe) {
                    panier.push({
                        nom: nom,
                        prix: prix,
                        quantite: 1
                    });
                }

                sauvegarderPanier();

                // Animation du bouton du modal
                var btn = this;
                btn.style.backgroundColor = '#2e7d32';
                btn.innerHTML = '<i class="fas fa-check"></i> Ajouté au panier';

                setTimeout(function () {
                    btn.style.backgroundColor = '';
                    btn.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
                }, 1500);

                // Notification
                showNotification(nom + ' ajouté au panier !');
            }
        });
    }

    // --- Formulaire de Réservation ---
    var reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        // Bloquer les dates passées pour la réservation
        var resaDateInput = document.getElementById('resaDate');
        if (resaDateInput) {
            var today = new Date().toISOString().split('T')[0];
            resaDateInput.min = today;
        }

        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nom = document.getElementById('resaNom').value;
            var personnes = document.getElementById('resaPersonnes').value;
            var date = document.getElementById('resaDate').value;
            var heure = document.getElementById('resaHeure').value;

            // Formater la date en français simple (jj/mm/aaaa)
            var dateObj = new Date(date);
            var dateFormatee = dateObj.toLocaleDateString('fr-FR');

            // Simuler l'envoi
            var submitBtn = reservationForm.querySelector('button[type="submit"]');
            var originalContent = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#2e7d32';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Réservation Confirmée !';

            showNotification('Table réservée pour ' + personnes + ' personne(s) le ' + dateFormatee + ' à ' + heure + ' !');

            setTimeout(function () {
                reservationForm.reset();
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                submitBtn.innerHTML = originalContent;
            }, 3000);
        });
    }

    // --- Smooth scroll pour les liens ancre ---
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
        anchors[i].addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            var cible = document.querySelector(href);
            if (cible) {
                var offset = navbar.offsetHeight;
                var position = cible.offsetTop - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    }

});
