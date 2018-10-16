var mouseMoveCallback = undefined;

var foldedProject = new OrigamiFold("canvas-folded").setPadding(0.1);
var project = new OrigamiPaper("canvas").setPadding(0.1);

var MouseMode = {
	"removeCrease":1,
	"flipCrease":2,
	"addSectorBisector":3,
	"addBetweenPoints":4,
	"addPointToPoint":5,
	"addEdgeToEdge":6,
	"addPleatBetweenEdges":7,
	"addRabbitEar":8,
	"addKawasakiCollapse":9,
	"addPerpendicular":10,
	"inspectKawasaki":11
}; Object.freeze(MouseMode);

function parseParams(input)
{
	var paramString = document.getElementById(input).value;
	if (paramString === undefined || paramString.length == 0) return [];
	return paramString.replace(/\[/g, '').replace(/\]/g, '').split(',')
		.map(function(str){ return Number(str.trim()); });
}

function setParams(input, params)
{
	if (params != undefined && params.length)
	{
		var paramString = cleanNumber(params[0], 8);
		for (var i = 1; i < params.length; ++i)
		{
			paramString += ',' + cleanNumber(params[i], 8);
		}
		document.getElementById(input).value = paramString;
	}
	else
	{
		delete document.getElementById(input).value;
	}
}

project.setEditorStyle = function(){
	this.style = this.defaultStyleTemplate();
	this.show.nodes = true;
	this.show.faces = true;
	this.show.sectors = true;
	this.show.gridLines = this.show.gridPoints = this.cp.grid != undefined;
	this.show.symmetry = this.cp.symmetry != undefined;
	this.style.mountain.dashArray = [0.03, 0.02, 0.005, 0.02];
	this.style.face.scale = 0.999;
	this.style.face.fillColor = Object.assign({alpha:0.0}, this.styles.byrne.red);
	this.style.sector.fillColors = [
		Object.assign({alpha:0.0}, this.styles.byrne.blue),
		Object.assign({alpha:0.0}, this.styles.byrne.blue) ];
	this.style.boundary.strokeColor = {gray:0.0, alpha:0.0};
	this.style.node.fillColor = Object.assign({alpha:0.0}, this.styles.byrne.red);
	this.style.node.radius = 0.015;
	this.style.sector.scale = 0.5;
	//this.thinLines();
}
project.setEditorStyle();

project.setByrneColors = function(){
	this.style.backgroundColor = { gray:1.0, alpha:1.0 };
	this.style.boundary.strokeColor = {gray:0.0};
	this.style.mountain.strokeColor = this.styles.byrne.red;
	this.style.valley.strokeColor = { hue:220, saturation:0.6, brightness:0.666 };
	this.style.border.strokeColor = { gray:0.0, alpha:1.0 };
	this.style.mark.strokeColor = { gray:0.0, alpha:1.0 };
	this.style.mountain.dashArray = null;
	this.style.valley.dashArray = [0.015, 0.02];
	this.style.border.dashArray = null;
	this.style.mark.dashArray = null;
	this.updateStyles();
}

project.ghostMarksLayer = new project.scope.Layer();
project.ghostMarksLayer.moveBelow(project.edgeLayer);
project.boundaryLayer.moveBelow(project.edgeLayer);
//
project.mouseMode = MouseMode.addBetweenPoints;
// project.stage = new CreasePattern();
project.reference = {};
project.selected = {};
project.nearest = {};
 // default values are hiding in the DOM, HTML code
project.modifiers = {
	pleatCount:8,
	betweenPoints:"full",
	perpendicular:"full"
}
project.select = {
	line:"crease",
	point:"endpoint"
}

project.updateCreasePattern = function(){
	this.cp.clean();
	this.draw();
	foldedProject.cp = this.cp.copy();
	foldedProject.draw();
}

project.nextCrease = undefined;
project.drawNextCrease = function(crease){
	if (this.nextCrease != undefined)
	{
		this.ghostMarksLayer.activate();

		var nodes = this.nextCrease.nodes.map(function(el){ return [el.x, el.y]; });
		var p = new this.scope.Path(Object.assign({segments: nodes, closed: false }, project.style.mark));
		p.strokeColor = this.styles.byrne.yellow
		p.strokeWidth = 0.0025;
	}
}

project.reset = function(full){
	this.cp.clear(full);
	this.reference = {};
	this.selected = {};
	this.nearest = {};
	this.nextCrease = undefined;
	this.updateCreasePattern();
	foldedProject.reset();
}
project.reset();

project.setMouseMode = function(newMode){
	// is this a good decision? reset selected creases between mode switching?
	this.reference = {};
	this.selected = {};
	this.nextCrease = undefined;
	this.mouseMode = newMode;
	this.updateCreasePattern();
}

project.onMouseDown = function(event){
	switch(this.mouseMode){
		case MouseMode.addSectorBisector:
			var nearest = this.cp.nearest(event.point);
			if(nearest.sector !== undefined){
				var cs = nearest.sector.bisect().creaseAndRepeat();
				cs.forEach(function(c){c.mountain()},this);
			}
		break;
		case MouseMode.addBetweenPoints:
			if (this.nearest.point != undefined){
				if(this.selected.point != undefined){
					switch(this.modifiers.betweenPoints){
						case "full": this.nextCrease.crease().mountain(); break;
						case "segment": this.cp.crease(this.selected.point, this.nearest.point).mountain(); break;
					}
					this.cp.clean();
					this.setMouseMode(MouseMode.addBetweenPoints);
				}
				else {
					this.selected = this.nearest;
				}
			}
		break;
		case MouseMode.addPointToPoint:
			if (this.nearest.point != undefined){
				if(this.selected.point != undefined){
					if(this.nextCrease){ this.nextCrease.crease().mountain(); }
					this.cp.clean();
					this.setMouseMode(MouseMode.addPointToPoint);
				}
				else{
					this.selected = this.nearest;
				}
			}
		break;
		case MouseMode.addEdgeToEdge:
			if (this.nearest.line != undefined){
				if(this.selected.line != undefined){
					if(this.nextCrease !== undefined){ this.nextCrease.crease().mountain(); }
					this.cp.clean();
					this.setMouseMode(MouseMode.addEdgeToEdge);
				}
				else{
					this.selected = this.nearest;
					this.reference = {};
				}
			}
			else{
				switch (this.select.line){
					case "perpendicular":
					case "parallel":
						menus2[5].style.display = "block";
					case "through":
						this.reference = this.nearest;
						break;
				}
			}
		break;
		case MouseMode.addPerpendicular:
			if(this.selected.point != undefined){
				if (this.nearest.line != undefined){
					switch(this.modifiers.perpendicular){
						case "full": this.nextCrease.crease().mountain(); break;
						case "segment":
							var l1 = this.nextCrease.infiniteLine();
							var l2 = this.nearest.line.infiniteLine();
							this.cp.crease(this.selected.point, l1.intersection(l2)).mountain();
						break;
					}
					this.cp.clean();
					this.setMouseMode(MouseMode.addPerpendicular);
				}
				else{
					switch (this.select.line){
						case "perpendicular":
						case "parallel":
							menus2[5].style.display = "block";
						case "through":
							this.reference = this.nearest;
							break;
					}
				}
			}
			else if (this.nearest.point){
				this.selected = this.nearest;
				menus2[5].style.display = "none";
				menus2[4].style.display = "block";
			}
			break;
		case MouseMode.addPleatBetweenEdges:
			if (this.nearest.line != undefined){
				if(this.selected.line != undefined){
					if(this.modifiers.pleatCount != undefined){
						this.cp.pleat(this.modifiers.pleatCount, this.selected.line, this.nearest.line)
							.filter(function(crease){ return crease != undefined; },this)
							.forEach(function(crease){ crease.mountain(); },this);
						this.cp.clean();
						this.updateCreasePattern();
						this.setMouseMode(MouseMode.addPleatBetweenEdges);
					}
				}
				else{
					this.selected = this.nearest;
					this.reference = {};
				}
			}
			else{
				switch (this.select.line){
					case "perpendicular":
					case "parallel":
						menus2[5].style.display = "block";
					case "through":
						this.reference = this.nearest;
						break;
				}
			}
		break;
		case MouseMode.addRabbitEar:
			if(this.nearest.face){
				this.nearest.face.rabbitEar()
					.filter(function(crease){ return crease != undefined; },this)
					.forEach(function(crease){ crease.mountain(); },this);
			}
		break;
		case MouseMode.addKawasakiCollapse:
			if(this.nearest.face){
				var ray = this.nearest.sector.kawasakiCollapse();
				if(ray){
					ray.creaseAndRepeat()
						.filter(function(crease){ return crease != undefined; },this)
						.forEach(function(crease){ crease.mountain(); },this);
				}
			}
		break;
		case MouseMode.removeCrease:
			var nearest = this.cp.nearest(event.point);
			if(nearest.edge !== undefined){
				switch(nearest.edge.orientation){
					case CreaseDirection.mark: this.cp.removeEdge(nearest.edge); break;
					case CreaseDirection.mountain:
					case CreaseDirection.valley: nearest.edge.mark(); break;
				}
			}
		break;
		case MouseMode.flipCrease:
			var nearest = this.cp.nearest(event.point);
			if(nearest.edge !== undefined){
				switch(nearest.edge.orientation){
					case CreaseDirection.mountain: nearest.edge.orientation = CreaseDirection.valley; break;
					case CreaseDirection.valley:   nearest.edge.orientation = CreaseDirection.mountain; break;
					case CreaseDirection.mark:     nearest.edge.orientation = CreaseDirection.mountain; break;
				}
			}
		break;
	}
	this.updateCreasePattern();
}
project.onMouseMove = function(event){
	var mousePoint = new XY(event.point);
	// what changed from frame to frame. only update complex calculations if necessary
	var didChange = this.updateNearestToMouse(mousePoint);

	this.updateStyles();
	this.ghostMarksLayer.removeChildren();

	switch(this.mouseMode){
		case MouseMode.addBetweenPoints:
			if(this.selected.point != undefined){ this.highlightPoint(this.selected); }
			if(this.nearest.point != undefined){ this.highlightPoint(this.nearest); }
			if(didChange.point){
				if(this.selected.point && this.nearest.point){ this.nextCrease = this.cp.axiom1(this.selected.point, this.nearest.point); }
				else{ this.nextCrease = undefined; }
			}
		break;
		case MouseMode.addPointToPoint:
			if(this.selected.point != undefined){ this.highlightPoint(this.selected); }
			if(this.nearest.point != undefined){ this.highlightPoint(this.nearest); }
			if(didChange.point){
				if(this.selected.point && this.nearest.point){ this.nextCrease = this.cp.axiom2(this.selected.point, this.nearest.point); }
				else{ this.nextCrease = undefined; }
			}
		break;
		case MouseMode.addEdgeToEdge:
			if(this.selected.line != undefined){ this.highlightLine(this.selected); }
			if(this.nearest.line != undefined){ this.highlightLine(this.nearest); }
			switch (this.select.line){
				case "perpendicular":
				case "parallel":
					if (this.reference.edge != undefined){
						this.highlightEdge(this.reference, this.styles.lang.green);
						if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
					}
					else if (this.nearest.edge != undefined){ this.highlightEdge(this.nearest, this.styles.lang.green); }
					break;
				case "through":
					if (this.reference.point != undefined){ this.highlightPoint(this.reference, this.styles.lang.green); }
					if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
					break;
			}
			if(didChange.line){
				if(this.selected.line && this.nearest.line){
					var creases = this.cp.axiom3(this.selected.line, this.nearest.line);
					this.nextCrease = creases[0];
					if (creases.length > 1){
						if (creases[1].nearestPoint(mousePoint).distanceTo(mousePoint) < creases[0].nearestPoint(mousePoint).distanceTo(mousePoint)){
							this.nextCrease = creases[1];
						}
					}
				}
				else{ this.nextCrease = undefined; }
			}
		break;
		case MouseMode.addPerpendicular:
			if(this.selected.point != undefined){
				this.highlightPoint(this.selected);
				if(this.nearest.line != undefined){ this.highlightLine(this.nearest); }
				switch (this.select.line){
					case "perpendicular":
					case "parallel":
						if (this.reference.edge != undefined){
							this.highlightEdge(this.reference, this.styles.lang.green);
							if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
						}
						else if (this.nearest.edge != undefined){ this.highlightEdge(this.nearest, this.styles.lang.green); }
						break;
					case "through":
						if (this.reference.point != undefined){ this.highlightPoint(this.reference, this.styles.lang.green); }
						if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
						break;
				}
				if(didChange.line){
					if(this.selected.point && this.nearest.line){ this.nextCrease = this.cp.axiom4(this.nearest.line, this.selected.point); }
					else{ this.nextCrease = undefined; }
				}
			}
			else{
				if(this.nearest.point != undefined){ this.highlightPoint(this.nearest); }
			}
		break;
		case MouseMode.addSectorBisector:
			if(this.nearest.node != undefined){ this.highlightNode(this.nearest); }
			if(this.nearest.edge != undefined){ this.highlightEdge(this.nearest); }
			if(this.nearest.face != undefined){ this.faces[this.nearest.face.index].fillColor.alpha = 1.0}
			if(this.nearest.sector != undefined){ this.sectors[this.nearest.sector.index].fillColor.alpha = 1.0; }
			if(mouseMoveCallback != undefined){ mouseMoveCallback(event.point); }
		break;
		case MouseMode.addPleatBetweenEdges:
			if(this.selected.line != undefined){ this.highlightLine(this.selected); }
			if(this.nearest.line != undefined){ this.highlightLine(this.nearest); }
			switch (this.select.line){
				case "perpendicular":
				case "parallel":
					if (this.reference.edge != undefined){
						this.highlightEdge(this.reference, this.styles.lang.green);
						if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
					}
					else if (this.nearest.edge != undefined){ this.highlightEdge(this.nearest, this.styles.lang.green); }
					break;
				case "through":
					if (this.reference.point != undefined){ this.highlightPoint(this.reference, this.styles.lang.green); }
					if (this.nearest.point != undefined){ this.highlightPoint(this.nearest, this.styles.lang.green); }
					break;
			}
			if(didChange.line){
				if (this.selected.line != undefined && this.nearest.line != undefined){
					// var edges = this.cp.
				}
			}
			break;
		case MouseMode.addRabbitEar:
			if(this.nearest.point != undefined){ this.highlightNode(this.nearest); }
			if(this.nearest.edge != undefined){ this.highlightEdge(this.nearest); }
			if(this.nearest.face != undefined){ this.faces[this.nearest.face.index].fillColor.alpha = 1.0}
			if(this.nearest.sector != undefined){ this.sectors[this.nearest.sector.index].fillColor.alpha = 1.0; }
			if(mouseMoveCallback != undefined){ mouseMoveCallback(event.point); }
			break;
		case MouseMode.addKawasakiCollapse:
			if(this.nearest.node != undefined){ this.nodes[this.nearest.node.index].fillColor.alpha = 1.0; }
			if(this.nearest.sector != undefined){ this.sectors[this.nearest.sector.index].fillColor.alpha = 1.0; }
			if(mouseMoveCallback != undefined){ mouseMoveCallback(event.point); }
			break;
		case MouseMode.removeCrease:
			if(this.nearest.edge != undefined){ this.highlightEdge(this.nearest); }
			break;
		case MouseMode.flipCrease:
			if(this.nearest.edge !== undefined){ this.highlightEdge(this.nearest, this.styleForCrease(this.nearest.edge.orientation)); }
			break;
	}

	this.drawNextCrease();
}

project.updateNearestToMouse = function(point){
	var nearestDidUpdate = {point:false, line:false, node:false, edge:false, face:false, sector:false, junction:false, gridPoint:false, gridLine:false};
	var nearest = this.cp.nearest(point);

	switch(this.select.point){
		case "endpoint": nearest.point = nearest.node; break;
		case "grid": if (this.show.gridPoints && nearest.gridPoint){ nearest.point = nearest.gridPoint; } break;
		case "midpoint": if (nearest.edge){ nearest.point = nearest.edge.midpoint(); } break;
		case "on": if (nearest.edge){ nearest.point = nearest.edge.nearestPointNormalTo(point); } break;
		case "none": nearest.point = point; break;
	}

	if (nearest.point == undefined){ nearestDidUpdate.point = this.nearest.point != undefined; }
	else if (this.nearest.point == undefined){ nearestDidUpdate.point = nearest.point != undefined; }
	else if(!nearest.point.equivalent(this.nearest.point)){ nearestDidUpdate.point = true; }

	switch(this.select.line){
		case "crease": nearest.line = nearest.edge; break;
		case "grid": nearest.line = nearest.gridLine; break;
		case "perpendicular": if (this.reference.edge != undefined){ nearest.line = this.cp.boundary.clipLine(new Line(nearest.point, this.reference.edge.vector().rotate90())); } break;
		case "parallel": if (this.reference.edge != undefined){ nearest.line = this.cp.boundary.clipLine(new Line(nearest.point, this.reference.edge.vector())); } break;
		case "through": if (this.reference.point != undefined){ nearest.line = new Edge(this.reference.point, nearest.point); } break;
	}
	if (nearest.line == undefined){ nearestDidUpdate.line = this.nearest.line != undefined; }
	else if (this.nearest.line == undefined){ nearestDidUpdate.line = nearest.line != undefined; }
	else if(!nearest.line.equivalent(this.nearest.line)){ nearestDidUpdate.line = true; }

	if(nearest.node !== this.nearest.node){ nearestDidUpdate.node = true; }
	if(nearest.edge !== this.nearest.edge){ nearestDidUpdate.edge = true; }
	if(nearest.face !== this.nearest.face){ nearestDidUpdate.face = true; }
	if(nearest.sector !== this.nearest.sector){ nearestDidUpdate.sector = true; }
	if(nearest.junction !== this.nearest.junction){ nearestDidUpdate.junction = true; }
	if(nearest.gridPoint !== this.nearest.gridPoint){ nearestDidUpdate.gridPoint = true; }
	if(nearest.gridLine !== this.nearest.gridLine){ nearestDidUpdate.gridLine = true; }
	this.nearest = nearest;
	return nearestDidUpdate;
}

project.highlightPoint = function(obj, color){
	if(obj.point != undefined){
		if (obj.point === obj.node){ this.highlightNode(obj, color); }
		else if (obj.point === obj.gridPoint){
			var p = this.gridPoints[obj.gridPoint.index];
			p.fillColor = color !== undefined ? color : this.styles.byrne.yellow;
			p.radius = this.style.node.radius;
		}
		else{
			this.ghostMarksLayer.activate();

			var circle = new this.scope.Shape.Circle(Object.assign({ center: [obj.point.x, obj.point.y] }, this.style.node));
			circle.fillColor = color !== undefined ? color : this.styles.byrne.yellow
		}
	}
}

project.highlightNode = function(obj, color){
	var n = this.nodes[obj.node.index];
	n.fillColor = color !== undefined ? color : this.styles.byrne.yellow;
}

project.highlightLine = function(obj, color){
	if(obj.line != undefined){
		if (obj.line === obj.edge){ this.highlightEdge(obj, color); }
		else if (obj.line === obj.gridLine){
			var l = this.gridLines[obj.gridLine.index];
			l.strokeColor = color !== undefined ? color : this.styles.byrne.yellow;
			l.strokeWidth = this.style.mountain.strokeWidth*1.3333;
		}
		else{
				this.ghostMarksLayer.activate();

				var nodes = obj.line.nodes.map(function(el){ return [el.x, el.y]; });
				var path = new this.scope.Path(Object.assign({segments: nodes, closed: false }, this.style.mark));
				path.strokeColor = color !== undefined ? color : this.styles.byrne.yellow;
				path.strokeWidth = this.style.mountain.strokeWidth*1.3333;
		}
	}
}

project.highlightEdge = function(obj, color){
	var e = this.edges[obj.edge.index];
	e.strokeColor = color !== undefined ? color : this.styles.byrne.yellow;
	e.strokeWidth = this.style.mountain.strokeWidth*1.3333;
}

// modal stuff
$("#modal-fold-window").draggable({ handle: ".modal-header" });
$("#modal-crease-window").draggable({ handle: ".modal-header" });
$("#modal-new-cp-window").draggable({ handle: ".modal-header" });
$("#modal-properties-window").draggable({ handle: ".modal-header" });

// IMPORT / EXPORT (called in import-export.js)
creasePatternDidUpload = function(cp){
	project.cp = cp;
	project.setEditorStyle();
	project.updateCreasePattern();
}

var menus1 = [
	document.getElementById("add-crease-sub-menu")
];
var menus2 = [
	document.getElementById("modifier-bisect"),
	document.getElementById("modifier-between-points"),
	document.getElementById("modifier-pleat"),
	document.getElementById("modifier-perpendicular"),
	document.getElementById("toolbar-select-line"),
	document.getElementById("toolbar-select-point")
];
// boot, hide all modifier panels
menus2.forEach(function(el){ el.style.display = "none"; },this);
menus2[5].style.display = "block";

function setMouseModeFromActiveSelection(){
	var activeSelection = Array.prototype.slice.call(document.getElementById("radio-input-crease").childNodes).filter(function(el){ return el.classList && el.classList.contains('active') },this).shift();
	if(activeSelection == undefined){ return; }
	var activeInput = Array.prototype.slice.call(activeSelection.childNodes).filter(function(el){return el.tagName == "INPUT";},this).shift();
	if(activeInput == undefined){ return; }
	switch(activeInput.id){
		case "radio-button-bisect-sector": project.setMouseMode(MouseMode.addSectorBisector); break;
		case "radio-button-between-points": project.setMouseMode(MouseMode.addBetweenPoints); break;
		case "radio-button-point-to-point": project.setMouseMode(MouseMode.addPointToPoint); break;
		case "radio-button-edge-to-edge": project.setMouseMode(MouseMode.addEdgeToEdge); break;
		case "radio-button-pleat-between-edges": project.setMouseMode(MouseMode.addPleatBetweenEdges); break;
		case "radio-button-rabbit-ear": project.setMouseMode(MouseMode.addRabbitEar); break;
		case "radio-button-kawasaki": project.setMouseMode(MouseMode.addKawasakiCollapse); break;
		case "radio-button-perpendicular": project.setMouseMode(MouseMode.addPerpendicular); break;
	}
}

// DOM HOOKS
document.getElementById("radio-input-mode").onchange = function(e){
	menus1.forEach(function(el){ el.style.display = "none"; },this);
	switch(e.target.id){
		case "radio-button-add-crease": e.preventDefault(); setMouseModeFromActiveSelection(); menus1[0].style.display = "block"; break;
		case "radio-button-remove-crease": e.preventDefault(); project.setMouseMode(MouseMode.removeCrease); break;
		case "radio-button-flip-crease": e.preventDefault(); project.setMouseMode(MouseMode.flipCrease); break;
	}
}
document.getElementById("radio-input-crease").onchange = function(event){
	menus2.forEach(function(el){ el.style.display = "none"; },this);
	switch(event.target.id){
		case "radio-button-between-points": project.setMouseMode(MouseMode.addBetweenPoints); menus2[1].style.display = "block"; menus2[5].style.display = "block"; break;
		case "radio-button-point-to-point": project.setMouseMode(MouseMode.addPointToPoint); menus2[5].style.display = "block"; break;
		case "radio-button-edge-to-edge": project.setMouseMode(MouseMode.addEdgeToEdge); menus2[4].style.display = "block"; if (this.select.line == "through"){ menus2[5].style.display = "block"; } break;
		case "radio-button-perpendicular": project.setMouseMode(MouseMode.addPerpendicular); menus2[3].style.display = "block"; menus2[5].style.display = "block"; break;
		case "radio-button-bisect-sector": project.setMouseMode(MouseMode.addSectorBisector); menus2[0].style.display = "block"; break;
		case "radio-button-pleat-between-edges": project.setMouseMode(MouseMode.addPleatBetweenEdges); menus2[2].style.display = "block"; menus2[4].style.display = "block"; if (this.select.line == "through"){ menus2[5].style.display = "block"; } break;
		case "radio-button-rabbit-ear": project.setMouseMode(MouseMode.addRabbitEar); break;
		case "radio-button-kawasaki": project.setMouseMode(MouseMode.addKawasakiCollapse); break;
	}
}
// modifiers
document.getElementById("input-pleat-count").oninput = function(event){ project.modifiers.pleatCount = parseInt(this.value); }
document.getElementById("radio-input-modifier-between-points").onchange = function(event){
	switch(event.target.id){
		case "radio-button-modifier-between-points-full": project.modifiers.betweenPoints = "full"; break;
		case "radio-button-modifier-between-points-segment": project.modifiers.betweenPoints = "segment"; break;
	}
}
document.getElementById("radio-input-modifier-perpendicular").onchange = function(event){
	switch(event.target.id){
		case "radio-button-modifier-perpendicular-full": project.modifiers.perpendicular = "full"; break;
		case "radio-button-modifier-perpendicular-segment": project.modifiers.perpendicular = "segment"; break;
	}
}
document.getElementById("radio-input-toolbar-select-line").onchange = function(event){
	menus2[5].style.display = "none";
	switch(event.target.id){
		case "radio-button-toolbar-select-line-crease": project.select.line = "crease"; break;
		case "radio-button-toolbar-select-line-grid": project.select.line = "grid"; break;
		case "radio-button-toolbar-select-line-perpendicular":
			if (project.select.line != "parallel"){ project.reference = {}; }
			project.select.line = "perpendicular";
			if (project.reference.edge != undefined){ menus2[5].style.display = "block"; }
			break;
		case "radio-button-toolbar-select-line-parallel":
			if (project.select.line != "perpendicular"){ project.reference = {}; }
			project.select.line = "parallel";
			if (project.reference.edge != undefined){ menus2[5].style.display = "block"; }
			break;
		case "radio-button-toolbar-select-line-through":
			project.reference = {};
			project.select.line = "through";
			menus2[5].style.display = "block";
			break;
	}
}
document.getElementById("radio-input-toolbar-select-point").onchange = function(event){
	switch(event.target.id){
		case "radio-button-toolbar-select-point-endpoint": project.select.point = "endpoint"; break;
		case "radio-button-toolbar-select-point-grid": project.select.point = "grid"; break;
		case "radio-button-toolbar-select-point-midpoint": project.select.point = "midpoint"; break;
		case "radio-button-toolbar-select-point-on": project.select.point = "on"; break;
		case "radio-button-toolbar-select-point-none": project.select.point = "none"; break;
	}
}

document.getElementById("menu-file-new").addEventListener("click", onClickMenuFileNew);
document.getElementById("menu-file-properties").addEventListener("click", onClickMenuFileProperties);
document.getElementById("menu-file-clear").addEventListener("click", onClickMenuFileClear);
document.getElementById("menu-file-export-fold").addEventListener("click", onClickMenuFileExportFold);
document.getElementById("menu-file-export-svg").addEventListener("click", onClickMenuFileExportSvg);

document.getElementById("new-cp-button-cancel").addEventListener("click", onClickNewCPButtonCancel);
document.getElementById("new-cp-button-ok").addEventListener("click", onClickNewCPButtonOK);
document.getElementById("new-cp-shape").addEventListener("change", onChangeNewCPShape);

document.getElementById("properties-button-cancel").addEventListener("click", onClickPropertiesButtonCancel);
document.getElementById("properties-button-ok").addEventListener("click", onClickPropertiesButtonOK);
document.getElementById("properties-grid").addEventListener("change", onChangePropertiesGrid);
document.getElementById("properties-symmetry").addEventListener("change", onChangePropertiesSymmetry);

function onClickMenuFileNew()
{
	onChangeNewCPShape();
	document.getElementById("modal-new-cp-window").style.display = "block";
}
function onClickMenuFileProperties()
{
	if (project.cp.name != undefined && project.cp.name.length > 0)
		document.getElementById("properties-name").value = project.cp.name;
	else
		delete document.getElementById("properties-name").value;
	if (project.cp.grid === undefined)
	{
		document.getElementById("properties-symmetry").value = 'none';
	}
	else
	{
		var g = project.cp.grid.serialize();
		switch(g.gridType)
		{
			case 'square':
			case 'rectangular':
			case 'isometric':
			case 'diagonal':
			case 'rhombic':
			case 'isosceles':
				document.getElementById("properties-grid").value = g.gridType;
				setParams("properties-grid-dimensions", g.args);
				break;
			case 'parallelogram':
			case 'triangular':
				document.getElementById("properties-grid").value = g.gridType;
				setParams("properties-grid-dimensions", [g.args[0],g.args[1]]);
				document.getElementById("properties-grid-angle").value = g.args[2];
				break;
			case 'grid':
				document.getElementById("properties-grid").value = 'custom';
				setParams("properties-grid-custom-vectors", [g.args[0],g.args[1],g.args[2],g.args[3]]);
				setParams("properties-grid-custom-origin", [g.args[4],g.args[5]]);
				document.getElementById("properties-grid-custom-triangulate").value = g.args[6] != 0 ? 'yes' : 'no';
				break;
		}
	}
	onChangePropertiesGrid();
	if (project.cp.symmetry === undefined)
	{
		document.getElementById("properties-symmetry").value = 'none';
	}
	else
	{
		var s = project.cp.symmetry.serialize();
		switch(s.symmetryType)
		{
			case 'book':
			case 'double-book':
			case 'diagonal':
			case 'double-diagonal':
			case 'octagonal':
				document.getElementById("properties-symmetry").value = s.symmetryType;
				break;
			case 'rotational':
				document.getElementById("properties-symmetry").value = s.symmetryType;
				document.getElementById("properties-symmetry-rotational-order").value = s.args[0];
				if (s.args.length == 3) setParams("properties-symmetry-rotational-center", [s.args[1],s.args[2]]);
				else setParams("properties-symmetry-rotational-center", []);
				break;
			case 'tile':
				var b = project.cp.bounds();
				document.getElementById("properties-symmetry").value = s.symmetryType;
				if (s.args.length == 2) setParams("properties-symmetry-tile", [s.args[0],s.args[1]]);
				else setParams("properties-symmetry-tile", [s.args[0]]);
				break;
			case 'reflective':
				document.getElementById("properties-symmetry").value = 'custom';
				setParams("properties-symmetry-custom-point", [s.args[0],s.args[1]]);
				setParams("properties-symmetry-custom-vectors", [s.args[2],s.args[3]]);
				break;
			case 'bireflective':
				document.getElementById("properties-symmetry").value = 'custom';
				setParams("properties-symmetry-custom-point", [s.args[0],s.args[1]]);
				setParams("properties-symmetry-custom-vectors", [s.args[2],s.args[3],s.args[6],s.args[7]]);
				break;
		}
	}
	onChangePropertiesSymmetry();
	document.getElementById("modal-properties-window").style.display = "block";
}
function onClickMenuFileClear(e){ e.preventDefault(); project.reset(false); }
function onClickMenuFileExportFold(e){ e.preventDefault(); downloadCreasePattern(project.cp, project.cp.name, "fold"); }
function onClickMenuFileExportSvg(e){ e.preventDefault(); downloadCreasePattern(project.cp, project.cp.name, "svg"); }

function onClickNewCPButtonCancel(){ document.getElementById("modal-new-cp-window").style.display = "none"; }
function onClickNewCPButtonOK()
{
	// if(text field contains text)
	project.reset();
	switch(document.getElementById("new-cp-shape").value)
	{
		case "square":
			project.cp.square();
			break;
		case "rectangle":
			var dimensions = parseParams("new-cp-dimensions");
			if (dimensions.length == 0) dimensions = [1,1];
			else if (dimensions.length == 1) dimensions.push(1);
			project.cp.rectangle(dimensions[0],dimensions[1]);
			break;
		case "right triangle":
			var dimensions = parseParams("new-cp-dimensions");
			project.cp.rightTriangle(dimensions[0],dimensions[1]);
			break;
		case "isosceles triangle":
			var dimensions = parseParams("new-cp-dimensions");
			if (dimensions.length == 0) dimensions = [1,1];
			else if (dimensions.length == 1) dimensions.push(1);
			project.cp.isoscelesTriangle(dimensions[0],dimensions[1]);
			break;
		case "regular polygon":
			var sides = document.getElementById("new-cp-polygon-sides").value;
			project.cp.polygon(sides);
			break;
	}
	project.updateCreasePattern();
	document.getElementById("modal-new-cp-window").style.display = "none";
}

function onChangeNewCPShape(e)
{
	document.getElementById("new-cp-input-dimensions").style.display = "none";
	document.getElementById("new-cp-input-polygon-sides").style.display = "none";
	switch(document.getElementById("new-cp-shape").value){
		case "square": break;
		case "rectangle":
		case "right triangle":
		case "isosceles triangle":
			document.getElementById("new-cp-input-dimensions").style.display = "block";
			break;
		case "regular polygon":
			document.getElementById("new-cp-input-polygon-sides").style.display = "block";
			break;
	}
}

function onClickPropertiesButtonCancel(){ document.getElementById("modal-properties-window").style.display = "none"; }
function onClickPropertiesButtonOK()
{
	// if(text field contains text)
	project.cp.name = document.getElementById("properties-name").value;
	var grid = document.getElementById("properties-grid").value;
	if (grid == "none") { project.cp.noGrid(); }
	else
	{
		if (grid == "custom")
		{
			var origin = parseParams("properties-grid-custom-origin");
			var vectors = parseParams("properties-grid-custom-vectors");
			var triangulate = document.getElementById("properties-grid-custom-triangulate").value == "yes";
			if (vectors === undefined || vectors.length < 2)
				project.cp.noGrid();
			else
				project.cp.setGrid(new CPGrid(project.cp, new XY(vectors[0], vectors[1]), vectors.length >= 4 ? new XY(vectors[2], vectors[3]) : undefined, origin !== undefined && origin.length >= 2 ? new XY(origin[0], origin[1]) : undefined, triangulate));
		}
		else
		{
			var gridDimensions = parseParams("properties-grid-dimensions");
			if (gridDimensions === undefined || gridDimensions.length == 0) { project.cp.noGrid(); }
			else
			{
				switch(grid)
				{
					case "square": project.cp.squareGrid(gridDimensions[0]); break;
					case "rectangular": project.cp.rectangularGrid(gridDimensions[0], gridDimensions[1] !== undefined ? gridDimensions[1] : gridDimensions[0]); break;
					case "diagonal": project.cp.diagonalGrid(gridDimensions[0]); break;
					case "isometric": project.cp.isometricGrid(gridDimensions[0]); break;
					case "parallelogram":
						var angle = parseFloat(document.getElementById("properties-grid-angle").value);
						project.cp.parallelogramGrid(gridDimensions[0], gridDimensions[1] !== undefined ? gridDimensions[1] : gridDimensions[0], angle);
						break;
					case "rhombic": project.cp.rhombicGrid(gridDimensions[0], gridDimensions[1] !== undefined ? gridDimensions[1] : gridDimensions[0]); break;
					case "isosceles": project.cp.isoscelesGrid(gridDimensions[0], gridDimensions[1] !== undefined ? gridDimensions[1] : gridDimensions[0]); break;
					case "triangular":
						var angle = parseFloat(document.getElementById("properties-grid-angle").value);
						project.cp.triangularGrid(gridDimensions[0], gridDimensions[1] !== undefined ? gridDimensions[1] : gridDimensions[0], angle);
						break;
				}
			}
		}
	}
	switch(document.getElementById("properties-symmetry").value)
	{
		case "none": project.cp.noSymmetry(); break;
		case "book": project.cp.bookSymmetry(); break;
		case "double-book": project.cp.doubleBookSymmetry(); break;
		case "diagonal": project.cp.diagonalSymmetry(); break;
		case "double-diagonal": project.cp.doubleDiagonalSymmetry(); break;
		case "octagonal": project.cp.octagonalSymmetry(); break;
		case "rotational":
			var order = parseInt(document.getElementById("properties-symmetry-rotational-order").value);
			var center = parseParams("properties-symmetry-rotational-center");
			if (!isValidNumber(order)) order = 1;
			if (center === undefined || center.length == 0)
				project.cp.rotationalSymmetry(order);
			else
				project.cp.setSymmetry(new RotationalSymmetry(project.cp, order, new XY(center[0], center[1])));
			break;
		case "tile":
			var tile = parseParams("properties-symmetry-tile");
			var dimX = isValidNumber(tile[0]) ? tile[0] : 2;
			var dimY = isValidNumber(tile[1]) ? tile[1] : undefined;
			project.cp.tileSymmetry(dimX, dimY); break;
		case "custom":
			var point = parseParams("properties-symmetry-custom-point");
			var vectors = parseParams("properties-symmetry-custom-vectors");
			if (point === undefined || point.length < 2 || vectors === undefined || vectors.length < 2) { project.cp.noSymmetry(); }
			else
			{
				if (vectors.length >= 4)
					project.cp.setSymmetry(new BiReflectiveSymmetry(project.cp, new Line(new XY(point[0], point[1]), new XY(vectors[0], vectors[1])), new Line(new XY(point[0], point[1]), new XY(vectors[2], vectors[3]))));
				else
					project.cp.setSymmetry(new ReflectiveSymmetry(project.cp, new Line(new XY(point[0], point[1]), new XY(vectors[0], vectors[1]))));
			}
			break;
	}
	project.setEditorStyle();
	project.updateCreasePattern();
	document.getElementById("modal-properties-window").style.display = "none";
}

function onChangePropertiesGrid(e)
{
	document.getElementById("properties-input-grid-dimensions").style.display = "none";
	document.getElementById("properties-input-grid-angle").style.display = "none";
	document.getElementById("properties-input-grid-custom-origin").style.display = "none";
	document.getElementById("properties-input-grid-custom-vectors").style.display = "none";
	document.getElementById("properties-input-grid-custom-triangulate").style.display = "none";
	switch(document.getElementById("properties-grid").value)
	{
		case "square":
		case "rectangular":
		case "isometric":
			document.getElementById("properties-input-grid-dimensions").style.display = "block";
			document.getElementById("properties-input-grid-dimensions").placeholder = "dimX";
			break;
		case "parallelogram":
		case "triangular":
			document.getElementById("properties-input-grid-angle").style.display = "block";
		case "diagonal":
		case "rhombic":
		case "isosceles":
			document.getElementById("properties-input-grid-dimensions").style.display = "block";
			document.getElementById("properties-input-grid-dimensions").placeholder = "[dimX,dimY]";
			break;
		case "custom":
			document.getElementById("properties-input-grid-custom-origin").style.display = "block";
			document.getElementById("properties-input-grid-custom-vectors").style.display = "block";
			document.getElementById("properties-input-grid-custom-triangulate").style.display = "block";
			break;
		default:
			break;
	}
}

function onChangePropertiesSymmetry(e)
{
	document.getElementById("properties-input-symmetry-rotational-order").style.display = "none";
	document.getElementById("properties-input-symmetry-rotational-center").style.display = "none";
	document.getElementById("properties-input-symmetry-tile").style.display = "none";
	document.getElementById("properties-input-symmetry-custom-point").style.display = "none";
	document.getElementById("properties-input-symmetry-custom-vectors").style.display = "none";
	switch(document.getElementById("properties-symmetry").value)
	{
		case "rotational":
			document.getElementById("properties-input-symmetry-rotational-order").style.display = "block";
			document.getElementById("properties-input-symmetry-rotational-center").style.display = "block";
			break;
		case "tile":
			document.getElementById("properties-input-symmetry-tile").style.display = "block"; break;
		case "custom":
			document.getElementById("properties-input-symmetry-custom-point").style.display = "block";
			document.getElementById("properties-input-symmetry-custom-vectors").style.display = "block";
			break;
		default:
			break;
	}
}
