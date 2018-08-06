var folded = new OrigamiFold("canvas-2");
var origami = new OrigamiPaper("canvas-1");
folded.style = { face:{ fillColor:{ gray:0.0, alpha:0.2 } } };
folded.show.edges = true;
folded.show.marks = true;
folded.mouseZoom = false;
folded.rotate3D = true;

function onChangeSelection()
{
	origami.reset();
}

function updateFoldedState(cp, topFace){
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
	var combo = document.menu.selectionCombo;
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
			for (var i = 0; i < 4; ++i)
			{
				var m = new Matrix().rotation(Math.PI*i/2, new XY(0.5,0.5));
				this.cp.crease(new XY(0, 0.2).transform(m), new XY(0.2, 0.2).transform(m)).valley();
				this.cp.crease(new XY(0.2, 0.2).transform(m), new XY(0.3, 0.2).transform(m)).mountain(90);
				this.cp.crease(new XY(0.3, 0.2).transform(m), new XY(0.4, 0.2).transform(m)).valley(90);
				this.cp.crease(new XY(0.4, 0.2).transform(m), new XY(0.6, 0.2).transform(m)).valley(45);
				this.cp.crease(new XY(0, 0.4).transform(m), new XY(0.2, 0.4).transform(m)).valley(45);
				this.cp.crease(new XY(0.2, 0.4).transform(m), new XY(0.4, 0.4).transform(m)).valley(90);
				this.cp.crease(new XY(0.4, 0.4).transform(m), new XY(0.6, 0.4).transform(m)).valley(45);
				this.cp.crease(new XY(0.2, 0).transform(m), new XY(0.2, 0.2).transform(m)).valley();
				this.cp.crease(new XY(0.2, 0.2).transform(m), new XY(0.2, 0.4).transform(m)).valley(90);
				this.cp.crease(new XY(0.3, 0).transform(m), new XY(0.3, 0.3).transform(m)).mountain();
				this.cp.crease(new XY(0.4, 0).transform(m), new XY(0.4, 0.2).transform(m)).valley(45);
				this.cp.crease(new XY(0.4, 0.2).transform(m), new XY(0.4, 0.4).transform(m)).valley(90);
				this.cp.crease(new XY(0, 0).transform(m), new XY(0.2, 0.2).transform(m)).mountain();
				this.cp.crease(new XY(0.2, 0.2).transform(m), new XY(0.3, 0.3).transform(m)).valley();
				this.cp.crease(new XY(0.3, 0.3).transform(m), new XY(0.4, 0.4).transform(m)).mountain(90);
				this.cp.crease(new XY(0.2, 0.4).transform(m), new XY(0.4, 0.2).transform(m)).mountain(90);
			}
			break;
	}
	this.cp.clean();
	this.draw();
	updateFoldedState(this.cp);
}
origami.reset();
