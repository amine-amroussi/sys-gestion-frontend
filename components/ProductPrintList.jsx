// PrintProductList.jsx
import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintProductList = (products) => {
  if (!products || !products.length) {
    ShowToast.error("Aucun produit sélectionné pour l'impression.");
    return;
  }

  console.log("PrintProductList called with:", JSON.stringify(products, null, 2));

  const hasMissingDesignations = products.some((product) => !product.designation);
  if (hasMissingDesignations) {
    ShowToast.warning("Certains produits n'ont pas de désignation. Les données peuvent être.");
  }

  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const productListContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Liste des produits</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .list { max-width: 800px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info, .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; text-align: right; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="list">
          <div class="header">
            <h1>Liste des Produits</h1>
          </div>
          <div class="info">
            <p><strong>Date d'impression:</strong> ${currentDate}</p>
          </div>

          <div class="section">
            <h2>Produits</h2>
            <table>
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Désignation</th>
                  <th>Genre</th>
                  <th>Stock (Caisses)</th>
                  <th>Unité en stock</th>
                  <th>Prix (MAD)</th>
                  <th>Capacité par caisse</th>
                  <th>Caisse</th>
                </tr>
              </thead>
              <tbody>
                ${
                  products.length
                    ? products.map(
                        (product) => `
                          <tr>
                            <td>#${product.id}</td>
                            <td>${product.designation || "N/A"}</td>
                            <td>${product.genre || "N/A"}</td>
                            <td>${product.stock || 0}</td>
                            <td>${product.uniteInStock || 0}</td>
                            <td>${product.priceUnite || 0}</td>
                            <td>${product.capacityByBox || -1}</td>
                            <td>${product.BoxAssociation?.designation || "Aucun"}</td>
                          </tr>
                        `
                      ).join("")
                    : `<tr><td colspan="8">Aucun produit}</td></tr>`
                }
              </tbody>
            </table>
          </div>

          <div class="total">
            <p>Total des produits: ${products.length}</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const confirmPrint = confirm("Voulez-vous imprimer la liste des produits ?");
  if (!confirmPrint) {
    ShowToast.info("Impression annulée.");
    return;
  }

  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    ShowToast.error("Veuillez autoriser les pop-ups pour imprimer la liste.");
    return;
  }
  printWindow.document.write(productListContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export default PrintProductList;