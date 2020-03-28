const invalidBoolSetting = (bool) => ((bool == null || (bool !== false && bool !== 'false' && bool !== true && bool !== 'true')) ? undefined : bool);

module.exports = {
  invalidBoolSetting,
};
