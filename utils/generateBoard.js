const generateBoard = (id) => {
  return Array(12)
    .fill(null)
    .map(() => Array(12).fill(""));
};

module.exports = { generateBoard };
