module.exports = {
    res: (ctx,code,msg,data)=>{
        if(data!==undefined||data!== ''||data!==null){
            ctx.body={
                code: code,
                msg: msg,
                data: data
            }
        }else{
            ctx.body={
                code: code,
                msg: msg,
            }
        }
    }
}