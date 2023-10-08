// Imports
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import userRoutes from './routes/userRoutes.js';

// dotenv config
dotenv.config();

// PORT INIT
const PORT = process.env.PORT || 5000;

// check if env is production
if (process.env.NODE_ENV === 'production') {
	// set static folder
	app.use(express.static(path.join(__dirname, '/frontend/build')));

	app.get('*', (req, res) =>
		res.sendFile(
			path.resolve(__dirname, 'frontend', 'build', 'index.html')
		)
	);
}

// Connect to db
try {
	const conn = await mongoose.connect(process.env.MONGO_URI);
	console.log(`--> INFO: MongoDB Connected: ${conn.connection.host}`);
} catch (error) {
	console.error(`--> Error: ${error.message}`);
	process.exit(1);
}

// Init express
const app = express();

app.use(cors());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/v1/users', userRoutes);

// Listen
app.listen(PORT, () =>
	console.log(`--> Server running on: http://localhost:${PORT}`)
);
