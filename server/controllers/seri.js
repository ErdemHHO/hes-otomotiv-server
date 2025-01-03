import fs from 'fs';
import slugify from 'slugify';
import SeriModel from '../models/seri.js';
import s3 from '../s3.js';

const bucketName = "hes-otomotiv";

const deleteImages = (imageUrls) => {
  imageUrls.forEach((imageUrl) => {
    const filename = imageUrl.split('/').pop();
    const params = {
      Bucket: bucketName,
      Key: filename,
    };

    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(`Resim silinirken hata oluştu: ${error}`);
      }
    });
  });
};

const getAllSeries = async (req, res) => {
  // updated
  try {
    const series = await SeriModel.find();

    if (!series || series.length === 0) {
      return res.status(400).json({ success: false, message: "Seri bulunamadı" });
    }

    return res.status(200).json({ success: true, series });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSeri = async (req, res) => {
  // updated
  try {
    const seri = await SeriModel.findOne({ slug: req.params.id });
    if (!seri) {
      return res.status(400).json({ success: false, message: "Seri bulunamadı" });
    }

    return res.status(200).json({ success: true, seri });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addSeri = async (req, res) => {
  try {
    const { body, files } = req;

    if (files) {
      const imageUrls = [];

      for (const file of files) {
        const fileContent = fs.readFileSync(file.path);
        const params = {
          Bucket: bucketName,
          Key: file.filename,
          Body: fileContent,
        };

        await s3.upload(params).promise();

        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${file.filename}`;
        imageUrls.push(imageUrl);
      }

      const newSeri = await SeriModel.create({ ...body, image_urls: imageUrls });
      return res.status(201).json({ success: true, message: "Seri başarıyla eklendi", newSeri });
    }

    const newSeri = await SeriModel.create({ ...body });
    return res.status(201).json({ success: true, message: "Resimsiz Seri başarıyla eklendi.", newSeri });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateSeri = async (req, res) => {
  try {
    const { body, files } = req;
    const seri = await SeriModel.find({ slug: req.params.id });

    if (!seri || seri.length === 0) {
      return res.status(400).json({ success: false, message: "Seri bulunamadı" });
    }

    const nameSlug = slugify(req.body.name, { lower: true, remove: /[*+~.()'"!:@]/g });
    const slug = nameSlug.replace(/\s+/g, "-");

    body.slug = slug;

    let oldImages = [];
    if (req.body.old_images) {
      if (Array.isArray(req.body.old_images)) {
        oldImages = req.body.old_images.map((url) => {
          const decodedURL = decodeURIComponent(url);
          const validURL = decodedURL.split("?")[0];
          return validURL;
        });
      } else {
        const decodedURL = decodeURIComponent(req.body.old_images);
        const validURL = decodedURL.split("?")[0];
        oldImages.push(validURL);
      }
    }

    const newImageUrls = [];
    if (files) {
      for (const file of files) {
        const fileContent = fs.readFileSync(file.path);
        const params = {
          Bucket: bucketName,
          Key: file.filename,
          Body: fileContent,
        };

        await s3.upload(params).promise();

        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${file.filename}`;
        newImageUrls.push(imageUrl);
      }
    }

    const updatedSeri = await SeriModel.findByIdAndUpdate(
      seri[0]._id,
      { ...body, image_urls: [...oldImages, ...newImageUrls] }, // Yeni ve mevcut image_urls'ları birleştiriyoruz
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Seri başarıyla güncellendi", updatedSeri });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const deleteSeri = async (req, res) => {
  try {
    const seri = await SeriModel.find({ slug: req.params.id });
    if (!seri || seri.length === 0) {
      return res.status(400).json({ success: false, message: "Seri bulunamadı" });
    }

    const imageUrls = seri[0].image_urls;

    // Resimleri S3'den sil
    deleteImages(imageUrls);

    await SeriModel.findByIdAndDelete(seri[0]._id);

    return res.status(200).json({ success: true, message: "Seri başarıyla silindi" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export {
  addSeri, deleteSeri, getAllSeries,
  getSeri, updateSeri
};

