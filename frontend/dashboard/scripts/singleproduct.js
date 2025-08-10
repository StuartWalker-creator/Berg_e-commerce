import popup from '../utils/popup.js';

let currentProduct = null;

window.openEditModal = function (index) {
  const variant = currentProduct.variants[index];
  document.getElementById("variantIndex").value = index;
  document.getElementById("editPrice").value = variant.price;
  document.getElementById("editStock").value = variant.stock;
  document.getElementById("editColor").value = variant.color || "";
  document.getElementById("editSize").value = variant.size || "";
}

document.getElementById("editVariantForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const index = parseInt(document.getElementById("variantIndex").value);
  const formData = new FormData();
  formData.append("price", document.getElementById("editPrice").value);
  formData.append("stock", document.getElementById("editStock").value);
  formData.append("color", document.getElementById("editColor").value);
  formData.append("size", document.getElementById("editSize").value);

  const imageFiles = document.getElementById("editImages").files;
  console.log('imageFiles',imageFiles[0])
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append("images", imageFiles[i]);
  }
console.log('formimage',formData.get('images'))
  try {
    const res = await fetch(`http://localhost:4000/api/admin/products/${currentProduct._id}/variants/${index}`, {
      method: "PUT",
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!res.ok){
      popup('Failed to update variant','error')
      throw new Error("Failed to update variant");
}
    const updated = await res.json();
    popup('Variant updated successfully','success')
    currentProduct = updated;
    renderProduct(currentProduct);
    bootstrap.Modal.getInstance(document.getElementById("editVariantModal")).hide();
  } catch (err) {
    popup(err.message);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  
  console.log('id',id)

  if (!id) {
    document.getElementById("productDetails").innerHTML = `<p class="text-danger">Product ID missing.</p>`;
    return;
  }

  try {
    const res = await fetch(`http://localhost:4000/api/products/single/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");

    const product = await res.json();
    console.log('product',product)
    renderProduct(product);
  } catch (err) {
    document.getElementById("productDetails").innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
});

function renderProduct(product) {
  currentProduct = product
  
  const { title, description, variants = [] } = product;

  const variantCards = variants.map((variant, i) => {
    const { price, stock, color, size, images = [] } = variant;

    return `
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Variant ${i + 1}</strong>
          <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editVariantModal" onclick="openEditModal(${i})">
            Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteVariant(${i})">Delete</button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Price:</strong> ${price} UGX</p>
              <p><strong>Stock:</strong> ${stock}</p>
              ${color ? `<p><strong>Color:</strong> ${color}</p>` : ""}
              ${size ? `<p><strong>Size:</strong> ${size}</p>` : ""}
            </div>
            <div class="col-md-6">
              <div class="d-flex flex-wrap gap-2">
                ${images.map(img => `<img src="${img}" alt="Variant Image" width="70" class="rounded border">`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("productDetails").innerHTML = `
    <h2>${title}</h2>
    <p class="text-muted">${description}</p>
    <hr />
    <h4 class="mb-3">Variants (${variants.length})</h4>
    ${variantCards || '<p>No variants available.</p>'}
  `;
}

// ⚠️ You’d replace this with a backend DELETE call
function deleteVariant(index) {
  if (confirm(`Delete Variant ${index + 1}?`)) {
    alert("Variant deleted (functionality to be implemented)");
    // You can refetch the data or update the DOM after deletion
  }
}