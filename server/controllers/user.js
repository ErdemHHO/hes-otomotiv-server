
import ProductModel from '../models/product.js';
import SeriModel from '../models/seri.js';
import CarModel from '../models/car.js';
import CategoryModel from '../models/category.js';
import BrandModel from '../models/brand.js';


import fs from'fs';
import s3 from '../s3.js';

const bucketName = "hes-otomotiv";




const getAllProducts = async (req, res) => {
    try {
      const products = await ProductModel.find({ isActive: true }, 'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image slug image_urls')
      .populate('brand_id', 'name');
      if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
      }
  
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          if (product.image_urls && product.image_urls.length > 0) {
            const imageUrls = await Promise.all(
              product.image_urls.map(async (imageUrl) => {
                const filename = imageUrl.split('/').pop();
                const params = {
                  Bucket: bucketName,
                  Key: filename,
                };
                const signedUrl = await s3.getSignedUrlPromise('getObject', params);
                return signedUrl;
              })
            );
            return { ...product._doc, image_urls: imageUrls };
          }
          return product;
        })
      );
  
      return res.status(200).json({ success: true, products: productsWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const { productSlug } = req.params;
  
        const product = await ProductModel.findOne({ slug: productSlug }, 'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug').populate('brand_id', 'name');
      if (!product) {
        return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
      }
  
      const productWithImages = { ...product._doc };
  
      if (productWithImages.image_urls && productWithImages.image_urls.length > 0) {
        const imageUrls = await Promise.all(
          productWithImages.image_urls.map(async (imageUrl) => {
            const filename = imageUrl.split('/').pop();
            const params = {
              Bucket: bucketName,
              Key: filename,
            };
            const signedUrl = await s3.getSignedUrlPromise('getObject', params);
            return signedUrl;
          })
        );
        productWithImages.image_urls = imageUrls;
      }
  
      return res.status(200).json({ success: true, product: productWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};
  
const getProductsByCarSlug = async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Car modelinde slug değerine göre arama yapılıyor
      const car = await CarModel.findOne({ slug });
  
      if (!car) {
        return res.status(400).json({ success: false, message: "Arama sonucunda araç bulunamadı" });
      }
  
      const carId = car._id;
  
      // ProductModel'de ilgili car_id'ye ve isActive=true'ye göre ürünleri arama yapılıyor
      const products = await ProductModel.find({ car_id: carId, isActive: true }, 'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug').populate('brand_id', 'name');
  
      if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
      }
  
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          if (product.image_urls && product.image_urls.length > 0) {
            const imageUrls = await Promise.all(
              product.image_urls.map(async (imageUrl) => {
                const filename = imageUrl.split('/').pop();
                const params = {
                  Bucket: bucketName,
                  Key: filename,
                };
                const signedUrl = await s3.getSignedUrlPromise('getObject', params);
                return signedUrl;
              })
            );
            return { ...product._doc, image_urls: imageUrls };
          }
          return product;
        })
      );
  
      return res.status(200).json({ success: true, products: productsWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getProductsByCarAndCategory = async (req, res) => {
    try {
      const { carSlug, categorySlug } = req.params;
  
      // Car modelinde carSlug değerine göre arama yapılıyor
      const car = await CarModel.findOne({ slug: carSlug });
  
      if (!car) {
        return res.status(400).json({ success: false, message: "Arama sonucunda araç bulunamadı" });
      }
  
      const carId = car._id;
  
      // Category modelinde categorySlug değerine göre arama yapılıyor
      const category = await CategoryModel.findOne({ slug: categorySlug });
  
      if (!category) {
        return res.status(400).json({ success: false, message: "Arama sonucunda kategori bulunamadı" });
      }
  
      const categoryId = category._id;
  
      // ProductModel'de ilgili car_id, category_id ve isActive=true'ye göre ürünleri arama yapılıyor
      const products = await ProductModel.find({ car_id: carId, category_id: categoryId, isActive: true }, 'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug').populate('brand_id', 'name');
  
      if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
      }
  
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          if (product.image_urls && product.image_urls.length > 0) {
            const imageUrls = await Promise.all(
              product.image_urls.map(async (imageUrl) => {
                const filename = imageUrl.split('/').pop();
                const params = {
                  Bucket: bucketName,
                  Key: filename,
                };
                const signedUrl = await s3.getSignedUrlPromise('getObject', params);
                return signedUrl;
              })
            );
            return { ...product._doc, image_urls: imageUrls };
          }
          return product;
        })
      );
  
      return res.status(200).json({ success: true, products: productsWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getProductsBySeriesSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Seri modelinde slug değerine göre arama yapılıyor
    const series = await SeriModel.findOne({ slug });

    if (!series) {
      return res.status(400).json({ success: false, message: "Arama sonucunda seri bulunamadı" });
    }

    const seriesId = series._id;

    // CarModel'de ilgili series_id'ye göre arabaları bul
    const cars = await CarModel.find({ series_id: seriesId });

    if (!cars || cars.length === 0) {
      return res.status(400).json({ success: false, message: "Seriye ait araç bulunamadı" });
    }

    const carIds = cars.map((car) => car._id);

    // ProductModel'de ilgili car_id'ler ve isActive=true'ye göre ürünleri arama yap
    const products = await ProductModel.find({ car_id: { $in: carIds }, isActive: true }, 'name title oemNumber stockCode car_id category_id status brand_id stock oldPrice sellingPrice salesFormat image_urls slug').populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        if (product.image_urls && product.image_urls.length > 0) {
          const imageUrls = await Promise.all(
            product.image_urls.map(async (imageUrl) => {
              const filename = imageUrl.split('/').pop();
              const params = {
                Bucket: bucketName,
                Key: filename,
              };
              const signedUrl = await s3.getSignedUrlPromise('getObject', params);
              return signedUrl;
            })
          );
          return { ...product._doc, image_urls: imageUrls };
        }
        return product;
      })
    );

    return res.status(200).json({ success: true, products: productsWithImages });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
    try {
      const cars = await CarModel.find();
      if (!cars || cars.length === 0) {
        return res.status(400).json({ success: false, message: "Araba bulunamadı" });
      }
  
      const carsWithImages = await Promise.all(
        cars.map(async (car) => {
          if (car.image_urls && car.image_urls.length > 0) {
            const validImageUrls = car.image_urls.filter((imageUrl) => imageUrl.trim() !== '');
            const imageUrls = await Promise.all(
              validImageUrls.map(async (imageUrl) => {
                const filename = imageUrl.split('/').pop();
                const params = {
                  Bucket: bucketName,
                  Key: filename,
                };
                const signedUrl = await s3.getSignedUrlPromise('getObject', params);
                return signedUrl;
              })
            );
            return { ...car._doc, image_urls: imageUrls };
          }
          return car;
        })
      );
  
      return res.status(200).json({ success: true, categories: carsWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllSeries = async (req, res) => {
    try {
      const series = await SeriModel.find();
  
      if (!series || series.length === 0) {
        return res.status(400).json({ success: false, message: "Seri bulunamadı" });
      }
  
      const seriesWithImages = await Promise.all(
        series.map(async (seri) => {
          if (seri.image_urls && seri.image_urls.length > 0) {
            const imageUrls = await Promise.all(
              seri.image_urls.map(async (imageUrl) => {
                const filename = imageUrl.split('/').pop();
                const params = {
                  Bucket: bucketName,
                  Key: filename,
                };
                const signedUrl = await s3.getSignedUrlPromise('getObject', params);
                return signedUrl;
              })
            );
            return { ...seri._doc, image_urls: imageUrls };
          } else {
            return seri;
          }
        })
      );
  
      return res.status(200).json({ success: true, categories: seriesWithImages });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
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
      {
        name: 1,
        title: 1,
        oemNumber: 1,
        stockCode: 1,
        car_id: 1,
        category_id: 1,
        status: 1,
        brand_id: 1,
        stock: 1,
        oldPrice: 1,
        sellingPrice: 1,
        salesFormat: 1,
        image: 1,
        slug: 1,
        image_urls: 1
      }
    ).populate('brand_id', 'name');

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Ürün bulunamadı" });
    }

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        if (product.image_urls && product.image_urls.length > 0) {
          const imageUrls = await Promise.all(
            product.image_urls.map(async (imageUrl) => {
              const filename = imageUrl.split('/').pop();
              const params = {
                Bucket: bucketName,
                Key: filename,
              };
              const signedUrl = await s3.getSignedUrlPromise('getObject', params);
              return signedUrl;
            })
          );
          return { ...product._doc, image_urls: imageUrls };
        }
        return product;
      })
    );

    return res.status(200).json({ success: true, products: productsWithImages });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
  getAllProducts,
  getProduct,
  getProductsByCarSlug,
  getProductsByCarAndCategory,
  getProductsBySeriesSlug,
  getAllCars,
  getAllSeries,
  getAllCategories,
  getCarsBySeriesSlug,
  getSeriBySlug,
  getCarBySlug,
  getCategoryBySlug,
  searchProduct,
  getBrandById
};
  