export function isValidObjectId(id) {
  if (!id) return false;
  const str = id.toString();
  return /^[a-fA-F0-9]{24}$/.test(str);
}

export function toObjectId(id) {
  if (!id) return id;
  return id.toString();
}

const ObjectId = toObjectId;
ObjectId.isValid = isValidObjectId;

export const Types = {
  ObjectId: Object.assign(toObjectId, { isValid: isValidObjectId }),
};

export default { Types };
