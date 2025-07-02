import validate from './utils/validation.js';
import popup from './utils/popup.js';

validate()

async function fetchUtilities(queryURL,selector){
  const token = localStorage.getItem('token')
  const res = await fetch(queryURL,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  
  const total = Number((await res.json()).quantity)
  
  document.querySelector(`.${selector}`).innerText=total
  }

function evaluateData(holder,data,fields) {
  console.log(fields)
  for (let prop of data) {
    console.log('prop',prop)
    const tr = document.createElement('tr')
    tr.setAttribute('data-holder',holder)
    tr.setAttribute('data-id',prop._id)
   let html = ''
     fields.forEach((field)=>{
        html+=`
        <td>${field=="image"?`<img class="field-image" src="${prop.images[0]}"/>`:field=='variants'?`${prop.variants?.length || 0}`:field=="name"?`${prop.userId.name}`:`${prop[field]}`}</td>
        `
      })

    tr.innerHTML=html
    tr.addEventListener('click',(e)=>{
      
      const id = e.currentTarget.dataset.id
      const holder = e.currentTarget.dataset.holder
      window.location.href=`single${holder}.html?id=${id}`
    })
   const tbody = document.querySelector(`.${holder}-tbody`)

tbody.appendChild(tr)
  }
  }

async function fetchData(url,holder) {
  showLoader()
  const lastId = localStorage.getItem(`${holder}-lastId`) || "null"
    
   console.log("lastid",lastId)
      try {
        const res = await fetch(`${url}/${lastId}`,{
          method:"GET",
          headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        });
     if(res.ok){
      const data = await res.json();
     console.log("data",data)
     
     const queries = holder=='products'? ['image','title','stock','variants','basePrice']
     : holder=='orders'?['name','status','paymentStatus']:[]
    evaluateData(holder,data, queries)
    if(data.length>0){
        let newLastId  = data[data.length-1]._id
        
        if(newLastId){
          localStorage.setItem(`${holder}-lastId`,newLastId)
         }
        }
        else{
          localStorage.removeItem(`${holder}-lastId`)
        }
       }
        else{
          popup('check your internet connection and try again')
        }
      } catch(error) {
        console.error("Failed to fetch products", error);
      } finally {
      hideLoader()
      }
      
      window.addEventListener('beforeunload',(e)=>{
        localStorage.removeItem(`${holder}-lastId`)
      },{once:true}
      )
            window.addEventListener('unload',(e)=>{
        localStorage.removeItem(`${holder}-lastId`)
      },{once:true}
      )
}  

document.addEventListener('DOMContentLoaded',async()=>{
  fetchUtilities('http://localhost:4000/api/admin/products/get','products-count')
  fetchUtilities('http://localhost:4000/api/admin/orders/get','orders-count')
  
  fetchData('http://localhost:4000/api/admin/products/get','products')
  fetchData('http://localhost:4000/api/admin/orders/get','orders')
}
)
