"use strict";
/*
	Main calls in the posts that were put into the mongoDB database
	by the python script that queries PRAW


*/
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var csv = require('csv-builder');
var url = 'mongodb://localhost:27017/earthpornDb';
var Posts = [];
var Countries = [];
var States = [];
var Results = {};
var ar = [];
var statesArray = [];
const builder = new csv({
    headers:['country', 'count']
});

var findPosts = function(db, callback){
    var cursor = db.collection('topPosts').find();
    cursor.each(function(err, doc){
       if(doc != null){
           Posts.push(doc);
           //console.dir(doc);
       } else { 
           callback();
       }
    });
};
function reader(Aray, filepath){
    
    
    
    var a = fs.readFileSync(filepath);
    var array = a.toString().split("\n");

    for (var i = 0; i < array.length; i++) {
        Aray.push(array[i].replace(/[\r]/g, ''));
    }
    
}
reader(Countries, "C:/Users/Adoni5/Documents/JavaScript/Mappy/country.txt");
reader(States, "C:/Users/Adoni5/Documents/JavaScript/Mappy/states.txt");
reader(statesArray, "C:/Users/Adoni5/Documents/JavaScript/Mappy/statesArray.csv");


fs.readFile("C:/Users/Adoni5/Documents/JavaScript/Mappy/statesArray.csv", function(err, data){
    
  if(err) throw err;
  var array = data.toString().split("\n");
  for(var i =0; i < array.length; i++){            
       statesArray.push(array[i].replace(/[\r]/g, '').split(","));
  }



});

    

var regPosts = function(posts, search){
    var total = 0;
    for(var j = 0; j < posts.length; j++){
        
            for(var i = 0; i < search.length; i++){

                var re  = new RegExp(search[i].toString(), 'g');
                if(posts[j].post.match(re) !== null){
                    
                    if(Results.hasOwnProperty(search[i])){
                        Results[search[i]] = Results[search[i]] + 1;
                        break;
                    } else {
                        Results[search[i]] = 1;
                        break;
                    }
                } else {
                    continue;
                }
                

            }
        
    }
    
};

function ResultsSort(Res){
        Res["United Kingdom"] = 0;
 
        for(var i = 0; i < Object.keys(Res).length; i++){
            for(var j = 0; j < statesArray.length; j++){
                
                    if(Object.keys(Res)[i] === statesArray[j][0] && Object.keys(Res).indexOf(statesArray[j][1]) > -1){
                        Res[statesArray[j][0]] = Res[statesArray[j][0]]+Res[statesArray[j][1]];
                        delete Res[statesArray[j][1]];
                    }
                
            }
        }
        for(var i = 0; i < Object.keys(Res).length; i++){
            for(var j = 0; j < statesArray.length; j++){
                if(Object.keys(Res)[i] === statesArray[j][1]){
                    console.dir("if loop");
                    Res[statesArray[j][0]] = Res[Object.keys(Res)[i]];
                    delete Res[statesArray[j][1]];
                }
            }
            if(Object.keys(Res)[i].indexOf("Scotland") > -1 || Object.keys(Res)[i].indexOf("England") > -1 ||Object.keys(Res)[i].indexOf("Wales") > -1 || Object.keys(Res)[i].indexOf("Northern Ireland") > -1){
                Res["United Kingdom"] += Res[Object.keys(Res)[i]];
                delete Res[Object.keys(Res)[i]];
            }
 
        }
        
        
};
function CSVstyle(Obj){
    
    for(var i = 0; i < Object.keys(Obj).length; i++){
        ar.push([Object.keys(Obj)[i], Obj[Object.keys(Obj)[i]]]);
    }
};
mongo.connect(url, function(err, db){
  assert.equal(null, err);
  findPosts(db, function(){
    db.close();
    var Search = Countries.concat(States);
    for(var i = 0; i < Posts.length; i++){
        Posts[i]['Checked'] = 0;
    }
    
    regPosts(Posts, Search);
    ResultsSort(Results);

    CSVstyle(Results);
    builder.createReadStream(ar)
    .pipe(fs.createWriteStream('output.csv'));
      console.dir(ar);
      console.dir("Succesfully Executed");
     
  });
//api key
});