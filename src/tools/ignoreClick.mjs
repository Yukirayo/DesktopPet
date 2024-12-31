
const main = async (app) => {
    app.renderer.autoClear = false
    const canvas = app.renderer.view

    const offscreenCanvas = document.createElement('canvas');
    const offscreenContext = offscreenCanvas.getContext('2d');

    // 设置 offscreenCanvas 的宽高与 Pixi.js canvas 相同
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    // 将 Pixi.js WebGL 渲染内容绘制到 2D canvas 上
    offscreenContext.drawImage(canvas, 0, 0);

    // 获取像素数据
    const imageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    canvas.addEventListener('mousemove', event => {
        const mouseX = event.clientX - canvas.offsetLeft; // 校正坐标
        const mouseY = event.clientY - canvas.offsetTop;

        const color = getPixel(mouseX, mouseY, imageData);

        console.log(color)
    })

    function getPixel(x, y,imageData) {
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        // 如果透明度为 0，返回透明
        if (a === 0) return 'Transparent';

        return rgbToHex(r, g, b);
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
}



export default main