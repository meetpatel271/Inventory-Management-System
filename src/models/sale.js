const db = require("../config/db");
const { ip, ipv6 } = require("address");

const ipAddress = ip() || ipv6();

// Create New Sale 
const createSale = async(req, res) => {
    const { userId, receiverName, salesDate, billAmount, paymentMode, note, details } = req.body;
    
    try {
        db.query("INSERT INTO sales (userId, receiverName, salesDate, billAmount, paymentMode, note, createdAtIP, updatedAtIP) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
        [userId, receiverName, salesDate, billAmount, paymentMode, note, ipAddress, ipAddress], (err, result) => {
            if (err) {
                console.error("Error occurred while creating purchase", err);
                return res.status(400).json({ error: "Error occurred while creating sales" });
            }

            const salesId = result.insertId;

            const values = details.map(detail => [salesId, detail.productId, detail.quantity, detail.salesPrice, ipAddress, ipAddress]);

            db.query("INSERT INTO sales_details (salesId, productId, quantity, salesPrice, createdAtIP, updatedAtIP) VALUES ?", [values], 
            (err, result) => {
                if (err) {
                    console.error("Error occurred while creating sales details", err);
                    return res.status(400).json({ error: "Error occurred while creating sales details" });
                }
                return res.status(201).json({ message: "Sales created successfully" });
            }
            );
         });
    } catch (error) {
        console.error("Error occurred during purchase creation", error);
        return res.status(400).json({ error: "Error occurred during Sales creation" });
    }
};

// Get Purchase By ID
const getSaleById = async (req, res) => {
    const saleId = req.params.id; 

    try {
        // Query to fetch the purchase details by ID
        db.query("SELECT * FROM sales WHERE id = ? AND deletedAt IS NULL", [saleId], (err, results) => {
            if (err) {
                console.error("Error occurred while retrieving sale", err);
                return res.status(400).json({ error: "Error occurred while retrieving sale" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Sale not found" });
            }

            const sale = results[0];

            //Query to fetch sale details associated with the sale
            db.query("SELECT sd.salesId, sd.productId, sd.quantity, sd.salesPrice, p.name, p.ProductCode, p.mrp FROM sales_details sd JOIN products p ON sd.productId = p.id WHERE sd.salesId = ?", [saleId], (err, details) => {
                if (err) {
                    console.error("Error occurred while retrieving sale details", err);
                    return res.status(400).json({ error: "Error occurred while retrieving sale details" });
                }

                
                // Combine purchase and details in single object
                const saleWithDetails = {
                    sale,
                    details
                };

                return res.status(200).json({ saleWithDetails });
            });
        });
    } catch (error) {
        console.error("Error occurred during purchase retrieval", error);
        return res.status(400).json({ error: "Error occurred during purchase retrieval" });
    }
};

// Get All Sale 
const getAllSale = async (req, res) => {
    try {
        // Query to fetch the purchase details by ID
        db.query("SELECT * FROM sales WHERE deletedAt IS NULL", async (err, sales) => {
            if (err) {
                console.error("Error occurred while retrieving sale", err);
                return res.status(400).json({ error: "Error occurred while retrieving sale" });
            }

            db.query("SELECT sd.salesId, sd.productId, sd.quantity, sd.salesPrice, p.name, p.ProductCode, p.mrp FROM sales_details sd JOIN products p ON sd.productId = p.id",
             async (err, details) => {
                if (err) {
                    console.error("Error occurred while retrieving sale details", err);
                    return res.status(400).json({ error: "Error occurred while retrieving sale details" });
                }

                // Filter purchases with details
                const salesWithDetails = sales.filter(sale =>
                    details.some(detail => detail.salesId === sale.id)
                );
                
                // Create salesWithDetails object
                const saleWithDetails = {
                    sales: salesWithDetails.map(sale => ({
                        ...sale,
                        details: details.filter(detail => detail.salesId === sale.id)
                    }))
                };
                return res.status(200).json({ saleWithDetails });
            });
        });
    } catch (error) {
        console.error("Error occurred during sale retrieval", error);
        return res.status(400).json({ error: "Error occurred during sale retrieval" });
    }
};

// Delete Sale By ID
const deleteSale = (req, res) =>{
    const saleId = req.params.id;
    try {
        db.query("UPDATE sales SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?", [saleId], async(error, results) => {
            if(error){
                console.log("Server error about query", error);
                return res.status(400).json({ error });
            }

            if(results.affectedRows === 0){
                return res.status(404).json({ message: "Sale not found" });
            } 

            db.query("UPDATE sales_details SET deletedAt = CURRENT_TIMESTAMP() WHERE salesId = ?", [saleId], (err, result) => {
                if (err) {
                    console.log("Error updating sales_details table", err);
                    return res.status(400).json({ error: "Error occurred during delete" });
                }
                return res.status(200).json({ message: "Sale delete successfully" });
            });

        })
    } catch (error) {
        console.error("Error occurred during delete", error);
        return res.status(400).json({ error: "Error occurred during delete" });
    }
};

module.exports = {
    createSale,
    getSaleById,
    getAllSale,
    deleteSale
};