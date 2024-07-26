import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/user.route.js';
import propertyRoutes from './routes/property.route.js';
import coinsRoutes from './routes/coins.route.js';
import adminRoutes from './routes/admin.route.js';
import autoSuggestRoutes from './routes/autosuggestion.js';

const app = express();
import dotenv from 'dotenv';
dotenv.config();

app.use(bodyParser.json());

connectDB();

app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', propertyRoutes);
app.use('/api', coinsRoutes);
app.use('/api', autoSuggestRoutes);

app.use((err, req, res, next) => {
  const code = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(code).json({
    code,
    data: {},
    message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
