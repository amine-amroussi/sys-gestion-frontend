import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintPurchaseInvoice = ({ purchaseData }) => {
  if (!purchaseData || !purchaseData.id) {
    ShowToast.error("Aucune donnée d'achat valide sélectionnée pour l'impression.");
    return;
  }

  console.log("PrintPurchaseInvoice called with:", JSON.stringify(purchaseData, null, 2));

  const hasMissingDesignations = purchaseData.WastesArray?.details?.some(
    (waste) => !waste.designation || waste.designation === `Produit ${waste.product_id}`
  );
  if (hasMissingDesignations) {
    ShowToast.warning("Certains produits de déchets n'ont pas de désignation. Les données peuvent être incomplètes.");
  }

  const totalBoxesIn = purchaseData.BoxAssociation?.reduce((sum, box) => sum + (box.qttIn || 0), 0) || 0;
  const totalBoxesOut = purchaseData.BoxAssociation?.reduce((sum, box) => sum + (box.qttOut || 0), 0) || 0;
  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const calculateTotalAmount = (products) => {
    let total = 0;
    products.forEach((product) => {
      const price = parseFloat(product.price) || 0;
      const qtt = parseFloat(product.qtt) || 0;
      const qttUnite = parseFloat(product.qttUnite) || 0;
      const capacityByBox = parseFloat(product.ProductAssociation?.capacityByBox) || 0;
      const productTotal = price * (capacityByBox * qtt + qttUnite);
      total += productTotal;
    });
    return total.toFixed(2);
  };

  const totalAmount = calculateTotalAmount(purchaseData.ProductAssociation || []);

  const invoiceContent = `
    <html>
      <head>
        <title>Facture d'Achat #${purchaseData.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Facture d'Achat</h1>
        <h2>N°: ${purchaseData.id}</h2>
        
        <p><strong>Fournisseur:</strong> ${purchaseData.SupplierAssociation?.name || "N/A"}</p>
        <p><strong>Date de l'achat:</strong> ${
          purchaseData.date ? format(new Date(purchaseData.date), "dd/MM/yyyy") : "N/A"
        }</p>
        <p><strong>Date d'impression:</strong> ${currentDate}</p>

        <h3>Produits</h3>
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Qté (Caisses)</th>
              <th>Qté (Unités)</th>
              <th>Prix Unitaire (MAD)</th>
              
            </tr>
          </thead>
          <tbody>
            ${
              purchaseData.ProductAssociation?.length
                ? purchaseData.ProductAssociation.map(
                    (prod) => {
                      const qtt = parseFloat(prod.qtt) || 0;
                      const qttUnite = parseFloat(prod.qttUnite) || 0;
                      const price = parseFloat(prod.price) || 0;
                      const capacityByBox = parseFloat(prod.ProductAssociation?.capacityByBox) || 0;
                      const totalUnits = capacityByBox * qtt + qttUnite;
                      const productTotal = (totalUnits * price).toFixed(2);
                      return `
                        <tr>
                          <td>${prod.ProductAssociation?.designation || "N/A"}</td>
                          <td>${qtt}</td>
                          <td>${qttUnite}</td>
                          <td>${price.toFixed(2)}</td>
                        
                        </tr>
                      `;
                    }
                  ).join("")
                : `<tr><td colspan="5">Aucun produit</td></tr>`
            }
          </tbody>
        </table>

        <h3>Caisses</h3>
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Qté Entrée</th>
              <th>Qté Sortie</th>
            </tr>
          </thead>
          <tbody>
            ${
              purchaseData.BoxAssociation?.length
                ? purchaseData.BoxAssociation.map(
                    (box) => `
                      <tr>
                        <td>${box.BoxAssociation?.designation || "N/A"}</td>
                        <td>${box.qttIn || 0}</td>
                        <td>${box.qttOut || 0}</td>
                      </tr>
                    `
                  ).join("") +
                  `
                  <tr class="total">
                    <td>Total</td>
                    <td>${totalBoxesIn}</td>
                    <td>${totalBoxesOut}</td>
                  </tr>
                `
                : `<tr><td colspan="3">Aucune caisse</td></tr>`
            }
          </tbody>
        </table>

        <h3>Déchets</h3>
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Quantité</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${
              purchaseData.WastesArray?.details?.length
                ? purchaseData.WastesArray.details.map(
                    (waste) => `
                      <tr>
                        <td>${waste.designation || `Produit ${waste.product_id}`}</td>
                        <td>${waste.qtt || 0}</td>
                        <td>${waste.type || "N/A"}</td>
                      </tr>
                    `
                  ).join("")
                : `<tr><td colspan="3">Aucun déchet</td></tr>`
            }
          </tbody>
        </table>

        <p class="total"><strong>Montant Enregistré:</strong> ${parseFloat(purchaseData.total || 0).toFixed(2)} MAD</p>

        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
        </div>
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

export default PrintPurchaseInvoice;