var intersectAllCallback = undefined;

var intersectAll = new OrigamiPaper("canvas-intersect-all").blackAndWhite();
intersectAll.intersectionLayer = new intersectAll.scope.Layer();
intersectAll.intersectionLayer.moveBelow(intersectAll.edgeLayer);

intersectAll.drawIntersections = function(line, ray, edge){
	paper = this.scope;
	this.intersectionLayer.activate();
	this.intersectionLayer.removeChildren();
	var intersections = [
		line.interscetion(ray),
		line.interscetion(edge),
		ray.intersection(edge)];
	var intersectParts = [
		[line, ray],
		[line, edge],
		[ray, edge],
	];
	for(var inter = 0; inter < intersections.length; inter++){
		var intersection = intersections[inter];
		if(intersection !== undefined){
			var interRadius = 0.04;
			var vec0 = intersectParts[inter][0].vector();
			var vec1 = intersectParts[inter][1].vector();
			var fourPoints = [
				intersection.add(vec0.normalize().scale(interRadius)),
				intersection.add(vec1.normalize().scale(interRadius)),
				intersection.subtract(vec0.normalize().scale(interRadius)),
				intersection.subtract(vec1.normalize().scale(interRadius))
			];
			var arcPoints = [];
			fourPoints.forEach(function(el, i){
				var nextI = (i+1)%fourPoints.length;
				var b = el.subtract(intersection).bisect(fourPoints[nextI].subtract(intersection))[0];
				var arcMidPoint = b.normalize().scale(interRadius).add(intersection);
				var thesePoints = [ fourPoints[i],
				                    arcMidPoint,
				                    fourPoints[nextI] ];
				arcPoints.push(thesePoints);
			});
			var fillColors = [this.styles.byrne.yellow, this.styles.byrne.red];
			for(var i = 0; i < 4; i++){
				var fillArc = new this.scope.Path.Arc(arcPoints[i][0], arcPoints[i][1], arcPoints[i][2]);
				fillArc.add(intersection);
				fillArc.closed = true;
				fillArc.strokeWidth = null;
				fillArc.fillColor = fillColors[i%2];
			}
		}
	}
}

intersectAll.redraw = function(){
	var points = this.touchPoints.map(function(el){ return new XY(el.position.x, el.position.y); });
	var line = new Line(points[0], points[1].subtract(points[0]));
	var ray = new Ray(points[2], points[3].subtract(points[2]));
	var edge = new Edge(points[4], points[5]);

	this.cp.clear();
	this.cp.crease(line).mountain();
	this.cp.crease(ray).mountain();
	this.cp.crease(edge).mountain();
	this.draw();
	this.drawIntersections(line, ray, edge);

	if(intersectAllCallback !== undefined){
		var event = {
			"edge": [this.touchPoints[4].position, this.touchPoints[5].position],
			"ray": [this.touchPoints[2].position, this.touchPoints[3].position],
			"line": [this.touchPoints[0].position, this.touchPoints[1].position]
		};
		intersectAllCallback(event);
	}
}

intersectAll.setup = function(){
	[[0.9, 0.56],[0.7, 0.53],[0.9, 0.44],[0.7, 0.47],[0.15, 0.3],[0.15, 0.7]].forEach(function(point){ this.makeTouchPoint(point); },this);
	this.redraw();
}
intersectAll.setup();

intersectAll.onFrame = function(event){ }
intersectAll.onResize = function(event){ }
intersectAll.onMouseDown = function(event){ }
intersectAll.onMouseUp = function(event){ }
intersectAll.onMouseMove = function(event){
	if(this.mouse.isPressed){
		this.redraw();
	}
}
