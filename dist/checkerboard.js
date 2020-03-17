import { Color } from "./color.js";
class Checkerboard {
    roughness = 150;
    specular = Color.white;
    constructor() { }
    diffuse(position) {
        return this._isEven(position.z, position.x) ? Color.white : Color.black;
    }
    reflect(position) {
        return this._isEven(position.z, position.x) ? 0.1 : 0.7;
    }
    _isEven(z, x) {
        return (Math.floor(z) + Math.floor(x)) % 2 !== 0;
    }
}
export { Checkerboard };
