const invalidBoolSetting = (bool) => ((bool == null || (bool !== false && bool !== true)) ? undefined : bool);

module.exports = {
  invalidBoolSetting,
};
