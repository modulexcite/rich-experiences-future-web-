define(function (require) {
		
	var Backbone = require('backbone'),
		path = require('text!app/data/path.json'),
        CameraPath;
		
	require('three');
	
	CameraPath = function () {
		
		var delta,
			vertices,
			geometry,
			position;
		
		this.delta = 0;
		
		this.initialize = function () {
			var splineVectors = [],
				i,
				spline;
						
			vertices = JSON.parse(path).vertices;
			path = new THREE.CurvePath();

			for (i = 0; i < vertices.length; i += 1) {
				splineVectors.push(vertices[i]);
			}

			spline = new THREE.SplineCurve3(splineVectors);
			path.add(spline);
			
			geometry = new THREE.TubeGeometry(path, vertices.length * 20, 3, 20, false, false);
		};
		
		this.positionCamera = function (camera) {

			var t, 
				lookAt, 
				pos, 
				dir, 
				normal,
				binormal,
				segments,
				pickt,
				pick,
				pickNext,
				pathLength;
			
			t = this.delta;
			
			position = geometry.path.getPointAt(t);
			dir = geometry.path.getTangentAt(t);
			normal = new THREE.Vector3();
			binormal = new THREE.Vector3();

			segments = geometry.tangents.length;
			pickt = t * segments;
			pick = Math.floor(pickt);
			pickNext = (pick + 1) % segments;

			binormal.subVectors(geometry.binormals[pickNext], geometry.binormals[pick]);
			binormal.multiplyScalar(pickt - pick).add(geometry.binormals[pick]);
			normal.copy(binormal).cross(dir).multiplyScalar(-1);
			
			camera.position = position;
			pathLength = geometry.path.getLength();
			
			lookAt = geometry.path.getPointAt((t + 30 / pathLength) % 1);
			lookAt.copy(position).add(dir);

			camera.matrix.lookAt(camera.position, lookAt, normal);
			camera.rotation.setEulerFromRotationMatrix(camera.matrix, camera.eulerOrder);
		};
		
		this.positionElement = function (element, t) {
			
			var lookAt, 
				pos, 
				dir, 
				normal,
				binormal,
				segments,
				pickt,
				pick,
				pickNext,
				pathLength;
			
			position = geometry.path.getPointAt(t);
			dir = geometry.path.getTangentAt(t);
			normal = new THREE.Vector3();
			binormal = new THREE.Vector3();
			
			segments = geometry.tangents.length;
			pickt = t * segments;
			pick = Math.floor(pickt);
			pickNext = (pick + 1) % segments;

			binormal.subVectors(geometry.binormals[pickNext], geometry.binormals[pick]);
			binormal.multiplyScalar(pickt - pick).add(geometry.binormals[pick]);
			normal.copy(binormal).cross(dir).multiplyScalar(-1);

			element.position = position;
			pathLength = geometry.path.getLength();
			
			lookAt = geometry.path.getPointAt((t + 30 / pathLength) % 1);
			lookAt.copy(position).add(dir);
		
			element.matrix.lookAt(element.position, lookAt, normal);
			element.rotation.setEulerFromRotationMatrix(element.matrix, element.eulerOrder);
						
			element.position = geometry.path.getPointAt((t + 30 / pathLength) % 1);
		};
		
		this.length = function () {
			return geometry.path.getLength();
		};
		
	};
	
	return new CameraPath();
});