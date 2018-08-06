var folded = new OrigamiFold("canvas-2");
var origami = new OrigamiPaper("canvas-1");
folded.style = { face:{ fillColor:{ gray:0.0, alpha:0.2 } } };
folded.mouseZoom = false;
folded.rotate3D = true;

function onChangeTest() {	origami.reset(); }
function onChangeWireFrame() {	updateFoldedState(origami.cp); }
function onChangeMarks() {	updateFoldedState(origami.cp); }

function updateFoldedState(cp, topFace){
	var combo = document.menu.wireframeCombo;
	folded.show.edges = combo.options[combo.selectedIndex].value == "ON";
	combo = document.menu.marksCombo;
	folded.show.marks = combo.options[combo.selectedIndex].value == "ON";
	folded.zoom = 1;
	folded.pitch = folded.roll = folded.yaw = 120;
	folded.cp = cp.copy();
	folded.draw( topFace );
}

origami.onMouseUp = function(event)
{
	updateFoldedState(this.cp, this.cp.nearest(event.point).face);
}

origami.reset = function(){
	var combo = document.menu.testCombo;
	var selection = combo.options[combo.selectedIndex].value;

	this.cp = new CreasePattern();
	switch (selection)
	{
		case 'T1':
			this.cp.crease(0, 0.5, 0.5, 0.5).valley(90);
			this.cp.crease(1, 0.5, 0.5, 0.5).valley(90);
			this.cp.crease(0.5, 0, 0.5, 0.5).valley(90);
			this.cp.crease(0.5, 1, 0.5, 0.5).mountain();
			this.cp.crease(1, 1, 0.5, 0.5).valley();
			//face identification creases
			this.cp.crease(0, 0, 0.5, 0.5);
			this.cp.crease(0.75, 0, 0.75, 0.75);
			break;
		case 'T2':
			this.cp.crease(0.1, 0, 0.1, 1).valley(150);
			this.cp.crease(0.2, 0, 0.2, 1).mountain(135);
			this.cp.crease(0.3, 0, 0.3, 1).valley(120);
			this.cp.crease(0.4, 0, 0.4, 1).mountain(105);
			this.cp.crease(0.5, 0, 0.5, 1).valley(90);
			this.cp.crease(0.6, 0, 0.6, 1).mountain(75);
			this.cp.crease(0.7, 0, 0.7, 1).valley(60);
			this.cp.crease(0.8, 0, 0.8, 1).mountain(45);
			this.cp.crease(0.9, 0, 0.9, 1).valley(30);
			break;
		case 'T3':
			var creases = [];
			creases.push(this.cp.crease(0, 0.2, 0.2, 0.2).valley());
			creases.push(this.cp.crease(0.2, 0.2, 0.3, 0.2).mountain(90));
			creases.push(this.cp.crease(0.3, 0.2, 0.4, 0.2).valley(90));
			creases.push(this.cp.crease(0.4, 0.2, 0.6, 0.2).valley(45));
			creases.push(this.cp.crease(0, 0.4, 0.2, 0.4).valley(45));
			creases.push(this.cp.crease(0.2, 0.4, 0.4, 0.4).valley(90));
			creases.push(this.cp.crease(0.4, 0.4, 0.6, 0.4).valley(45));
			creases.push(this.cp.crease(0.2, 0, 0.2, 0.2).valley());
			creases.push(this.cp.crease(0.2, 0.2, 0.2, 0.4).valley(90));
			creases.push(this.cp.crease(0.3, 0, 0.3, 0.3).mountain());
			creases.push(this.cp.crease(0.4, 0, 0.4, 0.2).valley(45));
			creases.push(this.cp.crease(0.4, 0.2, 0.4, 0.4).valley(90));
			creases.push(this.cp.crease(0, 0, 0.2, 0.2).mountain());
			creases.push(this.cp.crease(0.2, 0.2, 0.3, 0.3).valley());
			creases.push(this.cp.crease(0.3, 0.3, 0.4, 0.4).mountain(90));
			creases.push(this.cp.crease(0.2, 0.4, 0.4, 0.2).mountain(90));
			this.cp.replicate(creases, new Matrix().rotation(Math.PI/2, new XY(0.5,0.5)), 3);
			break;
		case "T4":
			var centrePoint = new XY(0.5,0.5);
			var verticalSymmetryLine = new Line(centrePoint,XY.J);
			var horizontalSymmetryLine = new Line(centrePoint,XY.I);
			//this.cp.pleatGrid(32,32);
			//vertical creases
			//this.cp.crease(1/32,0,1/32,15/32);
			this.cp.crease(1/32,15/32,1/32,0.5).mountain();
			//this.cp.crease(3/32,0,3/32,15/32);
			this.cp.crease(3/32,15/32,3/32,0.5).mountain();
			this.cp.crease(1/8,0,1/8,0.25).valley();
			this.cp.crease(1/8,0.25,1/8,9/32).mountain();
			this.cp.crease(1/8,9/32,1/8,11/32).valley();
			this.cp.crease(1/8,11/32,1/8,3/8).mountain();
			this.cp.crease(1/8,3/8,1/8,7/16).valley();
			this.cp.crease(1/8,7/16,1/8,0.5).mountain();
			this.cp.crease(5/32,0,5/32,1/32).valley();
			this.cp.crease(5/32,1/32,5/32,0.25).mountain();
			this.cp.crease(5/32,0.25,5/32,9/32).valley();
			this.cp.crease(5/32,9/32,5/32,5/16).mountain();
			this.cp.crease(5/32,5/16,5/32,3/8);
			this.cp.crease(5/32,3/8,5/32,7/16).mountain();
			this.cp.crease(5/32,7/16,5/32,15/32).valley();
			this.cp.crease(5/32,15/32,5/32,0.5).mountain();
			this.cp.crease(3/16,0,3/16,1/32).mountain();
			this.cp.crease(3/16,1/32,3/16,7/16);
			this.cp.crease(3/16,7/16,3/16,0.5).valley();
			this.cp.crease(0.25,0,0.25,3/32);
			this.cp.crease(0.25,3/32,0.25,0.25).valley();
			this.cp.crease(0.25,0.25,0.25,9/32).mountain();
			this.cp.crease(0.25,9/32,0.25,5/16).valley();
			this.cp.crease(0.25,5/16,0.25,11/32).mountain();
			this.cp.crease(0.25,11/32,0.25,3/8).valley();
			this.cp.crease(0.25,3/18,0.25,0.5).mountain();
			this.cp.crease(9/32,0,9/32,13/32);
			this.cp.crease(9/32,13/32,9/32,0.5).valley();
			this.cp.crease(5/16,0,5/16,7/16);
			this.cp.crease(5/16,7/16,5/16,0.5).mountain();
			this.cp.crease(11/32,0,11/32,15/32);
			this.cp.crease(11/32,15/32,11/32,0.5).valley();
			this.cp.crease(3/8,0,3/8,3/32).valley(90);
			this.cp.crease(3/8,3/32,3/8,0.25).mountain(90);
			this.cp.crease(3/8,0.25,3/8,9/32).valley(90);
			this.cp.crease(3/8,9/32,3/8,11/32).mountain(90);
			this.cp.crease(3/8,11/32,3/8,13/32).valley(90);
			this.cp.crease(3/8,13/32,3/8,15/32).mountain(90);
			this.cp.crease(3/8,15/32,3/8,0.5).valley(90);
			this.cp.crease(7/16,0,7/16,3/32).valley(90);
			this.cp.crease(7/16,3/32,7/16,0.25).mountain(90);
			this.cp.crease(7/16,0.25,7/16,9/32).valley(90);
			this.cp.crease(7/16,9/32,7/16,11/32).mountain(90);
			this.cp.crease(7/16,11/32,7/16,13/32).valley(90);
			this.cp.crease(7/16,13/32,7/16,15/32).mountain(90);
			this.cp.crease(7/16,15/32,7/16,0.5).valley(90);
			this.cp.crease(15/32,0,15/32,3/32).mountain(90);
			this.cp.crease(15/32,3/32,15/32,0.25).valley(90);
			this.cp.crease(15/32,0.25,15/32,9/32).mountain(90);
			this.cp.crease(15/32,9/32,15/32,5/16).valley(90);
			this.cp.crease(15/32,5/16,15/32,11/32).mountain(90);
			this.cp.crease(15/32,11/32,15/32,13/32).valley(90);
			this.cp.crease(15/32,13/32,15/32,7/16).mountain(90);
			this.cp.crease(15/32,7/16,15/32,0.5).valley(90);
			this.cp.crease(0.5,0,0.5,0.5);
			//horizontal creases
			this.cp.crease(0,1/32,3/16,1/32).valley();
			this.cp.crease(3/16,1/32,0.5,1/32);
			this.cp.crease(0,1/16,0.5,1/16);
			this.cp.crease(0,3/32,0.25,3/32);
			this.cp.crease(0.25,3/32,0.5,3/32).valley();
			this.cp.crease(0,1/8,0.5,1/8);
			this.cp.crease(0,0.25,0.5,0.25).mountain();
			this.cp.crease(0,9/32,0.5,9/32).valley();
			this.cp.crease(0,5/16,5/32,5/16);
			this.cp.crease(5/32,5/16,6/16,5/16).mountain();
			this.cp.crease(6/16,5/16,7/16,5/16).mountain(90);
			this.cp.crease(7/16,5/16,0.5,5/16).mountain();
			this.cp.crease(0,11/32,0.5,11/32).valley();
			this.cp.crease(0,3/8,5/32,3/8).mountain();
			this.cp.crease(5/32,3/8,3/8,3/8);
			this.cp.crease(3/8,3/8,7/16,3/8).mountain();
			this.cp.crease(7/16,3/8,0.5,3/8);
			this.cp.crease(0,13/32,9/32,13/32);
			this.cp.crease(9/32,13/32,0.5,13/32).valley();
			this.cp.crease(0,7/16,3/16,7/16).valley();
			this.cp.crease(3/16,7/16,5/16,7/16);
			this.cp.crease(5/16,7/16,6/16,7/16).mountain();
			this.cp.crease(6/16,7/16,7/16,7/16).mountain(90);
			this.cp.crease(7/16,7/16,0.5,7/16).mountain();
			this.cp.crease(0,15/32,1/32,15/32);
			this.cp.crease(1/32,15/32,3/32,15/32).valley();
			this.cp.crease(3/32,15/32,11/32,15/32);
			this.cp.crease(11/32,15/32,15/32,15/32).valley();
			this.cp.crease(15/32,15/32,0.5,15/32).valley(90);
			this.cp.crease(0,0.5,3/8,0.5);
			this.cp.crease(3/8,0.5,7/16,0.5).mountain();
			this.cp.crease(7/16,0.5,0.5,0.5);
			//diagonal creases
			this.cp.crease(0,7/16,1/16,0.5).valley();
			this.cp.crease(1/16,0.5,1/8,7/16).valley();
			this.cp.crease(1/8,1/32,5/32,0).mountain();
			this.cp.crease(1/8,1/32,5/32,1/16).valley();
			this.cp.crease(1/8,11/32,5/32,5/16).mountain();
			this.cp.crease(1/8,11/32,5/32,3/8).valley();
			this.cp.crease(1/8,7/16,5/32,15/32).mountain();
			this.cp.crease(5/32,0,0.25,3/32).valley();
			this.cp.crease(5/32,1/16,7/32,0).mountain();
			this.cp.crease(5/32,5/16,3/16,11/32).valley();
			this.cp.crease(5/32,6/16,3/16,11/32).mountain();
			this.cp.crease(5/32,15/32,3/16,7/16).mountain();
			this.cp.crease(3/16,7/16,4/16,6/16).valley();
			this.cp.crease(0.25,3/32,11/32,0).mountain();
			this.cp.crease(0.25,3/8,9/32,13/32).valley();
			this.cp.crease(9/32,13/32,5/16,7/16).mountain();
			this.cp.crease(5/16,7/16,11/32,15/32).valley();
			this.cp.crease(11/32,11/32,6/16,5/16).valley();
			this.cp.crease(11/32,11/32,6/16,3/8).mountain();
			this.cp.crease(11/32,13/32,6/16,3/8).mountain();
			this.cp.crease(11/32,13/32,6/16,7/16).valley();
			this.cp.crease(11/32,15/32,6/16,0.5).mountain();
			this.cp.crease(7/16,5/16,15/32,11/32).valley();
			this.cp.crease(7/16,3/8,15/32,11/32).mountain();
			this.cp.crease(7/16,3/8,15/32,13/32).mountain();
			this.cp.crease(7/16,7/16,15/32,13/32).valley();
			this.cp.crease(7/16,0.5,15/32,15/32).mountain();
			//duplicate the creases around the symmetry lines
			var creases = this.cp.getCreasesWithinBox(0,0,0.5,0.5);
			this.cp.replicate(creases, new Matrix().reflection(horizontalSymmetryLine));
			this.cp.replicate(creases, new Matrix().reflection(verticalSymmetryLine));
			creases = creases.concat(this.cp.getCollinearCreases(verticalSymmetryLine));
			creases = creases.concat(this.cp.getCollinearCreases(horizontalSymmetryLine));
			this.cp.replicate(creases, new Matrix().rotation(Math.PI, new XY(centrePoint)))
			this.cp.getCrease(1/16,0.5,0,9/16).mountain();
			this.cp.getCrease(15/16,0.5,1,9/16).mountain();
			break;
	}
	this.cp.clean();
	this.draw();
	updateFoldedState(this.cp);
}
origami.reset();
