import { lobMailRecordsCollection } from './dbCollections.js';

export const createLobMailRecord = async (payload) => {
  try {
    const res = await lobMailRecordsCollection.create(payload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateLobMailRecord = async (searchPayload, updatePayload) => {
  try {
    const res = await lobMailRecordsCollection.findOneAndUpdate(
      searchPayload,
      updatePayload,
      { new: true }
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const getLobMailRecord = async (searchPayload) => {
  try {
    const res = await lobMailRecordsCollection.findOne(searchPayload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const getLobMailRecords = async (searchPayload, options = {}) => {
  try {
    const { page = 1, pageSize = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      lobMailRecordsCollection
        .find(searchPayload)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      lobMailRecordsCollection.countDocuments(searchPayload),
    ]);
    return { data, total };
  } catch (err) {
    throw err;
  }
};

export const getLobMailRecordById = async (id) => {
  try {
    const res = await lobMailRecordsCollection.findById(id).lean();
    return res;
  } catch (err) {
    throw err;
  }
};
