module.exports = (query, { page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  return { ...query, skip, take: Number(limit) };
};
