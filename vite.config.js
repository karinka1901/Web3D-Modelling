import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
    root: "three-dev",
    publicDir: "../3d-assets",
    build: {
    outDir: "../build",

    rollupOptions: {
        output: {
        },
    },
    plugins: [
        basicSsl()
        
      
      ],

   
    
    chunkSizeWarningLimit: 1000,
    
}
};
