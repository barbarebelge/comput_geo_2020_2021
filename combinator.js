

/**
* Class used to get combinations of size k from a list (n=list.length).
*/
class Combinator{
    constructor(){
        this.list = [];
        this.combination = [];
        this.combinations = [];
    }

    findCombinations(offset, k){
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

