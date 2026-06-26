const mongoose =require('mongoose');


/**
 * -job description schema
 * -resume text
 * -Self description
 * 
 * matchScore:Number
 * 
 * Technical questions:[{
 *                          question:""
 *                          intention:""
 *                          answer:""   
 *                      }]
 * Behavioral que:[
 *                      {
 *                          question:""
 *                          intention:""
 *                          answer:""   
 *                      }]
 * Skill gaps:[{
 *              skill:"",
 *              severty:{
 *               type:string,
 *                  enum:["low,med,high"]
 *               }
 * }]
 * preparation plan:[{
 *      day:Number,
 *      focus:string,
 *      task:[string]
 * }}]
 */

const technicalQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})




const behavioralQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})



const skillGapSchema=new mongoose.Schema({
        skill:{
            type:String,
          required:[true,"skill name is required"]},
        severity:{
            type:String,
            enum:["low","med","high"],
            required:[true,"severty is required"]
        }
},{
    _id:false
})


const preparationPlanSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day is required"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type:String,
        required:[true,"Task is required"]
    }]
})


const interviewReportSchema=new mongoose.Schema({
    jobDescription:{
        type:String,
        required:[true,"job description is required"]
    },
    resume:{
        type:String,
    },
    selfDescription:{
        type:String,
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionSchema],
    skillGaps:[skillGapSchema],
    preparationPlan:[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
   
},{timestamps:true})

const interviewReportModel=mongoose.model("interviewReport",interviewReportSchema);

module.exports=interviewReportModel;
