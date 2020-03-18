import { Camera } from "./camera.js";
import { Checkerboard } from "./checkerboard.js";
import { count_count, count_getNaturalColor, count_getPoint, count_getReflectionColor, count_intersections, count_recenterX, count_recenterY, count_render, count_shade, count_testRay, count_traceRay } from "./count.js";
import { RGB, Thing, XYZ } from "./declarations.js";
import { Light } from "./light.js";
import { Plane } from "./plane.js";
import { RayTracer } from "./raytracer.js";
import { Scene } from "./scene.js";
import { Shiny } from "./shiny.js";
import { Sphere } from "./sphere.js";

function defaultThings(): Thing[] {
  function plane(): Plane {
    const norm: XYZ = {
      x: 0.0,
      y: 1.0,
      z: 0.0,
    };
    return new Plane(norm, 0.0, new Checkerboard());
  }

  function sphere1(): Sphere {
    const center: XYZ = {
      x: 0.0,
      y: 1.0,
      z: -0.25,
    };
    return new Sphere(center, 1.0, new Shiny());
  }

  function sphere2(): Sphere {
    const center: XYZ = {
      x: -1.0,
      y: 0.5,
      z: 1.5,
    };
    return new Sphere(center, 0.5, new Shiny());
  }

  return [plane(), sphere1(), sphere2()];
}

function defaultLights(): Light[] {
  function lightOne(): Light {
    const position: XYZ = {
      x: -2.0,
      y: 2.5,
      z: 0.0,
    };
    const color: RGB = {
      r: 0.49,
      g: 0.07,
      b: 0.07,
    };
    return new Light(position, color);
  }

  function lightTwo(): Light {
    const position: XYZ = {
      x: 1.5,
      y: 2.5,
      z: 1.5,
    };
    const color: RGB = {
      r: 0.07,
      g: 0.07,
      b: 0.49,
    };
    return new Light(position, color);
  }

  function lightThree(): Light {
    const position: XYZ = {
      x: 1.5,
      y: 2.5,
      z: -1,
    };
    const color: RGB = {
      r: 0.07,
      g: 0.49,
      b: 0.07,
    };
    return new Light(position, color);
  }

  function lightFour(): Light {
    const position: XYZ = {
      x: 0.0,
      y: 3.5,
      z: 0.0,
    };
    const color: RGB = {
      r: 0.21,
      g: 0.21,
      b: 0.35,
    };
    return new Light(position, color);
  }

  return [lightOne(), lightTwo(), lightThree(), lightFour()];
}

function defaultCamera(): Camera {
  const position: XYZ = {
    x: 3.0,
    y: 2.0,
    z: 4.0,
  };

  const lookAt: XYZ = {
    x: -1.0,
    y: 0.5,
    z: 0.0,
  };

  return new Camera(position, lookAt);
}

function init(): void {
  const conflictingCanvas: HTMLCanvasElement | null = document.querySelector(`canvas`);
  if (conflictingCanvas) {
    throw new ReferenceError(`A canvas already exists!`);
  }

  const canvas: HTMLCanvasElement = document.createElement(`canvas`);

  const SAME: number = 512 as const;
  canvas.width = SAME;
  canvas.height = SAME;

  if (canvas.width !== canvas.height || SAME !== canvas.width) {
    throw new TypeError(`Canvas width/height mismatch!`);
  }

  document.body.appendChild(canvas);
  const shouldExist: HTMLCanvasElement | null = document.querySelector(`canvas`);
  if (!shouldExist) {
    throw new ReferenceError(`Could not append canvas to body!`);
  }

  const context: CanvasRenderingContext2D | null = canvas.getContext(`2d`);
  if (!context) {
    throw new ReferenceError(`Could not get 2D context!`);
  }

  const scene = new Scene(defaultThings(), defaultLights(), defaultCamera());
  if (!scene) {
    throw new ReferenceError(`Could not create scene!`);
  }

  const rayTracer: RayTracer = new RayTracer(canvas.width, canvas.height);

  return rayTracer.render(context, scene);
}

console.time("fullRun");
init();
console.timeEnd("fullRun");

console.table([`TOTAL CALLS: ${count_count}`, `_intersections: ${count_intersections}`, `_testRay: ${count_testRay}`, `_traceRay: ${count_traceRay}`, `_shade: ${count_shade}`, `_getReflectionColor: ${count_getReflectionColor}`, `_getNaturalColor: ${count_getNaturalColor}`, `_recenterX: ${count_recenterX}`, `_recenterY: ${count_recenterY}`, `_getPoint: ${count_getPoint}`, `render: ${count_render}`]);
