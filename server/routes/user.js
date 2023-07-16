import express from 'express';
import { getAllProducts, getProduct ,getProductsByCarSlug , getProductsByCarAndCategory, getAllCars, getAllSeries, getAllCategories, getProductsBySeriesSlug, getCarsBySeriesSlug, getSeriBySlug, getCarBySlug , getCategoryBySlug, searchProduct , getBrandById } from '../controllers/user.js';

const router = express.Router();

router.get("/products", getAllProducts); 
router.get("/product/:productSlug",getProduct); 
router.get("/products/car/:slug", getProductsByCarSlug); 
router.get("/products/series/:slug", getProductsBySeriesSlug); 
router.get("/cars/series/:slug", getCarsBySeriesSlug);
router.get("/products/car/:carSlug/category/:categorySlug", getProductsByCarAndCategory);
router.get("/cars", getAllCars);
router.get("/series", getAllSeries);
router.get("/categories", getAllCategories);
router.get("/series/:slug", getSeriBySlug);
router.get("/cars/:slug", getCarBySlug);
router.get("/categories/:slug", getCategoryBySlug);
router.get("/product/search/search",searchProduct);
router.get("/brand/:id", getBrandById);


export default router;