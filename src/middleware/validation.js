const Joi = require('joi');

const validateSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const signupSchema = Joi.object({
  firstName: Joi.string().required().max(50).min(1),
  lastName: Joi.string().required().max(50).min(1),
  email: Joi.string()
    .regex(/^\S+@\S+\.\S+$/)
    .required().max(100).min(1)
    .messages({
      "string.pattern.base":
        "Invalid email format? required: johndoe@example.com",
    }),
  password: Joi.string().required().max(255).min(1),
  userType: Joi.string().valid("0", "1").required(), 
});

const loginSchema = Joi.object({
  email: Joi.string()
    .regex(/^\S+@\S+\.\S+$/)
    .required().max(100).min(1)
    .messages({
      "string.pattern.base":
        "Invalid email format? required: johndoe@example.com",
    }),
  password: Joi.string().required().max(255).min(1),
});

const userUpdateSchema = Joi.object({
  firstName: Joi.string().max(50).min(1),
  lastName: Joi.string().max(50).min(1),
  email: Joi.string().max(100).min(1)
    .regex(/^\S+@\S+\.\S+$/)
    .messages({
      "string.pattern.base":
        "Invalid email format? required: johndoe@example.com",
    }),
  password: Joi.string().max(255).min(1),
  userType: Joi.string().valid("0", "1"), // Add other valid user types if needed
});

const signup = validateSchema(signupSchema);
const login = validateSchema(loginSchema);
const userUpdate = validateSchema(userUpdateSchema);

// ------Category Validation Start-------

const createCategorySchema = Joi.object({
  userId: Joi.number().required().min(1),
  name: Joi.string().required().max(50).min(1),
  code: Joi.number().required().min(1),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(50).min(1),
  code: Joi.number().min(1),
});

const createCategory = validateSchema(createCategorySchema);
const updateCategory = validateSchema(updateCategorySchema);

// ------Product Validation Start-------

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

const createProduct = validateSchema(createProductSchema);
const updateProduct = validateSchema(updateProductSchema);

// ------Purchase Validation Start-------

const createPurchaseSchema = Joi.object({
  userId: Joi.number().required().min(1),
  partyName: Joi.string().required().min(1).max(50),
  purchaseDate: Joi.date().required(),
  billAmount: Joi.number().required().min(1),
  paymentMode: Joi.string().required().valid("0", "1", "2"),
  note: Joi.string().max(500),
  details: Joi.array()
});

const createPurchase = validateSchema(createPurchaseSchema);

// ------Sale Validation Start-------

const createSaleSchema = Joi.object({
  userId: Joi.number().required().min(1),
  receiverName: Joi.string().required().min(1).max(50),
  salesDate: Joi.date().required(),
  billAmount: Joi.number().required().min(1),
  paymentMode: Joi.string().required().valid("0", "1", "2"),
  note: Joi.string().max(500),
  details: Joi.array()
});

const createSale = validateSchema(createSaleSchema);

module.exports = {
  login,
  signup,
  userUpdate,
  createCategory,
  updateCategory,
  createProduct,
  updateProduct,
  createPurchase,
  createSale
};
