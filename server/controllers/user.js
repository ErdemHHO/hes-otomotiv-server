
import BrandModel from '../models/brand.js';
import CarModel from '../models/car.js';
import CategoryModel from '../models/category.js';
import ProductModel from '../models/product.js';
import SeriModel from '../models/seri.js';



const bucketName = "hes-otomotiv";

const getAllProducts = async (req, res) => {
  // updated
  try {
    const products = await ProductModel.find(
      { isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image slug image_urls'
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getProduct = async (req, res) => {
  // updated
  try {
    const { productSlug } = req.params;
    const product = await ProductModel.findOne(
      { slug: productSlug },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!product) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
  
const getProductsByCarSlug = async (req, res) => {
  // updated
  try {
    const { slug } = req.params;
    const car = await CarModel.findOne({ slug });

    if (!car) {
      return res.status(400).json({ success: false, message: "Arama sonucunda araç bulunamadı" });
    }

    const products = await ProductModel.find(
      { car_id: car._id, isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsByCarAndCategory = async (req, res) => {
  // updated
  try {
    const { carSlug, categorySlug } = req.params;

    const car = await CarModel.findOne({ slug: carSlug });
    if (!car) {
      return res.status(400).json({ success: false, message: "Arama sonucunda araç bulunamadı" });
    }

    const category = await CategoryModel.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(400).json({ success: false, message: "Arama sonucunda kategori bulunamadı" });
    }

    const products = await ProductModel.find(
      { car_id: car._id, category_id: category._id, isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsBySeriesSlug = async (req, res) => {
  // updated
  try {
    const { slug } = req.params;
    const series = await SeriModel.findOne({ slug });

    if (!series) {
      return res.status(400).json({ success: false, message: "Arama sonucunda seri bulunamadı" });
    }

    const cars = await CarModel.find({ series_id: series._id });
    if (!cars || cars.length === 0) {
      return res.status(400).json({ success: false, message: "Seriye ait araç bulunamadı" });
    }

    const products = await ProductModel.find(
      { car_id: { $in: cars.map((car) => car._id) }, isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


  
const getCarsBySeriesSlug = async (req, res) => {
    try {
      const { slug } = req.params;

      // Seri modelinde slug değerine göre arama yapılıyor

      const series = await SeriModel.findOne({ slug });

      if (!series) {
        return res.status(400).json({ success: false, message: "Arama sonucunda seri bulunamadı" });
      }
      
      const seriesId = series._id;

      // CarModel'de ilgili series_id'ye göre arabayı bul

      const cars = await CarModel.find({ series_id: seriesId });

      if (!cars || cars.length === 0) {
        return res.status(400).json({ success: false, message: "Seriye ait araç bulunamadı" });
      }

      return res.status(200).json({ success: true, categories: cars });

    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};
  
const getAllCars = async (req, res) => {
  // updated
  try {
    const cars = await CarModel.find();
    if (!cars || cars.length === 0) {
      return res.status(400).json({ success: false, message: "Araba bulunamadı" });
    }
    return res.status(200).json({ success: true, categories:cars });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSeries = async (req, res) => {
  // updated
  try {
    const series = await SeriModel.find();
    if (!series || series.length === 0) {
      return res.status(400).json({ success: false, message: "Seri bulunamadı" });
    }
    return res.status(200).json({ success: true, categories:series });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
    try {
      const categories = await CategoryModel.find();
      if (!categories || categories.length === 0) {
        return res.status(400).json({ success: false, message: "Kategori bulunamadı" });
      }
      return res.status(200).json({ success: true, categories });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getSeriBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const seri = await SeriModel.findOne({ slug });
      if (!seri) {
        return res.status(400).json({ success: false, message: "Seri bulunamadı" });
      }
      return res.status(200).json({ success: true, seri });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getCarBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const car = await CarModel.findOne({ slug });
      if (!car) {
        return res.status(400).json({ success: false, message: "Araba bulunamadı" });
      }
      return res.status(200).json({ success: true, car });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getCategoryBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await CategoryModel.findOne({ slug });
      if (!category) {
        return res.status(400).json({ success: false, message: "Kategori bulunamadı" });
      }
      return res.status(200).json({ success: true, category });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const searchProduct = async (req, res) => {
  // updated
  try {
    const { q } = req.query;

    const products = await ProductModel.find(
      {
        isActive: true,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { title: { $regex: q, $options: "i" } },
          { stockCode: { $regex: q, $options: "i" } }
        ]
      },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image slug image_urls'
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await BrandModel.findById(id);
    if (!brand) {
      return res.status(400).json({ success: false, message: "Marka bulunamadı" });
    }
    return res.status(200).json({ success: true, brand });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


  export {
  getAllCars, getAllCategories, getAllProducts, getAllSeries, getBrandById, getCarBySlug, getCarsBySeriesSlug, getCategoryBySlug, getProduct, getProductsByCarAndCategory, getProductsByCarSlug, getProductsBySeriesSlug, getSeriBySlug, searchProduct
};
  