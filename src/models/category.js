const db = require("../config/db");
const { ip, ipv6 } = require("address");
const Joi = require("joi");

const createCategorySchema = Joi.object({
  userId: Joi.number().required().min(1),
  name: Joi.string().required().max(50).min(1),
  code: Joi.number().required().min(1),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(50).min(1),
  code: Joi.number().min(1),
});

// Create New Category
const createCategory = async(req, res) => {
    const { userId, name, code } = req.body;
    try {
      const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

        db.query(
            "SELECT * FROM categorys WHERE name = ?",
            [name],
            async (err, result) => {
              if (err) {
                console.log("Server error about query", err);
                return res
                  .status(400)
                  .json({ message: "Error occurred during Category" });
              }
      
              if (result.length > 0) {
                // Category already exists
                return res.status(400).json({ message: "Category already exists" });
              } else {
                
                const createdAtIP = ip() || ipv6();
                
                db.query(
                  "INSERT INTO categorys (userId, name, code, createdAtIP, updatedAtIP) VALUES (?, ?, ?, ?, ?)",
                  [
                    userId,
                    name,
                    code,
                    createdAtIP,
                    createdAtIP,
                  ],
                  (err, result) => {
                    if (err) {
                      console.log("Server error about query", err);
                      return res
                        .status(400)
                        .json({ message: "Error occurred during new category" });
                    } else {
                      return res
                        .status(201)
                        .json({ message: "New Category Created"});
                    }
                  }
                );
              }
            }
          );
        
    } catch (error) {
        res.json({ error });
    }
};

//Get Category By ID
const getCategoryById = async(req, res) => {
    try {
        const categoryId = req.params.id;
        db.query("SELECT id, name, code FROM categorys WHERE id = ? AND deletedAt IS NULL",[categoryId], (err, results) => {
            if (err) {
                console.log("Server error about query", err);
                return res.json({ error: err });
              }

              if (results.length === 0) {
                return res.status(404).json({ error: "Category not found" });
              }

              const categoryData = results[0];
              const response = {
                id: categoryData.id,
                name: categoryData.name,
                code: categoryData.code,
              };
              
              res.json(response);
              console.log("Successfully retrieved category data by ID");
             });
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        return res.json({ error });
    }
};

//Get All Category 
const getAllCategory = async(req, res) => {
    try {
      db.query("SELECT id, name, code FROM categorys WHERE deletedAt IS NULL", (err, results) => {
        if (err) {
          console.log("Server error about query", err);
          return res.json({ error: err });
        } else {
          const category = results.map((category) => category);
          res.status(200).json(category);
        }
      });
    } catch (error) {
      console.error("Error in getAllCategory:", error);
      return res.json({ error });
    }
};

// Update Category By ID
const updateCategoryDetail = async(req, res) =>{
    const categoryId = req.params.id;
    const { name, code } = req.body;
    try {
      const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
        db.query(
          "SELECT * FROM categorys WHERE id = ?",
          [categoryId],
          async (err, results) => {
            if (err) {
              console.error("Server error about query", err);
              return res.status(400).json({ error: "Server Error" });
            }
    
            if (results.length === 0) {
              return res.status(404).json({ message: "Category not found" });
            }

            let updateFields = [];
            let params = [];

            if (name) {
              updateFields.push("name = ?");
              params.push(name);
          }

            if (code) {
              updateFields.push("code = ?");
              params.push(code);
          }
          
          const updatedAtIP = ip() || ipv6();

          params.push(updatedAtIP);
          params.push(categoryId);

          if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
            
          const updateQuery = `UPDATE categorys SET ${updateFields.join(', ')}, updatedAtIP = ? WHERE id = ?`;
          db.query(
            updateQuery,
            params,
            (err, result) => {
                if (err) {
                    console.error("Server error about query", err);
                    return res.status(400).json({ error: "Error occurred during update" });
                }
                // If the update is successful, return success message
                return res.status(200).json({ message: "Category updated successfully" });
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

// Delete Category By ID
const deleteCategory = async(req, res) => {
    const categoryId = req.params.id;
    try {
        db.query(
          "UPDATE categorys SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?",
          [categoryId],
          async (err, results) => {
            if (err) {
              console.error("Server error about query", err);
              return res.status(400).json({ error: "Server Error" });
            }
    
            if (results.affectedRows === 0) {
              return res.status(404).json({ message: "Category not found" });
            } else {
              return res.status(200).json({ message: "Category delete successfully" });
            }
          }
        );
      } catch (error) {
        console.error("Error occurred during delete", error);
        return res.status(400).json({ error: "Error occurred during delete" });
      }
};


module.exports = {
 createCategory,
 getCategoryById,
 getAllCategory,
 updateCategoryDetail,
 deleteCategory
};