const express = require('express')

const router = express.Router();
const { auth } = require('../middlewares/auth');
const { getCanvas, getCanvases, updateImage, addAndRemoveStroke, clearCanvas } = require('../controllers/canvas');

router.get('/', auth, getCanvases);
router.get('/:id', auth, getCanvas);
// router.post('/stroke', auth, addCanvasStroke);
// router.post('/stroke/delete', auth, deleteCanvasStroke);
router.post('/stroke/add-remove', auth, addAndRemoveStroke);
router.post('/img', auth, updateImage);
router.post('/clear', auth, clearCanvas);

module.exports = router;