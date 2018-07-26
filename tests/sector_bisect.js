var sectorBisect = new OrigamiPaper("canvas-sector-bisect", new CreasePattern().setBoundary([new XY(-1.0,-1.0),new XY(1.0,-1.0),new XY(1.0,1.0),new XY(-1.0,1.0)]));

sectorBisect.style.mountain.strokeWidth = 0.02;
sectorBisect.style.mountain.strokeColor = { gray:0.0, alpha:1.0 };
sectorBisect.cp.edges = sectorBisect.cp.edges.filter(function(el){ return el.orientation !== CreaseDirection.border});
sectorBisect.style.selected.node.fillColor = sectorBisect.styles.byrne.yellow;
sectorBisect.style.selected.node.radius = 0.04;
sectorBisect.show.boundary = false;


sectorBisect.validNodes = [];
sectorBisect.draggingNode = undefined;
sectorBisect.arcLayer = new sectorBisect.scope.Layer();
sectorBisect.arcLayer.sendToBack();
sectorBisect.backgroundLayer.sendToBack();
// sectorBisect.edgeLayer.bringToFront();
// sectorBisect.mouseDragLayer.bringToFront();

sectorBisect.updateAngles = function(){
	this.arcLayer.activate();
	this.arcLayer.removeChildren();
	var nodes = this.validNodes.map(function(el){return new XY(el.x, el.y);});
	var bisections = nodes[0].bisect(nodes[1]);
	var small = bisections[0];
	var large = bisections[1];
	// bisect smaller angle
	var arc1Pts = [ new XY(this.validNodes[0].x, this.validNodes[0].y), small, new XY(this.validNodes[1].x, this.validNodes[1].y) ];
	for(var i = 0; i < 3; i++){ arc1Pts[i] = arc1Pts[i].normalize().scale(0.25); }
	// bisect larger angle
	var arc2Pts = [ new XY(this.validNodes[0].x, this.validNodes[0].y), large, new XY(this.validNodes[1].x, this.validNodes[1].y) ];
	for(var i = 0; i < 3; i++){ arc2Pts[i] = arc2Pts[i].normalize().scale(0.3); }
	// draw things
	var smallArc = new this.scope.Path.Arc(arc1Pts[0], arc1Pts[1], arc1Pts[2]);
	smallArc.add(new this.scope.Point(0.0, 0.0));
	smallArc.closed = true;
	var largeArc = new this.scope.Path.Arc(arc2Pts[0], arc2Pts[1], arc2Pts[2]);
	largeArc.add(new this.scope.Point(0.0, 0.0));
	largeArc.closed = true;
	var smallLine = new this.scope.Path({segments:[[0.0, 0.0], [small.x,small.y]], closed:true});
	var largeLine = new this.scope.Path({segments:[[0.0, 0.0], [large.x,large.y]], closed:true});

	Object.assign(smallLine, this.style.mountain);
	Object.assign(largeLine, this.style.mountain);
	Object.assign(smallLine, {strokeColor:this.styles.byrne.yellow});
	Object.assign(largeLine, {strokeColor:this.styles.byrne.blue});
	Object.assign(smallArc, this.style.mountain);
	Object.assign(largeArc, this.style.mountain);
	Object.assign(smallArc, {strokeColor:null, fillColor:this.styles.byrne.blue});
	Object.assign(largeArc, {strokeColor:null, fillColor:this.styles.byrne.red});
}

sectorBisect.reset = function(){
	var creases = [
		this.cp.crease(new XY(0.0, 0.0), new XY(Math.random()*2-1.0, Math.random()*2-1.0)).mountain(),
		this.cp.crease(new XY(0.0, 0.0), new XY(Math.random()*2-1.0, Math.random()*2-1.0)).mountain()
	];
	this.cp.clean();
	this.validNodes = [
		creases[0].uncommonNodeWithEdge(creases[1]),
		creases[1].uncommonNodeWithEdge(creases[0])
	];
	this.draw();
	this.updateAngles();
}
sectorBisect.reset();

sectorBisect.onFrame = function(event) { }
sectorBisect.onResize = function(event) { }
sectorBisect.onMouseDown = function(event){
	var nearest = this.cp.nearest(event.point);
	if(this.validNodes.filter(function(e){return e===nearest.node;},this).length > 0){
		this.draggingNode = nearest.node;
	}
}
sectorBisect.onMouseUp = function(event){
	this.draggingNode = undefined;
}
sectorBisect.onMouseMove = function(event){
	if(this.draggingNode !== undefined){
		this.draggingNode.x = event.point.x;
		this.draggingNode.y = event.point.y;
	}
	this.update();
	this.updateAngles();
}
sectorBisect.onMouseDidBeginDrag = function(event){ }
