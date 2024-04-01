const { default: slugify } = require("slugify");
const Products = require("../models/productModel");
const validId = require("../config/mongoIDvalidate");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const fs = require("fs").promises;

const createProduct = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const files = req.files;
    const images = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return {
          imageURL: result.url,
          public_id: result.public_id,
        };
      })
    );
    await Promise.all(files.map(async (file) => await fs.unlink(file.path)));
    req.body.images = images;
    const newProduct = await Products.create(req.body);
    return res.status(200).json(newProduct);
  } catch (error) {
    console.error(error);
    if (files) {
      await Promise.all(files.map(async (file) => await fs.unlink(file.path)));
    }
    return res.status(500).json("Internal Server Error");
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);

    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Products.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(newProduct);
  } catch (error) {
    console.log(error);
  }
};

const getaProduct = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const findProduct = await Products.findById(id)
      .populate("ratings")
      .populate("color")
      .populate("categories")
      .populate("brand")
      .exec();
    return res.status(200).json(findProduct);
  } catch (error) {
    console.log(error);
  }
};

const deleteaProduct = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const deleteaProduct = await Products.findByIdAndDelete(id);
    res.json(deleteaProduct);
  } catch (error) {
    throw new Error(error);
  }
};

const getaAllProducts = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    console.log(queryObj);

    if (queryObj.gender) {
      queryObj.gender = queryObj.gender.split(",");
    }

    if (queryObj.categories) {
      queryObj.categories = queryObj.categories.split(",");
    }

    if (queryObj.brand) {
      queryObj.brand = queryObj.brand.split(",");
    }
    if (queryObj.color) {
      queryObj.color = queryObj.color.split(",");
    }

    let query = Products.find();

    if (queryObj.gender) {
      query = query.where("gender").in(queryObj.gender);
    }

    if (queryObj.categories) {
      query = query.where("categories").in(queryObj.categories);
    }

    if (queryObj.brand) {
      query = query.where("brand").in(queryObj.brand);
    }
    if (queryObj.color) {
      query = query.where("color").in(queryObj.color);
    }
    if (queryObj.minrating) {
      const ratingResult = parseFloat(queryObj.minrating);
      console.log(ratingResult);
      query = query.where("totalrating").gte(ratingResult);
    }
    // Sorting
    if (req.query.sort) {
      const sortQuery = req.query.sort.split(",").join(" ");
      query = query.sort(sortQuery);
    } else {
      query = query.sort("-createdAt");
    }
    if (req.query.priceRange) {
      const [minPrice, maxPrice] = req.query.priceRange.split(",");
      query = query.where("price").gte(minPrice).lte(maxPrice);
    }

    // Field limit
    const fieldsArray = (req.query.fields || "").split(",");
    const selectedFields = fieldsArray.join(" ");
    query = query.select(selectedFields || "-__v");

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const findAllProducts = await query
      .populate("categories")
      .populate("color")
      .populate("brand")
      .exec();

    return res.status(200).json(findAllProducts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// const ratings = async (req, res) => {
//   const { id } = req.user;
//   const { prodId, star, comment } = req.body;
//   try {
//     const productDetails = await Products.findById(prodId);
//     const alreadyRated = productDetails.ratings.find((userId) => {
//       return userId._id.toString() === id.toString();
//     });
//     if (alreadyRated) {
//       await Products.updateOne(
//         {
//           ratings: { $elemMatch: alreadyRated },
//         },
//         {
//           $set: { "ratings.$.star": star, "ratings.$.comment": comment },
//         },
//         {
//           new: true,
//         }
//       );
//     } else {
//       await Products.findByIdAndUpdate(
//         prodId,
//         {
//           $push: {
//             ratings: {
//               star: star,
//               comment: comment,
//               _id: id,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     }
//     const updatedRatings = await Products.findById(prodId);
//     let ratingsLength = updatedRatings.ratings.length;
//     let ratingsTotal = updatedRatings.ratings
//       .map((rate) => rate.star)
//       .reduce((prev, curr) => prev + curr, 0);
//     let ratingsAverage = Math.round(ratingsTotal / ratingsLength);
//     let updatedProduct = await Products.findByIdAndUpdate(
//       prodId,
//       {
//         totalrating: ratingsAverage,
//       },
//       {
//         new: true,
//       }
//     );
//     res.json(updatedProduct);
//   } catch (error) {
//     console.log(error);
//   }
// };

const ratings = async (req, res) => {
  const { id } = req.user;
  const { prodId, star, comment } = req.body;
  try {
    validId(id, res);

    const productDetails = await Products.findById(prodId);

    const alreadyRated = productDetails.ratings.find(
      (userId) => userId.postedby.toString() === id.toString()
    );

    if (alreadyRated) {
      await Products.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const updatedProduct = await Products.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: id,
            },
          },
        },
        {
          new: true,
        }
      ).populate("ratings.postedby");

      res.json(updatedProduct);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getaProduct,
  getaAllProducts,
  deleteaProduct,
  ratings,
};
