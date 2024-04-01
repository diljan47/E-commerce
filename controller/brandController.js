const validId = require("../config/mongoIDvalidate");
const Brands = require("../models/brandModel");

const createBrand = async (req, res) => {
  const { title } = req.body;
  try {
    const ifExists = await Brands.findOne({ title });
    if (ifExists) {
      return res.status(400).json("Brand Name Already Exists ");
    }
    const newBrand = await Brands.create(req.body);
    return res.status(200).json(newBrand);
  } catch (error) {
    throw new Error(error);
  }
};
const updateBrand = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const updatedBrand = await Brands.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(updatedBrand);
  } catch (error) {
    throw new Error(error);
  }
};
const deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const deletedBrand = await Brands.findByIdAndDelete(id);
    return res.status(200).json(deletedBrand);
  } catch (error) {
    throw new Error(error);
  }
};
const getBrand = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const getaBrand = await Brands.findById(id);
    return res.status(200).json(getaBrand);
  } catch (error) {
    throw new Error(error);
  }
};
const getallBrand = async (req, res) => {
  try {
    const getallBrand = await Brands.find();
    return res.status(200).json(getallBrand);
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
};
