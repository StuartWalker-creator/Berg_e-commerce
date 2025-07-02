 async function checkToken(token) {
     try {
       const response = await fetch('http://localhost:4000/api/users/verify-token?role=admin',{
         method:"POST",
         headers:{'Content-Type':"application/json"
       },
        body:JSON.stringify({
          token}
        )
       })
       
       const data = await response.json()
       
       const isValid = data.valid
       
       if(!isValid){
    window.location.href='login.html'
         return
       }
     } catch (error) {
       console.error(error);
       window.location.href='login.html'
     }
   }
   
  export default function validate(){
     const token = localStorage.getItem("token")
   
   if(!token){
    window.location.href='login.html'
     return
   }
   checkToken(token)
   }