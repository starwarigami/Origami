var symmetry = new OrigamiPaper("canvas-axiom-1").setPadding(0.05);
symmetry.circleStyle = {radius: 0.02, strokeWidth: 0.01, strokeColor:symmetry.styles.byrne.blue};
symmetry.style.valley.strokeColor = symmetry.styles.byrne.red;

symmetry.redraw = function(){
	this.cp.clear();
	this.cp.octagonalSymmetry();
	var crease = this.cp.creaseEdge(this.touchPoints[0].position, this.touchPoints[1].position);
	if(crease){ crease.valley(); }
	this.draw();
}
symmetry.reset = function(){
	[[0.25, 0.25],[0.25, 0.5]].forEach(function(point){ this.makeTouchPoint(point, this.circleStyle); },this);
	this.redraw();
}
symmetry.reset();

symmetry.onFrame = function(event){ }
symmetry.onResize = function(event){ }
symmetry.onMouseMove = function(event){
	if(this.mouse.isPressed){ this.redraw(); }
}
symmetry.onMouseDown = function(event){ }
symmetry.onMouseUp = function(event){ }
