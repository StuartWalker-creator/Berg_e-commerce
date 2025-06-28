const errorHandler = async (err,req,res,next) => {
  let statusCode = res.statusCode || 500
  
  console.log('ErrorHandledErr: ',err.message)

  if (statusCode==400) {
    res.status(400)
    res.json({
      error:err.message
    })
  }
  else if (statusCode==401) {
    res.status(401)
    res.json({
      error: err.message
    })
  }
  else if (statusCode == 403) {
    res.status(403)
    res.json({
      error: err.message
    })
  }
  else{
    res.status(500)
    res.json({
      error:'Server error'
    })
  }
}

module.exports = errorHandler