// ===================================
// Le Palais Africain - Page Panier
// ===================================

document.addEventListener('DOMContentLoaded', function () {

    // --- Variables ---
    var panierVide = document.getElementById('panierVide');
    var panierListe = document.getElementById('panierListe');
    var panierItems = document.getElementById('panierItems');
    var sousTotal = document.getElementById('sousTotal');
    var livraisonEl = document.getElementById('livraison');
    var totalFinal = document.getElementById('totalFinal');
    var btnValider = document.getElementById('btnValider');
    var btnVider = document.getElementById('btnVider');
    var modalOverlay = document.getElementById('modalOverlay');
    var btnFermerModal = document.getElementById('btnFermerModal');
    var cartCount = document.getElementById('cartCount');

    var fraisLivraison = 1500;

    // --- Charger le panier ---
    var panier = JSON.parse(localStorage.getItem('panier')) || [];

    // --- Afficher le panier ---
    function afficherPanier() {
        // mise a jour compteur
        var totalItems = 0;
        for (var i = 0; i < panier.length; i++) {
            totalItems += panier[i].quantite;
        }
        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        // si panier vide
        if (panier.length === 0) {
            panierVide.style.display = 'block';
            panierListe.style.display = 'none';
            return;
        }

        // sinon on affiche les articles
        panierVide.style.display = 'none';
        panierListe.style.display = 'block';

        // vider la liste d'abord
        panierItems.innerHTML = '';

        var totalPrix = 0;

        for (var i = 0; i < panier.length; i++) {
            var article = panier[i];
            var sousT = article.prix * article.quantite;
            totalPrix += sousT;

            // creer l'element
            var div = document.createElement('div');
            div.className = 'panier-item';
            div.setAttribute('data-index', i);

            div.innerHTML = 
                '<span class="nom-article">' + article.nom + '</span>' +
                '<span class="prix-unit">' + formaterPrix(article.prix) + ' XAF</span>' +
                '<div class="qte-controles">' +
                    '<button class="qte-btn btn-moins" data-index="' + i + '">-</button>' +
                    '<span class="qte-nombre">' + article.quantite + '</span>' +
                    '<button class="qte-btn btn-plus" data-index="' + i + '">+</button>' +
                '</div>' +
                '<span class="sous-total">' + formaterPrix(sousT) + ' XAF</span>' +
                '<button class="btn-supprimer" data-index="' + i + '">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>';

            panierItems.appendChild(div);
        }

        // mettre a jour les totaux
        sousTotal.textContent = formaterPrix(totalPrix) + ' XAF';

        if (totalPrix > 0) {
            livraisonEl.textContent = formaterPrix(fraisLivraison) + ' XAF';
            totalFinal.textContent = formaterPrix(totalPrix + fraisLivraison) + ' XAF';
        } else {
            livraisonEl.textContent = '0 XAF';
            totalFinal.textContent = '0 XAF';
        }

        // ajouter les evenements sur les boutons
        ajouterEvenements();
    }

    // --- Formater le prix (ajouter des espaces) ---
    function formaterPrix(prix) {
        return prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // --- Ajouter les events sur les boutons +, - et supprimer ---
    function ajouterEvenements() {
        // Boutons +
        var btnsPlus = document.querySelectorAll('.btn-plus');
        for (var i = 0; i < btnsPlus.length; i++) {
            btnsPlus[i].addEventListener('click', function () {
                var index = parseInt(this.getAttribute('data-index'));
                panier[index].quantite += 1;
                sauvegarder();
                afficherPanier();
            });
        }

        // Boutons -
        var btnsMoins = document.querySelectorAll('.btn-moins');
        for (var i = 0; i < btnsMoins.length; i++) {
            btnsMoins[i].addEventListener('click', function () {
                var index = parseInt(this.getAttribute('data-index'));
                if (panier[index].quantite > 1) {
                    panier[index].quantite -= 1;
                } else {
                    // retirer l'article si quantité = 0
                    panier.splice(index, 1);
                    showNotification('Article retiré du panier');
                }
                sauvegarder();
                afficherPanier();
            });
        }

        // Boutons supprimer
        var btnsSuppr = document.querySelectorAll('.btn-supprimer');
        for (var i = 0; i < btnsSuppr.length; i++) {
            btnsSuppr[i].addEventListener('click', function () {
                var index = parseInt(this.getAttribute('data-index'));
                var nom = panier[index].nom;
                panier.splice(index, 1);
                sauvegarder();
                afficherPanier();
                showNotification(nom + ' retiré du panier');
            });
        }
    }

    // --- Sauvegarder dans localStorage ---
    function sauvegarder() {
        localStorage.setItem('panier', JSON.stringify(panier));
    }

    // --- Vider le panier ---
    if (btnVider) {
        btnVider.addEventListener('click', function () {
            if (confirm('Voulez-vous vraiment vider votre panier ?')) {
                panier = [];
                sauvegarder();
                afficherPanier();
                showNotification('Panier vidé');
            }
        });
    }

    // --- Valider la commande ---
    if (btnValider) {
        btnValider.addEventListener('click', function () {
            if (panier.length === 0) return;

            // afficher le modal
            modalOverlay.classList.add('show');

            // vider le panier après validation
            panier = [];
            sauvegarder();
        });
    }

    // --- Fermer le modal ---
    if (btnFermerModal) {
        btnFermerModal.addEventListener('click', function () {
            modalOverlay.classList.remove('show');
            // rediriger vers l'accueil
            window.location.href = 'index.html';
        });
    }

    // fermer le modal en cliquant a coté
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
                afficherPanier();
            }
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

    // --- Burger menu mobile ---
    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');

    if (burger) {
        burger.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            var icon = burger.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Lancer l'affichage ---
    afficherPanier();

});
