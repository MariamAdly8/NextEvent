export default (err,req,res,next)=>{
    let status=err.status || 500;
    let message = typeof err === 'string' ? err : (err.message || "Internal server error");
    let errors=[];
    if(err.code===11000){
        status=400;
        let field=Object.keys(err.keyValue)[0];
        let value=err.keyValue[field];
        message=`${field} with value ${value} already exists`;
        errors.push({
            field: field,
            message: message
        });
    }
    if(err.name==="ValidationError"){
        status=400;
        message="Validation error";
        errors=Object.values(err.errors).map((element)=>{
            return{
                field:element.path,
                message:element.message
            }
        })
    }
    else {
        errors.push({
            field: "general", 
            message: message
        });
    }
    return res.status(status).json({
        status:"Error",
        message,
        errors
    })
}