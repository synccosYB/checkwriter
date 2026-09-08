import { carrierShipmentsCollection } from './dbCollections.js';

export const createCarrierShipment = async (payload) => {
  try {
    const res = await carrierShipmentsCollection.create(payload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateCarrierShipment = async (searchPayload, updatePayload) => {
  try {
    const res = await carrierShipmentsCollection.findOneAndUpdate(
      searchPayload,
      updatePayload,
      { new: true }
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const getCarrierShipment = async (searchPayload) => {
  try {
    const res = await carrierShipmentsCollection.findOne(searchPayload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const getCarrierShipments = async (searchPayload, options = {}) => {
  try {
    const { page = 1, pageSize = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      carrierShipmentsCollection
        .find(searchPayload)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      carrierShipmentsCollection.countDocuments(searchPayload),
    ]);
    return { data, total };
  } catch (err) {
    throw err;
  }
};

export const getCarrierShipmentById = async (id) => {
  try {
    const res = await carrierShipmentsCollection.findById(id).lean();
    return res;
  } catch (err) {
    throw err;
  }
};
