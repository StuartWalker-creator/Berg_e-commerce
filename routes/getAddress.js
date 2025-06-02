const express = require('express')
const router = express.Router()

router.post('/get_address',async (req,res,next)=>{
  try {
    const nominatimUrl = 'https://nominatim.openstreetmap.org/reverse'
    
    const {lng,lat} = req.body
    
    const params = new URLSearchParams({
      format:'json',
      lat,
      lon:lng,
      zoom:18,
      addressdetails: 1
    })
    
   const response = await fetch(`${nominatimUrl}?${params}`)
   console.log(response)
   const add = await response.json()
   
  const address = add.display_name
   
  console.log(address)
  res.status(200).json({address})
  } catch (e) {
    console.log('error:',e)
    throw new Error('Error getting address'+e)
  }
})

module.exports = router