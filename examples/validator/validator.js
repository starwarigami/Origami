function showAndScrollResults(){
	// prevent 2 drops without page reload
	// dropZone.style.display = "none";
	document.getElementById("result-container").style.display = "block";
	window.dispatchEvent(new Event('resize'));
	// $('html, body').scrollTo('#result-container');
	document.getElementById('result-container').scrollIntoView({behavior: "smooth"});
}

function setJumbotron(success){
	var titleSuccess = "Valid";
	var titleFail = "Invalid";
	var messageSuccess = "crease pattern is flat-foldable";
	var messageFail = "crease pattern contains non-flat-foldable nodes";
	if(success){
		$("#jumbo-container").removeClass("fail");
		$("#jumbo-container").addClass("success");
		document.getElementById("jumbo-title").innerHTML = titleSuccess;
		document.getElementById("jumbo-message").innerHTML = messageSuccess;
	}
	else{
		$("#jumbo-container").removeClass("success");
		$("#jumbo-container").addClass("fail");
		document.getElementById("jumbo-title").innerHTML = titleFail;
		document.getElementById("jumbo-message").innerHTML = messageFail;
	}
}

//////////////////////////// epsilon settings
document.getElementById("settings").addEventListener("click", function(e){
	$("#settings-div").toggle();
});
document.getElementById("recalculate").addEventListener("click", function(e){
	if(inputFile !== undefined){
		fileDidLoad(inputFile);
	} else{
		$("#recalculate").addClass("disabled");
	}
});
$('#epsilon-radio label').click(function(e) {
    // $(this).addClass('active').siblings().removeClass('active');
    console.log($(this));
    console.log(e.target.innerText);
    valid_epsilon = parseFloat(e.target.innerText);
    // TODO: insert whatever you want to do with $(this) here
    console.log(e);
});


/////////////////////////////////////////////////////////////////////

var project1 = new OrigamiPaper("canvas-1");
var foldedState = new OrigamiFold("canvas-2");
foldedState.style.face.fillColor = {gray:1.0, alpha:0.2};
//foldedState.show.edges = true;
//foldedState.show.marks = true;
//foldedState.rotate3D = true;

var inputFile = undefined;
// var valid_epsilon = 0.00001;
var valid_epsilon = 0.001;

document.getElementById("result-container").style.display = "none";

function setInputFile(svg){
	inputFile = svg;
	$("#recalculate").removeClass("disabled");
}

function updateFold(cp){
	foldedState.cp = cp.copy();
	foldedState.zoom = 1;
	foldedState.rotation = 0;
	foldedState.draw();
	foldedState.update();
}

function fileDidLoad(file, mimeType){
	setInputFile(file);

	try{
		// try .fold file format first
		var foldFile = JSON.parse(file);
		project1.cp.importFoldFile(foldFile);
		project1.draw();
		updateFold(project1.cp);
		showAndScrollResults();

	} catch(err){
		// try .svg file format
		project1.load(file, function(){
			project1.cp = project1.cp.copy();
			project1.draw();
			updateFold(project1.cp);
			showAndScrollResults();
		}, valid_epsilon);
	}

	// loadSVG(svg, function(cp){

		// project1 = new OrigamiPaper("canvas-1", cp.copy());
		// project1.cp = new CreasePattern();
		// project1.draw();

		// project1.cp = cp.copy();
		project1.show.nodes = true;
		project1.style.node.radius = 0.015;;
		project1.draw();
		// project1.setPadding(0.05);
		project1.colorNodesFlatFoldable = function(){
		project1.cp.clean();
			var ffTestPassed = true;
			for(var i = 0; i < project1.cp.junctions.length; i++){
				console.log(project1.cp.junctions[i]);
				var color = { hue:130, saturation:0.8, brightness:0.7, alpha:0.5 }
				if( !project1.cp.junctions[i].flatFoldable(0.01) ){
					ffTestPassed = false;
					color = { hue:0, saturation:0.8, brightness:1, alpha:0.5 }
				} else{
					project1.nodes[ project1.cp.junctions[i].origin.index ].fillColor = {alpha:0.0};
				}
				project1.nodes[ project1.cp.junctions[i].origin.index ].fillColor = color;
			}
			setJumbotron(ffTestPassed);
			if(ffTestPassed){ document.getElementById("canvas-2").style.display = "inline-block"; }
			else            { document.getElementById("canvas-2").style.display = "none"; }
		}
		// todo: this is breaking, fix it and uncomment it
		project1.colorNodesFlatFoldable();

	// 	foldedState.cp = cp.copy();
	// 	foldedState.draw();
	// 	// foldedState.style = { face:{ fillColor:{ gray:0.0, alpha:0.1 } } };
	// 	foldedState.update();

	// 	// project2 = new OrigamiFold("canvas-2", cp.copy());
	// 	// project2.epsilon = EPSILON;
	// 	// project2.draw();
	// 	// project2.buildViewMatrix(0.05);

	// 	showAndScrollResults();
	// }, valid_epsilon);
}
