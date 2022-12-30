
const sharedfunc = require('../../shared/func');
var _lodash = require('lodash');
const async = require('async');


var log4js = require('log4js');
var logger = log4js.getLogger();

const priceQuerySharedfunc = require('../../shared/priceQuery');


exports.getAllQuestionsDetailByCategoryId= async (req,categoryId,cb)=>{
  
  const sqlRest=`
  SELECT 
  questions.id AS questionId,
  questions.category_id AS categoryId,
  questions.question,
  questions.question_ar,
  questions.questionTypeSelection,
  question_options.id AS questionOptionId,
  question_options.optionLabel,
  question_options.optionLabel_ar,
  question_options.valueChargeType,
  question_options.flatValue,
  question_options.percentageValue
  
  FROM questions questions join categories categories ON (categories.Id = questions.category_id)
  INNER JOIN question_options  question_options ON ( question_options.question_id = questions.Id)
  WHERE 
  questions.isDelete=0 AND question_options.isDelete=0 AND
  categories.Id=?
                      `;
          const sqlParameter = [categoryId];
          let questionOptionsList=[];
          let finalList= [];
  
          try{
              questionOptionsList = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);
  
              if(questionOptionsList && questionOptionsList.length){
  
                  const uniqueQuestionIdList = _lodash.uniqBy(questionOptionsList, 'questionId');
  
                 
                  uniqueQuestionIdList.map( item =>{ 
                       let {questionId, categoryId,question,question_ar, questionTypeSelection  } =  item;        
                           
  
                          let filterQuestionOptions = questionOptionsList.filter( (questionOptionItem)=>{
                              return (questionOptionItem.questionId == questionId);
                           }).map( questionOptionsItem=>{
                              return  (questionOptionsItem)?
                              _lodash.pick(questionOptionsItem, ['questionId','categoryId', "questionOptionId","optionLabel",
                              "valueChargeType","flatValue","percentageValue","optionLabel_ar"]):undefined; 
                           });
                       
                          const response = {
                              questionId,
                               categoryId,
                               question,
                               question_ar,
                               questionTypeSelection: questionTypeSelection,
                               optionsList:filterQuestionOptions
                           };
                           finalList.push(response);
                      });
              
                  cb(null,{questionList:finalList});
              }else{
                  cb(null,{questionList:finalList});
              }
  
          }catch(err){
                  cb(err,null);
          }
  };


exports.findQuestionsByCategoryId= async (req,categoryId,languageId,cb)=>{

  languageQuestionField='question';
  languageOptionLabelField = 'optionLabel';
  if(languageId == 15){
    languageQuestionField='question_ar';
    languageOptionLabelField='optionLabel_ar';
    
  }  


const sqlRest=`
SELECT 
questions.id AS questionId,
questions.category_id AS categoryId,
questions.${languageQuestionField} AS question,
questions.questionTypeSelection,
question_options.id AS questionOptionId,
question_options.${languageOptionLabelField} AS optionLabel,
question_options.valueChargeType,
question_options.flatValue,
question_options.percentageValue

FROM questions questions join categories categories ON (categories.Id = questions.category_id)
INNER JOIN question_options  question_options ON ( question_options.question_id = questions.Id)
WHERE 
questions.isDelete=0 AND question_options.isDelete=0 
AND categories.Id=?;
                    `;
        const sqlParameter = [categoryId];
        let questionOptionsList=[];
        let finalList= [];

        try{
            questionOptionsList = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);

            if(questionOptionsList && questionOptionsList.length){

                const uniqueQuestionIdList = _lodash.uniqBy(questionOptionsList, 'questionId');

               
                uniqueQuestionIdList.map( item =>{ 
                     let {questionId, categoryId,question, questionTypeSelection  } =  item;        
                         

                        let filterQuestionOptions = questionOptionsList.filter( (questionOptionItem)=>{
                            return (questionOptionItem.questionId == questionId);
                         }).map( questionOptionsItem=>{
                            return  (questionOptionsItem)?
                            _lodash.pick(questionOptionsItem, ['questionId','categoryId', "questionOptionId","optionLabel",
                            "valueChargeType","flatValue","percentageValue"]):undefined; 
                         });
                     
                        const response = {
                            questionId,
                             categoryId,
                             question,
                             questionTypeSelection: questionTypeSelection,
                             optionsList:filterQuestionOptions
                         };
                         finalList.push(response);
                    });
            
                cb(null,{questionList:finalList});
            }else{
                cb(null,{questionList:finalList});
            }

        }catch(err){
                cb(err,null);
        }
};


exports.findQuestionsByQuestionId= async (req,categoryId,cb)=>{

    const sqlRest=`
    SELECT 
    questions.id AS questionId,
    questions.category_id AS categoryId,
    questions.question,
    questions.questionTypeSelection,
    question_options.id AS questionOptionId,
    question_options.optionLabel,
    question_options.valueChargeType,
    question_options.flatValue,
    question_options.percentageValue
    
    FROM questions questions
    INNER JOIN question_options  question_options ON ( question_options.question_id = questions.Id)
    WHERE 
    questions.isDelete=0 AND question_options.isDelete=0 AND
    questions.Id=?
    `;
            const sqlParameter = [categoryId];
            let questionOptionsList=[];
            let finalList= [];
    
            try{
                questionOptionsList = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);
    
                if(questionOptionsList && questionOptionsList.length){
    
                    const uniqueQuestionIdList = _lodash.uniqBy(questionOptionsList, 'questionId');

                    console.log('uniqueQuestionIdList');
                    console.log(uniqueQuestionIdList);

                    uniqueQuestionIdList.map( item =>{ 
                         let {questionId, categoryId,question, questionTypeSelection  } =  item;        
                             
    
                            let filterQuestionOptions = questionOptionsList.filter( (questionOptionItem)=>{
                                return (questionOptionItem.questionId == questionId);
                             }).map( questionOptionsItem=>{
                                return  (questionOptionsItem)?
                                _lodash.pick(questionOptionsItem, ['questionId','categoryId', "questionOptionId","optionLabel",
                                "valueChargeType","flatValue","percentageValue"]):undefined; 
                             });
                         
                            const response = {
                                questionId,
                                 categoryId,
                                 question,
                                 questionTypeSelection: questionTypeSelection,
                                 optionsList:filterQuestionOptions
                             };
                             finalList.push(response);
                        });
                
                    cb(null,finalList[0]);
                }else{
                    cb(null,finalList[0]);
                }
    
            }catch(err){
                // logger.debug("................err..........................................",err);                  
                    cb(err,null);
            }
    };
    


exports.deleteQuestionsByQuestionIds= async (req,deletedBy,questionIds,cb)=>{

    const Ids = _lodash.uniqBy(questionIds, 'Id').map(( {Id})=>Id);
    const commonDynamic = Ids.map((v)=> '?').join(',');


    async.waterfall([
        async function(callback) {
            try{
const sqlRest=` 
update questions SET isDelete=1, modified_by=?, modified= NOW() WHERE id in (?) AND isDelete=0;
`;

// const sqlParameter = _lodash.concat( [deletedBy],Ids);
                sqlParameter=[deletedBy,questionIds]
                const deleteResult = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);
                callback(null);
            }catch(err){
                callback(err,null);
            }

        },
        async function(callback) {
            try{
const sqlRestDeleteQuestionOption=`
update question_options 
SET isDelete=1, modified_by=?, 
modified= NOW()
WHERE 
question_id in (${commonDynamic}) AND isDelete=0;
`;
                
                const sqlParameter = _lodash.concat( [deletedBy],Ids);
                const deleteOptionResult = await sharedfunc.queryExecute(req.dbName,sqlRestDeleteQuestionOption,sqlParameter);
                callback(null,{});
                            }catch(err){
                                callback(err,null);
                            }
        }
    ], function (err, result) {
        if(err){
            cb(err,null);
        }else{
            cb(null,{});
        }
    });

 };

 const addNewOptionToQuestion = async (dbName,createdBy,questionId,optionsRec)=>{
     logger.debug("=======optionsRec====",optionsRec)
let {optionLabel, optionLabel_ar, valueChargeType, flatValue, percentageValue} = optionsRec;
     logger.debug("=======Opto====",{optionLabel, optionLabel_ar, valueChargeType, flatValue, percentageValue})
const sqlRest=`
INSERT INTO question_options (id, question_id, optionLabel,optionLabel_ar,valueChargeType, flatValue, percentageValue, created_by, modified_by,created, modified)
VALUES (NULL, ?, ?,?,?, ?, ?,?, ?, NOW(), NOW());
`;

const sqlParameter = [questionId, optionLabel,optionLabel_ar, valueChargeType,flatValue,
 percentageValue,createdBy ,createdBy];

const response = await sharedfunc.queryExecute(dbName,sqlRest,sqlParameter);
  return {insertId:response.insertId};  
 };

 const editOptionToQuestion = async (dbName,questionOptionId,createdBy,questionId,optionsRec)=>{

    let {optionLabel,optionLabel_ar, valueChargeType, flatValue, percentageValue} = optionsRec;

    if(valueChargeType==1){
        percentageValue = null;
    }else{
        flatValue = null;
    }

    
const sqlRest=`
UPDATE question_options SET optionLabel=?,optionLabel_ar=?, valueChargeType=?, flatValue=?, percentageValue=?, modified_by=?,modified=NOW() WHERE question_id=? AND id=? AND isDelete=0;
`;
    
    const sqlParameter = [optionLabel,optionLabel_ar,valueChargeType,flatValue,percentageValue,createdBy,questionId, questionOptionId];
    
    const response = await sharedfunc.queryExecute(dbName,sqlRest,sqlParameter);
    
      return response;  
     };
    
 
 

const addNewQuestion = async (dbName,createdBy,categoryId,  questionRecord)=>{

    let {question,question_ar, questionTypeSelection, optionsList} = questionRecord;

    return   new Promise((resolve,reject)=>{
    async.waterfall([
        async function(callback) {
            try{

                const sqlRest=`
                INSERT INTO questions 
                (id, category_id, question,question_ar, questionTypeSelection,  created_by, modified_by, created, modified) 
                VALUES 
                (NULL, ?, ?, ?, ?, '1', '1', NOW(),NOW());
                `;
                
                const sqlParameter = [categoryId, question,question_ar, questionTypeSelection,createdBy];
                const insertQuestion = await sharedfunc.queryExecute(dbName,sqlRest,sqlParameter);
                // const insertQuestion = {insertId:1333};  
                callback(null,insertQuestion.insertId);
            }catch(err){
                callback({err:err,status:false,reason:'During question add'},null);
            }

        },
        
        async function(questionId, callback) {
            //addNewOptionToQuestion
            async.each(optionsList, async function(addOptionRec, nestedEachcallback) {

                // Perform operation on file here.
                try{

                    const optionREsponse = await addNewOptionToQuestion(dbName,createdBy,questionId,addOptionRec);
                    nestedEachcallback();
                }catch(err){
                    nestedEachcallback(err);
                }
            
            }, function(err) {
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                    // All processing will now stop.
                    callback({err:err,status:false,reason:'During question->option add',questionId:questionId},null);
                } else {
                    callback(null,{success:true,questionId:questionId})
                }
            });
            // callback(null, 'three');
        }
    ], function (err, result) {
        // result now equals 'done'
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
        
    });


});



}

const editQuestion = async (dbName,questionId,createdBy,categoryId,  questionRecord)=>{

    let {question, question_ar, questionTypeSelection, optionsList} = questionRecord;

    return   new Promise((resolve,reject)=>{
    async.waterfall([
        async function(callback) {
            try{

const sqlRest=`
UPDATE questions SET question=?,question_ar=?, questionTypeSelection=?, modified_by=?, modified=NOW() WHERE id=? AND isDelete=0;
`;
                
                const sqlParameter = [question, question_ar, questionTypeSelection,createdBy,questionId];
                const updateQuestion = await sharedfunc.queryExecute(dbName,sqlRest,sqlParameter);
                 //affectedRows:
                callback(null);
            }catch(err){
                callback({err:err,status:false,reason:'During question update'},null);
            }

        },
        async function(callback) {
            try{

            const optionListExit = _lodash.uniq(optionsList.map(( {questionOptionId})=>questionOptionId));
            const commonDynamic = optionListExit.map((v)=> '?').join(',');

const sqlRest=`
UPDATE question_options SET isDelete=1, modified_by=?, modified=NOW() WHERE question_id=? AND isDelete=0 AND id NOT IN (${commonDynamic});
`;

 
                const sqlParameter = _lodash.concat( [createdBy, questionId],optionListExit);
                const deleteRemainingQuestionOptional = await sharedfunc.queryExecute(dbName,sqlRest,sqlParameter);
                console.log(deleteRemainingQuestionOptional);
             
                //affectedRows:
                callback(null);
            }catch(err){
              
                callback({err:err,status:false,reason:'During question option delete'},null);
            }

        },
        async function(callback) {
            //addNewOptionToQuestion
            async.each(optionsList, async function(addOptionRec, nestedEachcallback) {

                 const {questionOptionId} = addOptionRec;
                 let optionREsponse;
                try{
                   
                    if(questionOptionId){
                        optionREsponse = await editOptionToQuestion(dbName,questionOptionId,createdBy,questionId,addOptionRec);
                    }else{
                        optionREsponse = await addNewOptionToQuestion(dbName,createdBy,questionId,addOptionRec);
                    }
                    nestedEachcallback();
                }catch(err){
                    console.log(err);
                    nestedEachcallback(err);
                }
            
            }, function(err) {
                console.log(err);
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                    // All processing will now stop.
                    callback({err:err,status:false,reason:'During question->option add',questionId:questionId},null);
                } else {
                    callback(null,{success:true,questionId:questionId})
                }
            });
            // callback(null, 'three');
        }
    ], function (err, result) {
        // result now equals 'done'
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
        
    });


});



}


/*

    @request:
    {
    "accessToken": "54c4607ea4593ee3d6bf06a4d9ca478353319d94b94a82a9a45518a71c437b5dc10d09e359bdb7e13ddbe907be045c299ed6fa3cb53e296f84a4e66e842a0d88933c3fabe8902712c8f7adfe8bffca40",
    "categoryId":1,
    "questions":[
        {
                "question": "testing  my question ?",
                "questionTypeSelection": 1,
                "optionsList": [
                    {
                        "questionOptionId": 1,
                        "optionLabel": "Do you want coke?",
                        "valueChargeType": 1,
                        "flatValue": 20,
                        "percentageValue": null
                    }
                ]
            }
    ]
    }

 */
 exports.saveQuestionsByCategoryId= async (createdBy,categoryId,questions,mainCallback)=>{

    let questionIdsList= [];
    try{

        async.each(questions, async function(questionRecord, nestedEachcallback) {
            
            let questionResponse = await addNewQuestion(createdBy,categoryId, questionRecord);
            questionIdsList.push(questionResponse);
            nestedEachcallback();

        }, function(err) {
            if( err ) {
                mainCallback(err,null);
             } else {
                 mainCallback(null,questionIdsList)
            }
        });

    }catch(err){
         cb(err,null);
    }
 };


 exports.editQuestionsByCategoryId= async (req,createdBy,categoryId,questions,mainCallback)=>{

    let questionIdsList= [];

    try{

        async.waterfall([
            async function(callback) {
                try{
        
                const questionExitInRequestion = _lodash.uniq(questions.map(( {questionsId})=>questionsId));
                const commonDynamic = questionExitInRequestion.map((v)=> '?').join(',');
        
        const sqlRest=`
        UPDATE questions SET isDelete=1, modified_by=?, modified=NOW() WHERE category_id=? AND isDelete=0 AND id NOT IN (${commonDynamic});
        `;
        
                    console.log('sqlRest',sqlRest);
                    
                    const sqlParameter = _lodash.concat( [createdBy,categoryId],questionExitInRequestion);
                    const deleteRemainingQuestion = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);
                    console.log('deleteRemainingQuestion',deleteRemainingQuestion);
                    
                    //affectedRows:
                    callback(null);
                }catch(err){
                  
                    callback({err:err,status:false,reason:'During delete remaining question '},null);
                }
        
            },
            async function(callback) {

                async.each(questions, async function(questionRecord, nestedEachcallback) {
            
                    const {questionId} = questionRecord;
        
                    console.log('questionId',questionId);
                    
                    if(questionId){

                        let questionResponse = await editQuestion(req.dbName,questionId,createdBy,categoryId, questionRecord);
                        console.log('questionResponse true',JSON.stringify(questionResponse));
                        
                         questionIdsList.push(questionResponse);
                    }else{

                        let questionResponse = await addNewQuestion(req.dbName,createdBy,categoryId, questionRecord);
                        console.log('questionResponse false',JSON.stringify(questionResponse));
                        questionIdsList.push(questionResponse);
                    }
             
                    nestedEachcallback();
        
                }, function(err) {
                    if( err ) {
                        callback(err,null);
                     } else {
                        callback(null,questionIdsList)
                    }
                });
            }

        ],(err,result)=>{
            if( err ) {
                mainCallback(err,null);
             } else {
                 mainCallback(null,result)
            }
        })


       





    }catch(err){
         cb(err,null);
    }
 };


exports.getSupplierByServiceId= async (req,areaId,languageId,serviceIds,user_id, mainCallback)=>{
 
    const Ids = _lodash.uniqBy(serviceIds, 'Id').map(( {Id})=>Id);
    
    async.waterfall([
        async function(callback) {
            try{

               let supplierByService = [];
                if(user_id){

                    const {sqlRest, sqlParameter} = priceQuerySharedfunc.priceQueryWithAndWithoutUser(areaId,languageId,Ids,user_id,'getSupplierByServiceId');
                    supplierByServiceAll = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);

                    let gRecordSpecificUserRecord = _lodash.groupBy(supplierByServiceAll, 'supplier_id');
                    // without login user
                    const {sqlRest:sqlRest1, sqlParameter:sqlParameter1} = priceQuerySharedfunc.priceQueryWithAndWithoutUser(areaId,languageId,Ids,0,'getSupplierByServiceId');
                    supplierByServiceSelected = await sharedfunc.queryExecute(req.dbName,sqlRest1,sqlParameter1);
                    let gRecordAll = _lodash.groupBy(supplierByServiceSelected, 'supplier_id');

                    for( let supplier_id in gRecordSpecificUserRecord){

                        if(gRecordAll[supplier_id]){
                            gRecordAll[supplier_id] =  gRecordSpecificUserRecord[supplier_id] ; 
                        }
                    }

                    for( let supplier_id in  gRecordAll){
                        gRecordAll[supplier_id].map( v =>{
                            supplierByService.push(v);
                        });
                    }



                //    return callback('Service list',null);

                }else{ // without login
                    const {sqlRest, sqlParameter} = priceQuerySharedfunc.priceQueryWithAndWithoutUser(areaId,languageId,Ids,user_id,'getSupplierByServiceId');
                    supplierByService = await sharedfunc.queryExecute(req.dbName,sqlRest,sqlParameter);
                }
                
                
                // unique supplier under services get collection
                
                let  uniquesSupplierIds = {};
                
                supplierByService.map( (rec)=>{
                    
                    const {supplier_id}=rec;

                    let recordDisplayPriceSyncWithOthers=0;
                        
                    if(supplier_id){
                        
                        
                        recordDisplayPriceSyncWithOthers = parseFloat(rec['hourly_price']);

                                if(uniquesSupplierIds[supplier_id] == undefined){
                                    uniquesSupplierIds[supplier_id] ={...rec, "servicesList":[]};


                                    uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = parseFloat(rec['sumDisplayPrice']);
                                    uniquesSupplierIds[supplier_id]['sumHourlyPrice'] = parseFloat(rec['hourly_price']);

                                    /*

                                     As per discussion nitin, ajay and pankaj
                                     
                                     NOTE:
                                     There is not strike price will see in price.
                                     please dont change, if you want to please discuss with app and frontend   

                                     sumDisplayUserPrice: is user has discount of not
                                     price field is using in app.
                                     hourly_price, fixed_price and display_price is using.
                                     hourly_price

                                     discount: boolean : whether discount implement on product of not. Need to explicit set if user has discount.

                                     NOte:
                                     price = hourly_price= fixed_price= display_price = sumDisplayUserPrice


                                     App is using sumHourlyPrice field to show price, in product is using price
                                     web is fixed_price 

                                    */
                                   
                                    if ( rec.hasOwnProperty('displayUserPrice')){
                                        if( rec['discount'] == 1 ){
                                            uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = uniquesSupplierIds[supplier_id]['sumHourlyPrice'];
                                        }else{
                                            if(rec['displayUserPrice']){
                                                // explicit discount given because discount field is checked in app for loyality
                                                // discount is 1 then loyality section in checkout page will not see

                                                rec['discount'] = 1;
                                                rec['explicitSetForDiscount'] = 1 ;
                                                uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = parseFloat(rec['displayUserPrice']);

                                                recordDisplayPriceSyncWithOthers = parseFloat(rec['displayUserPrice']);
                                            }else{
                                                uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = parseFloat(rec['hourly_price']);
                                            }
                                        
                                        }

                                        //same to sync app and frontend
                                        // uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = parseFloat(rec['sumDisplayUserPrice']);
                                        // uniquesSupplierIds[supplier_id]['sumFixedPrice'] = parseFloat(rec['sumDisplayUserPrice']);

                                    }else{
                                        uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = uniquesSupplierIds[supplier_id]['sumHourlyPrice'];

                                        //same to sync app and frontend
                                        // uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = parseFloat(rec['sumDisplayUserPrice']);
                                        // uniquesSupplierIds[supplier_id]['sumFixedPrice'] = parseFloat(rec['sumDisplayUserPrice']);
    

                                    }


                                    

                                }else{
                                    uniquesSupplierIds[supplier_id]['sumDisplayPrice'] += parseFloat(rec['sumDisplayPrice']);
                                    // uniquesSupplierIds[supplier_id]['sumDiscount'] += rec['discount'];
                                    // uniquesSupplierIds[supplier_id]['sumHourlyPrice'] += rec['hourly_price'];
                                    // uniquesSupplierIds[supplier_id]['sumDuration'] += rec['duration'];
                                    uniquesSupplierIds[supplier_id]['sumHourlyPrice'] += parseFloat(rec['hourly_price']);


                                     /*
                                     calculate sumDisplayUserPrice:
                                     

                                    */
             
                                   if ( rec.hasOwnProperty('displayUserPrice')){
                                    if( rec['discount'] == 1 ){


                                        uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = uniquesSupplierIds[supplier_id]['sumHourlyPrice'];
                                    }else{
                                        if(rec['displayUserPrice']){

                                               // explicit discount given because discount field is checked in app for loyality
                                                // discount is 1 then loyality section in checkout page will not see

                                                rec['discount'] = 1 ;
                                                rec['explicitSetForDiscount'] = 1 ;
                                            uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] += parseFloat(rec['displayUserPrice']);

                                            recordDisplayPriceSyncWithOthers = parseFloat(rec['displayUserPrice']);

                                        }else{
                                            uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] += parseFloat(rec['hourly_price']);
                                        }
                                    }

                                    //same to sync app and frontend
                                    // uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = parseFloat(rec['sumDisplayUserPrice']);
                                    // uniquesSupplierIds[supplier_id]['sumFixedPrice'] = parseFloat(rec['sumDisplayUserPrice']);
                                }else{

                                    uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] = uniquesSupplierIds[supplier_id]['sumHourlyPrice'];

                                    //same to sync app and frontend
                                    // uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = parseFloat(rec['sumDisplayUserPrice']);
                                    // uniquesSupplierIds[supplier_id]['sumFixedPrice'] = parseFloat(rec['sumDisplayUserPrice']);

                                }
                   }
                    
                   // get same price in all fields.
                   uniquesSupplierIds[supplier_id]['sumHourlyPrice'] = uniquesSupplierIds[supplier_id]['sumFixedPrice'] = uniquesSupplierIds[supplier_id]['sumDisplayPrice'] = uniquesSupplierIds[supplier_id]['sumDisplayUserPrice']=
                   uniquesSupplierIds[supplier_id]['sumDisplayUserPrice'] ;


                   rec['display_price']=rec['price']=rec['fixed_price']=recordDisplayPriceSyncWithOthers


                                uniquesSupplierIds[supplier_id]["servicesList"].push(rec);
               }

                });


                let finalResult =  [];
                
                Object.keys(uniquesSupplierIds).map( rec=>{ 
                    
                    // if Nth services selected then supplier who has same Nth length of servies list then only it is accepted
                    if(uniquesSupplierIds[rec]['servicesList'].length == Ids.length){ 
                        finalResult.push(uniquesSupplierIds[rec]);
                    }

                 });

                // supplierByService

                 //affectedRows:
                callback(null,{service:finalResult})
            }catch(err){
                callback({err:err,status:false,reason:'Service list'},null);
            }

        },
       
    ], function (err, result) {
        // result now equals 'done'
                if(err){
                    mainCallback(err,null);
                }else{
                    mainCallback(null,result);
                }
        
    });

};
