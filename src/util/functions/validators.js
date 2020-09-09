const invalidBoolSetting = (bool, defaultBool) => ((bool == null || (bool !== false && bool !== 'false' && bool !== true && bool !== 'true')) ? defaultBool : bool === 'true' || bool === true);

module.exports = {
  invalidBoolSetting,
};
