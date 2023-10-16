const validId = require("../config/mongoIDvalidate");
const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    return res.status(200).json(newCategory);
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const updatedCate = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(updatedCate);
  } catch (error) {
    console.log(error);
  }
};

const getaCategory = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const getaCat = await Category.findById(id);
    res.status(200).json(getaCat);
  } catch (error) {
    console.log(error);
  }
};

const getAllCategory = async (req, res) => {
  try {
    const getAll = await Category.find();
    res.status(200).json(getAll);
  } catch (error) {
    console.log(error);
  }
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const deletedCate = await Category.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Category Deleted", data: deletedCate });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getAllCategory,
  getaCategory,
  deleteCategory,
};
