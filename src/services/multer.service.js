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

			let resourceType = 'auto';

			if (file.fieldname === 'pdfFile') {
				resourceType = 'raw';
			} else if (file.fieldname === 'videoFile') {
				resourceType = 'video';
			} else if (file.fieldname === 'image') {
				resourceType = 'image';
			}

			return {
				folder: `${folderName}`,
				public_id: `${fileName}-${uniqueId}`,
				resource_type: resourceType,
			};
		},
	});
};

const fileFilter = (req, file, cb) => {
	const fileExtension = path.extname(file.originalname).toLowerCase();

	if (file.fieldname === 'pdfFile') {
		if (fileExtension === '.pdf') {
			cb(null, true);
		} else {
			cb(
				new Error(
					'Invalid file type. Only .pdf is allowed for PDF files',
				),
			);
		}
	} else if (file.fieldname === 'videoFile') {
		const allowedVideoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
		if (allowedVideoExtensions.includes(fileExtension)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					'Invalid file type. Only .mp4, .mov, and .avi are allowed for video files',
				),
			);
		}
	} else if (file.fieldname === 'image') {
		const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];
		if (allowedImageExtensions.includes(fileExtension)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					'Invalid file type. Only .jpg, .jpeg, and .png are allowed for image files',
				),
			);
		}
	} else {
		cb(new Error('Unknown file field'));
	}
};

exports.uploadSingleImage = multer({
	storage: createStorage('images'),
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
}).single('image');
exports.uploadFiles = multer({
	storage: createStorage('lessons'),
	fileFilter,
	limits: {
		fileSize: 1000 * 1024 * 1024,
	},
}).fields([
	{ name: 'pdfFile', maxCount: 1, resource_type: 'raw' },
	{ name: 'videoFile', maxCount: 1, resource_type: 'video' },
]);

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

exports.deleteFilesFromCloudinary = async (folder, fileUrl, resourceType) => {
	try {
		const decodedUrl = decodeURIComponent(fileUrl);
		const publicId = decodedUrl.split('/').pop().split('.')[0];

		// console.log(`Attempting to delete file with public ID: ${folder}/${publicId}, resource_type: ${resourceType}`);

		const result = await cloudinary.uploader.destroy(
			`${folder}/${publicId}`,
			{
				resource_type: resourceType,
			},
		);

		// console.log(`File with public ID: ${publicId} deleted successfully from Cloudinary.`, result);
		return result;
	} catch (error) {
		// console.error('Error deleting file from Cloudinary:', error);
		throw new Error('Failed to delete file from Cloudinary');
	}
};
