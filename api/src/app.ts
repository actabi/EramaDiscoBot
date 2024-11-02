// src/app.ts - Ajoutez une route health check
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import { sequelize } from './config/database';

const app = express();

app.use(bodyParser.json());
app.use('/api', userRoutes);

// Add health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;