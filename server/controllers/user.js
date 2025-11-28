import BrandModel from '../models/brand.js';
import CarModel from '../models/car.js';
import CategoryModel from '../models/category.js';
import ProductModel from '../models/product.js';
import SeriModel from '../models/seri.js';

const bucketName = "hes-otomotiv";

function rewriteUrl(url) {
  if (!url) return url;
  return url.replace(
    "https://hes-otomotiv.s3.amazonaws.com/",
    "https://hes-otomotiv.com/uploads/"
  );
}

function transformProduct(doc) {
  const p = doc._doc ? doc._doc : doc;
  return {
    ...p,
    image: rewriteUrl(p.image),
    image_urls: p.image_urls?.map(rewriteUrl) || []
  };
}

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find(
      { isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image slug image_urls'
    ).populate('brand_id', 'name');

    if (!products.length) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      products: products.map(transformProduct),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { productSlug } = req.params;

    const product = await ProductModel.findOne(
      { slug: productSlug },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!product) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      product: transformProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsByCarSlug = async (req, res) => {
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

    if (!products.length) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      products: products.map(transformProduct),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsByCarAndCategory = async (req, res) => {
  try {
    const { carSlug, categorySlug } = req.params;

    const car = await CarModel.findOne({ slug: carSlug });
    if (!car) return res.status(400).json({ success: false, message: "Arama sonucunda araç bulunamadı" });

    const category = await CategoryModel.findOne({ slug: categorySlug });
    if (!category) return res.status(400).json({ success: false, message: "Arama sonucunda kategori bulunamadı" });

    const products = await ProductModel.find(
      { car_id: car._id, category_id: category._id, isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!products.length) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      products: products.map(transformProduct),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsBySeriesSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const series = await SeriModel.findOne({ slug });
    if (!series) {
      return res.status(400).json({ success: false, message: "Arama sonucunda seri bulunamadı" });
    }

    const cars = await CarModel.find({ series_id: series._id });
    if (!cars.length) {
      return res.status(400).json({ success: false, message: "Seriye ait araç bulunamadı" });
    }

    const products = await ProductModel.find(
      { car_id: { $in: cars.map(c => c._id) }, isActive: true },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug'
    ).populate('brand_id', 'name');

    if (!products.length) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      products: products.map(transformProduct),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------
// Kalanlar ürün olmayan endpointler → değişmedi
// --------------------

const getCarsBySeriesSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const series = await SeriModel.findOne({ slug });
    if (!series) {
      return res.status(400).json({ success: false, message: "Arama sonucunda seri bulunamadı" });
    }

    const cars = await CarModel.find({ series_id: series._id });
    if (!cars.length) {
      return res.status(400).json({ success: false, message: "Seriye ait araç bulunamadı" });
    }

    return res.status(200).json({ success: true, categories: cars });

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await CarModel.find();
    return res.status(200).json({ success: true, categories: cars });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSeries = async (req, res) => {
  try {
    const series = await SeriModel.find();
    return res.status(200).json({ success: true, categories: series });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSeriBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const seri = await SeriModel.findOne({ slug });
    return res.status(200).json({ success: true, seri });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCarBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const car = await CarModel.findOne({ slug });
    return res.status(200).json({ success: true, car });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await CategoryModel.findOne({ slug });
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { q } = req.query;

    const products = await ProductModel.find(
      {
        isActive: true,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { title: { $regex: q, $options: "i" } },
          { stockCode: { $regex: q, $options: "i" } }
        ],
      },
      'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image slug image_urls'
    ).populate('brand_id', 'name');

    if (!products.length) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    return res.status(200).json({
      success: true,
      products: products.map(transformProduct),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await BrandModel.findById(id);
    return res.status(200).json({ success: true, brand });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export {
  getAllCars,
  getAllCategories,
  getAllProducts,
  getAllSeries,
  getBrandById,
  getCarBySlug,
  getCarsBySeriesSlug,
  getCategoryBySlug,
  getProduct,
  getProductsByCarAndCategory,
  getProductsByCarSlug,
  getProductsBySeriesSlug,
  getSeriBySlug,
  searchProduct
};
