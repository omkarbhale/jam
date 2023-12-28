const Canvas = require('../models/Canvas');

const getCanvases = (req, res, next) => {
    return res.send('Get all canvases of this user');
}

const getCanvas = async (req, res, next) => {
    const canvasId = req.params.id;
    const canvas = await Canvas.findById(canvasId);
    if (!canvas) return res.status(404).json({ message: 'Can not find canvas' });
    return res.json(canvas);
}

const updateImage = async (req, res, next) => {
    const canvasId = req.body.canvas;
    const canvas = await Canvas.findByIdAndUpdate(canvasId, { img: req.body.base64 }, {upsert: true});
    return res.json(canvas);
}

const addAndRemoveStroke = async (req, res, next) => {
    const { canvas: canvasId, newStroke, oldStrokesIndex } = req.body;
    
    const canvas = await Canvas.findById(canvasId);
    if (!canvas) return res.status(404).json({ message: 'Can not find canvas' });

    oldStrokesIndex.sort();
    oldStrokesIndex.reverse();
    for (let i = oldStrokesIndex.length - 1; i >= 0; i--) {
        canvas.strokes.splice(oldStrokesIndex[i], 1);
    }

    if (newStroke)
        canvas.strokes.push(newStroke);
    
    delete canvas.__v;
    await canvas.save();
    return res.json(canvas);
}

const clearCanvas = async (req, res, next) => {
    const canvasId = req.body.canvas;
    const canvas = await Canvas.findByIdAndUpdate(canvasId, { strokes: [], $unset: { img: 1 } });
    if (!canvas) return res.status(404).json({ message: 'Can not find canvas' });

    return res.json(canvas);
}

module.exports = {
    getCanvases,
    getCanvas,
    // addCanvasStroke,
    addAndRemoveStroke,
    // deleteCanvasStroke,
    updateImage,
    clearCanvas,
};