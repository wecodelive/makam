const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

exports.uploadProductImages = async (req, res) => {
	try {
		const { files } = req.body;

		if (
			!process.env.CLOUDINARY_CLOUD_NAME ||
			!process.env.CLOUDINARY_API_KEY ||
			!process.env.CLOUDINARY_API_SECRET
		) {
			return res.status(500).json({
				success: false,
				message: "Cloudinary credentials are missing in environment variables",
			});
		}

		if (!Array.isArray(files) || files.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No images provided for upload",
			});
		}

		const uploadTasks = files.map((file) =>
			cloudinary.uploader.upload(file, {
				resource_type: "image",
				folder: "Product Images",
			})
		);

		const uploadResults = await Promise.all(uploadTasks);
		const imageUrls = uploadResults.map((result) => result.secure_url);

		return res.status(200).json({ success: true, imageUrls });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: `Errors in uploading images: ${error.message}`,
		});
	}
};
