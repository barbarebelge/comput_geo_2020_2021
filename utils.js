

/** Returns a string repreesenting the type of the variable. */
function typeOf(obj) 
{
	return {}.toString
    		.call(obj)
    		.match(/\s(\w+)/)[1]
    		.toLowerCase();
}

function mod(a, n)
{
	return ((a % n ) + n ) % n;
}

function removeElem(elem, list) 
{
	let index = list.indexOf(elem);
	list.splice(index, 1); // remove elem
}


// get different colors in a random order
function getHSLColors(colorsNb) 
{
	// HSL: hue, saturation, lightness
	// =HSB: hue, saturation, brightness
	// This function return at maximum 10 000 colors
	let hslColors = [];
	if(colorsNb <= 100){ // this allow to have very different colors when we have a small number of colors
		let step = Math.ceil(100/colorsNb);
		for (let j = 0; j < colorsNb; j++) {
			hslColors.push([j*step, 100, 100]);
		}
  	}
	else{
		let linesNb = Math.ceil(colorsNb / 100);
		//console.log(linesNb);
		let columnsNb = colorsNb;
		if (colorsNb > 100) {
			columnsNb = 100;
		}
		for (let i = 0; i < linesNb; i++) {
			for (let j = 0; j < columnsNb; j++) {
				// first element of the list is the hue
				// and it is in purcentage not in degrees
				// (this values gives the base color)
				// (is used to browse the colors)
				// second is the stuartion
				// (high value the color is opaque)
				// (low value the color is transparent)
				// third is the brightness
				// (high  value the color is very lighty)
				// (low valeu the color is very darky)
				hslColors.push([j, 100 - i, 100]);
			}
		}
	}   
  return shuffleList(hslColors);
}

// shuffle list
function shuffleList(list) 
{
	var j, tmp, i;
	for (i = list.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1)); // random index
		tmp = list[i];
		list[i] = list[j];
		list[j] = tmp;
	}
	return list;
}
