var folded = new OrigamiFold("canvas-2");
var origami = new OrigamiPaper("canvas-1");
folded.style = { face:{ fillColor:{ gray:0.0, alpha:0.2 } } };
folded.show.edges = true;
folded.show.marks = true;
folded.mouseZoom = true;
folded.rotate3D = true;
folded.pitch = folded.roll = folded.yaw = 120;

function updateFoldedState(cp){
	folded.cp = cp.copy();
	var topFace = folded.cp.nearest(0.5, 0.5).face;
	folded.draw( topFace );
}

origami.reset = function(){
	this.cp = new CreasePattern();
	this.cp.crease(0, 0.5, 0.5, 0.5).valley(90);
	this.cp.crease(1, 0.5, 0.5, 0.5).valley(90);
	this.cp.crease(0.5, 0, 0.5, 0.5).valley(90);
	this.cp.crease(0.5, 1, 0.5, 0.5).mountain();
	this.cp.crease(1, 1, 0.5, 0.5).valley();
	//face identification creases
	this.cp.crease(0, 0, 0.5, 0.5);
	this.cp.crease(0.75, 0, 0.75, 0.75);
	this.cp.clean();
	this.draw();
	updateFoldedState(this.cp);
}
origami.reset();
