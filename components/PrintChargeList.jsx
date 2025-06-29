import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintChargeList = (charges) => {
  if (!charges || !charges.length) {
    ShowToast.error("Aucune charge sélectionnée pour l'impression.");
    return;
  }

  console.log("PrintChargeList called with:", JSON.stringify(charges, null, 2));

  const hasMissingTypes = charges.some((charge) => !charge.type);
  if (hasMissingTypes) {
    ShowToast.warning("Certaines charges n'ont pas de type. Les données peuvent être incomplètes.");
  }

  const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

  const chargeListContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Liste des charges</title>
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
            <h1>Liste des Charges</h1>
          </div>
          <div class="info">
            <p><strong>Date d'impression:</strong> ${currentDate}</p>
          </div>

          <div class="section">
            <h2>Charges</h2>
            <table>
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Type</th>
                  <th>Montant (MAD)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${
                  charges.length
                    ? charges.map(
                        (charge) => `
                          <tr>
                            <td>#${charge.id}</td>
                            <td>${charge.type || "N/A"}</td>
                            <td>${charge.amount || 0}</td>
                            <td>${charge.date ? format(new Date(charge.date), "dd/MM/yyyy") : "N/A"}</td>
                          </tr>
                        `
                      ).join("")
                    : `<tr><td colspan="4">Aucune charge</td></tr>`
                }
              </tbody>
            </table>
          </div>

          <div class="total">
            <p>Total des charges: ${charges.length}</p>
            <p>Montant total: ${charges.reduce((sum, charge) => sum + (charge.amount || 0), 0)} MAD</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const confirmPrint = confirm("Voulez-vous imprimer la liste des charges ?");
  if (!confirmPrint) {
    ShowToast.info("Impression annulée.");
    return;
  }

  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    ShowToast.error("Veuillez autoriser les pop-ups pour imprimer la liste.");
    return;
  }
  printWindow.document.write(chargeListContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export default PrintChargeList;