import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintAfternoonInvoice = ({ invoiceData }) => {
  if (!invoiceData || !invoiceData.tripId || !invoiceData.products) {
    ShowToast.error("Données de tournée ou produits invalides pour l'impression.");
    return;
  }

  console.log("Invoice Data for Printing:", JSON.stringify(invoiceData, null, 2));

  // Check for missing or invalid product data
  const hasInvalidProducts = invoiceData.products.some(
    (prod) =>
      !prod.designation ||
      prod.qttRestanteCaisses == null ||
      prod.qttRestanteUnites == null ||
      prod.newQttOut == null ||
      prod.newQttOutUnite == null ||
      prod.sortieTotalCaisses == null ||
      prod.sortieTotalUnites == null ||
      prod.qttReutour == null ||
      prod.qttReutourUnite == null ||
      prod.qttVendu == null ||
      prod.priceUnite == null ||
      prod.totalRevenue == null
  );
  if (hasInvalidProducts) {
    ShowToast.warning("Certaines données de produits sont manquantes ou invalides. Vérifiez les données.");
  }

  const totalBoxesIn = invoiceData.boxes?.reduce((sum, box) => sum + (box.qttIn || 0), 0) || 0;
  const totalBoxesOut = invoiceData.boxes?.reduce((sum, box) => sum + (box.qttOut || 0), 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const calculateTotalAmount = (products) => {
    return products?.reduce((total, product) => {
      const totalUnits = product.qttVendu || 0;
      return total + totalUnits * (product.priceUnite || 0);
    }, 0) || 0;
  };

  const totalAmount = calculateTotalAmount(invoiceData.products);

  const invoiceContent = `
    <html>
      <head>
        <title>Facture Tournée #${invoiceData.tripId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          td:first-child { text-align: left; }
          .section { margin-bottom: 20px; }
          .totals { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Entreprise Exemple</h1>
        <p style="text-align: center;">
          123 Rue Principale, Casablanca, Maroc<br>
          Tél: +212 5 22 123 456 | Email: contact@exemple.com
        </p>

        <div class="section">
          <h2>Détails de la Facture</h2>
          <p>N° Facture: ${invoiceData.tripId}</p>
          <p>Date d'émission: ${currentDate}</p>
          <p>Zone: ${invoiceData.zone || "N/A"}</p>
          <p>Camion: ${invoiceData.truck || "N/A"}</p>
          <p>Conducteur: ${invoiceData.driver || "N/A"}</p>
          <p>Vendeur: ${invoiceData.seller || "N/A"}</p>
        </div>

        <div class="section">
          <h3>Produits</h3>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Restant (Caisses)</th>
                <th>Restant (Unités)</th>
                <th>Sortie (Caisses)</th>
                <th>Sortie (Unités)</th>
                <th>Total Sortie (Caisses)</th>
                <th>Total Sortie (Unités)</th>
                <th>Retour (Caisses)</th>
                <th>Retour (Unités)</th>
                <th>Vendu</th>
                <th>Prix (MAD)</th>
                <th>Total (MAD)</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoiceData.products?.length
                  ? invoiceData.products
                      .map(
                        (prod) => `
                          <tr>
                            <td>${prod.designation || "Produit Inconnu"}</td>
                            <td>${prod.qttRestanteCaisses !== null ? prod.qttRestanteCaisses : 0}</td>
                            <td>${prod.qttRestanteUnites !== null ? prod.qttRestanteUnites : 0}</td>
                            <td>${prod.newQttOut !== null ? prod.newQttOut : 0}</td>
                            <td>${prod.newQttOutUnite !== null ? prod.newQttOutUnite : 0}</td>
                            <td>${prod.sortieTotalCaisses !== null ? prod.sortieTotalCaisses : 0}</td>
                            <td>${prod.sortieTotalUnites !== null ? prod.sortieTotalUnites : 0}</td>
                            <td>${prod.qttReutour !== null ? prod.qttReutour : 0}</td>
                            <td>${prod.qttReutourUnite !== null ? prod.qttReutourUnite : 0}</td>
                            <td>${prod.qttVendu !== null ? prod.qttVendu : 0}</td>
                            <td>${(prod.priceUnite !== null ? parseFloat(prod.priceUnite) : 0).toFixed(2)}</td>
                            <td>${(prod.totalRevenue !== null ? parseFloat(prod.totalRevenue) : 0).toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="12">Aucun produit disponible</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Caisses</h3>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Restant Précédent (Caisses)</th>
                <th>Sortie (Caisses)</th>
                <th>Retour (Caisses)</th>
                <th>Diff (Caisses)</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoiceData.boxes?.length
                  ? invoiceData.boxes
                      .map(
                        (box) => `
                          <tr>
                            <td>${box.designation || "N/A"}</td>
                            <td>${box.previousRemaining !== null ? box.previousRemaining : 0}</td>
                            <td>${box.qttOut !== null ? box.qttOut : 0}</td>
                            <td>${box.qttIn !== null ? box.qttIn : 0}</td>
                            <td>${((box.qttOut || 0) - (box.qttIn || 0)).toFixed(0)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="5">Aucune caisse disponible</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Déchets</h3>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Type</th>
                <th>Prix Unitaire (MAD)</th>
                <th>Coût Total (MAD)</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoiceData.wastes?.length
                  ? invoiceData.wastes
                      .map(
                        (waste) => `
                          <tr>
                            <td>${waste.product || "Inconnu"}</td>
                            <td>${waste.qtt !== null ? waste.qtt : 0}</td>
                            <td>${waste.type || "N/A"}</td>
                            <td>${(waste.priceUnite !== null ? parseFloat(waste.priceUnite) : 0).toFixed(2)}</td>
                            <td>${(waste.cost !== null ? waste.cost : 0).toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="5">Aucun déchet disponible</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Charges</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant (MAD)</th>
              </tr>
            </thead>
            <tbody>
              ${
                invoiceData.charges?.length
                  ? invoiceData.charges
                      .map(
                        (charge) => `
                          <tr>
                            <td>${charge.type || "N/A"}</td>
                            <td>${(charge.amount !== null ? parseFloat(charge.amount) : 0).toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="2">Aucune charge disponible</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="section totals">
          <p>Montant Total Produits: ${(parseFloat(totalAmount) || 0).toFixed(2)} MAD</p>
          <p>Montant Attendu: ${(parseFloat(invoiceData.totals?.waitedAmount )|| 0).toFixed(2)} MAD</p>
          <p>Montant Reçu: ${(parseFloat(invoiceData.totals?.receivedAmount )|| 0).toFixed(2)} MAD</p>
          <p>Différence: ${(parseFloat(invoiceData.totals?.deff )|| 0).toFixed(2)} MAD</p>
          <p>Total Charges: ${(parseFloat(invoiceData.totals?.tripCharges) || 0).toFixed(2)} MAD</p>
          <p>Coût Total Déchets: ${(parseFloat(invoiceData.totals?.wastesCost) || 0).toFixed(2)} MAD</p>
        </div>

        <p style="text-align: center;">
          Merci pour votre confiance !<br>
          © ${new Date().getFullYear()} Entreprise Exemple
        </p>
      </body>
    </html>
  `;

  const confirmPrint = confirm("Voulez-vous imprimer la facture ?");
  if (!confirmPrint) {
    ShowToast.info("Impression annulée.");
    return;
  }

  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    ShowToast.error("Veuillez autoriser les pop-ups pour imprimer la facture.");
    return;
  }
  printWindow.document.write(invoiceContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export default PrintAfternoonInvoice;
