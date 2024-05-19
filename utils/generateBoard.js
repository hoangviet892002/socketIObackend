const generateBoard = (id) => {
  return Array(20)
    .fill(null)
    .map(() => Array(20).fill(""));
};

module.exports = { generateBoard };
