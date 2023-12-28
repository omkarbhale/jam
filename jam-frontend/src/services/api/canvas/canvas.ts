import axios from "../api.ts";
import { self } from "../auth/auth.ts";

export const getCanvas = async (id) => {
    const result = await axios.get(`/canvas/${id}`, { params: { id: self().id } });
    if (result.status !== 200) return null;
    return result.data;
}

export const addAndRemoveCanvasStroke = async (id, newStroke, oldStrokesIndex) => {
    const result = await axios.post(`/canvas/stroke/add-remove`, { canvas: id, newStroke, oldStrokesIndex }, { params: { id: self().id } });
    if (result.status!== 200) return null;
    return result.data;
}

export const updateImage = async (id, base64) => {
    const result = await axios.post(`/canvas/img`, { canvas: id, base64 }, { params: { id: self().id } });
    if (result.status !== 200) return null;
    return result.data;
}

export const clearCanvas = async (id) => {
    const result = await axios.post(`/canvas/clear/`, { canvas: id }, { params: { id: self().id } });
    if (result.status !== 200) return null;
    return result.data;
}
