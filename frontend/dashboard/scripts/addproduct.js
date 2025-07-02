const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
let variants = [];

const variantsContainer = document.getElementById("variantsContainer");
const addVariantBtn = document.getElementById("addVariantBtn");
const productForm = document.getElementById("productForm");
const alertContainer = document.getElementById("alertContainer");
const submitBtn = document.getElementById("submitBtn");

function showAlert(type, message) {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function createVariantElement(index) {
  const variant = {
    images: [],
    price: "",
    stock: "",
    color: "",
    size: ""
  };
  variants.push(variant);

  const div = document.createElement("div");
  div.className = "card mb-3 p-3";

  div.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Images</label>
        <div class="drop-zone border rounded p-3 text-center bg-light"
             data-index="${index}">
          <p class="mb-2">Drag & drop or click to upload</p>
          <input type="file" class="d-none" multiple accept="image/*" />
          <div class="preview small text-muted"></div>
        </div>
      </div>

      <div class="col-md-3">
        <label class="form-label">Price</label>
        <input type="number" class="form-control w-50" required 
               oninput="handleVariantChange(${index}, 'price', this.value)" />
      </div>

      <div class="col-md-3">
        <label class="form-label">Stock</label>
        <input type="number" class="form-control w-25" required 
               oninput="handleVariantChange(${index}, 'stock', this.value)" />
      </div>

      <div class="col-md-4">
        <label class="form-label">Color (optional)</label>
        <input type="text" class="form-control w-50" 
               oninput="handleVariantChange(${index}, 'color', this.value)" />
      </div>

      <div class="col-md-4">
        <label class="form-label">Select Size</label>
        <select class="form-select w-50"
                onchange="handleVariantChange(${index}, 'size', this.value)">
          <option value="">-- Choose Size --</option>
          ${sizeOptions.map(size => `<option value="${size}">${size}</option>`).join("")}
        </select>
      </div>
    </div>
  `;

  variantsContainer.appendChild(div);

  // Hook up the drag & drop zone
  const dropZone = div.querySelector(".drop-zone");
  const input = dropZone.querySelector("input");
  const preview = dropZone.querySelector(".preview");

  dropZone.addEventListener("click", () => input.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-primary", "bg-white");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-primary", "bg-white");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-primary", "bg-white");
    const files = e.dataTransfer.files;
    handleImageUpload(index, files, preview);
  });

  input.addEventListener("change", () => {
    handleImageUpload(index, input.files, preview);
  });
}

function handleVariantChange(index, field, value) {
  variants[index][field] = value;
}

function handleImageUpload(index, files, previewEl) {
  const fileList = Array.from(files);
  variants[index].images = fileList;

  previewEl.innerHTML = fileList.length
    ? `Selected: ${fileList.map(f => f.name).join(", ")}`
    : "No files selected.";
}

addVariantBtn.addEventListener("click", () => {
  createVariantElement(variants.length);
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("productTitle").value;
  const description = document.getElementById("productDescription").value;

  const allValid = variants.every(v => v.images.length && v.price && v.stock);
  if (!allValid) {
    showAlert("warning", "Please fill in all the mandatory fields and upload at least one image per variant.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = "Creating product...";

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);

  variants.forEach((variant, i) => {
    formData.append(`variants[${i}][price]`, variant.price);
    formData.append(`variants[${i}][stock]`, variant.stock);
    if (variant.color) formData.append(`variants[${i}][color]`, variant.color);
    if (variant.size) formData.append(`variants[${i}][size]`, variant.size);
    variant.images.forEach(file => {
      formData.append(`variants[${i}][images]`, file);
    });
  });

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/products/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await res.json();
    showAlert("success", "Product created successfully!");
    productForm.reset();
    variantsContainer.innerHTML = "";
    variants = [];
  } catch (err) {
    console.error(err);
    showAlert("danger", "Upload failed! Try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Create Product";
  }
});

// Add first variant on load
addVariantBtn.click();