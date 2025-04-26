import express from 'express';
const router = express.Router();
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectRoute from '../middleware/authMiddleware.js';
import User from '../models/User.js';
router.post('/',protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        // Validate input
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const uploadResponse = await cloudinary.uploader.upload(image);
        if (!uploadResponse) {
            return res.status(500).json({ message: 'Image upload failed' });
        }
        const imageUrl = uploadResponse.secure_url;
        // Create new book object
        const newBook = {
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id, // Assuming you have user authentication and req.user is set
        };
        await newBook.save();

        // Save the book to the database (assuming you have a Book model)
        // const savedBook = await Book.create(newBook);

        // Send response back to the client
        res.status(201).json({
            message: 'Book created successfully',
            book: newBook,
        });
    } catch (error) {
        console.error('Error in creating book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        

        const books = await Book.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profileImage')
        .exec();
        const totalBooks = await Book.countDocuments();
        res.send(
           {
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
           }
        );
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id })
            .sort({ createdAt: -1 })
        res.json(books);
    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({ message: 'Server error' });
        
    }
}
)
router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const bookId = req.params.id;

        // Find the book by ID and delete it
        const deletedBook = await Book.findByIdAndDelete(bookId);
        if(!bookId) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if(bookId.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this book' });
        }
        // Delete the image from Cloudinary
        if(bookId.image && bookId.image.includes('cloudinary')) {
           try {
            const publicId = bookId.image.split('/').pop().split('.')[0];
             await cloudinary.uploader.destroy(publicId);
           } catch (error) {
            
           }
        }
        await bookId.deleteOne();
        res.json({
            message: 'Book deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
);
export default router;