/*
 * Load an image, and when it's done, draw it on the canvas with `drawImage`
 *
 * After that, get all the pixel data from the canvas with `getImageData`
 * Loop through that data, and store each pixel with color and position
 * in a new array. With that array, create a `THREE.Points()`
*/

var Explode = {

	init: function() {
		this.canvas = document.querySelector('.js-canvas');
		this.ctx = this.canvas.getContext('2d');

		this.totalTicks = 200;
		this.tick = 0;

		this.mouseDown = false;
		this.explode = false;
		this.rotationX = 0;
		this.rotationY = 0;

		this.raf = null;

		this.setupOptions();
		this.setupStage();
		this.addEventListeners();

		this.run();
	},

	setupOptions: function() {
		this.options = {
			easing: 'easeOutCubic',
			duration: 120,
			separateColor: false,
			radialExplode: false,
			image: 'burger',
			maxRotation: 0.15
		};

		var gui = new dat.GUI(),
			reset = this.reset.bind(this),
			rewind = this.rewind.bind(this);

		gui.add(this.options, 'easing', Object.keys(Easing)).onFinishChange(rewind);
		gui.add(this.options, 'duration', 10, 300).onFinishChange(rewind);
		gui.add(this.options, 'image', Object.keys(this.imgSources)).onFinishChange(reset);
		gui.add(this.options, 'separateColor').onFinishChange(reset);
		gui.add(this.options, 'radialExplode').onFinishChange(reset);
	},

	// Create all needed THREE stuff
	setupStage: function() {
		var loader = new THREE.TextureLoader();
		loader.crossOrigin = '';

		this.sprite = loader.load(this.spriteData);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
		this.camera.position.z = 1000;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.domElement.classList.add('js-stage');
		document.body.appendChild(this.renderer.domElement);

		this.world = new THREE.Object3D();

		this.scene.add(this.world);

	},

	run: function() {
		// load image, when done, get the pixels
		// and fill create the particles
		this.loadImage().then(function(img) {
			var pixels = this.getPixels(img);

			this.createParticles(pixels);

			this.render();

		}.bind(this));
	},

	// rewind animation and stop explosion
	rewind: function() {
		this.tick = 0;

		// argh..
		requestAnimationFrame(function() {
			this.explode = false;
		}.bind(this));
	},

	// reset stage
	reset: function() {
		window.cancelAnimationFrame(this.raf);

		this.world.remove(this.particles);
		this.particles = null;
		this.material.dispose();

		this.rewind();

		this.run();
	},

	addEventListeners: function() {
		// bleh
		var self = this,
			stage = document.querySelector('.js-stage');

		window.addEventListener('resize', function() {
			self.camera.aspect = window.innerWidth / window.innerHeight;
			self.camera.updateProjectionMatrix();
			self.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		document.querySelector('.js-btn').addEventListener('click', this.rewind.bind(this));

		stage.addEventListener('mousemove', function(e) {
			var midX = window.innerWidth >> 1,
				midY = window.innerHeight >> 1;

			self.rotationX = -self.options.maxRotation * ((e.screenY - midY) / midY);
			self.rotationY = -self.options.maxRotation * ((e.screenX - midX) / midX);
		});

		stage.addEventListener('mousedown', function() {
			self.mouseDown = true;
		});

		stage.addEventListener('mouseup', function() {
			self.mouseDown = false;
			self.explode = true;
		});
	},

	// create and returns a array with all needed pixels, including
	// their position and color
	getPixels: function(img) {
		var pixels = [],
			colorSum = 0,

			x = 0,
			destX = 0,

			y = 0,
			destY = 0,

			z = 0,
			destZ = 0,

			midX = img.width >> 1,
			midY = img.height >> 1,

			maxDistance = Math.sqrt((midX * midX) + (midY * midY)),
			distance = 0,
			angle = 0,

			maxDepth = this.options.radialExplode ? -200 : -700,
			maxRadius = -200,

			i;

		this.imgWidth = img.width;
		this.imgHeight = img.height * (this.imgWidth / img.width);

		this.canvas.width = this.imgWidth;
		this.canvas.height = this.imgHeight;

		// draw the image on the canvas and get all pixels
		this.ctx.drawImage(img, 0, 0);
		pixelData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

		// store color per pixel, with x / y position in an array
		for (i = 0; i < pixelData.data.length; i += 4) {
			distance = (Math.sqrt((x - midX) * (x - midX) + (y - midY) * (y - midY)) / maxDistance);
			angle = Math.atan2(y - midY, x - midX);
			colorSum = (pixelData.data[i]) +  pixelData.data[i + 1] +  pixelData.data[i + 2];

			destX = Math.cos(angle) * (distance * maxRadius);
			destY = Math.sin(angle) * (distance * maxRadius);

			destZ = (this.options.separateColor) ? maxDepth * (colorSum / (255 * 3)) : Math.random() * maxDepth;

			if (this.options.radialExplode) {
				destZ += (1 - distance) * -500;
			}

			// skip light, dark and transparent pixels
			if (colorSum < 750 && colorSum > 60 && pixelData.data[i + 3] > 0.7) {
				pixels.push({
					rgb: [pixelData.data[i], pixelData.data[i + 1], pixelData.data[i + 2]],
					x: x,
					startX: x,
					destX: destX,

					y: y,
					startY: y,
					destY: destY,

					z: z,
					startZ: z,
					destZ: destZ
				});
			}

			// next column
			x += 1;

			if (i % (pixelData.width * 4) === 0) {
				// next row, first column
				x = 1;
				y += 1;
			}
		}

		// return array with pixels
		return pixels;
	},

	// Create a `THREE.Points()` with an array of pixels
	createParticles: function(pixels) {
		var geometry = new THREE.Geometry(),
			colors = [],
			material,
			pixel,
			vertex,
			particles;

		for ( i = 0; i < pixels.length; i ++ ) {
			pixel = pixels[i];

			vertex = new THREE.Vector3();

			vertex.x = pixel.x - (this.imgWidth * 0.5);
			vertex.startX = vertex.x;
			vertex.destX = vertex.x + pixel.destX;

			vertex.y = -pixel.y + (this.imgHeight * 0.5);
			vertex.startY = vertex.y;
			vertex.destY = vertex.y - pixel.destY;

			vertex.z = pixel.z;
			vertex.startZ = pixel.z;
			vertex.destZ = pixel.z + pixel.destZ;

			geometry.vertices.push(vertex);

			colors[i] = new THREE.Color('rgb(' + pixel.rgb[0] + ', ' + pixel.rgb[1] + ', ' + pixel.rgb[2] + ')');
		}

		geometry.colors = colors;
		this.material = new THREE.PointsMaterial({size: 3, map: this.sprite, vertexColors: THREE.FaceColors});
		this.particles = new THREE.Points(geometry, this.material);
		this.world.add(this.particles);

		this.vertices = this.particles.geometry.vertices;
	},

	render: function() {
		var easingFunc = Easing[this.options.easing],
			duration = this.options.duration,
			i = this.vertices.length,
			vertice;

		if (this.mouseDown && this.tick > 0) {
			this.tick -= 2;
		}

		if (this.explode && this.tick < duration) {
			while (i--) {
				vertice = this.vertices[i];
				vertice.z = easingFunc(this.tick, vertice.startZ, vertice.startZ - vertice.destZ, duration);
			}

			if (this.mouseDown === false) {
				this.tick++;
			}
		}

		this.particles.geometry.verticesNeedUpdate = true;
		this.particles.geometry.__dirtyVertices = true;

		this.particles.rotation.x = this.rotationX;
		this.particles.rotation.y = this.rotationY;

		this.renderer.render(this.scene, this.camera);
		this.raf = window.requestAnimationFrame(this.render.bind(this));
	},

	loadImage: function() {
		var img = document.createElement('img'),
			src = this.imgSources[this.options.image];

		img.crossOrigin = '';
		img.src = src;

		return new Promise(function(resolve, reject) {
			img.addEventListener('load', function() {
				resolve(img);
			});
		});
	},

	imgSources: {
		burger: 'https://dl.dropboxusercontent.com/s/o1k3zyutze2e2cp/burger-black.jpg',
		spiral: 'https://dl.dropboxusercontent.com/s/h5vvretttwk9j2j/spiral-3.png',
		hitman: 'https://dl.dropboxusercontent.com/s/4muuh5h4vt120eh/hitman-2.jpg',
		newvegas: 'https://dl.dropboxusercontent.com/s/lt9rfrmkax1qzqa/newvegas.jpg'
	},

	// spriteData: 'https://dl.dropboxusercontent.com/s/nvkhzgjabyjy0lv/ball.png'
	spriteData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM4QUQyQjJCOURCQTExRTU5RDA1OUNERUU1RjdFRTc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM4QUQyQjJDOURCQTExRTU5RDA1OUNERUU1RjdFRTc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzhBRDJCMjk5REJBMTFFNTlEMDU5Q0RFRTVGN0VFNzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzhBRDJCMkE5REJBMTFFNTlEMDU5Q0RFRTVGN0VFNzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5grvxNAAAFrklEQVR42uydP0hcWRTG7xNDIClkLZS1UcGBLQSD6JbKFhLMhiCmcIuAIMIWaTawxRZZdmUttljYbSwWgrCQQouEIBtDsAixVAkKFsIIamPQwmCxgii45xvPDeNz/rw38959582cH3xVYDTfN/c9Z9695/MuLi6MYL4gfUXKkDpJ7aQ2UiupmdREukW6QTojnZCOSUekA9I+aY+0Q8qStkifJP+HPWGBfEn6mtRP6iX1cABRgYA2SB9Iq6QV0kcN5CodpG9Ig6QBXgmuwMpZJr0nvSPt1nMg35KGSXdJXQLenNukt6Q3pNf1Egiu+aOkEdIDwZfyBdIr0ku+J9VcILdJ35HGSEMmPSyR5klzpP9qJZCHpEe8KtIKVstz0os0B3KHNMG6bdIPVsgsaz1tgUySvif1mdpjjfQ36VkaAsEHuMesRlO7nJNmWFmpgeBm/QPpnqkfFkl/8c1fVCDjpB9J3ab+2CT9QfpHSiBPSD+RWkz9ckj6nfRn0oE8Zd00yilpmpVIIL+SftEcrjHF3jgNBKviN/W+KD9XulIaKrxnPFXPy75hn7gIZJxv4HrPKM1N9mk8zkCG+E/bFvU7EC3s11AcgWT4Q1+3+hyKbvYtE3Ugj+vsE3iU3GP/IgtkMswLKkXf0JNRBIKv0PGtbaN6WhWN7OOdagPBs4w+9TMS+tjPigN5GOQFlFBMsK+hA8ETvkemNp70SaKsr8UCwYaEEfUvFkbY38CBYKvOmPoWK2Psc6BARk26tuqkkSH2OVAgeqlyd+m6hv/rd2zv/Fe9csZ949u26l8hw+qRU4ZLXbI6zOXGZ8Udd9n3goHgSECXeuSULva9YCCD6k8iDBYKBCeXBtSbRBhg/68EgmNknepNInSy/1cC6VdfEqXfH0ivepIovfmB4Ohxj3qSKD2cQy4QnANvU08SpY1zyAWSUT9EkLGB6F9Xcv7aygXSrl6IoN0GovcPOfeRXCCt6oUIWm0gzeqFCJptIE3qhQiabCC31AsR5HLAI9wL9UIMHlbImfoggjN7yTpRL0RwYgM5Vi9EcGwDOVIvRHBkAzlQL0RwYAPZVy9EsG8D2VMvRLBnA9lRL0SwYwPJqhciyNpAtvQ+IuL+sWUDwSz0DfUkUTY4h8/bgD6oJ4ny2X8byKp6kiir/kBW9K+tRP+6WvEHgsqGZfUmEZZNXmVG/nGE9+pNIlzxPT8Q9Gdsqz9O2WbfCwayay77MxR3vDW+Ehn/oc836pFTrvntDwRHdBfUJycsmAJNPoUGB7xSr5xQ0OdCgaDmZ0n9ipUl9jlQIHi2O6+excq8KbKXodh4pjm9dMV6qZor9o/FAkG9z3PjqAirjijra6kRfyjAmlUPI2XWlCkWawjwAmvqYySsBXmDlwsEbWQowDpXP6vinH1crzYQgDayGfW0KmZMwFa3hhAvuKi+VsRimDd00ECwIwJtZJvqbyg22bds1IHYT5doIztUnwNxyH6F+tYjbKELquHQRnaqfpfklH0KXaVXSeURquGm1fOSTJsKK/QaqviBU+p7QaaqecNqj2G0l6lEewwt2vQpqOnTol24grpwLdoWHQFRVhnhl9rlD0Hapy5gheSDAix0LtViXRK+tcUXhc/ieHEvxkEOKMCaYNVCUw8eKs2y1uP6IZ6DyRroXELNT5prMPDYFU/6XsT9gzxHo06wQlDzM2bSVRaD+yI2JMwZR4+zPcezZzCCaJRXywPBQSzwqsBWHaeTLrwEhwGhPAb9GahskNDKgI3P2GuL7Z2vk/olPAHTmTrMZWUDWgIwmN7llFQclsH5DBwJeGd8G5/rNZB80BKAwfSYhY7x25j4HOWQTpx2xQFLnOnDMTKcXPooyQBP+PwyjN/GxOcMr5x2DggDI5v5noRJbDfM5bypE77mY5DLAQewxysBH+Bw9PiT5P+wpwPlZPG/AAMA59FYDkcAVosAAAAASUVORK5CYII='

};

/*!
 * -------------------------
 * http://gizma.com/easing/
 * -------------------------
 */
var Easing = {
	linear: function (t, b, c, d) { return c*t/d + b; },

	easeInQuad: function (t, b, c, d) {
		t /= d;
		return c*t*t + b;
	},

	easeOutQuad: function (t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	},

	easeInOutQuad: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	},

	easeInCubic: function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	},

	easeOutCubic: function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	},

	easeInOutCubic: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	},

	easeInQuart: function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	},

	easeOutQuart: function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	},

	easeInOutQuart: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	},

	easeInQuint: function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	},

	easeOutQuint: function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	},

	easeInOutQuint: function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	},

	easeInSine: function (t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},

	easeInExpo: function (t, b, c, d) {
		return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
	}

};

Explode.init();