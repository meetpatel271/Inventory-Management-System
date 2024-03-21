const db = require("../config/db");
const { ip, ipv6 } = require("address");


// Create New Category
const createCategory = async(req, res) => {
    const { userId, name, code } = req.body;
    try {

        db.query(
            "SELECT * FROM categorys WHERE name = ?",
            [name],
            async (err, result) => {
              if (err) {
                console.log("Server error about query", err);
                return res
                  .status(400)
                  .json({ message: "Error occurred during signup" });
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
        db.query("SELECT id, name, code FROM categorys WHERE id = ?",[categoryId], (err, results) => {
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
      db.query("SELECT id, name, code FROM categorys", (err, results) => {
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
            
            db.query(
              "UPDATE categorys SET name = ?, code = ?, updatedAtIP = ? WHERE id = ?",
              [name, code, ip() || ipv6(), categoryId],
              (err, result) => {
                if (err) {
                  console.error("Server error about query", err);
                  return res
                    .status(400)
                    .json({ error: "Error occurred during update" });
                }
                // If the update is successful, return success message
                return res
                  .status(200)
                  .json({ message: "Category updated successfully" });
              }
            );
          }
        );
      } catch (error) {
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