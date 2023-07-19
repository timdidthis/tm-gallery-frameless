/*
 * Yes, this code isn't great, but it's small and works even in IE10.
 * I wasn't configuring babel/webpack for a one off fun project.
 */
	var contestantNames = ["1", "2", "3", "4", "5", "6","7","8"];
    var currentContestant = 0;

// (function() {
	var contestants = [];

	// var frameWidth = 717;
	// var frameHeight = 624;

	var locked = true; // change this to false to turn on Xs and + button
	//var frameScale = 1;
	//var mainScale = 1;
	var framesPerRow = Math.ceil(contestantNames.length/2); //Math.ceil(Math.sqrt(contestantNames.length));
	var frameGap = 275;//framesPerRow; // default is 275 for one row
	var frameHorizontalOffset = 40;///framesPerRow; // default is 30 for one row
	
	var main = document.querySelector("main");
	var fileInput = document.querySelector("#file-input");
	
	function addContestant(image) {
		var contestant = {};

		contestant.image = !!image ? image : "./images/blank.png";

		contestants.push(contestant);

		return contestants.length;
	}

	function removeContestant(idx) {
		contestants.splice(idx, 1);
	}

	function createContestantEl(con, id) {
		var el = document.createElement("div");
		el.classList.add("contestant");
        el.setAttribute("id", "contestant"+id);

		var frameScaler = document.createElement("div");
		frameScaler.classList.add("frame-scaler");

		var frameContainer = document.createElement("div");
		frameContainer.classList.add("frame-container");
		frameContainer.style.webkitAnimationDelay = -id * 1.25 + "s";
		frameContainer.style.animationDelay = -id * 1.25 + "s";

		var fill = document.createElement("div");
		fill.classList.add("fill");
		fill.style.backgroundImage = "url(" + con.image + ")";
        fill.setAttribute("id", "image"+id);

		var shadow = document.createElement("div");
		shadow.classList.add("shadow");
 
        var frame = document.createElement("img");
		frame.src = "./images/blank.png";
		frame.classList.add("frame");
		frame.removeAttribute("width");
		frame.removeAttribute("height");        

		frame.addEventListener("click", function() {
			var cb = function(evt) {
				if (fileInput.files && fileInput.files[0]) {
					con.image = URL.createObjectURL(fileInput.files[0]);
					fill.style.backgroundImage = "url(" + con.image + ")";
				}
				fileInput.removeEventListener("change", cb);
				fileInput.value = "";
			};

			fileInput.addEventListener("change", cb);
			fileInput.click();
		});

		var exit = document.createElement("button");
		exit.classList.add("exit-button");
		exit.innerText = "X";
		exit.addEventListener("click", function() {
			removeContestant(id - 1);
			refreshContestants();
			resize();
		});

		fill.appendChild(shadow);
		frameContainer.appendChild(fill);
		frameContainer.appendChild(frame);
		
		var nameContainer = document.createElement("div");
		nameContainer.classList.add("contestant-name");
		var nameText = document.createTextNode(contestantNames[id-1]);
		
		var nameScale = 1;
		var nameScaleMin = 5;
		if(contestantNames[id-1].length > nameScaleMin){
			nameScale = 1/(contestantNames[id-1].length/nameScaleMin*.9);
		}
		
		nameContainer.style.transform = "scale("+nameScale*2+","+nameScale+")";
	
		frameContainer.appendChild(nameContainer);
		nameContainer.appendChild(nameText);
		

		if (!locked) frameContainer.appendChild(exit);

		frameScaler.appendChild(frameContainer);
		
		el.appendChild(frameScaler);
		
		return el;
	}

	function transformContestants() {

		contestants.sort(function(first, second) {
			if (first.score < second.score) {
				return -1;
			} else if (first.score > second.score) {
				return 1;
			} else {
				return 0;
			}
		});

		
		var maxScore = contestants[contestants.length - 1].score;
		var maxCount = 1;

		for (var i = contestants.length - 1; i > 0; --i) {
			var con = contestants[i-1];
			if (con.score == maxScore) {
				++maxCount;
			}
		}

		for (var i = 0, l = contestants.length; i < l; ++i) {
			var con = contestants[i];
			var rows = Math.ceil(contestants.length/framesPerRow);
			var row = Math.floor(i/framesPerRow)+1;
			
			var translateX = frameGap * (i%framesPerRow) + frameHorizontalOffset;
			var translateY = (row-1)*frameGap*.9-rows*frameGap/2.45;
			
			con.el.style.msTransform = "translate(" + translateX + "px, " + translateY + "px)";
			con.el.style.transform = "translate(" + translateX + "px, " + translateY + "px)";
			
			con.el.children[0].classList.add("larger");
			
			/*
			if (con.score == maxScore) {
				if (maxCount > 2) {
					con.el.children[0].classList.remove("larger");
					con.el.children[0].classList.add("large");
				} else {
					con.el.children[0].classList.remove("large");
					con.el.children[0].classList.add("larger");
				}
			} else {
				con.el.children[0].classList.remove("large");
				con.el.children[0].classList.remove("larger");
			}
			*/
			
		}
	}
	
	function createAdd(len) {
		var res = document.createElement("button");

		res.innerText = "+";

		res.classList.add("add-button")

		res.style.msTransform = "translateX(" + (275 * len + 30) + "px)";
		res.style.transform = "translateX(" + (275 * len + 30) + "px)";

		res.addEventListener("click", function() {
			addContestant();
			refreshContestants();
			resize();
		});

		return res;
	}

	function refreshContestants() {
		main.innerHTML = "";

		for (var i = contestants.length; i > 0; --i) {
			var con = contestants[i-1];

			var cEl = createContestantEl(con, i);
			con.el = cEl;
		}

		if (contestants.length > 0) transformContestants();
		
		for (var i = contestants.length; i > 0; --i) {
			var con = contestants[i-1];
			main.appendChild(con.el);
		}

		if (!locked) {
			main.appendChild(createAdd(contestants.length));
		}
	}

	for (var i = 0; i < contestantNames.length; ++i)
		addContestant();

	refreshContestants();

	function resize(rep) {
		var w = window.innerWidth;
		var h = window.innerHeight;

		var wm = 1400 * ((framesPerRow + (locked ? 0 : 0.25)) / 5);
		//var wm = 1400 * ((contestants.length + (locked ? 0 : 0.25)) / 5);

		var m = Math.min(w / wm, h / 1080);

		main.style.msTransform = "scale(" + m + ")";
		main.style.transform = "scale(" + m + ")";

		main.style.left = (w - wm * m) / 2 + "px";
        
        if(framesPerRow > 3 || currentContestant > 0) {
           document.getElementById("main-wrapper").style.scale = 1-(framesPerRow-3)*.1;
        } else {
           document.getElementById("main-wrapper").style.scale = 1;
        }
	}

	window.addEventListener("resize", resize);
	resize();
// })();

document.addEventListener('keyup', (e) => {
    var keypress = e.code.toString();
    
    if (keypress.includes("Digit") || keypress.includes("Numpad") || e.code == "ArrowDown") {
        currentContestant = parseInt(e.code.slice(-1));
        
        if(e.code == "ArrowDown") {
            currentContestant = 0;    
        }
        
        showHideContestants(currentContestant);
    }
    else if (e.code === "ArrowLeft") {
        currentContestant--;
        if(currentContestant < 1) {
            currentContestant = 1;
        }
        showHideContestants(currentContestant);
    } else if(e.code === "ArrowRight") {
        currentContestant++;
        if(currentContestant > contestantNames.length) {
            currentContestant = contestantNames.length;
        }
        showHideContestants(currentContestant);
    } else if(e.code === "Escape" || e.code == "ArrowUp") {
        currentContestant = 0;
        showAllContestants();   
    }
});

function showAllContestants() {
    var elements = document.getElementsByClassName("contestant-name");
    for (var i=0; i < elements.length; i++) {
        elements[i].style.display = '';
    }
    
    for(var counter = 1; counter <= contestantNames.length; counter++) {         
        document.getElementById("contestant"+counter).style.display = "block";
        document.getElementById("contestant"+counter).style.scale = 1;
        refreshContestants();
        resize();
    }   
    
}

function showHideContestants(currentContestant) {
    var elements = document.getElementsByClassName("contestant-name");
    for (var i=0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }
    
     for(var counter = 1; counter <= contestantNames.length; counter++) {         
          if(counter != currentContestant) {
            document.getElementById("contestant"+counter).style.display = "none";
          } else {
              document.getElementById("contestant"+counter).style.display = "block";
              document.getElementById("contestant"+counter).style.scale = 3.3;
              
              if(contestantNames.length > 6) {
                document.getElementById("contestant"+counter).style.transform = "translate(140px, -7px)";
              } else if(contestantNames.length > 4) {
                  document.getElementById("contestant"+counter).style.transform = "translate(125px,-7px)";
              }
          }
    }   

}

/* 
ArrowLeft
ArrowRight
Numpad1
Digit1
KeyA
Space
Escape
Enter */
