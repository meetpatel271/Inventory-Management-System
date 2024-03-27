const db = require("../config/db");
const { ip, ipv6 } = require("address");

const ipAddress = ip() || ipv6();
// Create New Purchase
const createPurchase = async(req, res) => {
    const { userId, partyName, purchaseDate, billAmount, paymentMode, note, details } = req.body;
    
    try {
        db.query("INSERT INTO purchases (userId, partyName, purchaseDate, billAmount, paymentMode, note, createdAtIP, updatedAtIP) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
         [userId, partyName, purchaseDate, billAmount, paymentMode, note, ipAddress, ipAddress],
         (err, result) => {
            if (err) {
                console.error("Error occurred while creating purchase", err);
                return res.status(400).json({ error: "Error occurred while creating purchase" });
            }

            const purchaseId = result.insertId;

            const values = details.map(detail => [purchaseId, detail.productId, detail.quantity, detail.purchasePrice, ipAddress, ipAddress]);

            db.query("INSERT INTO purchases_details (purchaseId, productId, quantity, purchasePrice, createdAtIP, updatedAtIP) VALUES ?", [values], 
            (err, result) => {
                if (err) {
                    console.error("Error occurred while creating purchase details", err);
                    return res.status(400).json({ error: "Error occurred while creating purchase details" });
                }
                return res.status(201).json({ message: "Purchase created successfully" });
            }
            );
         });
    } catch (error) {
        console.error("Error occurred during purchase creation", error);
        return res.status(400).json({ error: "Error occurred during purchase creation" });
    }
};

// Get Purchase By ID
const getPurchaseById = async (req, res) => {
    const purchaseId = req.params.id; 

    try {
        // Query to fetch the purchase details by ID
        db.query("SELECT * FROM purchases WHERE id = ? AND deletedAt IS NULL", [purchaseId], (err, results) => {
            if (err) {
                console.error("Error occurred while retrieving purchase", err);
                return res.status(400).json({ error: "Error occurred while retrieving purchase" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Purchase not found" });
            }

            const purchase = results[0];

            //Query to fetch purchase details associated with the purchase
            db.query("SELECT pd.purchaseId, pd.productId, pd.quantity, pd.purchasePrice, p.name, p.ProductCode, p.mrp FROM purchases_details pd JOIN products p ON pd.productId = p.id WHERE pd.purchaseId = ?", [purchaseId], (err, details) => {
                if (err) {
                    console.error("Error occurred while retrieving purchase details", err);
                    return res.status(400).json({ error: "Error occurred while retrieving purchase details" });
                }

                
                // Combine purchase and details in single object
                const purchaseWithDetails = {
                    purchase,
                    details
                };

                return res.status(200).json({ purchaseWithDetails });
            });
        });
    } catch (error) {
        console.error("Error occurred during purchase retrieval", error);
        return res.status(400).json({ error: "Error occurred during purchase retrieval" });
    }
};

// Get All Purchase 
const getAllPurchase = async (req, res) => {
    try {
        // Query to fetch the purchase details by ID
        db.query("SELECT * FROM purchases WHERE deletedAt IS NULL", async (err, purchases) => {
            if (err) {
                console.error("Error occurred while retrieving purchase", err);
                return res.status(400).json({ error: "Error occurred while retrieving purchase" });
            }

            db.query("SELECT pd.purchaseId, pd.productId, pd.quantity, pd.purchasePrice, p.name, p.ProductCode, p.mrp FROM purchases_details pd JOIN products p ON pd.productId = p.id",
             async (err, details) => {
                if (err) {
                    console.error("Error occurred while retrieving purchase details", err);
                    return res.status(400).json({ error: "Error occurred while retrieving purchase details" });
                }

                // Filter purchases with details
                const purchasesWithDetails = purchases.filter(purchase =>
                    details.some(detail => detail.purchaseId === purchase.id)
                );

                // Create purchaseWithDetails object
                const purchaseWithDetails = {
                    purchase: purchasesWithDetails.map(purchase => ({
                        ...purchase,
                        details: details.filter(detail => detail.purchaseId === purchase.id)
                    }))
                };

                return res.status(200).json({ purchaseWithDetails });
            });
        });
    } catch (error) {
        console.error("Error occurred during purchase retrieval", error);
        return res.status(400).json({ error: "Error occurred during purchase retrieval" });
    }
};

// Delete Purchase By ID
const deletePurchase = (req, res) =>{
    const purchaseId = req.params.id;
    try {
        db.query("UPDATE purchases SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?", [purchaseId], async(error, results) => {
            if(error){
                console.log("Server error about query", error);
                return res.status(400).json({ error });
            }

            if(results.affectedRows === 0){
                return res.status(404).json({ message: "Purchase not found" });
            } 

            db.query("UPDATE purchases_details SET deletedAt = CURRENT_TIMESTAMP() WHERE purchaseId = ?", [purchaseId], (err, result) => {
                if (err) {
                    console.log("Error updating purchases_details table", err);
                    return res.status(400).json({ error: "Error occurred during delete" });
                }
                return res.status(200).json({ message: "Purchase delete successfully" });
            });

        })
    } catch (error) {
        console.error("Error occurred during delete", error);
        return res.status(400).json({ error: "Error occurred during delete" });
    }
};

module.exports = {
    createPurchase,
    getPurchaseById,
    getAllPurchase,
    deletePurchase
};