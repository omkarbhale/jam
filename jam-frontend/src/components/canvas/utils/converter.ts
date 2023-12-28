export const imageToBase64 = (graphics) => {
    return graphics.canvas.toDataURL();
}

export const base64ToImage = (base64, p5) => {
    return new Promise((res, rej) => {
        const _img = p5.loadImage(base64, () => {
            res(_img);
        }, () => {
            rej("Could not load");
        });
    })
}