const validId = require("../config/mongoIDvalidate");
const Color = require("../models/colorModel");

const createColor = async (req, res) => {
  const { title } = req.body;
  try {
    const ifExists = await Color.findOne({ title });
    if (ifExists) {
      return res.status(400).json("Same Color Already Exists ");
    }
    const addColor = await Color.create(req.body);
    return res.status(200).json(addColor);
  } catch (error) {
    throw new Error(error);
  }
};

const updateColor = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(updatedColor);
  } catch (error) {
    throw new Error(error);
  }
};
const deleteColor = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    await Color.findByIdAndDelete(id);
    return res.status(200).json("Color Deleted");
  } catch (error) {
    throw new Error(error);
  }
};
const getColor = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const getaColor = await Color.findById(id);
    return res.status(200).json(getaColor);
  } catch (error) {
    throw new Error(error);
  }
};
const getallColors = async (req, res) => {
  try {
    const getallColor = await Color.find();
    return res.status(200).json(getallColor);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColors,
};
