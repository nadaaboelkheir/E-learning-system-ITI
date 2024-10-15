const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../configs/cloudinary.config');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const createStorage = (folderName) => {
	return new CloudinaryStorage({
		cloudinary: cloudinary,
		params: (req, file) => {
			const uniqueId = uuidv4();
			const fileName = file.originalname.split('.')[0];

			return {
				folder: `${folderName}`,
				public_id: `${fileName}-${uniqueId}`,
			};
		},
	});
};

const fileFilter = (req, file, cb) => {
	const allowedExtensions = ['.jpg', '.jpeg', '.png'];
	const fileExtension = path.extname(file.originalname).toLowerCase();

	if (allowedExtensions.includes(fileExtension)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Invalid file type. Only .jpg, .jpeg, and .png are allowed',
			),
		);
	}
};

exports.uploadSingleImage = multer({
	storage: createStorage('images'),
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
}).single('image');

// const uploadSingleImage = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       if (err.code === 'LIMIT_FILE_SIZE') {
//         return res.status(413).json({
//           message: 'Image size limit exceeded',
//           details: 'The uploaded image exceeds the maximum size of 5MB.',
//         });
//       }

//       if (err.message === 'Invalid file type. Only .jpg, .jpeg, and .png are allowed') {
//         return res.status(415).json({
//           message: 'Invalid file type',
//           details: 'Please upload an image with .jpg, .jpeg, or .png extensions.',
//         });
//       }

//       return res.status(500).json({
//         message: 'An error occurred during the image upload',
//         details: err.message,
//       });
//     }
//     next();
//   });
// };

exports.deleteImageFromCloudinary = async (imageUrl) => {
	try {
		const publicId = imageUrl.split('/').pop().split('.')[0];
		await cloudinary.uploader.destroy(`images/${publicId}`);
		console.log(
			`Image with public ID: ${publicId} deleted successfully from Cloudinary.`,
		);
		return true;
	} catch (error) {
		console.error('Error deleting image from Cloudinary:', error);
		throw new Error('Failed to delete image from Cloudinary');
	}
};
