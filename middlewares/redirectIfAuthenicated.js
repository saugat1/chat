const check =  function(req,res,next){

        if(req.session.token){
            return res.redirect('/home'); 
        }
        else{
            next();
        }
}

module.exports = check;