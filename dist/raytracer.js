import { Color } from "./color.js";
import { count } from "./count.js";
import { Vector } from "./vector.js";
export class RayTracer {
    _maxDepth = 5;
    screenWidth;
    screenHeight;
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this._intersections = this._intersections.bind(this);
        this._testRay = this._testRay.bind(this);
        this._traceRay = this._traceRay.bind(this);
        this._shade = this._shade.bind(this);
        this._getReflectionColor = this._getReflectionColor.bind(this);
        this._getNaturalColor = this._getNaturalColor.bind(this);
        this._recenterX = this._recenterX.bind(this);
        this._recenterY = this._recenterY.bind(this);
        this._getPoint = this._getPoint.bind(this);
        this.render = this.render.bind(this);
    }
    _intersections(ray, scene) {
        let closest = +Infinity;
        let closestIntersection = null;
        let i = scene.things.length;
        while (i--) {
            count(`_intersections`);
            const intersection = scene.things[i].intersect(ray);
            if (intersection && intersection.distance < closest) {
                closestIntersection = intersection;
                closest = intersection.distance;
            }
        }
        return closestIntersection;
    }
    _testRay(ray, scene) {
        count(`_testRay`);
        const intersection = this._intersections(ray, scene);
        if (!intersection)
            return null;
        return intersection.distance;
    }
    _traceRay(ray, scene, depth) {
        count(`_traceRay`);
        const intersection = this._intersections(ray, scene);
        if (!intersection)
            return Color.backgroundColor;
        return this._shade(intersection, scene, depth);
    }
    _shade(intersection, scene, depth) {
        count(`_shade`);
        const direction = intersection.ray.direction;
        const position = Vector.plus(Vector.times(intersection.distance, direction), intersection.ray.start);
        const normal = intersection.thing.normal(position);
        const reflectionDirection = Vector.minus(direction, Vector.times(2, Vector.times(Vector.dotProduct(normal, direction), normal)));
        const naturalColor = Color.plus(Color.backgroundColor, this._getNaturalColor(intersection.thing, position, normal, reflectionDirection, scene));
        const reflectedColor = depth >= this._maxDepth ? Color.grey : this._getReflectionColor(intersection.thing, position, reflectionDirection, scene, depth);
        return Color.plus(naturalColor, reflectedColor);
    }
    _getReflectionColor(thing, position, reflectionDirection, scene, depth) {
        count(`_getReflectionColor`);
        const ray = {
            start: position,
            direction: reflectionDirection,
        };
        return Color.scale(thing.surface.reflect(position), this._traceRay(ray, scene, depth + 1));
    }
    _getNaturalColor(thing, position, normal, reflectionDirection, scene) {
        count(`_getNaturalColor`);
        let naturalColor = Color.defaultColor;
        let i = scene.lights.length;
        while (i--) {
            const light = scene.lights[i];
            const lightDistance = Vector.minus(light.position, position);
            const lightVector = Vector.normal(lightDistance);
            const ray = {
                start: position,
                direction: lightVector,
            };
            const neatIntersection = this._testRay(ray, scene);
            let isInShadow;
            if (!neatIntersection) {
                isInShadow = false;
            }
            else {
                isInShadow = neatIntersection <= Vector.magnitude(lightDistance);
            }
            if (isInShadow) {
                naturalColor = Color.plus(naturalColor, Color.defaultColor);
                continue;
            }
            const illumination = Vector.dotProduct(lightVector, normal);
            let lightColor;
            if (illumination > 0) {
                lightColor = Color.scale(illumination, light.color);
            }
            else {
                lightColor = Color.defaultColor;
            }
            const specular = Vector.dotProduct(lightVector, Vector.normal(reflectionDirection));
            let specularColor;
            if (specular > 0) {
                specularColor = Color.scale(Math.pow(specular, thing.surface.roughness), light.color);
            }
            else {
                specularColor = Color.defaultColor;
            }
            naturalColor = Color.plus(naturalColor, Color.plus(Color.times(thing.surface.diffuse(position), lightColor), Color.times(thing.surface.specular, specularColor)));
        }
        return naturalColor;
    }
    _recenterX(x) {
        count(`_recenterX`);
        return (x - this.screenWidth / 2.0) / 2.0 / this.screenWidth;
    }
    _recenterY(y) {
        count(`_recenterY`);
        return -(y - this.screenHeight / 2.0) / 2.0 / this.screenHeight;
    }
    _getPoint(x, y, camera) {
        count(`_getPoint`);
        return Vector.normal(Vector.plus(camera.forward, Vector.plus(Vector.times(this._recenterX(x), camera.right), Vector.times(this._recenterY(y), camera.up))));
    }
    render(context, scene) {
        const { screenWidth, screenHeight } = this;
        const { camera } = scene;
        const { position } = camera;
        const ray = {
            start: position,
            direction: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
        let y = screenHeight;
        while (y--) {
            for (let x = 0; x < screenWidth; ++x) {
                count(`render`);
                ray.direction = this._getPoint(x, y, camera);
                const color = this._traceRay(ray, scene, 0);
                const { r, g, b } = Color.toDrawingColor(color);
                context.fillStyle = `rgb(${r}, ${g}, ${b})`;
                context.fillRect(x, y, 1, 1);
            }
        }
        console.log(`screenHeight: ${screenHeight}`);
        console.log(`screenWidth: ${screenWidth}`);
    }
}
