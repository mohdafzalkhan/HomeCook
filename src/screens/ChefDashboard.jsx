import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChefDashboard.css";
const API_URL = import.meta.env.VITE_API_URL;
export default function ChefDashboard() {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    img: "",
    options: [{ half: "", full: "" }],
    CategoryName: "",
    description: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "chef") {
      navigate("/");
      return;
    }

    loadFoodData();
    loadCategories();
  }, [navigate]);

  // ✅ Fetch food and categories
  const loadFoodData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/foodData`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data && data.length > 0) {
        setFoodItems(data[0]);
        setCategories(data[1]);
      }
    } catch (error) {
      console.error("Error loading food data:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/getCategories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // ✅ Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Enter category name");
    try {
      const res = await fetch(`${API_URL}/api/addCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
        body: JSON.stringify({ CategoryName: newCategory }),
      });
      const result = await res.json();
      if (result.success) {
        alert("Category added successfully!");
        setNewCategory("");
        loadCategories();
      } else {
        alert("Error adding category: " + result.error);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // ✅ Add new food item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/addFoodItem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
        body: JSON.stringify(newItem),
      });
      const result = await response.json();
      if (result.success) {
        alert("Food item added successfully!");
        setFoodItems((prev) => [...prev, result.newItem]);
        setNewItem({
          name: "",
          img: "",
          options: [{ half: "", full: "" }],
          CategoryName: "",
          description: "",
        });
        setShowAddForm(false);
      } else {
        alert("Error adding food item: " + result.error);
      }
    } catch (error) {
      console.error("Error adding food item:", error);
    }
  };

  // ✅ Update item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_URL}/api/updateFoodItem/${editingItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
          body: JSON.stringify(editingItem),
        }
      );
      const result = await response.json();
      if (result.success) {
        alert("Food item updated successfully!");
        setEditingItem(null);
        loadFoodData();
      } else {
        alert("Error updating food item: " + result.error);
      }
    } catch (error) {
      console.error("Error updating food item:", error);
    }
  };

  // ✅ Delete item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(
          `${API_URL}/api/deleteFoodItem/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          alert("Food item deleted successfully!");
          loadFoodData();
        } else {
          alert("Error deleting food item: " + result.error);
        }
      } catch (error) {
        console.error("Error deleting food item:", error);
      }
    }
  };

  // ✅ Input Handlers
  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing)
      setEditingItem((prev) => ({ ...prev, [name]: value }));
    else setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (index, field, value, isEditing = false) => {
    const item = isEditing ? editingItem : newItem;
    const updatedOptions = [...item.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    if (isEditing)
      setEditingItem({ ...editingItem, options: updatedOptions });
    else setNewItem({ ...newItem, options: updatedOptions });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToTrackOrders = () => {
    navigate("/chefTrackOrders");
  };

  return (
    <div className="chef-dashboard">
      <header className="chef-header">
        <div className="header-content">
          <h1>👨‍🍳 Chef Dashboard</h1>
          <div className="header-actions">
  <button
    className="btn btn-primary me-3"
    onClick={goToTrackOrders}
  >
    Track Orders
  </button>
  <button
    className="btn-add-item"
    onClick={() => setShowAddForm(true)}
  >
    Add Food Item
  </button>
  <button className="btn-danger" onClick={handleLogout}>
    Logout
  </button>
</div>

        </div>
      </header>

      <main className="chef-main container py-4">
        {/* Add Category Section */}
        <div className="category-management mb-4">
          <h3>Add Category</h3>
          <div className="category-input d-flex gap-2">
            <input
              type="text"
              placeholder="New Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="form-control"
            />
            <button className="btn btn-success" onClick={handleAddCategory}>
              Add
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Food Item</h2>
              <form onSubmit={handleAddItem}>
                <input
                  type="text"
                  name="name"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="url"
                  name="img"
                  placeholder="Image URL"
                  value={newItem.img}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="CategoryName"
                  value={newItem.CategoryName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.CategoryName}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </select>
                <textarea
                  name="description"
                  placeholder="Description"
                  rows="3"
                  value={newItem.description}
                  onChange={handleInputChange}
                  required
                />
                <div className="price-section">
                  <h4>Pricing</h4>
                  <input
                    type="number"
                    placeholder="Half Price"
                    value={newItem.options[0]?.half || ""}
                    onChange={(e) =>
                      handlePriceChange(0, "half", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Full Price"
                    value={newItem.options[0]?.full || ""}
                    onChange={(e) =>
                      handlePriceChange(0, "full", e.target.value)
                    }
                  />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button type="submit" className="btn btn-success">
                    Add Item
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editingItem && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Edit Food Item</h2>
      <form onSubmit={handleUpdateItem}>
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={editingItem.name}
          onChange={(e) => handleInputChange(e, true)}
          required
        />
        <input
          type="url"
          name="img"
          placeholder="Image URL"
          value={editingItem.img}
          onChange={(e) => handleInputChange(e, true)}
          required
        />
        <select
          name="CategoryName"
          value={editingItem.CategoryName}
          onChange={(e) => handleInputChange(e, true)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.CategoryName}>
              {cat.CategoryName}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={editingItem.description}
          onChange={(e) => handleInputChange(e, true)}
          required
        />
        <div className="price-section">
          <h4>Pricing</h4>
          <input
            type="number"
            placeholder="Half Price"
            value={editingItem.options[0]?.half || ""}
            onChange={(e) =>
              handlePriceChange(0, "half", e.target.value, true)
            }
          />
          <input
            type="number"
            placeholder="Full Price"
            value={editingItem.options[0]?.full || ""}
            onChange={(e) =>
              handlePriceChange(0, "full", e.target.value, true)
            }
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="submit" className="btn btn-warning">
            Update Item
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditingItem(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


        {/* Food Item List */}
        {categories.map((category) => {
          const categoryItems = foodItems.filter(
            (item) => item.CategoryName === category.CategoryName
          );
          return (
            categoryItems.length > 0 && (
              <div key={category._id} className="category-section mb-5">
                <h3>{category.CategoryName}</h3>
                <div className="row g-3">
                  {categoryItems.map((item) => (
                    <div key={item._id} className="col-md-4 col-lg-3">
                      <div className="card shadow-sm rounded-3 h-100">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="card-img-top"
                        />
                        <div className="card-body">
                          <h5 className="card-title">{item.name}</h5>
                          <p className="text-muted">{item.description}</p>
                          <div className="mb-2">
                            {item.options.map((opt, i) => (
                              <div key={i}>
                                Half: ₹{opt.half || 0} | Full: ₹{opt.full || 0}
                              </div>
                            ))}
                          </div>
                          <div className="d-flex justify-content-between">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => setEditingItem(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          );
        })}
      </main>
    </div>
  );
}
