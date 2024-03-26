const { query } = require("express");
const db = require("../config/db");
const { ip, ipv6 } = require("address");
const Joi = require("joi");

const createProductSchema = Joi.object({
    userId: Joi.number().required().min(1),
    categoryId: Joi.number().required().min(1),
    name: Joi.string().required().max(50).min(1),
    productCode: Joi.number().required().min(1),
    mrp: Joi.number().required().min(1),
});

const updateProductSchema = Joi.object({
    name: Joi.string().max(50).min(1),
    productCode: Joi.number().min(1),
    mrp: Joi.number().min(1),
});



// Create New Product
const createProduct = (req, res) =>{
    const { userId, categoryId, name, productCode, mrp } = req.body;
    try {
        const { error, value } = createProductSchema.validate(req.body);
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }

        db.query("SELECT * FROM products WHERE name = ?", [name], (err, result) =>{
            if(err){
                console.log("Server error about query", err);
                return res
                  .status(400)
                  .json({ message: "Error occurred during signup" });
              }

              if(result.length > 0){
                    return res.status(400).json({ message: "Category already exists" });
              } else{
                const createdAtIP = ip() || ipv6();
                db.query("INSERT INTO products (userId, categoryId, name, productCode, mrp, createdAtIP, updatedAtIP) VALUES(?, ?, ?, ?, ?, ?, ?)",
                [userId, categoryId, name, productCode, mrp, createdAtIP, createdAtIP],
                (err, result) =>{
                    if (err) {
                        console.log("Server error about query", err);
                        return res
                          .status(400)
                          .json({ message: "Error occurred during new product" });
                      } else {
                        return res
                          .status(201)
                          .json({ message: "New Product Created"});
                      }
                }
                )
              }
            }
        );
    } catch (error) {
        res.json({ error });
    }
};

// Get Product By ID
const getProductById = (req, res) =>{
    try {
        const productId = req.params.id;
        db.query("SELECT id, name, productCode, mrp FROM products WHERE id = ? AND deletedAt IS NULL", [productId], (err, results) => {
            if(err){
                console.log("Server error about query", err);
                return res.json({ error: err});
            }

            if(results.length === 0){
                return res.status(404).json({ error: "Product not found" })
            }

            const productData = results[0];
            const response = {
                id: productData.id,
                name: productData.name,
                productCode: productData.productCode,
                mrp: productData.mrp,
            };
            
              res.json(response);
              console.log("Successfully retrieved product data by ID");

        });
        
    } catch (error) {
        console.error("Error in getProductById:", error);
        return res.json({ error });
    }
};

//Get All Category 
const getAllProduct = (req, res) =>{
    try {
        db.query("SELECT id, name, productCode, mrp FROM products WHERE deletedAt IS NULL", (err, results) =>{
            if(err){
                console.log("Server error about query", err);
                return res.json ({ error: err });
            } else{
                console.log("Successfully retrieved all products")
                res.status(200).json(results);
            }
        });
    } catch (error) {
        console.error("Error in getAllProduct:", error);
        return res.json({ error });
    }
}; 

// Update Product By ID
const updateProductDetail = (req, res) => {
    const productId = req.params.id;
    const  {name, productCode, mrp} = req.body;
    
    try {
        const { error, value } = updateProductSchema.validate(req.body);
        if (error) {
        return res.status(400).json({ message: error.details[0].message });
        }

        db.query("SELECT * FROM products WHERE ?", [productId], (error,results) => {
            if(error){
                console.log("Server error about query", error)
                return res.status(400).json ({ error });
            }

            if(results.length === 0){
                return res.status(404).json ({ message: "Category not found"});
            }

            let updateFields = [];
            let params = [];

            if (name){
                updateFields.push("name = ?");
                params.push(name);
            }

            if(productCode){
                updateFields.push("productCode = ?");
                params.push(productCode);
            }

            if(mrp){
                updateFields.push("mrp = ?");
                params.push(mrp);
            }

            const updatedAtIP = ip() || ipv6();
            params.push(updatedAtIP);
            params.push(productId);

            if (updateFields.length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }

            const updateQuery = `UPDATE products SET ${updateFields.join(', ')}, updatedAtIP = ? WHERE id = ?`;
            db.query(updateQuery, params, (error, results) => {
                if(error){
                    console.log("Server error about query", error);
                    return res.status(400).json({ error: "Error occurred during update" });
                }
                return res.status(200).json({ message: "Product updated successfully" });
                }
            ); 
        }
        );
        }
    catch (error) {
        console.error("Error occurred during update", error);
        return res.status(400).json({ error: "Error occurred during update" });
    }
};

// Delete Product By ID
const deleteProduct = (req, res) =>{
    const productId = req.params.id;
    try {
        db.query("UPDATE products SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?", [productId], async(error, results) => {
            if(error){
                console.log("Server error about query", error);
                return res.status(400).json({ error });
            }

            if(results.affectedRows === 0){
                return res.status(404).json({ message: "Product not found" });
            } else {
                return res.status(200).json({ message: "Product delete successfully" });
            }

        })
    } catch (error) {
        console.error("Error occurred during delete", error);
        return res.status(400).json({ error: "Error occurred during delete" });
    }
};


module.exports = {
    createProduct,
    getProductById,
    getAllProduct,
    updateProductDetail,
    deleteProduct
   };