const nodemailer = require('nodemailer')

const sendEmail = async (order)=>{
  try {
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    
    await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to:order.email,
      subject: 'Order Receipt',
      html:`<h2>Order confirmed</h2>
      <p>Order Id: ${order._id}</p>
      <p>Total: ${order.total} </p>
      <p>Status ${order.status} </p>
      
      <p> <i>Thank you for trusting Electronics</i></p>
      `
    })
    
  } catch (e) {
    res.status(500)
    return next(new Error('Server Error'+e))
  }
}

module.exports = sendEmail