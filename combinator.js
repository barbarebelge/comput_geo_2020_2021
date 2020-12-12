

/**
* Class used to get combinations of size k from a list (n=list.length).
*/
class Combinator{
    constructor(){
        this.list = [];
        this.combination = [];
        this.combinations = [];
    }


    findCombinations(offset, k)
    {
	    if(k === 0)
	    {
	        //console.log(this.combination);
	        this.combinations.push(Array.from(this.combination));
	        return true;
	    }

	    for(let i = offset; i <= this.list.length - k; i++)
	    {
	        this.combination.push(this.list[i]);
	        this.findCombinations(i + 1, k - 1);
	        this.combination.pop();
	    }
    }

	getCombinationsOfSizeKFromList(k, list)
	{
	    if (k > list.length)
	    {
	        throw new TypeError("k should be <= to the list length.");
	    }

	    else
	    {
	    	this.reset();
	        this.list = list;
	        this.findCombinations(0,k);
	        //console.log(this.combinations);
	        return Array.from(this.combinations);
	   }

	}

	reset()
	{
	    this.combination = [];
	    this.combinations = [];
	}
}


function getPermutationsOf(array, permutations = [], len = array.length) {
	if (len === 1){
		permutations.push(Array.from(array)); // make a shallow copy and save it
	}
	for (let i = 0; i < len; i++) {
		getPermutationsOf(array, permutations, len - 1);
		// swap a and b: [a, b] = [b, a];
		if(len % 2 === 0){ // length even
			[array[i], array[len - 1]] = [array[len - 1], array[i]]; // swap elem i with last elem
		}
		else{ // length odd
			[array[0], array[len - 1]] = [array[len - 1], array[0]]; // swap first elem with last elem
		}
	}
	return permutations;
}