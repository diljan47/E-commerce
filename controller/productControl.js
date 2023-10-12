const { default: slugify } = require("slugify");
const Products = require("../models/productModel");
const validId = require("../config/mongoIDvalidate");
const User = require("../models/usermodel");

const createProduct = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Products.create(req.body);
    return res.status(200).json(newProduct);
  } catch (error) {
    console.log(error);
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  validId(id);
  try {
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
    validId(id);
    const findProduct = await Products.findById(id);
    return res.status(200).json(findProduct);
  } catch (error) {
    console.log(error);
  }
};

const deleteaProduct = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id);
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

    if (req.body.fields) {
      const fields = req.body.fields.split(",").join(" ");
      result = result.select(fields);
    } else {
      result = result.select("-__v");
    }

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
    const findAllProducts = await result;
    return res
      .status(200)
      .json({ length: findAllProducts.length, data: findAllProducts });
  } catch (error) {
    console.log(error);
  }
};

const addtoWishList = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(id);
    const alreadyAdded = user.wishlist.find((id) => {
      id.toString() === prodId;
    });
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user.wishlist);
    } else {
      let user = await User.findByIdAndUpdate(
        id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user.wishlist);
    }
  } catch (error) {
    console.log(error);
  }
};

const ratings = async (req, res) => {
  const { id } = req.user;
  const { prodId, star, comment } = req.body;
  try {
    const productDetails = await Products.findById(prodId);
    const alreadyRated = productDetails.ratings.find((userId) => {
      return userId._id.toString() === id.toString();
    });
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
      await Products.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              _id: id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    console.log(productDetails);
    const updatedRatings = await Products.findById(prodId);
    res.json(updatedRatings);
  } catch (error) {
    console.log(error);
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
