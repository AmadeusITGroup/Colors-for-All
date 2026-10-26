module.exports = function (config) {
  require('./karma.conf')(config);
  config.set({
    client: {
      args: ['--grep', '/ColorMatrixService|MatrixLoadingService|APCA matrix preferences|ColorPaletteSaveModalComponent|ColorPaletteService|MatrixTableComponent|HelpComponent|Navigation palette download|AccessibleCombinationsExportService|MatrixCustomFormComponent/']
    }
  });
};