const API = import.meta.env.VITE_API_URL;
import { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", reg_no: "", dept: "", year: "", mail: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Fetch all users
  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = () => {
    setIsLoading(true);
    axios.get(`${API}/users`)
      .then(response => {
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
        setFilteredUsers(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        showNotification("Failed to fetch users", "error");
        setIsLoading(false);
      });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Search function
  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchText) ||
      user.reg_no.toLowerCase().includes(searchText) ||
      user.dept.toLowerCase().includes(searchText) ||
      user.mail.toLowerCase().includes(searchText)
    );
    setFilteredUsers(filtered);
  };

  // Delete user function
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      setIsLoading(true);
      try {
        await axios.delete(`${API}/users/${id}`);
        getAllUsers();
        showNotification("User deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("Failed to delete user", "error");
        setIsLoading(false);
      }
    }
  };

  // Open modal for editing
  const handleEdit = (user) => {
    console.log("Editing User:", user);
    setUserData({ ...user, id: user.id });
    setIsModalOpen(true);
  };

  // Open modal for inserting new user
  const handleInsert = () => {
    setUserData({ name: "", reg_no: "", dept: "", year: "", mail: "" });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle input changes
  const handleData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Submit form (Insert/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (userData.id) {
        await axios.patch(`${API}/users/${userData.id}`, userData);
        showNotification("User updated successfully", "success");
      } else {
        await axios.post(`${API}/users`, userData);
        showNotification("User added successfully", "success");
      }

      setUserData({ name: "", reg_no: "", dept: "", year: "", mail: "" });
      setIsModalOpen(false);
      getAllUsers();
    } catch (error) {
      console.error("Error submitting user data:", error);
      showNotification("Failed to submit data", "error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='container'>
        <div className="header">
          <h3>Student Management System</h3>
          <p>Manage student records with ease</p>
        </div>
        
        <div className='search-container'>
          <div className="search-box">
            <input 
              type="search" 
              placeholder="Search by name, registration number, department or email..." 
              onChange={handleSearchChange} 
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <button className='btn-insert' onClick={handleInsert}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Student
          </button>
        </div>
        
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        )}
        
        <div className="table-container">
          {filteredUsers.length > 0 ? (
            <table className='table'>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.reg_no}</td>
                    <td>{user.dept}</td>
                    <td>{user.year}</td>
                    <td>{user.mail}</td>
                    <td className="actions">
                      <button className='btn-edit' onClick={() => handleEdit(user)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className='btn-delete' onClick={() => handleDelete(user.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>No students found</p>
            </div>
          )}
        </div>
        
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{userData.id ? "Edit Student" : "Add New Student"}</h2>
                <button className="close-btn" onClick={closeModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    value={userData.name} 
                    onChange={handleData} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg_no">Registration Number</label>
                  <input 
                    type="text" 
                    id="reg_no"
                    name="reg_no" 
                    value={userData.reg_no} 
                    onChange={handleData} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dept">Department</label>
                  <input 
                    type="text" 
                    id="dept"
                    name="dept" 
                    value={userData.dept} 
                    onChange={handleData} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <select 
                    id="year"
                    name="year" 
                    value={userData.year} 
                    onChange={handleData} 
                    required 
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="mail">Email Address</label>
                  <input 
                    type="email" 
                    id="mail"
                    name="mail" 
                    value={userData.mail} 
                    onChange={handleData} 
                    required 
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {userData.id ? "Update" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </>
  );
}

export default App;