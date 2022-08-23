export const centerOfDevices = (devices, direction) => {
  const x = [];
  const y = [];
  devices.forEach((d) => {
    x.push(parseInt(d.x, 10));
    y.push(parseInt(d.y, 10));
  });

  let min = 0;
  let max = 0;

  if (direction === "x") {
    min = Math.min.apply(null, x);
    max = Math.max.apply(null, x);
  } else {
    min = Math.min.apply(null, y);
    max = Math.max.apply(null, y);
  }

  return Number((min + max) / 2);
};

export const calculateZoomAndScale = (cameraDistance, centerX, centerY) => {
  let zoomLevel = 1;
  let scaleLevel = 1;
  if (cameraDistance !== 0 && centerX !== 0 && centerY !== 0) {
    let zoomX = 0;
    let zoomY = 0;
    if (cameraDistance > centerX) {
      zoomX = Math.abs(cameraDistance / centerX);
    } else {
      zoomX = Math.abs(centerX / cameraDistance);
    }

    if (cameraDistance > centerY) {
      zoomY = Math.abs(cameraDistance / centerY);
    } else {
      zoomY = Math.abs(centerY / cameraDistance);
    }

    zoomLevel = (zoomX + zoomY) / 2;
    scaleLevel = zoomX + zoomY;

    return { zoomLevel, scaleLevel };
  }
  return { zoomLevel, scaleLevel };
};

export const groupBy = (xs, f) => {
  return xs.reduce(
    (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
    {}
  );
};

export const setLocation = (x, y, zoom) => {
  const location = {
    target: {
      x: x,
      y: y,
      z: 0,
    },
    position: {
      x: x,
      y: y,
      z: 0.9999999999993942,
    },

    zoom: zoom,
  };
  return location;
};
