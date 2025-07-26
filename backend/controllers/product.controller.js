const mongoose = require("mongoose");
const Product = require("../models/products.model");

const getProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		console.log("error in fetching products:", error.message);
		
		// Fallback: Return sample data when database is not connected
		const sampleProducts = [
			{
				_id: "1",
				name: "Premium Steel Beams",
				description: "High-quality structural steel beams for construction projects",
				category: "Construction",
				price: 2500,
				unit: "ton",
				quantity: 100,
				minOrderQuantity: 5,
				images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"],
				specifications: { "Grade": "A36", "Length": "20ft", "Weight": "50 lbs/ft" },
				tags: ["steel", "construction", "beams"],
				rating: 4.5,
				reviewCount: 125,
				isActive: true,
				supplierId: { name: "SteelCorp Industries" }
			},
			{
				_id: "2",
				name: "Industrial Cement",
				description: "Portland cement for commercial and residential construction",
				category: "Construction",
				price: 85,
				unit: "bag",
				quantity: 500,
				minOrderQuantity: 10,
				images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"],
				specifications: { "Type": "Portland", "Strength": "4000 PSI", "Weight": "94 lbs" },
				tags: ["cement", "construction", "portland"],
				rating: 4.2,
				reviewCount: 89,
				isActive: true,
				supplierId: { name: "CementPro Ltd" }
			},
			{
				_id: "3",
				name: "Aluminum Sheets",
				description: "Lightweight aluminum sheets for manufacturing and fabrication",
				category: "Manufacturing",
				price: 450,
				unit: "sheet",
				quantity: 75,
				minOrderQuantity: 2,
				images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"],
				specifications: { "Thickness": "0.125 inch", "Size": "4x8 ft", "Alloy": "6061" },
				tags: ["aluminum", "manufacturing", "sheets"],
				rating: 4.7,
				reviewCount: 156,
				isActive: true,
				supplierId: { name: "AluTech Solutions" }
			},
			{
				_id: "4",
				name: "Copper Wire",
				description: "High-conductivity copper wire for electrical applications",
				category: "Electrical",
				price: 120,
				unit: "roll",
				quantity: 200,
				minOrderQuantity: 5,
				images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"],
				specifications: { "Gauge": "12 AWG", "Length": "500 ft", "Conductivity": "100%" },
				tags: ["copper", "electrical", "wire"],
				rating: 4.8,
				reviewCount: 203,
				isActive: true,
				supplierId: { name: "ElectroSupply Co" }
			},
			{
				_id: "5",
				name: "PVC Pipes",
				description: "Durable PVC pipes for plumbing and irrigation systems",
				category: "Plumbing",
				price: 35,
				unit: "piece",
				quantity: 300,
				minOrderQuantity: 20,
				images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400"],
				specifications: { "Diameter": "2 inch", "Length": "10 ft", "Schedule": "40" },
				tags: ["pvc", "plumbing", "pipes"],
				rating: 4.3,
				reviewCount: 67,
				isActive: true,
				supplierId: { name: "PipeMaster Inc" }
			}
		];
		
		res.status(200).json({ success: true, data: sampleProducts });
	}
};




const createProduct = async (req, res) => {
	const product = req.body;

	if (!product.name || !product.price || !product.description) {
		return res.status(400).json({ success: false, message: "Please provide all fields" });
	}

	const newProduct = new Product(product);

	try {
		await newProduct.save();
		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error("Error in Create product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

const updateProduct = async (req, res) => {
	const { id } = req.params;

	const product = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
		res.status(200).json({ success: true, data: updatedProduct });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

const deleteProduct = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		await Product.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Product deleted" });
	} catch (error) {
		console.log("error in deleting product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

module.exports = {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct
};