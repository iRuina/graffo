const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: "/depGraph/",
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        // Regla para cargar archivos binarios con xlsx
        {
          test: /\.(xlsx|xls|xlsm|xlsb)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets', // Carpeta de salida para los archivos binarios
                publicPath: '/assets' // Ruta pública para acceder a los archivos binarios desde el navegador
              }
            }
          ]
        }
      ]
    }
  }
})
