const { default: slugify } = require("slugify");
const Products = require("../models/productModel");
const validId = require("../config/mongoIDvalidate");
const User = require("../models/usermodel");
const cloudinary = require("../config/cloudinary");
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
    //Filtering using gt,gte,lt,lte on query
    // let query = JSON.stringify(req.query);
    // query = query.replace(/\b(gt|gte|lt|lte)\b/g, (match) => {
    //   return `$${match}`;
    // });
    // const newQuery = JSON.parse(query);
    // let result = Products.find(newQuery);
    //
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let result = Products.find(JSON.parse(queryStr));
    //Sorting
    if (req.query.sort) {
      const sortQuery = req.query.sort.split(",").join(" ");
      result = result.sort(sortQuery);
    } else {
      result = result.sort("-createdAt");
    }

    // field limit
    const fieldsArray = (req.query.fields || "").split(",");
    const selectedFields = fieldsArray.join(" ");
    result = result.select(selectedFields || "-__v");

    //Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Products.countDocuments();
      if (skip >= productCount) {
        return res.status(204).json("This Page does not exists");
      }
    }
    const findAllProducts = await result.populate("categories").exec();
    return res
      .status(200)
      .json({ length: findAllProducts.length, data: findAllProducts });
  } catch (error) {
    console.log(error);
  }
};

// const addtoWishList = async (req, res) => {
//   const { id } = req.user;
//   const { prodId } = req.body;
//   try {
//     const user = await User.findById(id);
//     const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
//     console.log(alreadyAdded);
//     if (alreadyAdded) {
//       console.log(`Removing ${prodId} from wishlist`);
//       let updatedUser = await User.findByIdAndUpdate(
//         id,
//         {
//           $pull: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log("User after removing:", updatedUser);
//       res.json(updatedUser);
//     } else {
//       console.log(`Adding ${prodId} to wishlist`);
//       let updatedUser = await User.findByIdAndUpdate(
//         id,
//         {
//           $push: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log("User after adding:", updatedUser);
//       res.json(updatedUser);
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const addtoWishList = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById(id);
    const alreadyAddedIndex = user.wishlist.findIndex(
      (itemId) => itemId.toString() === prodId
    );
    if (alreadyAddedIndex !== -1) {
      // Remove the old product ID from the wishlist
      user.wishlist.splice(alreadyAddedIndex, 1);
    }
    user.wishlist.push(prodId);
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  addtoWishList,
  ratings,
};
