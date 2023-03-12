class APIFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ?{
            name:{
                $regex: this.queryStr.keyword,
                $options: 'i' //case insensitive
            }
        }:{}
        

        this.query  = this.query.find({...keyword});
        console.log(keyword)
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr}

        //remove field
        const removeField = ['keyword','page','limit']
        removeField.forEach(el=>delete queryCopy[el])
        
        let queryString = JSON.stringify(queryCopy)
        //for lte to $lte
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match =>`$${match}`)
        // console.log(queryString)
        // console.log(queryString)
        this.query = this.query.find(JSON.parse(queryString))

        return this;
    }
    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;  //take input like page=2
        const skip = resPerPage*(currentPage-1); //page 2 for 11 to 20 and 3 for 21 to 30 and so on...
        this.query = this.query.limit(resPerPage).skip(skip)
        return this
    }

}



module.exports = APIFeatures