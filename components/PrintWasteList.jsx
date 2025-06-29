import { format } from "date-fns";
import { ShowToast } from "@/utils/toast";

const PrintWasteList = (wastes, products, filters = {}) => {
    if (!wastes || !wastes.length) {
        ShowToast.error("Aucun déchet à imprimer.");
        return;
    }

    console.log("PrintWasteList called with:", JSON.stringify(wastes, null, 2));

    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm");

    // Format filter information for display
    const filterInfo = [];
    if (filters.type) filterInfo.push(`Type: ${filters.type}`);
    if (filters.startDate) filterInfo.push(`Date de début: ${format(new Date(filters.startDate), "dd/MM/yyyy")}`);
    if (filters.endDate) filterInfo.push(`Date de fin: ${format(new Date(filters.endDate), "dd/MM/yyyy")}`);
    const filterText = filterInfo.length ? `Filtres appliqués: ${filterInfo.join(", ")}` : "Aucun filtre appliqué";

    // Function to get product designation
    const getProductDesignation = (productId) => {
        const product = products.find((p) => p.id === productId);
        return product ? product.designation : `Produit #${productId}`;
    };

    const wasteListContent = `
        <html>
            <head>
                <title>Liste des Déchets</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .footer { margin-top: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <h1>Liste des Déchets</h1>
                <p>Date d'impression: ${currentDate}</p>
                <p>${filterText}</p>
                <h2>Déchets</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Type</th>
                            <th>Date de création</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            wastes.length
                                ? wastes
                                      .map(
                                          (waste) => `
                                            <tr>
                                                <td>${getProductDesignation(waste.product)}</td>
                                                <td>${waste.qtt || "0"}</td>
                                                <td>${waste.type || "N/A"}</td>
                                                <td>${
                                                    waste.createdAt
                                                        ? new Date(waste.createdAt).toLocaleDateString("fr-FR", {
                                                              year: "numeric",
                                                              month: "2-digit",
                                                              day: "2-digit",
                                                          })
                                                        : "Non défini"
                                                }</td>
                                            </tr>
                                        `
                                      )
                                      .join("")
                                : `<tr><td colspan="4">Aucun déchet</td></tr>`
                        }
                    </tbody>
                </table>
                <p>Total des déchets: ${wastes.length}</p>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Entreprise Exemple</p>
                </div>
            </body>
        </html>
    `;

    const confirmPrint = confirm("Voulez-vous imprimer la liste des déchets ?");
    if (!confirmPrint) {
        ShowToast.info("Impression annulée.");
        return;
    }

    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) {
        ShowToast.error("Veuillez autoriser les pop-ups pour imprimer la liste.");
        return;
    }
    printWindow.document.write(wasteListContent);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

export default PrintWasteList;