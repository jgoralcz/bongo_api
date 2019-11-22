const MAGIC = {
  jpgNumber: 'ffd8ffe0',
  jpg2Number: 'ffd8ffe1',
  pngNumber: '89504e47',
  gifNumber: '47494638',
  jpgGeneral: 'ffd8ff',
};

const imageIdentifier = (buffer) => {
  const magicNumber = buffer.toString('hex', 0, 4);

  if (magicNumber === MAGIC.gifNumber) {
    return 'gif';
  }
  if (magicNumber.startsWith(MAGIC.jpgGeneral)) {
    return 'jpg';
  }
  if (magicNumber === MAGIC.pngNumber) {
    return 'png';
  }

  return '';
};

module.exports = {
  MAGIC,
  imageIdentifier,
};
